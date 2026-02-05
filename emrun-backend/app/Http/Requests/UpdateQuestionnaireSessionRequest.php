<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateQuestionnaireSessionRequest
 * 
 * Validation légère pour la mise à jour de session anonyme.
 * Validation des types uniquement, pas de règles required.
 */
class UpdateQuestionnaireSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'payload' => 'nullable|array',
            'payload.email' => 'nullable|email|max:255',
            // Validation légère des types uniquement
            'payload.first_name' => 'nullable|string|max:255',
            'payload.last_name' => 'nullable|string|max:255',
            'payload.birth_date' => 'nullable|date',
            'payload.gender' => 'nullable|in:male,female,other',
            'payload.height_cm' => 'nullable|integer|between:50,250',
            'payload.weight_kg' => 'nullable|integer|between:20,300',
            'payload.primary_goal' => 'nullable|in:me_lancer,reprendre,entretenir,ameliorer_condition,courir_race,ameliorer_chrono,autre',
            'payload.primary_goal_other' => 'nullable|string|max:500',
            'payload.race_distance' => 'nullable|in:5km,10km,15km,20km,25km,semi_marathon,marathon,autre',
            'payload.race_distance_km' => 'nullable|integer|min:1|max:50',
            'payload.target_race_date' => 'nullable|date',
            'payload.intermediate_objectives' => 'nullable|string|max:1000',
            'payload.current_race_times' => 'nullable|array',
            'payload.current_race_times.*.distance' => 'required_with:payload.current_race_times|string',
            'payload.current_race_times.*.time' => 'required_with:payload.current_race_times|string',
            'payload.current_weekly_volume_km' => 'nullable|integer|min:0|max:100',
            'payload.current_runs_per_week' => 'nullable|in:0,1_2,3_4,5_6,7_plus',
            'payload.available_days' => 'nullable|array',
            'payload.available_days.*' => 'in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'payload.running_experience_period' => 'nullable|in:je_commence,1_11_mois,1_10_ans,plus_10_ans',
            'payload.problem_to_solve' => 'nullable|in:structure,blessure,motivation,autre',
            'payload.problem_to_solve_other' => 'nullable|string|max:500',
            'payload.injuries' => 'nullable|array',
            'payload.injuries.*' => 'string',
            'payload.training_locations' => 'nullable|array',
            'payload.training_locations.*' => 'in:route,chemins,piste,tapis,autre',
            'payload.training_location_other' => 'nullable|string|max:255',
            'payload.equipment' => 'nullable|string|max:1000',
            'payload.personal_constraints' => 'nullable|string|max:1000',
            'completed' => 'nullable|boolean',
        ];
    }
}

