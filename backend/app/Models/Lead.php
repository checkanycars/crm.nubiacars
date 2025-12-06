<?php

namespace App\Models;

use App\LeadPriority;
use App\LeadStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    /** @use HasFactory<\Database\Factories\LeadFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'lead_name',
        'contact_name',
        'email',
        'phone',
        'status',
        'source',
        'car_company',
        'model',
        'trim',
        'spec',
        'model_year',
        'kilometers',
        'price',
        'notes',
        'priority',
        'not_converted_reason',
        'assigned_to',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'priority' => LeadPriority::class,
            'model_year' => 'integer',
            'kilometers' => 'integer',
            'price' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user assigned to this lead.
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Check if lead is new.
     */
    public function isNew(): bool
    {
        return $this->status === LeadStatus::New;
    }

    /**
     * Check if lead is converted.
     */
    public function isConverted(): bool
    {
        return $this->status === LeadStatus::Converted;
    }

    /**
     * Check if lead is not converted.
     */
    public function isNotConverted(): bool
    {
        return $this->status === LeadStatus::NotConverted;
    }

    /**
     * Check if lead has high priority.
     */
    public function isHighPriority(): bool
    {
        return $this->priority === LeadPriority::High;
    }
}
