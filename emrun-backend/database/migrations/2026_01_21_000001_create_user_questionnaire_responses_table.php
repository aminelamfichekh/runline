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
        Schema::create('user_questionnaire_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            
            // La valeur de la réponse (peut être string, number, JSON selon le type de question)
            $table->text('value')->nullable(); // Pour les valeurs simples
            $table->json('value_json')->nullable(); // Pour les arrays (available_days, training_locations, etc.)
            
            // Version de la question au moment de la réponse (pour traçabilité)
            // Pour l'instant, on utilise question_id. Plus tard, on pourrait avoir un système de versioning
            // $table->foreignId('question_version_id')->nullable()->constrained('questions')->nullOnDelete();
            
            // Session UUID si la réponse vient d'une session anonyme
            $table->uuid('session_uuid')->nullable();
            
            // Timestamps
            $table->timestamp('answered_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            
            $table->timestamps();
            
            // Index pour performance
            $table->index('user_id');
            $table->index('question_id');
            $table->index(['user_id', 'question_id']); // Pour retrouver rapidement une réponse spécifique
            $table->index('session_uuid');
            $table->index('answered_at');
            
            // Un utilisateur ne peut avoir qu'une seule réponse active par question
            // (mais on garde l'historique avec updated_at)
            $table->unique(['user_id', 'question_id', 'answered_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_questionnaire_responses');
    }
};

