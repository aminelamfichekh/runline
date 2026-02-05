<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add 15km, 20km, 25km to race_distance enum for "Autre distance" wheel.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance ENUM('5km', '10km', '15km', '20km', '25km', 'semi_marathon', 'marathon') NULL");
        }
        // SQLite uses string columns; app validation accepts 15km/20km/25km.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE user_profiles MODIFY COLUMN race_distance ENUM('5km', '10km', 'semi_marathon', 'marathon') NULL");
        }
    }
};
