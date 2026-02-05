<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add new fields for enhanced running experience tracking and race distance description.
     */
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            // Add race_distance_other for text description when race_distance is 'autre'
            $table->string('race_distance_other', 500)->nullable()->after('race_distance_km');

            // Add running experience detail fields
            $table->string('running_experience_weeks', 10)->nullable()->after('running_experience_period');
            $table->string('running_experience_months', 10)->nullable()->after('running_experience_weeks');
            $table->string('running_experience_years', 10)->nullable()->after('running_experience_months');
        });

        // Update running_experience_period enum to include 'je_reprends' and '1_4_semaines'
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN running_experience_period ENUM('je_commence', 'je_reprends', '1_4_semaines', '1_11_mois', '1_10_ans', 'plus_10_ans') NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert running_experience_period enum
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN running_experience_period ENUM('je_commence', '1_11_mois', '1_10_ans', 'plus_10_ans') NULL");
        }

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'race_distance_other',
                'running_experience_weeks',
                'running_experience_months',
                'running_experience_years',
            ]);
        });
    }
};
