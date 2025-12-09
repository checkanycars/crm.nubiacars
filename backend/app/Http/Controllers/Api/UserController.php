<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUserRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\User;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users (Manager only).
     */
    public function index(Request $request): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        $query = User::query();

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role')) {
            $role = $request->input('role');
            if (in_array($role, ['manager', 'sales'])) {
                $query->where('role', $role);
            }
        }

        // Filter by status (active users have recent last_login)
        if ($request->has('status')) {
            $status = $request->input('status');
            if ($status === 'active') {
                $query->whereNotNull('last_login_at')
                    ->where('last_login_at', '>=', now()->subDays(30));
            } elseif ($status === 'inactive') {
                $query->where(function ($q) {
                    $q->whereNull('last_login_at')
                        ->orWhere('last_login_at', '<', now()->subDays(30));
                });
            }
        }

        // Sort by
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        if (in_array($sortBy, ['name', 'email', 'role', 'created_at', 'last_login_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        // Pagination
        $perPage = $request->input('per_page', 15);
        $users = $query->paginate($perPage);

        return response()->json([
            'users' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ], 200);
    }

    /**
     * Get user statistics (Manager only).
     */
    public function statistics(Request $request): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        $totalUsers = User::count();
        $totalManagers = User::where('role', UserRole::Manager)->count();
        $totalSales = User::where('role', UserRole::Sales)->count();
        $totalFinance = User::where('role', UserRole::Finance)->count();

        $activeUsers = User::whereNotNull('last_login_at')
            ->where('last_login_at', '>=', now()->subDays(30))
            ->count();

        $inactiveUsers = $totalUsers - $activeUsers;

        $recentUsers = User::where('created_at', '>=', now()->subDays(30))->count();

        return response()->json([
            'statistics' => [
                'total_users' => $totalUsers,
                'total_managers' => $totalManagers,
                'total_sales' => $totalSales,
                'total_finance' => $totalFinance,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'recent_users' => $recentUsers,
            ],
        ], 200);
    }

    /**
     * Store a newly created user (Manager only).
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        $validated = $request->validated();

        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ];

        // Set target_price (default 50000 if not provided)
        $userData['target_price'] = $validated['target_price'] ?? 50000;

        $user = User::create($userData);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => new UserResource($user),
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): JsonResponse
    {
        // Manager can view any user, sales can only view themselves
        if (! $request->user()->isManager() && $request->user()->id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized. You can only view your own profile.',
            ], 403);
        }

        return response()->json([
            'user' => new UserResource($user),
        ], 200);
    }

    /**
     * Update the specified user (Manager only).
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        $validated = $request->validated();

        // Update user fields
        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['email'])) {
            $user->email = $validated['email'];
        }

        if (isset($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if (isset($validated['role'])) {
            $user->role = $validated['role'];
        }

        // Update target_price if provided, otherwise set default if null
        if (array_key_exists('target_price', $validated)) {
            $user->target_price = $validated['target_price'];
        } elseif (is_null($user->target_price)) {
            $user->target_price = 50000;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => new UserResource($user),
        ], 200);
    }

    /**
     * Remove the specified user (Manager only).
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        // Prevent deleting yourself
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        // Check if user has assigned leads
        $assignedLeadsCount = $user->assignedLeads()->count();
        if ($assignedLeadsCount > 0) {
            return response()->json([
                'message' => "Cannot delete user. User has {$assignedLeadsCount} assigned lead(s). Please reassign them first.",
            ], 422);
        }

        $userName = $user->name;
        $user->delete();

        return response()->json([
            'message' => "User '{$userName}' deleted successfully.",
        ], 200);
    }

    /**
     * Get list of sales users for assignment dropdown.
     */
    public function salesList(Request $request): JsonResponse
    {
        // Both managers and sales can view sales list
        $salesUsers = User::where('role', UserRole::Sales)
            ->orderBy('name')
            ->get();

        return response()->json([
            'sales' => UserResource::collection($salesUsers),
        ], 200);
    }

    /**
     * Get list of all assignable users (both sales and managers) for assignment dropdown.
     */
    public function assignableList(Request $request): JsonResponse
    {
        // Get all users (both managers and sales) for lead assignment
        $assignableUsers = User::whereIn('role', [UserRole::Sales, UserRole::Manager])
            ->orderBy('role', 'desc') // Managers first
            ->orderBy('name')
            ->get();

        return response()->json([
            'users' => UserResource::collection($assignableUsers),
        ], 200);
    }

    /**
     * Bulk delete users (Manager only).
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        // Check if user is manager
        if (! $request->user()->isManager()) {
            return response()->json([
                'message' => 'Unauthorized. Manager access required.',
            ], 403);
        }

        $request->validate([
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $userIds = $request->input('user_ids');

        // Remove current user from deletion list
        $userIds = array_filter($userIds, function ($id) use ($request) {
            return $id !== $request->user()->id;
        });

        if (empty($userIds)) {
            return response()->json([
                'message' => 'Cannot delete selected users.',
            ], 422);
        }

        // Check for users with assigned leads
        $usersWithLeads = User::whereIn('id', $userIds)
            ->has('assignedLeads')
            ->pluck('name')
            ->toArray();

        if (! empty($usersWithLeads)) {
            return response()->json([
                'message' => 'Cannot delete users with assigned leads: '.implode(', ', $usersWithLeads),
            ], 422);
        }

        $deletedCount = User::whereIn('id', $userIds)->delete();

        return response()->json([
            'message' => "{$deletedCount} user(s) deleted successfully.",
            'deleted_count' => $deletedCount,
        ], 200);
    }
}
