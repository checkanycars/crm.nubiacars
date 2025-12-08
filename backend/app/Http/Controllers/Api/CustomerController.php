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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::query();

        // Filter by logged-in user if they are a sales person
        // Only show customers that have leads assigned to this sales person
        $user = $request->user();
        if ($user && $user->isSales()) {
            $query->whereHas('leads', function ($q) use ($user) {
                $q->where('assigned_to', $user->id);
            });
        }

        // Optionally load documents
        if ($request->get('with_documents')) {
            $query->with('documents');
        }

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
        \Log::info('CustomerController@store called');
        \Log::info('Request all data:', $request->all());
        \Log::info('Request files:', $request->allFiles());
        \Log::info('Has documents file:', ['has' => $request->hasFile('documents')]);
        
        // Create the customer without documents
        $customerData = $request->except('documents');
        $customer = Customer::create($customerData);
        \Log::info('Customer created:', ['id' => $customer->id]);

        // Handle document uploads if present
        if ($request->hasFile('documents')) {
            \Log::info('Documents found in request');
            $documents = $request->file('documents');
            \Log::info('Document count:', ['count' => count($documents)]);
            
            foreach ($documents as $index => $file) {
                \Log::info("Processing document {$index}", [
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime' => $file->getMimeType(),
                ]);
                
                // Generate a unique filename
                $storedName = Str::uuid() . '.pdf';
                
                // Store the file in the customer-documents directory
                $path = $file->storeAs(
                    'customer-documents/' . $customer->id,
                    $storedName,
                    'local'
                );
                
                \Log::info("File stored", [
                    'path' => $path,
                    'stored_name' => $storedName,
                    'full_path' => storage_path('app/' . $path),
                    'exists' => file_exists(storage_path('app/' . $path)),
                ]);

                // Create the document record
                $document = $customer->documents()->create([
                    'filename' => $file->getClientOriginalName(),
                    'stored_name' => $storedName,
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
                
                \Log::info('Document record created:', ['id' => $document->id]);
            }
        } else {
            \Log::warning('No documents in request');
        }

        // Load documents relationship
        $customer->load('documents');
        \Log::info('Loaded documents for customer:', ['count' => $customer->documents->count()]);

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
        // Load documents relationship
        $customer->load('documents');

        return response()->json([
            'data' => new CustomerResource($customer),
        ], 200);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        // Update the customer without documents
        $customerData = $request->except('documents');
        $customer->update($customerData);

        // Handle document uploads if present
        if ($request->hasFile('documents')) {
            foreach ($request->file('documents') as $file) {
                // Generate a unique filename
                $storedName = Str::uuid() . '.pdf';
                
                // Store the file in the customer-documents directory
                $path = $file->storeAs(
                    'customer-documents/' . $customer->id,
                    $storedName,
                    'local'
                );

                // Create the document record
                $customer->documents()->create([
                    'filename' => $file->getClientOriginalName(),
                    'stored_name' => $storedName,
                    'path' => $path,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        // Load documents relationship
        $customer->load('documents');

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
        // Delete all associated documents from storage
        foreach ($customer->documents as $document) {
            if (Storage::disk('local')->exists($document->path)) {
                Storage::disk('local')->delete($document->path);
            }
        }

        // Delete the customer (documents will be cascade deleted)
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully.',
        ], 200);
    }
}
