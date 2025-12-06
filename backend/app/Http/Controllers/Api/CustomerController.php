<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCustomerRequest;
use App\Http\Requests\Api\UpdateCustomerRequest;
use App\Http\Resources\Api\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by full name, email, or phone
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortField = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate
        $perPage = $request->get('per_page', 15);
        $customers = $query->paginate($perPage);

        return CustomerResource::collection($customers);
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = Customer::create($request->validated());

        return response()->json([
            'message' => 'Customer created successfully.',
            'data' => new CustomerResource($customer),
        ], 201);
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json([
            'data' => new CustomerResource($customer),
        ], 200);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return response()->json([
            'message' => 'Customer updated successfully.',
            'data' => new CustomerResource($customer),
        ], 200);
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ], 200);
    }
}
