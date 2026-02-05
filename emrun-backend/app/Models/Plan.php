<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Plan Model
 * 
 * Represents a generated training plan for a user.
 * Can be either 'initial' (first plan) or 'monthly' (updated plan).
 */
class Plan extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'start_date',
        'end_date',
        'content',
        'type',
        'status',
        'openai_prompt',
        'openai_response',
        'openai_tokens_used',
        'error_message',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'content' => 'array',
            'openai_tokens_used' => 'integer',
        ];
    }

    /**
     * Get the user that owns the plan.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
