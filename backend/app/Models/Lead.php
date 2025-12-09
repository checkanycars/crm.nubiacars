<?php

namespace App\Models;

use App\LeadCategory;
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
        'customer_id',
        'status',
        'category',
        'source',
        'car_company',
        'model',
        'trim',
        'spec',
        'model_year',
        'interior_colour',
        'exterior_colour',
        'gear_box',
        'car_type',
        'fuel_tank',
        'steering_side',
        'export_to',
        'export_to_country',
        'quantity',
        'selling_price',
        'cost_price',
        'notes',
        'priority',
        'not_converted_reason',
        'assigned_to',
        'is_active',
        'finance_approved',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'commission_paid',
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
            'category' => LeadCategory::class,
            'priority' => LeadPriority::class,
            'model_year' => 'integer',
            'quantity' => 'integer',
            'selling_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'is_active' => 'boolean',
            'finance_approved' => 'boolean',
            'commission_paid' => 'boolean',
            'approved_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the customer associated with this lead.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
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
     * Check if lead is contacted.
     */
    public function isContacted(): bool
    {
        return $this->status === LeadStatus::Contacted;
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

    /**
     * Check if lead is active.
     */
    public function isActive(): bool
    {
        return $this->is_active === true;
    }

    /**
     * Get the finance user who approved this lead.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if lead is approved by finance.
     */
    public function isApproved(): bool
    {
        return $this->finance_approved === true;
    }

    /**
     * Check if lead is rejected by finance.
     */
    public function isRejected(): bool
    {
        return $this->finance_approved === false;
    }

    /**
     * Check if lead is pending finance approval.
     */
    public function isPendingApproval(): bool
    {
        return $this->finance_approved === null && $this->isConverted();
    }

    /**
     * Check if commission has been paid.
     */
    public function isCommissionPaid(): bool
    {
        return $this->commission_paid === true;
    }
}
