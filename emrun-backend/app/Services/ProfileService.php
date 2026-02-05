<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * ProfileService
 * 
 * Handles all user profile-related business logic.
 * Manages the questionnaire data and profile updates.
 */
class ProfileService
{
    /**
     * Get or create user profile.
     *
     * @param User $user
     * @return UserProfile
     */
    public function getOrCreateProfile(User $user): UserProfile
    {
        return $user->profile ?? UserProfile::create(['user_id' => $user->id]);
    }

    /**
     * Get user profile.
     *
     * @param User $user
     * @return UserProfile|null
     */
    public function getProfile(User $user): ?UserProfile
    {
        return $user->profile;
    }

    /**
     * Update user profile.
     *
     * @param User $user
     * @param array $data
     * @return UserProfile
     * @throws \Illuminate\Validation\ValidationException
     */
    public function updateProfile(User $user, array $data): UserProfile
    {
        // Merge with existing profile data for conditional validation
        $profile = $this->getOrCreateProfile($user);
        $mergedData = array_merge($profile->toArray(), $data);
        
        $validator = Validator::make($data, [
            // Basic Information
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'height_cm' => 'nullable|integer|min:50|max:250',
            'weight_kg' => 'nullable|integer|min:20|max:300',
            
            // Completion tracking
            'questionnaire_completed' => 'nullable|boolean',
            
            // Primary Goal
            'primary_goal' => 'nullable|in:me_lancer,reprendre,entretenir,ameliorer_condition,courir_race,ameliorer_chrono,autre',
            'primary_goal_other' => 'nullable|required_if:primary_goal,autre|string|max:500',
            
            // Race Goal Details (conditional - required if courir_race or ameliorer_chrono)
            'race_distance' => 'nullable|required_if:primary_goal,courir_race|required_if:primary_goal,ameliorer_chrono|in:5km,10km,15km,20km,25km,semi_marathon,marathon,autre',
            'race_distance_km' => 'nullable|integer|min:1|max:50', // Legacy field
            'race_distance_other' => 'nullable|string|max:500', // Text description when race_distance is 'autre'
            'target_race_date' => 'nullable|required_if:primary_goal,courir_race|required_if:primary_goal,ameliorer_chrono|date|after:today',
            'intermediate_objectives' => 'nullable|string|max:1000',
            'current_race_times' => 'nullable|array',
            'current_race_times.*.distance' => 'required_with:current_race_times|string',
            'current_race_times.*.time' => 'required_with:current_race_times|string',
            
            // Current Running Status
            'current_weekly_volume_km' => 'nullable|integer|min:0|max:100',
            'current_runs_per_week' => 'nullable|in:0,1_2,3_4,5_6,7_plus',
            'available_days' => 'nullable|array',
            'available_days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            
            // Running Experience
            'running_experience_period' => 'nullable|in:je_commence,je_reprends,1_4_semaines,1_11_mois,1_10_ans,plus_10_ans',
            'running_experience_weeks' => 'nullable|string|max:10', // e.g., "1w", "2w", "3w", "4w"
            'running_experience_months' => 'nullable|string|max:10', // e.g., "1m", "2m", etc.
            'running_experience_years' => 'nullable|string|max:10', // e.g., "1y", "2y", etc.
            'running_experience' => 'nullable|string|max:255', // Legacy field
            
            // Problem to Solve
            'problem_to_solve' => 'nullable|in:structure,blessure,motivation,autre',
            'problem_to_solve_other' => 'nullable|required_if:problem_to_solve,autre|string|max:500',
            
            // Injuries and Limitations
            'injuries' => 'nullable|array',
            'injuries.*' => 'string',
            
            // Training Locations
            'training_locations' => 'nullable|array',
            'training_locations.*' => 'in:route,chemins,piste,tapis,autre',
            'training_location_other' => 'nullable|string|max:255',
            
            // Equipment
            'equipment' => 'nullable|string|max:1000',
            
            // Personal/Professional Constraints
            'personal_constraints' => 'nullable|string|max:1000',
            
            // Legacy fields (for backward compatibility)
            'weekly_frequency' => 'nullable|integer|min:1|max:7',
            'average_pace_min_per_km' => 'nullable|integer|min:2|max:15',
            'longest_run_km' => 'nullable|integer|min:0|max:500',
            'preferences' => 'nullable|array',
        ]);

        // Custom conditional validation for race goal fields
        $validator->after(function ($validator) use ($data, $mergedData) {
            $primaryGoal = $data['primary_goal'] ?? $mergedData['primary_goal'] ?? null;
            
            // If primary goal is courir_race or ameliorer_chrono, race_distance and target_race_date are required
            if (in_array($primaryGoal, ['courir_race', 'ameliorer_chrono'])) {
                if (empty($data['race_distance']) && empty($mergedData['race_distance'])) {
                    $validator->errors()->add('race_distance', 'The race distance is required when primary goal is a race.');
                }
                if (empty($data['target_race_date']) && empty($mergedData['target_race_date'])) {
                    $validator->errors()->add('target_race_date', 'The target race date is required when primary goal is a race.');
                }
            }
            
            // Validate current_weekly_volume_km is multiple of 5 (0-100km)
            if (isset($data['current_weekly_volume_km']) && $data['current_weekly_volume_km'] !== null) {
                if ($data['current_weekly_volume_km'] % 5 !== 0) {
                    $validator->errors()->add('current_weekly_volume_km', 'The current weekly volume must be a multiple of 5 km (0-100km).');
                }
            }
            
            // Validate training_location_other is required if "autre" is in training_locations
            $trainingLocations = $data['training_locations'] ?? $mergedData['training_locations'] ?? [];
            if (is_array($trainingLocations) && in_array('autre', $trainingLocations)) {
                if (empty($data['training_location_other']) && empty($mergedData['training_location_other'])) {
                    $validator->errors()->add('training_location_other', 'Please specify the training location when "autre" is selected.');
                }
            }
        });

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Handle conditional fields - clear race goal fields if primary goal changes
        if (isset($data['primary_goal']) && !in_array($data['primary_goal'], ['courir_race', 'ameliorer_chrono'])) {
            // If primary goal is not race-related, clear race-specific fields
            if (empty($data['race_distance'])) {
                $data['race_distance'] = null;
            }
            if (empty($data['race_distance_km'])) {
                $data['race_distance_km'] = null;
            }
            if (empty($data['race_distance_other'])) {
                $data['race_distance_other'] = null;
            }
            if (empty($data['target_race_date'])) {
                $data['target_race_date'] = null;
            }
            if (empty($data['intermediate_objectives'])) {
                $data['intermediate_objectives'] = null;
            }
        }
        if (isset($data['race_distance']) && $data['race_distance'] !== 'autre') {
            $data['race_distance_km'] = null;
            $data['race_distance_other'] = null;
        }
        
        // Ensure primary_goal_other is cleared if primary_goal is not "autre"
        if (isset($data['primary_goal']) && $data['primary_goal'] !== 'autre') {
            $data['primary_goal_other'] = null;
        }
        
        // Ensure problem_to_solve_other is cleared if problem_to_solve is not "autre"
        if (isset($data['problem_to_solve']) && $data['problem_to_solve'] !== 'autre') {
            $data['problem_to_solve_other'] = null;
        }
        
        // Ensure training_location_other is cleared if "autre" is not in training_locations
        if (isset($data['training_locations']) && is_array($data['training_locations']) && !in_array('autre', $data['training_locations'])) {
            $data['training_location_other'] = null;
        }
        
        // Check if questionnaire is being completed
        $requiredFields = [
            'first_name',
            'last_name',
            'birth_date',
            'gender',
            'height_cm',
            'weight_kg',
            'primary_goal',
            'current_weekly_volume_km',
            'current_runs_per_week',
            'available_days',
            'running_experience_period',
            'training_locations',
        ];

        // If primary goal is race-related, also require race fields
        $primaryGoal = $data['primary_goal'] ?? $profile->primary_goal;
        if (in_array($primaryGoal, ['courir_race', 'ameliorer_chrono'])) {
            $requiredFields[] = 'race_distance';
            $requiredFields[] = 'target_race_date';
        }

        $allRequiredPresent = true;
        foreach ($requiredFields as $field) {
            $value = $data[$field] ?? $profile->$field ?? null;
            
            // Special handling for array fields - they must have at least one element
            if (in_array($field, ['available_days', 'training_locations'])) {
                if (!is_array($value) || count($value) === 0) {
                    $allRequiredPresent = false;
                    break;
                }
            } else {
                // For other fields, check if empty
                if (empty($value) && $value !== 0 && $value !== '0') {
                    $allRequiredPresent = false;
                    break;
                }
            }
        }

        // When race_distance is 'autre', race_distance_other (text description) is required
        $raceDistance = $data['race_distance'] ?? $profile->race_distance ?? null;
        if ($raceDistance === 'autre') {
            $raceOther = $data['race_distance_other'] ?? $profile->race_distance_other ?? null;
            if (empty($raceOther) || trim($raceOther) === '') {
                $allRequiredPresent = false;
            }
        }

        // Handle questionnaire_completed: if frontend sends it, use it directly
        // Otherwise, auto-detect based on required fields
        if (isset($data['questionnaire_completed'])) {
            // Frontend explicitly set it - use it directly
            $data['questionnaire_completed'] = (bool) $data['questionnaire_completed'];
        } else {
            // Auto-detect completion based on required fields
            $data['questionnaire_completed'] = $allRequiredPresent;
        }

        // Log what we're about to save
        \Log::info('Saving profile data', [
            'user_id' => $user->id,
            'questionnaire_completed' => $data['questionnaire_completed'],
            'questionnaire_completed_type' => gettype($data['questionnaire_completed']),
            'data_keys' => array_keys($data),
        ]);

        // Update the profile - use update() which handles mass assignment correctly
        $updated = $profile->update($data);
        
        if (!$updated) {
            \Log::error('Profile update failed', [
                'user_id' => $user->id,
                'profile_id' => $profile->id,
            ]);
            throw new \Exception('Failed to update profile');
        }

        // Refresh to get the latest data from database
        $profile = $profile->fresh();

        // Verify questionnaire_completed was actually saved
        if (isset($data['questionnaire_completed']) && $data['questionnaire_completed'] && !$profile->questionnaire_completed) {
            \Log::warning('questionnaire_completed not saved, forcing update', [
                'user_id' => $user->id,
                'expected' => true,
                'actual' => $profile->questionnaire_completed,
            ]);
            // Force it directly
            \DB::table('user_profiles')
                ->where('id', $profile->id)
                ->update(['questionnaire_completed' => true]);
            $profile->refresh();
        }

        // Log the result
        \Log::info('Profile saved successfully', [
            'user_id' => $user->id,
            'profile_id' => $profile->id,
            'questionnaire_completed' => $profile->questionnaire_completed,
            'questionnaire_completed_type' => gettype($profile->questionnaire_completed),
        ]);

        return $profile;
    }

    /**
     * Mark questionnaire as completed.
     *
     * @param User $user
     * @return UserProfile
     */
    public function completeQuestionnaire(User $user): UserProfile
    {
        $profile = $this->getOrCreateProfile($user);
        $profile->update(['questionnaire_completed' => true]);

        return $profile->fresh();
    }

    /**
     * Check if questionnaire is completed.
     *
     * @param User $user
     * @return bool
     */
    public function isQuestionnaireCompleted(User $user): bool
    {
        $profile = $user->profile;
        return $profile && $profile->questionnaire_completed;
    }
}
