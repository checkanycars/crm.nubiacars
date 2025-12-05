<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LeadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function (Request $request) {
    return response()->json(['status' => 200, 'message' => 'Api is running']);
});

Route::get('/server-time', function () {
    return response()->json([
        'timezone' => config('app.timezone'),
        'current_time' => now()->toDateTimeString(),
        'current_time_iso' => now()->toISOString(),
        'timestamp' => now()->timestamp,
    ]);
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Lead routes
    Route::apiResource('leads', LeadController::class);
    Route::get('/leads-statistics', [LeadController::class, 'statistics']);
    Route::post('/leads-bulk-destroy', [LeadController::class, 'bulkDestroy']);
    Route::get('/leads-export', [LeadController::class, 'export']);
});
