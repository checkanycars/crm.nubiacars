<?php

namespace App\Models;

use App\CustomerStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'status',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CustomerStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Check if customer is a lead.
     */
    public function isLead(): bool
    {
        return $this->status === CustomerStatus::Lead;
    }

    /**
     * Check if customer is active.
     */
    public function isActive(): bool
    {
        return $this->status === CustomerStatus::Active;
    }

    /**
     * Check if customer is inactive.
     */
    public function isInactive(): bool
    {
        return $this->status === CustomerStatus::Inactive;
    }

    /**
     * Get the documents for the customer.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    /**
     * Get the leads for the customer.
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}