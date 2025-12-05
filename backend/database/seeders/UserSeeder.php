<?php

namespace Database\Seeders;

use App\Models\User;
use App\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Manager
        User::create([
            'name' => 'Manager',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Manager,
        ]);

        // Sales 1
        User::create([
            'name' => 'Sales One',
            'email' => 'sales1@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Sales,
        ]);

        // Sales 2
        User::create([
            'name' => 'Sales Two',
            'email' => 'sales2@example.com',
            'password' => Hash::make('password'),
            'role' => UserRole::Sales,
        ]);
    }
}
