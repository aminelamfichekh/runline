<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * QuestionnaireSession Model
 * 
 * Stores anonymous questionnaire sessions that can be attached to user profiles
 * after authentication.
 */
class QuestionnaireSession extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'session_uuid',
        'payload',
        'completed',
        'user_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'completed' => 'boolean',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($session) {
            if (empty($session->session_uuid)) {
                $session->session_uuid = Str::uuid()->toString();
            }
        });
    }

    /**
     * Get the user that owns this session (if attached).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

