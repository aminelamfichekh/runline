<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('goal_time', 10)->nullable()->after('target_race_date');
            // Stored as "HH:MM:SS" e.g. "0:30:00" for 30min, "1:45:00" for 1h45
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn('goal_time');
        });
    }
};
