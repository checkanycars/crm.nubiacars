<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCarTrimRequest;
use App\Http\Requests\UpdateCarTrimRequest;
use App\Http\Resources\CarTrimResource;
use App\Models\CarTrim;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CarTrimController extends Controller
{
    /**
     * Display a listing of car trims.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CarTrim::query();

        // Optional: Include model with trims
        if ($request->has('include_model')) {
            $query->with('model.brand');
        }

        // Optional: Filter by model
        if ($request->has('model_id')) {
            $query->where('model_id', $request->model_id);
        }

        // Optional: Filter by body type
        if ($request->has('body_type')) {
            $query->where('body_type', $request->body_type);
        }

        // Optional: Filter by popularity level
        if ($request->has('popularity_level')) {
            $query->where('popularity_level', $request->popularity_level);
        }

        // Optional: Search by trim name
        if ($request->has('search')) {
            $query->where('trim_name', 'like', '%'.$request->search.'%');
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $trims = $query->latest()->paginate($perPage);

        return CarTrimResource::collection($trims);
    }

    /**
     * Store a newly created car trim.
     */
    public function store(StoreCarTrimRequest $request): JsonResponse
    {
        $trim = CarTrim::create($request->validated());

        $trim->load('model.brand');

        return response()->json([
            'message' => 'Car trim created successfully.',
            'data' => new CarTrimResource($trim),
        ], 201);
    }

    /**
     * Display the specified car trim.
     */
    public function show(Request $request, CarTrim $carTrim): CarTrimResource
    {
        // Optional: Load relationships
        if ($request->has('include_model')) {
            $carTrim->load('model.brand');
        }

        return new CarTrimResource($carTrim);
    }

    /**
     * Update the specified car trim.
     */
    public function update(UpdateCarTrimRequest $request, CarTrim $carTrim): JsonResponse
    {
        $carTrim->update($request->validated());

        $carTrim->load('model.brand');

        return response()->json([
            'message' => 'Car trim updated successfully.',
            'data' => new CarTrimResource($carTrim),
        ]);
    }

    /**
     * Remove the specified car trim.
     */
    public function destroy(CarTrim $carTrim): JsonResponse
    {
        $carTrim->delete();

        return response()->json([
            'message' => 'Car trim deleted successfully.',
        ]);
    }
}
