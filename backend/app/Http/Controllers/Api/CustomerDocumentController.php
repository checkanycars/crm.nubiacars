<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\CustomerDocumentResource;
use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerDocumentController extends Controller
{
    /**
     * Display a listing of the customer's documents.
     */
    public function index(Customer $customer): AnonymousResourceCollection
    {
        $documents = $customer->documents()->latest()->get();

        return CustomerDocumentResource::collection($documents);
    }

    /**
     * Store newly uploaded documents for a customer.
     */
    public function store(Request $request, Customer $customer): JsonResponse
    {
        $request->validate([
            'documents' => ['required', 'array', 'min:1'],
            'documents.*' => ['required', 'file', 'mimes:pdf', 'max:2048'], // 2MB max
        ], [
            'documents.required' => 'At least one document is required.',
            'documents.*.mimes' => 'Only PDF files are allowed.',
            'documents.*.max' => 'Each file must not exceed 2MB.',
        ]);

        $uploadedDocuments = [];

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
            $document = $customer->documents()->create([
                'filename' => $file->getClientOriginalName(),
                'stored_name' => $storedName,
                'path' => $path,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            $uploadedDocuments[] = new CustomerDocumentResource($document);
        }

        return response()->json([
            'message' => count($uploadedDocuments) === 1 
                ? 'Document uploaded successfully.' 
                : count($uploadedDocuments) . ' documents uploaded successfully.',
            'data' => $uploadedDocuments,
        ], 201);
    }

    /**
     * Display the specified document.
     */
    public function show(Customer $customer, CustomerDocument $document): JsonResponse
    {
        // Ensure the document belongs to the customer
        if ($document->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'Document not found.',
            ], 404);
        }

        return response()->json([
            'data' => new CustomerDocumentResource($document),
        ], 200);
    }

    /**
     * Download the specified document.
     */
    public function download(Customer $customer, CustomerDocument $document): BinaryFileResponse|JsonResponse
    {
        // Ensure the document belongs to the customer
        if ($document->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'Document not found.',
            ], 404);
        }

        // Check if file exists
        if (!Storage::disk('local')->exists($document->path)) {
            return response()->json([
                'message' => 'File not found on server.',
            ], 404);
        }

        // Return the file for inline viewing (opens in browser)
        return response()->file(
            Storage::disk('local')->path($document->path),
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="' . $document->filename . '"'
            ]
        );
    }

    /**
     * Remove the specified document from storage.
     */
    public function destroy(Customer $customer, CustomerDocument $document): JsonResponse
    {
        // Ensure the document belongs to the customer
        if ($document->customer_id !== $customer->id) {
            return response()->json([
                'message' => 'Document not found.',
            ], 404);
        }

        // Delete the file from storage
        if (Storage::disk('local')->exists($document->path)) {
            Storage::disk('local')->delete($document->path);
        }

        // Delete the database record
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully.',
        ], 200);
    }
}