<?php

namespace App\Services;

use App\Models\User;
use App\Models\Question;
use App\Models\UserQuestionnaireResponse;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * QuestionnaireResponseService
 * 
 * Service pour gérer les réponses du questionnaire de manière normalisée.
 * Permet de:
 * - Synchroniser user_profiles avec les réponses normalisées
 * - Récupérer toutes les réponses d'un utilisateur
 * - Modifier les réponses
 * - Analyser les réponses pour l'IA
 */
class QuestionnaireResponseService
{
    /**
     * Sauvegarder les réponses depuis un payload (depuis session ou profile).
     * 
     * @param User $user
     * @param array $payload
     * @param string|null $sessionUuid
     * @return array Réponses créées/mises à jour
     */
    public function saveResponsesFromPayload(User $user, array $payload, ?string $sessionUuid = null): array
    {
        $savedResponses = [];
        
        // Récupérer toutes les questions actives
        $questions = Question::active()->get()->keyBy('key');
        
        DB::transaction(function () use ($user, $payload, $sessionUuid, $questions, &$savedResponses) {
            foreach ($payload as $key => $value) {
                // Ignorer les champs qui ne sont pas des questions
                if (in_array($key, ['questionnaire_completed', 'email'])) {
                    continue;
                }
                
                $question = $questions->get($key);
                
                if (!$question) {
                    // Question non trouvée - peut être un champ legacy ou supprimé
                    Log::warning("Question not found for key: {$key}", [
                        'user_id' => $user->id,
                        'key' => $key,
                    ]);
                    continue;
                }
                
                // Vérifier si la question doit être affichée (logique conditionnelle)
                if (!$question->shouldShow($payload)) {
                    // Question conditionnelle non applicable - supprimer la réponse si elle existe
                    UserQuestionnaireResponse::where('user_id', $user->id)
                        ->where('question_id', $question->id)
                        ->delete();
                    continue;
                }
                
                // Créer ou mettre à jour la réponse
                $response = UserQuestionnaireResponse::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'value' => is_array($value) ? null : (string) $value,
                        'value_json' => is_array($value) ? $value : null,
                        // 'question_version_id' => $question->getCurrentVersionId(), // Pour l'instant, on utilise question_id
                        'session_uuid' => $sessionUuid,
                        'answered_at' => now(),
                    ]
                );
                
                $savedResponses[] = $response;
            }
        });
        
        return $savedResponses;
    }

    /**
     * Récupérer toutes les réponses d'un utilisateur formatées.
     * 
     * @param User $user
     * @return array Format: ['question_key' => value, ...]
     */
    public function getUserResponses(User $user): array
    {
        $responses = UserQuestionnaireResponse::where('user_id', $user->id)
            ->with('question')
            ->latest('answered_at')
            ->get()
            ->unique('question_id'); // Prendre la dernière réponse pour chaque question
        
        $formatted = [];
        
        foreach ($responses as $response) {
            $formatted[$response->question->key] = $response->getActualValue();
        }
        
        return $formatted;
    }

    /**
     * Récupérer les réponses avec les questions (pour affichage/modification).
     * 
     * @param User $user
     * @return array Format: [['question' => Question, 'response' => Response, 'value' => mixed], ...]
     */
    public function getUserResponsesWithQuestions(User $user): array
    {
        $questions = Question::active()->ordered()->get();
        $responses = UserQuestionnaireResponse::where('user_id', $user->id)
            ->with('question')
            ->latest('answered_at')
            ->get()
            ->keyBy('question_id');
        
        $result = [];
        
        foreach ($questions as $question) {
            $response = $responses->get($question->id);
            
            $result[] = [
                'question' => $question,
                'response' => $response,
                'value' => $response ? $response->getActualValue() : null,
                'answered_at' => $response ? $response->answered_at : null,
            ];
        }
        
        return $result;
    }

    /**
     * Mettre à jour une réponse spécifique.
     * 
     * @param User $user
     * @param string $questionKey
     * @param mixed $value
     * @return UserQuestionnaireResponse
     */
    public function updateResponse(User $user, string $questionKey, $value): UserQuestionnaireResponse
    {
        $question = Question::where('key', $questionKey)->firstOrFail();
        
        $response = UserQuestionnaireResponse::updateOrCreate(
            [
                'user_id' => $user->id,
                'question_id' => $question->id,
            ],
            [
                'value' => is_array($value) ? null : (string) $value,
                'value_json' => is_array($value) ? $value : null,
                // 'question_version_id' => $question->getCurrentVersionId(), // Pour l'instant, on utilise question_id
                'answered_at' => now(),
            ]
        );
        
        // Synchroniser avec user_profiles
        $this->syncToUserProfile($user);
        
        return $response;
    }

    /**
     * Synchroniser les réponses normalisées vers user_profiles (pour compatibilité).
     * 
     * @param User $user
     * @return UserProfile
     */
    public function syncToUserProfile(User $user): UserProfile
    {
        $responses = $this->getUserResponses($user);
        
        // Ajouter questionnaire_completed si toutes les réponses requises sont présentes
        $requiredQuestions = Question::active()->where('required', true)->pluck('key');
        $allRequiredAnswered = $requiredQuestions->every(function ($key) use ($responses) {
            $value = $responses[$key] ?? null;
            
            // Pour les arrays, vérifier qu'ils ne sont pas vides
            if (is_array($value)) {
                return count($value) > 0;
            }
            
            return !empty($value);
        });
        
        $responses['questionnaire_completed'] = $allRequiredAnswered;
        
        // Utiliser ProfileService pour mettre à jour (réutilise toute la validation)
        $profileService = app(ProfileService::class);
        return $profileService->updateProfile($user, $responses);
    }

    /**
     * Synchroniser user_profiles vers les réponses normalisées (migration/import).
     * 
     * @param User $user
     * @return array Réponses créées
     */
    public function syncFromUserProfile(User $user): array
    {
        $profile = $user->profile;
        
        if (!$profile) {
            return [];
        }
        
        $payload = $profile->toArray();
        unset($payload['id'], $payload['user_id'], $payload['created_at'], $payload['updated_at']);
        
        return $this->saveResponsesFromPayload($user, $payload);
    }

    /**
     * Récupérer les réponses formatées pour l'IA (avec contexte).
     * 
     * @param User $user
     * @return array Format optimisé pour l'analyse IA
     */
    public function getResponsesForAI(User $user): array
    {
        $responses = $this->getUserResponsesWithQuestions($user);
        
        $aiData = [
            'user_id' => $user->id,
            'responses' => [],
            'metadata' => [
                'total_questions' => count($responses),
                'answered_questions' => count(array_filter($responses, fn($r) => $r['value'] !== null)),
                'completed_at' => $user->profile?->updated_at,
            ],
        ];
        
        foreach ($responses as $item) {
            if ($item['value'] === null) {
                continue;
            }
            
            $aiData['responses'][] = [
                'question_key' => $item['question']->key,
                'question_label' => $item['question']->label,
                'question_section' => $item['question']->section,
                'value' => $item['value'],
                'answered_at' => $item['answered_at']?->toIso8601String(),
            ];
        }
        
        return $aiData;
    }
}

