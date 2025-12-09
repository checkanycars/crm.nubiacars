<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategoryLimit;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryLimitController extends Controller
{
    /**
     * Get category limits for a user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userId = $request->get('user_id', $user->id);

        // Only managers can view other users' limits
        if ($userId != $user->id && ! $user->isManager()) {
            return response()->json([
                'message' => 'Unauthorized to view other user category limits.',
            ], 403);
        }

        // Get limits for the user
        $limits = CategoryLimit::where('user_id', $userId)->get();

        // Convert to key-value pairs
        $limitsData = [
            'local_new' => 0,
            'local_used' => 0,
            'premium_export' => 0,
            'regular_export' => 0,
            'commercial_export' => 0,
        ];

        foreach ($limits as $limit) {
            $limitsData[$limit->category] = $limit->limit;
        }

        return response()->json([
            'data' => [
                'user_id' => (int) $userId,
                'limits' => $limitsData,
            ],
        ], 200);
    }

    /**
     * Update category limits for a user (Manager only).
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only managers can set limits
        if (! $user->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Only managers can set category limits.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'limits' => ['required', 'array'],
            'limits.local_new' => ['nullable', 'integer', 'min:0'],
            'limits.local_used' => ['nullable', 'integer', 'min:0'],
            'limits.premium_export' => ['nullable', 'integer', 'min:0'],
            'limits.regular_export' => ['nullable', 'integer', 'min:0'],
            'limits.commercial_export' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $targetUserId = $request->input('user_id');
        $limits = $request->input('limits');

        // Verify target user exists
        $targetUser = User::find($targetUserId);
        if (! $targetUser) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        // Update or create limits for each category
        foreach ($limits as $category => $limit) {
            if ($limit !== null) {
                CategoryLimit::updateOrCreate(
                    [
                        'user_id' => $targetUserId,
                        'category' => $category,
                    ],
                    [
                        'limit' => $limit,
                    ]
                );
            }
        }

        // Get updated limits
        $updatedLimits = CategoryLimit::where('user_id', $targetUserId)->get();
        $limitsData = [
            'local_new' => 0,
            'local_used' => 0,
            'premium_export' => 0,
            'regular_export' => 0,
            'commercial_export' => 0,
        ];

        foreach ($updatedLimits as $limit) {
            $limitsData[$limit->category] = $limit->limit;
        }

        return response()->json([
            'message' => 'Category limits updated successfully.',
            'data' => [
                'user_id' => $targetUserId,
                'user_name' => $targetUser->name,
                'limits' => $limitsData,
            ],
        ], 200);
    }

    /**
     * Get list of users with their category limits (Manager only).
     */
    public function listUsers(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only managers can view all users' limits
        if (! $user->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Only managers can view all users.',
            ], 403);
        }

        // Get all users (sales and managers)
        $users = User::where('is_active', true)
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        $usersData = [];

        foreach ($users as $targetUser) {
            $limits = CategoryLimit::where('user_id', $targetUser->id)->get();

            $limitsData = [
                'local_new' => 0,
                'local_used' => 0,
                'premium_export' => 0,
                'regular_export' => 0,
                'commercial_export' => 0,
            ];

            foreach ($limits as $limit) {
                $limitsData[$limit->category] = $limit->limit;
            }

            $usersData[] = [
                'id' => $targetUser->id,
                'name' => $targetUser->name,
                'email' => $targetUser->email,
                'role' => $targetUser->role->value,
                'limits' => $limitsData,
            ];
        }

        return response()->json([
            'data' => $usersData,
        ], 200);
    }
}
