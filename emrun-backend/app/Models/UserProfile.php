<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserProfile Model
 * 
 * Stores the complete user questionnaire data.
 * This is the full profile information used for generating personalized training plans.
 */
class UserProfile extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        // Basic Information
        'first_name',
        'last_name',
        'birth_date',
        'gender',
        'height_cm',
        'weight_kg',
        
        // Primary Goal
        'primary_goal',
        'primary_goal_other',
        
        // Race Goal Details
        'race_distance',
        'race_distance_km', // 1-50 when race_distance is 'autre' (legacy)
        'race_distance_other', // text description when race_distance is 'autre'
        'target_race_date',
        'intermediate_objectives',
        'current_race_times',
        
        // Current Running Status
        'current_weekly_volume_km',
        'current_runs_per_week',
        'available_days',
        
        // Running Experience
        'running_experience_period',
        'running_experience_weeks', // weeks value when period is '1_4_semaines'
        'running_experience_months', // months value when period is '1_11_mois'
        'running_experience_years', // years value when period is '1_10_ans'
        'running_experience', // Legacy field
        
        // Problem to Solve
        'problem_to_solve',
        'problem_to_solve_other',
        
        // Injuries and Limitations
        'injuries',
        
        // Training Locations
        'training_locations',
        'training_location_other',
        
        // Equipment
        'equipment',
        
        // Personal/Professional Constraints
        'personal_constraints',
        
        // Legacy fields
        'weekly_frequency', // Deprecated, use available_days instead
        'average_pace_min_per_km',
        'longest_run_km',
        'preferences', // Legacy field
        
        // Completion tracking
        'questionnaire_completed',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'target_race_date' => 'date',
            'height_cm' => 'integer',
            'weight_kg' => 'integer',
            'race_distance_km' => 'integer',
            'current_weekly_volume_km' => 'integer',
            'weekly_frequency' => 'integer', // Legacy
            'average_pace_min_per_km' => 'integer',
            'longest_run_km' => 'integer',
            'questionnaire_completed' => 'boolean',
            
            // JSON fields
            'current_race_times' => 'array',
            'available_days' => 'array',
            'training_locations' => 'array',
            'injuries' => 'array',
            'preferences' => 'array', // Legacy
        ];
    }

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
