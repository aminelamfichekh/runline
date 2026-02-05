<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Question Model
 * 
 * Représente une question du questionnaire.
 * Permet de gérer dynamiquement les questions sans modifier le code.
 */
class Question extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'section',
        'order',
        'type',
        'label',
        'description',
        'required',
        'active',
        'options',
        'validation_rules',
        'conditional_logic',
        'other_field_key',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'required' => 'boolean',
            'active' => 'boolean',
            'options' => 'array',
            'validation_rules' => 'array',
            'conditional_logic' => 'array',
            'metadata' => 'array',
        ];
    }

    /**
     * Get all responses for this question.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(UserQuestionnaireResponse::class);
    }

    /**
     * Scope to get only active questions.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    /**
     * Scope to get questions ordered by order field.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('id');
    }

    /**
     * Scope to get questions by section.
     */
    public function scopeBySection($query, string $section)
    {
        return $query->where('section', $section);
    }

    /**
     * Check if this question should be shown based on conditional logic.
     */
    public function shouldShow(array $currentAnswers): bool
    {
        if (!$this->conditional_logic) {
            return true;
        }

        $dependsOn = $this->conditional_logic['depends_on'] ?? null;
        $requiredValues = $this->conditional_logic['values'] ?? [];

        if (!$dependsOn || empty($requiredValues)) {
            return true;
        }

        $dependentValue = $currentAnswers[$dependsOn] ?? null;

        return in_array($dependentValue, $requiredValues);
    }

    /**
     * Get the current version ID (for tracking changes).
     */
    public function getCurrentVersionId(): int
    {
        return $this->id; // Pour l'instant, on utilise l'ID. Plus tard, on pourrait avoir un système de versioning
    }
}

