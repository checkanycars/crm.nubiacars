<?php

namespace App\Http\Middleware;

use App\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasFinanceAccess
{
    /**
     * Handle an incoming request.
     *
     * Ensures the authenticated user has either Finance or Manager role.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (! $request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if user has Finance or Manager role
        $user = $request->user();
        $hasAccess = $user->role === UserRole::Finance || $user->role === UserRole::Manager;

        if (! $hasAccess) {
            return response()->json([
                'message' => 'Unauthorized. Only finance users and managers can access this resource.',
                'required_roles' => ['finance', 'manager'],
                'user_role' => $user->role->value ?? $user->role,
            ], 403);
        }

        return $next($request);
    }
}
