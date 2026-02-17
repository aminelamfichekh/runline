<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreQuestionnaireSessionRequest;
use App\Http\Requests\UpdateQuestionnaireSessionRequest;
use App\Http\Requests\AttachQuestionnaireSessionRequest;
use App\Models\QuestionnaireSession;
use App\Services\ProfileService;
use App\Services\PlanGeneratorService;
use App\Services\QuestionnairePayloadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * QuestionnaireSessionController
 * 
 * Handles anonymous questionnaire sessions and attachment to user profiles.
 */
class QuestionnaireSessionController extends Controller
{
    public function __construct(
        protected ProfileService $profileService,
        protected PlanGeneratorService $planGeneratorService,
        protected QuestionnairePayloadService $payloadService
    ) {
        // Middleware is applied in routes/api.php
    }

    /**
     * Create a new anonymous questionnaire session.
     *
     * @param StoreQuestionnaireSessionRequest $request
     * @return JsonResponse
     */
    public function store(StoreQuestionnaireSessionRequest $request): JsonResponse
    {
        try {
            $payload = $request->input('payload', []);
            
            // Nettoyer les champs dépendants
            $payload = $this->payloadService->cleanDependentFields($payload);
            
            $session = QuestionnaireSession::create([
                'payload' => $payload,
                'completed' => false,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'session_uuid' => $session->session_uuid,
                    'session_id' => $session->id,
                ],
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to create questionnaire session', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Échec de la création de la session : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update an existing questionnaire session.
     * Merge le nouveau payload avec l'existant (NE PAS écraser).
     *
     * @param UpdateQuestionnaireSessionRequest $request
     * @param string $session_uuid
     * @return JsonResponse
     */
    public function update(UpdateQuestionnaireSessionRequest $request, string $session_uuid): JsonResponse
    {
        try {
            $session = QuestionnaireSession::where('session_uuid', $session_uuid)->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session non trouvée',
                ], 404);
            }

            // Si session déjà attachée à un user, ne pas permettre les updates
            if ($session->user_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'La session est déjà attachée à un utilisateur',
                ], 403);
            }

            // Récupérer le payload existant
            $existingPayload = $session->payload ?? [];
            
            // Récupérer le nouveau payload de la requête
            $newPayload = $request->input('payload', []);
            
            // MERGE : fusionner sans écraser (les nouvelles valeurs remplacent les anciennes)
            $mergedPayload = $this->payloadService->mergePayload($existingPayload, $newPayload);
            
            // Nettoyer les champs dépendants
            $mergedPayload = $this->payloadService->cleanDependentFields($mergedPayload);
            
            // Préparer les données de mise à jour
            $updateData = [
                'payload' => $mergedPayload,
            ];
            
            // Mettre à jour completed si fourni
            if ($request->has('completed')) {
                $updateData['completed'] = (bool) $request->input('completed');
            }
            
            $session->update($updateData);

            return response()->json([
                'success' => true,
                'data' => [
                    'session_uuid' => $session->session_uuid,
                    'completed' => $session->completed,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update questionnaire session', [
                'session_uuid' => $session_uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Échec de la mise à jour de la session : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Attach a questionnaire session to the authenticated user's profile.
     * Validation complète + transfert vers user_profiles.
     *
     * @param AttachQuestionnaireSessionRequest $request
     * @param string $session_uuid
     * @return JsonResponse
     */
    public function attach(AttachQuestionnaireSessionRequest $request, string $session_uuid): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié',
                ], 401);
            }

            $session = QuestionnaireSession::where('session_uuid', $session_uuid)->first();

            if (!$session) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session non trouvée',
                ], 404);
            }

            // Si session déjà attachée à un autre user, rejeter
            if ($session->user_id && $session->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'La session est déjà attachée à un autre utilisateur',
                ], 403);
            }

            // Si session déjà attachée à cet user, retourner succès sans re-traiter
            if ($session->user_id === $user->id) {
                $profile = $this->profileService->getProfile($user);

                return response()->json([
                    'success' => true,
                    'message' => 'Session déjà attachée',
                    'data' => [
                        'profile' => $profile,
                        'questionnaire_completed' => $profile ? $profile->questionnaire_completed : false,
                    ],
                ]);
            }

            // VALIDATION DE COMPLÉTION : Vérifier que le questionnaire est complet avant attach
            $sessionPayload = $session->payload ?? [];

            // Normaliser le payload (conversion mètres→cm, etc.) AVANT validation
            $sessionPayload = $this->payloadService->normalizePayload($sessionPayload);

            $validator = $this->validatePayloadForAttach($sessionPayload);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le questionnaire est incomplet. Veuillez compléter tous les champs requis avant d\'attacher.',
                    'errors' => $validator->errors(),
                ], 422);
            }
            
            // TOUT DANS UNE TRANSACTION DB pour garantir l'intégrité
            return DB::transaction(function () use ($user, $session, $session_uuid, $sessionPayload) {
                // Préparer le payload pour l'attach (nettoyer + retirer email)
                $preparedPayload = $this->payloadService->preparePayloadForAttach($sessionPayload);
                
                // Vérifier si l'utilisateur avait déjà complété le questionnaire
                $wasCompleted = $user->profile && $user->profile->questionnaire_completed;
                
                // Mettre à jour le profil utilisateur (utilise ProfileService qui a toute la validation)
                $profile = $this->profileService->updateProfile($user, $preparedPayload);
                
                // Attacher la session à l'utilisateur (DANS LA MÊME TRANSACTION)
                $session->update([
                    'user_id' => $user->id,
                    'completed' => true,
                ]);
                
                // Si première complétion, déclencher la génération de plan
                $isNowCompleted = $profile->questionnaire_completed;
                if (!$wasCompleted && $isNowCompleted) {
                    try {
                        // Refresh user to get updated profile relationship
                        $user->refresh();
                        $this->planGeneratorService->generateInitialPlan($user);
                    } catch (\Exception $e) {
                        // Logger l'erreur mais ne pas faire échouer l'attach
                        Log::error('Failed to generate initial plan after session attach', [
                            'user_id' => $user->id,
                            'session_uuid' => $session_uuid,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }
                
                Log::info('Questionnaire session attached successfully', [
                    'user_id' => $user->id,
                    'session_uuid' => $session_uuid,
                    'questionnaire_completed' => $profile->questionnaire_completed,
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'profile' => $profile,
                        'questionnaire_completed' => (bool) $profile->questionnaire_completed,
                    ],
                ]);
            });

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de la validation',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Failed to attach questionnaire session', [
                'user_id' => Auth::id(),
                'session_uuid' => $session_uuid,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Échec de l\'attachement de la session : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Valide le payload complet pour l'attach.
     *
     * @param array $payload
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validatePayloadForAttach(array $payload): \Illuminate\Contracts\Validation\Validator
    {
        $rules = [
            // Champs requis
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birth_date' => 'required|date|before:today',
            'gender' => 'required|in:male,female,other',
            'height_cm' => 'required|integer|between:50,250',
            'weight_kg' => 'required|integer|between:20,300',
            'primary_goal' => 'required|in:me_lancer,reprendre,entretenir,ameliorer_condition,courir_race,ameliorer_chrono,autre',
            'primary_goal_other' => 'required_if:primary_goal,autre|string|max:500',
            'current_weekly_volume_km' => 'required|integer|min:0|max:100',
            'current_runs_per_week' => 'required|in:0,1_2,3_4,5_6,7_plus',
            'available_days' => 'required|array|min:1',
            'available_days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'running_experience_period' => 'required|in:je_commence,je_reprends,1_4_semaines,1_11_mois,1_10_ans,plus_10_ans',
            'running_experience_months' => 'nullable|string',
            'running_experience_years' => 'nullable|string',
            'training_locations' => 'required|array|min:1',
            'training_locations.*' => 'in:route,chemins,piste,tapis,autre',

            // Champs conditionnels pour course
            'race_distance' => [
                'required_if:primary_goal,courir_race',
                'required_if:primary_goal,ameliorer_chrono',
                'nullable',
                \Illuminate\Validation\Rule::in(['5km', '10km', '15km', '20km', '25km', 'semi_marathon', 'marathon', 'autre']),
            ],
            'race_distance_km' => 'nullable|integer|min:1|max:50|required_if:race_distance,autre',
            'target_race_date' => [
                'required_if:primary_goal,courir_race',
                'required_if:primary_goal,ameliorer_chrono',
                'nullable',
                'date',
                'after:today',
            ],

            // Champs optionnels
            'intermediate_objectives' => 'nullable|string|max:1000',
            'current_race_times' => 'nullable|array',
            'current_race_times.*.distance' => 'required_with:current_race_times|string',
            'current_race_times.*.time' => 'required_with:current_race_times|string',
            'problem_to_solve' => 'nullable|in:structure,blessure,motivation,autre',
            'problem_to_solve_other' => 'required_if:problem_to_solve,autre|string|max:500',
            'injuries' => 'nullable|array',
            'injuries.*' => 'string',
            'training_location_other' => 'required_if:training_locations,autre|string|max:255',
            'equipment' => 'nullable|string|max:1000',
            'personal_constraints' => 'nullable|string|max:1000',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make($payload, $rules);

        $validator->after(function ($validator) use ($payload) {
            // Validation: current_weekly_volume_km doit être multiple de 5
            if (isset($payload['current_weekly_volume_km']) && $payload['current_weekly_volume_km'] !== null) {
                if ($payload['current_weekly_volume_km'] % 5 !== 0) {
                    $validator->errors()->add(
                        'current_weekly_volume_km',
                        'Le volume hebdomadaire actuel doit être un multiple de 5 km (0-100km).'
                    );
                }
            }

            // Validation: training_location_other requis si "autre" dans training_locations
            $trainingLocations = $payload['training_locations'] ?? [];
            if (is_array($trainingLocations) && in_array('autre', $trainingLocations)) {
                if (empty($payload['training_location_other'])) {
                    $validator->errors()->add(
                        'training_location_other',
                        'Veuillez préciser le lieu d\'entraînement lorsque "autre" est sélectionné.'
                    );
                }
            }

            // Validation: running_experience_weeks requis si running_experience_period est "1_4_semaines"
            if (isset($payload['running_experience_period']) && $payload['running_experience_period'] === '1_4_semaines') {
                if (empty($payload['running_experience_weeks'])) {
                    $validator->errors()->add(
                        'running_experience_weeks',
                        'Veuillez préciser le nombre de semaines.'
                    );
                }
            }

            // Validation: running_experience_months requis si running_experience_period est "1_11_mois"
            if (isset($payload['running_experience_period']) && $payload['running_experience_period'] === '1_11_mois') {
                if (empty($payload['running_experience_months'])) {
                    $validator->errors()->add(
                        'running_experience_months',
                        'Veuillez préciser le nombre de mois.'
                    );
                }
            }

            // Validation: running_experience_years requis si running_experience_period est "1_10_ans"
            if (isset($payload['running_experience_period']) && $payload['running_experience_period'] === '1_10_ans') {
                if (empty($payload['running_experience_years'])) {
                    $validator->errors()->add(
                        'running_experience_years',
                        'Veuillez préciser le nombre d\'années.'
                    );
                }
            }
        });

        return $validator;
    }

    /**
     * Attach a questionnaire session to a user during signup.
     * Méthode interne appelée depuis AuthService (pas d'appel HTTP).
     * 
     * @param string $session_uuid
     * @param \App\Models\User $user
     * @return \App\Models\UserProfile
     * @throws \Illuminate\Validation\ValidationException
     * @throws \Exception
     */
    public function attachFromSignup(string $session_uuid, \App\Models\User $user): \App\Models\UserProfile
    {
        $session = QuestionnaireSession::where('session_uuid', $session_uuid)->first();

        if (!$session) {
            throw new \Exception('Session not found');
        }

        // Si session déjà attachée à un autre user, rejeter
        if ($session->user_id && $session->user_id !== $user->id) {
            throw new \Exception('Session is already attached to another user');
        }

        // Si session déjà attachée à cet user, retourner le profil existant
        if ($session->user_id === $user->id) {
            $profile = $this->profileService->getProfile($user);
            if ($profile) {
                return $profile;
            }
        }

        // Récupérer le payload de la session
        $sessionPayload = $session->payload ?? [];

        // Normaliser le payload (conversion mètres→cm, etc.) AVANT validation
        $sessionPayload = $this->payloadService->normalizePayload($sessionPayload);

        // VALIDATION COMPLÈTE du payload
        $validator = $this->validatePayloadForAttach($sessionPayload);
        
        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }
        
        // TOUT DANS UNE TRANSACTION DB
        return DB::transaction(function () use ($user, $session, $session_uuid, $sessionPayload) {
            // Préparer le payload pour l'attach (nettoyer + retirer email)
            $preparedPayload = $this->payloadService->preparePayloadForAttach($sessionPayload);
            
            // Vérifier si l'utilisateur avait déjà complété le questionnaire
            $wasCompleted = $user->profile && $user->profile->questionnaire_completed;
            
            // Mettre à jour le profil utilisateur
            $profile = $this->profileService->updateProfile($user, $preparedPayload);
            
            // Attacher la session à l'utilisateur (DANS LA MÊME TRANSACTION)
            $session->update([
                'user_id' => $user->id,
                'completed' => true,
            ]);
            
            // Si première complétion, déclencher la génération de plan
            $isNowCompleted = $profile->questionnaire_completed;
            if (!$wasCompleted && $isNowCompleted) {
                try {
                    // Refresh user to get updated profile relationship
                    $user->refresh();
                    $this->planGeneratorService->generateInitialPlan($user);
                } catch (\Exception $e) {
                    // Logger l'erreur mais ne pas faire échouer l'attach
                    Log::error('Failed to generate initial plan after signup attach', [
                        'user_id' => $user->id,
                        'session_uuid' => $session_uuid,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
            
            Log::info('Questionnaire session attached from signup', [
                'user_id' => $user->id,
                'session_uuid' => $session_uuid,
                'questionnaire_completed' => $profile->questionnaire_completed,
            ]);

            return $profile;
        });
    }
}
