<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarBrandRequest;
use App\Http\Requests\UpdateCarBrandRequest;
use App\Http\Resources\CarBrandResource;
use App\Models\CarBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CarBrandController extends Controller
{
    /**
     * Display a listing of car brands.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CarBrand::query();

        // Optional: Include models with brands
        if ($request->has('include_models')) {
            $query->with('models');
        }

        // Optional: Add counts
        if ($request->has('with_counts')) {
            $query->withCount('models');
        }

        // Optional: Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $brands = $query->latest()->paginate($perPage);

        return CarBrandResource::collection($brands);
    }

    /**
     * Store a newly created car brand.
     */
    public function store(StoreCarBrandRequest $request): JsonResponse
    {
        $brand = CarBrand::create($request->validated());

        return response()->json([
            'message' => 'Car brand created successfully.',
            'data' => new CarBrandResource($brand),
        ], 201);
    }

    /**
     * Display the specified car brand.
     */
    public function show(Request $request, CarBrand $carBrand): CarBrandResource
    {
        // Optional: Load relationships
        if ($request->has('include_models')) {
            $carBrand->load('models.trims');
        }

        if ($request->has('with_counts')) {
            $carBrand->loadCount('models');
        }

        return new CarBrandResource($carBrand);
    }

    /**
     * Update the specified car brand.
     */
    public function update(UpdateCarBrandRequest $request, CarBrand $carBrand): JsonResponse
    {
        $carBrand->update($request->validated());

        return response()->json([
            'message' => 'Car brand updated successfully.',
            'data' => new CarBrandResource($carBrand),
        ]);
    }

    /**
     * Remove the specified car brand.
     */
    public function destroy(CarBrand $carBrand): JsonResponse
    {
        $carBrand->delete();

        return response()->json([
            'message' => 'Car brand deleted successfully.',
        ]);
    }
}
