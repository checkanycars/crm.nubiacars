<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExportCountryRequest;
use App\Http\Requests\UpdateExportCountryRequest;
use App\Http\Resources\ExportCountryResource;
use App\Models\ExportCountry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExportCountryController extends Controller
{
    /**
     * Display a listing of export countries.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = ExportCountry::query();

        // Filter only active countries by default
        if (! $request->has('show_inactive')) {
            $query->where('is_active', true);
        }

        // Optional: Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $countries = $query->orderBy('name', 'asc')->paginate($perPage);

        return ExportCountryResource::collection($countries);
    }

    /**
     * Store a newly created export country.
     */
    public function store(StoreExportCountryRequest $request): JsonResponse
    {
        $country = ExportCountry::create($request->validated());

        return response()->json([
            'message' => 'Export country created successfully.',
            'data' => new ExportCountryResource($country),
        ], 201);
    }

    /**
     * Display the specified export country.
     */
    public function show(ExportCountry $exportCountry): ExportCountryResource
    {
        return new ExportCountryResource($exportCountry);
    }

    /**
     * Update the specified export country.
     */
    public function update(UpdateExportCountryRequest $request, ExportCountry $exportCountry): JsonResponse
    {
        $exportCountry->update($request->validated());

        return response()->json([
            'message' => 'Export country updated successfully.',
            'data' => new ExportCountryResource($exportCountry),
        ]);
    }

    /**
     * Remove the specified export country.
     */
    public function destroy(ExportCountry $exportCountry): JsonResponse
    {
        $exportCountry->delete();

        return response()->json([
            'message' => 'Export country deleted successfully.',
        ]);
    }
}
