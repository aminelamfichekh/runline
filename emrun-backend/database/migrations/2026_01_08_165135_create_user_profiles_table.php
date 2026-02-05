<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Basic Information
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->integer('height_cm')->nullable(); // Height in centimeters
            $table->integer('weight_kg')->nullable(); // Weight in kilograms
            
            // Primary Goal (updated to match roadmap requirements)
            $table->enum('primary_goal', [
                'me_lancer',              // Me lancer dans la course à pied
                'reprendre',              // Reprendre la course à pied
                'entretenir',             // Entretenir ma forme
                'ameliorer_condition',    // Améliorer ma condition physique générale
                'courir_race',            // Courir un 5 km / 10 km / semi-marathon / marathon
                'ameliorer_chrono',       // Améliorer mon chrono sur 5 km / 10 km / semi-marathon / marathon
                'autre'                   // Autres
            ])->nullable();
            $table->string('primary_goal_other')->nullable(); // If "autre" is selected
            
            // Race Goal Details (conditional - only if courir_race or ameliorer_chrono)
            $table->enum('race_distance', ['5km', '10km', 'semi_marathon', 'marathon'])->nullable();
            $table->date('target_race_date')->nullable();
            $table->text('intermediate_objectives')->nullable(); // Objectif(s) intermédiaire(s)
            
            // Current Race Times (optional - with distance)
            $table->json('current_race_times')->nullable(); // [{distance: "5km", time: "25:00"}, ...]
            
            // Current Running Status
            $table->integer('current_weekly_volume_km')->nullable(); // 0-100km/week, increments of 5km
            $table->enum('current_runs_per_week', ['0', '1_2', '3_4', '5_6', '7_plus'])->nullable();
            // 0 = Pas du tout, 1_2 = Un peu, 3_4 = Beaucoup, 5_6 = Passionnément, 7_plus = A la folie
            $table->json('available_days')->nullable(); // Array of days: ['monday', 'tuesday', ...]
            
            // Running Experience
            $table->enum('running_experience_period', [
                'je_commence',    // Je commence
                '1_11_mois',      // 1 mois à 11 mois
                '1_10_ans',       // 1 an à 10 ans
                'plus_10_ans'     // + de 10 ans
            ])->nullable();
            $table->string('running_experience')->nullable(); // Legacy field - kept for backward compatibility
            
            // Problem to Solve
            $table->enum('problem_to_solve', [
                'structure',     // besoin de structure
                'blessure',      // retour de blessure
                'motivation',    // motivation
                'autre'          // autre
            ])->nullable();
            $table->string('problem_to_solve_other')->nullable();
            
            // Injuries and Limitations
            $table->json('injuries')->nullable(); // Array of injury strings
            
            // Training Locations (multiple choice)
            $table->json('training_locations')->nullable(); // Array: ['route', 'chemins', 'piste', 'tapis', 'autre']
            $table->string('training_location_other')->nullable(); // If "autre" is selected
            
            // Equipment
            $table->text('equipment')->nullable(); // chaussures, ceinture cardio, montre GPS...
            
            // Personal/Professional Constraints
            $table->text('personal_constraints')->nullable(); // travail de nuit, garde d'enfants...
            
            // Legacy fields (kept for backward compatibility)
            $table->integer('weekly_frequency')->nullable(); // Days per week available - deprecated, use available_days instead
            $table->integer('average_pace_min_per_km')->nullable(); // Average pace in minutes per km
            $table->integer('longest_run_km')->nullable(); // Longest run in kilometers
            $table->text('preferences')->nullable(); // JSON field for training preferences - kept for backward compatibility
            
            // Completion tracking
            $table->boolean('questionnaire_completed')->default(false);
            
            $table->timestamps();
            $table->index('user_id');
            $table->index('primary_goal');
            $table->index('questionnaire_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
