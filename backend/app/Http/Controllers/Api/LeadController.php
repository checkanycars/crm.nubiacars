<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreLeadRequest;
use App\Http\Requests\Api\UpdateLeadRequest;
use App\Http\Resources\Api\LeadResource;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeadController extends Controller
{
    /**
     * Display a listing of the leads.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Lead::query()->with(['assignedUser', 'customer']);

        // Filter by active status (only show active leads by default)
        // Allow viewing inactive leads with ?include_inactive=true parameter
        if (! $request->boolean('include_inactive')) {
            $query->where('is_active', true);
        }

        // Filter by logged-in user if they are a sales person
        $user = $request->user();
        if ($user && $user->isSales()) {
            $query->where('assigned_to', $user->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter by assigned user
        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Filter by source
        if ($request->has('source')) {
            $query->where('source', $request->source);
        }

        // Search by lead name or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_name', 'like', "%{$search}%")
                    ->orWhereHas('customer', function ($customerQuery) use ($search) {
                        $customerQuery->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by car company
        if ($request->has('car_company')) {
            $query->where('car_company', 'like', "%{$request->car_company}%");
        }

        // Filter by model
        if ($request->has('model')) {
            $query->where('model', 'like', "%{$request->model}%");
        }

        // Filter by model year
        if ($request->has('model_year')) {
            $query->where('model_year', $request->model_year);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sort
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $leads = $query->paginate($perPage);

        return LeadResource::collection($leads);
    }

    /**
     * Store a newly created lead in storage.
     */
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $lead = Lead::create($request->validated());

        $lead->load(['assignedUser', 'customer']);

        return response()->json([
            'message' => 'Lead created successfully.',
            'data' => new LeadResource($lead),
        ], 201);
    }

    /**
     * Display the specified lead.
     */
    public function show(Lead $lead): JsonResponse
    {
        $lead->load(['assignedUser', 'customer']);

        return response()->json([
            'data' => new LeadResource($lead),
        ], 200);
    }

    /**
     * Update the specified lead in storage.
     */
    public function update(UpdateLeadRequest $request, Lead $lead): JsonResponse
    {
        $lead->update($request->validated());

        $lead->load(['assignedUser', 'customer']);

        return response()->json([
            'message' => 'Lead updated successfully.',
            'data' => new LeadResource($lead),
        ], 200);
    }

    /**
     * Remove the specified lead from storage.
     */
    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json([
            'message' => 'Lead deleted successfully.',
        ], 200);
    }

    /**
     * Get lead statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $query = Lead::where('is_active', true);

        // Filter by logged-in user if they are a sales person
        $user = $request->user();
        if ($user && $user->isSales()) {
            $query->where('assigned_to', $user->id);
        }

        $stats = [
            'total' => (clone $query)->count(),
            'new' => (clone $query)->where('status', 'new')->count(),
            'converted' => (clone $query)->where('status', 'converted')->count(),
            'not_converted' => (clone $query)->where('status', 'not_converted')->count(),
            'contacted' => (clone $query)->where('status', 'contacted')->count(),
            'high_priority' => (clone $query)->where('priority', 'high')->count(),
            'medium_priority' => (clone $query)->where('priority', 'medium')->count(),
            'low_priority' => (clone $query)->where('priority', 'low')->count(),
        ];

        return response()->json([
            'data' => $stats,
        ], 200);
    }

    /**
     * Get lead statistics by category (converted leads only).
     */
    public function categoryStatistics(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $request->get('user_id', $user->id);

        // Only managers can view other users' statistics
        if ($userId != $user->id && ! $user->isManager()) {
            return response()->json([
                'message' => 'Unauthorized to view other user statistics.',
            ], 403);
        }

        // Query only converted leads
        $query = Lead::where('is_active', true)
            ->where('status', 'converted')
            ->where('assigned_to', $userId);

        $stats = [
            'local_new' => (clone $query)->where('category', 'local_new')->count(),
            'local_used' => (clone $query)->where('category', 'local_used')->count(),
            'premium_export' => (clone $query)->where('category', 'premium_export')->count(),
            'regular_export' => (clone $query)->where('category', 'regular_export')->count(),
            'commercial_export' => (clone $query)->where('category', 'commercial_export')->count(),
        ];

        return response()->json([
            'data' => [
                'user_id' => (int) $userId,
                'statistics' => $stats,
            ],
        ], 200);
    }

    /**
     * Get performance statistics for sales and managers.
     */
    public function performance(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $request->get('user_id', $user->id);

        // Only managers can view other users' performance
        if ($userId != $user->id && ! $user->isManager()) {
            return response()->json([
                'message' => 'Unauthorized to view other user performance.',
            ], 403);
        }

        // Get target based on role
        $targetUser = $userId != $user->id ? \App\Models\User::find($userId) : $user;
        if (! $targetUser) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        $targetAmount = $targetUser->isManager() ? 70000 : 50000;

        // Get converted leads for this user
        $convertedLeads = Lead::where('is_active', true)
            ->where('status', 'converted')
            ->where('assigned_to', $userId)
            ->get();

        // Calculate total sales (sum of selling prices)
        $totalSales = $convertedLeads->sum('selling_price');

        // Calculate commission based on profit margins
        $commission = 0;
        $bonusCommission = 0;

        foreach ($convertedLeads as $lead) {
            $profitMargin = $lead->selling_price - $lead->cost_price;

            // Commission based on profit margin ranges (0-35k target)
            if ($totalSales <= 35000) {
                if ($profitMargin >= 2000 && $profitMargin < 4000) {
                    $commission += $profitMargin * 0.03; // 3%
                } elseif ($profitMargin >= 4000 && $profitMargin < 7000) {
                    $commission += $profitMargin * 0.07; // 7%
                } elseif ($profitMargin >= 7000) {
                    $commission += $profitMargin * 0.10; // 10%
                }
            }
        }

        // Bonus commission based on crossing targets
        if ($totalSales > 35000 && $totalSales <= 50000) {
            $bonusCommission = 500;
        } elseif ($totalSales > 50000) {
            $bonusCommission = 1000;
        }

        // Calculate remaining to target
        $remainingToTarget = max(0, $targetAmount - $totalSales);
        $progressPercentage = min(100, ($totalSales / $targetAmount) * 100);

        return response()->json([
            'data' => [
                'user_id' => $userId,
                'user_name' => $targetUser->name,
                'user_role' => $targetUser->role->value,
                'target' => [
                    'amount' => $targetAmount,
                    'achieved' => $totalSales,
                    'remaining' => $remainingToTarget,
                    'progress_percentage' => round($progressPercentage, 2),
                ],
                'commission' => [
                    'base_commission' => round($commission, 2),
                    'bonus_commission' => $bonusCommission,
                    'total_commission' => round($commission + $bonusCommission, 2),
                ],
                'deals' => [
                    'total_converted' => $convertedLeads->count(),
                    'total_sales_value' => $totalSales,
                ],
            ],
        ], 200);
    }

    /**
     * Bulk delete leads.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:leads,id'],
        ]);

        $count = Lead::where('is_active', true)->whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$count} lead(s) deleted successfully.",
        ], 200);
    }

    /**
     * Export leads to CSV.
     */
    public function export(Request $request): JsonResponse
    {
        $query = Lead::query()->where('is_active', true)->with(['assignedUser', 'customer']);

        // Filter by logged-in user if they are a sales person
        $user = $request->user();
        if ($user && $user->isSales()) {
            $query->where('assigned_to', $user->id);
        }

        $leads = $query->get();

        $data = $leads->map(function ($lead) {
            return [
                'ID' => $lead->id,
                'Lead Name' => $lead->lead_name,
                'Customer Name' => $lead->customer?->full_name ?? 'N/A',
                'Customer Email' => $lead->customer?->email ?? 'N/A',
                'Customer Phone' => $lead->customer?->phone ?? 'N/A',
                'Status' => $lead->status->value,
                'Category' => $lead->category?->value ?? 'N/A',
                'Source' => $lead->source,
                'Car Company' => $lead->car_company,
                'Model' => $lead->model,
                'Trim' => $lead->trim,
                'Spec' => $lead->spec,
                'Model Year' => $lead->model_year,
                'Interior Colour' => $lead->interior_colour,
                'Exterior Colour' => $lead->exterior_colour,
                'Gear Box' => $lead->gear_box,
                'Car Type' => $lead->car_type,
                'Fuel Tank' => $lead->fuel_tank,
                'Steering Side' => $lead->steering_side,
                'Export To' => $lead->export_to,
                'Export To Country' => $lead->export_to_country,
                'Quantity' => $lead->quantity,
                'Selling Price' => $lead->selling_price,
                'Cost Price' => $lead->cost_price,
                'Priority' => $lead->priority->value,
                'Assigned To' => $lead->assignedUser?->name ?? 'N/A',
                'Created At' => $lead->created_at?->toDateTimeString(),
            ];
        });

        return response()->json([
            'data' => $data,
        ], 200);
    }

    /**
     * Deactivate a lead (hide from frontend).
     */
    public function deactivate(Lead $lead): JsonResponse
    {
        $lead->update(['is_active' => false]);

        return response()->json([
            'message' => 'Lead deactivated successfully.',
            'data' => new LeadResource($lead),
        ], 200);
    }

    /**
     * Activate a lead (show in frontend).
     */
    public function activate(Lead $lead): JsonResponse
    {
        $lead->update(['is_active' => true]);

        return response()->json([
            'message' => 'Lead activated successfully.',
            'data' => new LeadResource($lead),
        ], 200);
    }
}
