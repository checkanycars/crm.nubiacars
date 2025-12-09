<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify the enum column to include 'finance' role
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('manager', 'sales', 'finance') NOT NULL DEFAULT 'sales'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if any users have the 'finance' role
        $financeUsers = DB::table('users')->where('role', 'finance')->count();

        if ($financeUsers > 0) {
            throw new \Exception("Cannot remove 'finance' role from enum. {$financeUsers} user(s) have this role. Please reassign them first.");
        }

        // Remove 'finance' from the enum
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('manager', 'sales') NOT NULL DEFAULT 'sales'");
    }
};
