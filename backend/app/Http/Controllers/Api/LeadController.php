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
        $query = Lead::query()->with('assignedUser');

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

        // Search by lead name, contact name, email, or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('lead_name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
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

        $lead->load('assignedUser');

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
        $lead->load('assignedUser');

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

        $lead->load('assignedUser');

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
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Lead::count(),
            'new' => Lead::where('status', 'new')->count(),
            'converted' => Lead::where('status', 'converted')->count(),
            'not_converted' => Lead::where('status', 'not_converted')->count(),
            'high_priority' => Lead::where('priority', 'high')->count(),
            'medium_priority' => Lead::where('priority', 'medium')->count(),
            'low_priority' => Lead::where('priority', 'low')->count(),
        ];

        return response()->json([
            'data' => $stats,
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

        $count = Lead::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "{$count} lead(s) deleted successfully.",
        ], 200);
    }

    /**
     * Export leads to CSV.
     */
    public function export(Request $request): JsonResponse
    {
        $leads = Lead::query()->with('assignedUser')->get();

        $data = $leads->map(function ($lead) {
            return [
                'ID' => $lead->id,
                'Lead Name' => $lead->lead_name,
                'Contact Name' => $lead->contact_name,
                'Email' => $lead->email,
                'Phone' => $lead->phone,
                'Status' => $lead->status->value,
                'Source' => $lead->source,
                'Car Company' => $lead->car_company,
                'Model' => $lead->model,
                'Model Year' => $lead->model_year,
                'Kilometers' => $lead->kilometers,
                'Price' => $lead->price,
                'Priority' => $lead->priority->value,
                'Assigned To' => $lead->assignedUser?->name ?? 'N/A',
                'Created At' => $lead->created_at?->toDateTimeString(),
            ];
        });

        return response()->json([
            'data' => $data,
        ], 200);
    }
}
