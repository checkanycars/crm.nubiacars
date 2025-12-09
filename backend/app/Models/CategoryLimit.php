<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category',
        'limit',
    ];

    protected $casts = [
        'limit' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the category limit.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
