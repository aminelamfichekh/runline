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
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('start_date'); // First Monday after signup
            $table->date('end_date'); // Sunday before first Monday of next month
            $table->text('content'); // The generated plan content (JSON or text)
            $table->enum('type', ['initial', 'monthly'])->default('initial');
            $table->enum('status', ['pending', 'generating', 'completed', 'failed'])->default('pending');
            $table->text('openai_prompt')->nullable(); // Store the prompt used
            $table->text('openai_response')->nullable(); // Store the raw OpenAI response
            $table->integer('openai_tokens_used')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'start_date']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
