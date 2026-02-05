<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * UserQuestionnaireResponse Model
 * 
 * Stocke les réponses individuelles des utilisateurs aux questions.
 * Permet de:
 * - Voir l'historique des réponses
 * - Modifier les réponses
 * - Analyser les réponses pour l'IA
 */
class UserQuestionnaireResponse extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'question_id',
        'value',
        'value_json',
        // 'question_version_id', // Pour l'instant, on utilise question_id directement
        'session_uuid',
        'answered_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value_json' => 'array',
            'answered_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns this response.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the question this response belongs to.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    /**
     * Get the actual value (from value or value_json depending on question type).
     */
    public function getActualValue()
    {
        if ($this->value_json !== null) {
            return $this->value_json;
        }
        return $this->value;
    }

    /**
     * Set the value (automatically determines if it should be in value or value_json).
     */
    public function setActualValue($value): void
    {
        if (is_array($value)) {
            $this->value_json = $value;
            $this->value = null;
        } else {
            $this->value = (string) $value;
            $this->value_json = null;
        }
    }

    /**
     * Scope to get responses for a specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get responses for a specific question.
     */
    public function scopeForQuestion($query, int $questionId)
    {
        return $query->where('question_id', $questionId);
    }

    /**
     * Scope to get the latest response for each question.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('answered_at', 'desc');
    }
}

