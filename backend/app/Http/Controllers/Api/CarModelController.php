<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarModelRequest;
use App\Http\Requests\UpdateCarModelRequest;
use App\Http\Resources\CarModelResource;
use App\Models\CarModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CarModelController extends Controller
{
    /**
     * Display a listing of car models.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CarModel::query();

        // Optional: Include brand with models
        if ($request->has('include_brand')) {
            $query->with('brand');
        }

        // Optional: Include trims with models
        if ($request->has('include_trims')) {
            $query->with('trims');
        }

        // Optional: Add counts
        if ($request->has('with_counts')) {
            $query->withCount('trims');
        }

        // Optional: Filter by brand
        if ($request->has('brand_id')) {
            $query->where('brand_id', $request->brand_id);
        }

        // Optional: Search by model name
        if ($request->has('search')) {
            $query->where('model_name', 'like', '%'.$request->search.'%');
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $models = $query->latest()->paginate($perPage);

        return CarModelResource::collection($models);
    }

    /**
     * Store a newly created car model.
     */
    public function store(StoreCarModelRequest $request): JsonResponse
    {
        $model = CarModel::create($request->validated());

        $model->load('brand');

        return response()->json([
            'message' => 'Car model created successfully.',
            'data' => new CarModelResource($model),
        ], 201);
    }

    /**
     * Display the specified car model.
     */
    public function show(Request $request, CarModel $carModel): CarModelResource
    {
        // Optional: Load relationships
        if ($request->has('include_brand')) {
            $carModel->load('brand');
        }

        if ($request->has('include_trims')) {
            $carModel->load('trims');
        }

        if ($request->has('with_counts')) {
            $carModel->loadCount('trims');
        }

        return new CarModelResource($carModel);
    }

    /**
     * Update the specified car model.
     */
    public function update(UpdateCarModelRequest $request, CarModel $carModel): JsonResponse
    {
        $carModel->update($request->validated());

        $carModel->load('brand');

        return response()->json([
            'message' => 'Car model updated successfully.',
            'data' => new CarModelResource($carModel),
        ]);
    }

    /**
     * Remove the specified car model.
     */
    public function destroy(CarModel $carModel): JsonResponse
    {
        $carModel->delete();

        return response()->json([
            'message' => 'Car model deleted successfully.',
        ]);
    }
}
