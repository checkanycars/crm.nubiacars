<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CarBrandController;
use App\Http\Controllers\Api\CarModelController;
use App\Http\Controllers\Api\CarTrimController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ExportCountryController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\UserController;
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
    Route::patch('/leads/{lead}/deactivate', [LeadController::class, 'deactivate']);
    Route::patch('/leads/{lead}/activate', [LeadController::class, 'activate']);

    // Customer routes
    Route::apiResource('customers', CustomerController::class);
    
    // Customer document routes
    Route::get('customers/{customer}/documents', [\App\Http\Controllers\Api\CustomerDocumentController::class, 'index']);
    Route::post('customers/{customer}/documents', [\App\Http\Controllers\Api\CustomerDocumentController::class, 'store']);
    Route::get('customers/{customer}/documents/{document}', [\App\Http\Controllers\Api\CustomerDocumentController::class, 'show']);
    Route::get('customers/{customer}/documents/{document}/download', [\App\Http\Controllers\Api\CustomerDocumentController::class, 'download']);
    Route::delete('customers/{customer}/documents/{document}', [\App\Http\Controllers\Api\CustomerDocumentController::class, 'destroy']);

    // Car database routes
    Route::apiResource('car-brands', CarBrandController::class);
    Route::apiResource('car-models', CarModelController::class);
    Route::apiResource('car-trims', CarTrimController::class);

    // Export countries routes
    Route::apiResource('export-countries', ExportCountryController::class);

    // User management routes (Manager only - authorization checked in controller)
    Route::get('/users-statistics', [UserController::class, 'statistics']);
    Route::get('/users-sales-list', [UserController::class, 'salesList']);
    Route::post('/users-bulk-destroy', [UserController::class, 'bulkDestroy']);
    Route::apiResource('users', UserController::class);
});
