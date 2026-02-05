<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add race_distance_km (1-50) for "Autre distance" and add 'autre' to race_distance enum.
     */
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->unsignedTinyInteger('race_distance_km')->nullable()->after('race_distance');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance ENUM('5km', '10km', '15km', '20km', '25km', 'semi_marathon', 'marathon', 'autre') NULL");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn('race_distance_km');
        });

        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance ENUM('5km', '10km', '15km', '20km', '25km', 'semi_marathon', 'marathon') NULL");
        }
    }
};
