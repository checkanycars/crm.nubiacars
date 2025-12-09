<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\LeadStatus;
use App\Models\Lead;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FinanceController extends Controller
{
    /**
     * Check if user has finance access (Finance or Manager role).
     */
    private function canAccessFinance(Request $request): bool
    {
        $user = $request->user();

        return $user->role === UserRole::Finance || $user->role === UserRole::Manager;
    }

    /**
     * Get all converted leads pending finance approval.
     */
    public function pendingApprovals(Request $request)
    {
        // Only finance users and managers can access this
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can access this resource.',
            ], 403);
        }

        $query = Lead::with(['customer', 'assignedUser', 'approvedBy'])
            ->where('status', LeadStatus::Converted)
            ->whereNull('finance_approved');

        // Search functionality
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_name', 'like', "%{$search}%")
                    ->orWhere('car_company', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('assignedUser', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by assigned user
        if ($request->has('assigned_to') && ! empty($request->assigned_to)) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'updated_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $leads = $query->paginate($perPage);

        return response()->json($leads);
    }

    /**
     * Get all approved leads.
     */
    public function approvedLeads(Request $request)
    {
        // Only finance users and managers can access this
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can access this resource.',
            ], 403);
        }

        $query = Lead::with(['customer', 'assignedUser', 'approvedBy'])
            ->where('status', LeadStatus::Converted)
            ->where('finance_approved', true);

        // Search functionality
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_name', 'like', "%{$search}%")
                    ->orWhere('car_company', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('assignedUser', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by commission paid status
        if ($request->has('commission_paid')) {
            $query->where('commission_paid', $request->commission_paid === 'true' || $request->commission_paid === true);
        }

        // Filter by assigned user
        if ($request->has('assigned_to') && ! empty($request->assigned_to)) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'approved_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $leads = $query->paginate($perPage);

        return response()->json($leads);
    }

    /**
     * Get all rejected leads.
     */
    public function rejectedLeads(Request $request)
    {
        // Only finance users and managers can access this
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can access this resource.',
            ], 403);
        }

        $query = Lead::with(['customer', 'assignedUser', 'approvedBy'])
            ->where('status', LeadStatus::Converted)
            ->where('finance_approved', false);

        // Search functionality
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_name', 'like', "%{$search}%")
                    ->orWhere('car_company', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($q) use ($search) {
                        $q->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('assignedUser', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by assigned user
        if ($request->has('assigned_to') && ! empty($request->assigned_to)) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'approved_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $leads = $query->paginate($perPage);

        return response()->json($leads);
    }

    /**
     * Approve a converted lead.
     */
    public function approve(Request $request, Lead $lead)
    {
        // Only finance users and managers can approve
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can approve leads.',
            ], 403);
        }

        // Validate the lead is converted and not already approved
        if ($lead->status !== LeadStatus::Converted) {
            return response()->json([
                'message' => 'Only converted leads can be approved.',
            ], 422);
        }

        if ($lead->finance_approved !== null) {
            return response()->json([
                'message' => 'This lead has already been processed.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Approve the lead
            $lead->finance_approved = true;
            $lead->approved_by = $request->user()->id;
            $lead->approved_at = now();
            $lead->rejection_reason = null;
            $lead->save();

            // Calculate and add commission to the sales user
            if ($lead->assigned_to) {
                $salesUser = User::find($lead->assigned_to);
                if ($salesUser && $salesUser->role === UserRole::Sales) {
                    // Calculate commission (selling_price - cost_price)
                    $profit = ($lead->selling_price ?? 0) - ($lead->cost_price ?? 0);
                    $commissionAmount = $profit * ($salesUser->commission / 100);

                    // Add bonus commission if applicable
                    if ($salesUser->bonus_commission > 0) {
                        $commissionAmount += $profit * ($salesUser->bonus_commission / 100);
                    }

                    // Update user's total commission
                    $salesUser->increment('commission', $commissionAmount);
                }
            }

            DB::commit();

            // Reload relationships
            $lead->load(['customer', 'assignedUser', 'approvedBy']);

            return response()->json([
                'message' => 'Lead approved successfully and commission added.',
                'lead' => $lead,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to approve lead.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Reject a converted lead.
     */
    public function reject(Request $request, Lead $lead)
    {
        // Only finance users and managers can reject
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can reject leads.',
            ], 403);
        }

        // Validate the lead is converted and not already processed
        if ($lead->status !== LeadStatus::Converted) {
            return response()->json([
                'message' => 'Only converted leads can be rejected.',
            ], 422);
        }

        if ($lead->finance_approved !== null) {
            return response()->json([
                'message' => 'This lead has already been processed.',
            ], 422);
        }

        // Validate rejection reason
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Reject the lead
        $lead->finance_approved = false;
        $lead->approved_by = $request->user()->id;
        $lead->approved_at = now();
        $lead->rejection_reason = $request->rejection_reason;
        $lead->save();

        // Reload relationships
        $lead->load(['customer', 'assignedUser', 'approvedBy']);

        return response()->json([
            'message' => 'Lead rejected successfully.',
            'lead' => $lead,
        ]);
    }

    /**
     * Mark commission as paid for an approved lead.
     */
    public function markCommissionPaid(Request $request, Lead $lead)
    {
        // Only finance users and managers can mark commission as paid
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can mark commission as paid.',
            ], 403);
        }

        // Validate the lead is approved
        if (! $lead->isApproved()) {
            return response()->json([
                'message' => 'Only approved leads can have commission marked as paid.',
            ], 422);
        }

        if ($lead->commission_paid) {
            return response()->json([
                'message' => 'Commission has already been marked as paid for this lead.',
            ], 422);
        }

        // Mark commission as paid
        $lead->commission_paid = true;
        $lead->save();

        // Reload relationships
        $lead->load(['customer', 'assignedUser', 'approvedBy']);

        return response()->json([
            'message' => 'Commission marked as paid successfully.',
            'lead' => $lead,
        ]);
    }

    /**
     * Get finance statistics.
     */
    public function statistics(Request $request)
    {
        // Only finance users and managers can access this
        if (! $this->canAccessFinance($request)) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can access this resource.',
            ], 403);
        }

        $stats = [
            'pending_approvals' => Lead::where('status', LeadStatus::Converted)
                ->whereNull('finance_approved')
                ->count(),

            'approved_leads' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', true)
                ->count(),

            'rejected_leads' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', false)
                ->count(),

            'pending_commission_payment' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', true)
                ->where('commission_paid', false)
                ->count(),

            'total_approved_value' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', true)
                ->sum('selling_price'),

            'total_commission_paid' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', true)
                ->where('commission_paid', true)
                ->sum(DB::raw('selling_price - cost_price')),

            'total_pending_commission' => Lead::where('status', LeadStatus::Converted)
                ->where('finance_approved', true)
                ->where('commission_paid', false)
                ->sum(DB::raw('selling_price - cost_price')),
        ];

        // Get top sales users by approved leads
        $topSalesUsers = Lead::select('assigned_to', DB::raw('COUNT(*) as approved_count'))
            ->where('status', LeadStatus::Converted)
            ->where('finance_approved', true)
            ->whereNotNull('assigned_to')
            ->groupBy('assigned_to')
            ->orderByDesc('approved_count')
            ->limit(5)
            ->with('assignedUser:id,name,email')
            ->get();

        $stats['top_sales_users'] = $topSalesUsers;

        // Get recent activities
        $recentActivities = Lead::with(['assignedUser', 'approvedBy'])
            ->where('status', LeadStatus::Converted)
            ->whereNotNull('finance_approved')
            ->orderByDesc('approved_at')
            ->limit(10)
            ->get();

        $stats['recent_activities'] = $recentActivities;

        return response()->json($stats);
    }
}
