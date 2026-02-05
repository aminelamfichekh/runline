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
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'first_name', 'primary_goal', 'height_cm'
            $table->string('section')->nullable(); // e.g., 'basic_info', 'goals', 'running_status'
            $table->integer('order')->default(0); // Ordre d'affichage
            $table->string('type'); // 'text', 'number', 'date', 'enum', 'multi_select', 'textarea'
            $table->string('label'); // Label/question en français
            $table->text('description')->nullable(); // Description/help text
            $table->boolean('required')->default(false);
            $table->boolean('active')->default(true); // Permet de désactiver une question
            
            // Pour les questions de type enum ou multi_select
            $table->json('options')->nullable(); // [{value: 'male', label: 'Homme'}, ...]
            
            // Validation rules (JSON)
            $table->json('validation_rules')->nullable(); // {min: 50, max: 250, multiple_of: 5}
            
            // Logique conditionnelle
            $table->json('conditional_logic')->nullable(); // {depends_on: 'primary_goal', values: ['courir_race', 'ameliorer_chrono']}
            
            // Pour les champs "other" (si l'utilisateur sélectionne "autre")
            $table->string('other_field_key')->nullable(); // e.g., 'primary_goal_other' pour 'primary_goal'
            
            // Metadata
            $table->text('metadata')->nullable(); // JSON pour infos supplémentaires
            
            $table->timestamps();
            $table->softDeletes(); // Permet de garder l'historique si on supprime une question
            
            $table->index('key');
            $table->index('section');
            $table->index('order');
            $table->index('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};

