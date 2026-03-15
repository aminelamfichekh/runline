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
        Schema::table('plans', function (Blueprint $table) {
            $table->renameColumn('openai_prompt', 'ai_prompt');
            $table->renameColumn('openai_response', 'ai_response');
            $table->renameColumn('openai_tokens_used', 'ai_tokens_used');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->renameColumn('ai_prompt', 'openai_prompt');
            $table->renameColumn('ai_response', 'openai_response');
            $table->renameColumn('ai_tokens_used', 'openai_tokens_used');
        });
    }
};
