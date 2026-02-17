<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds missing fields and updates enums to match frontend questionnaire.
     */
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            // Add missing running experience fields (for wheel picker values)
            if (!Schema::hasColumn('user_profiles', 'running_experience_weeks')) {
                $table->string('running_experience_weeks', 10)->nullable()->after('running_experience_period');
            }
            if (!Schema::hasColumn('user_profiles', 'running_experience_months')) {
                $table->string('running_experience_months', 10)->nullable()->after('running_experience_weeks');
            }
            if (!Schema::hasColumn('user_profiles', 'running_experience_years')) {
                $table->string('running_experience_years', 10)->nullable()->after('running_experience_months');
            }

            // Add missing race distance fields
            if (!Schema::hasColumn('user_profiles', 'race_distance_km')) {
                $table->integer('race_distance_km')->nullable()->after('race_distance');
            }
            if (!Schema::hasColumn('user_profiles', 'race_distance_other')) {
                $table->string('race_distance_other', 500)->nullable()->after('race_distance_km');
            }

            // Add pause_duration for "reprendre" flow
            if (!Schema::hasColumn('user_profiles', 'pause_duration')) {
                $table->string('pause_duration', 20)->nullable()->after('primary_goal_other');
            }

            // Add records field for personal records
            if (!Schema::hasColumn('user_profiles', 'records')) {
                $table->text('records')->nullable()->after('pause_duration');
            }

            // Add objectives field for intermediate objectives text
            if (!Schema::hasColumn('user_profiles', 'objectives')) {
                $table->text('objectives')->nullable()->after('intermediate_objectives');
            }
        });

        // Update race_distance enum to include all options
        // Note: MySQL doesn't support easy enum modification, so we'll change to string
        DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance VARCHAR(50) NULL");

        // Update running_experience_period enum to include all options
        DB::statement("ALTER TABLE user_profiles MODIFY COLUMN running_experience_period VARCHAR(50) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'running_experience_weeks',
                'running_experience_months',
                'running_experience_years',
                'race_distance_km',
                'race_distance_other',
                'pause_duration',
                'records',
                'objectives',
            ]);
        });

        // Revert to original enums (this may fail if data doesn't match)
        DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance ENUM('5km', '10km', 'semi_marathon', 'marathon') NULL");
        DB::statement("ALTER TABLE user_profiles MODIFY COLUMN running_experience_period ENUM('je_commence', '1_11_mois', '1_10_ans', 'plus_10_ans') NULL");
    }
};
