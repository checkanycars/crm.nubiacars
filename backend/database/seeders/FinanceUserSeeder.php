<?php

namespace Database\Seeders;

use App\Models\User;
use App\UserRole;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FinanceUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a finance user if it doesn't exist
        $financeUser = User::where('email', 'finance@nubiacars.com')->first();

        if (! $financeUser) {
            User::create([
                'name' => 'Finance Manager',
                'email' => 'finance@nubiacars.com',
                'password' => Hash::make('password'),
                'role' => UserRole::Finance,
                'commission' => 0.00,
                'bonus_commission' => 0.00,
            ]);

            $this->command->info('Finance user created successfully!');
            $this->command->info('Email: finance@nubiacars.com');
            $this->command->info('Password: password');
        } else {
            $this->command->warn('Finance user already exists.');
        }

        // Update existing sales users with commission rates if not set
        $salesUsers = User::where('role', UserRole::Sales)
            ->whereNull('commission')
            ->orWhereNull('bonus_commission')
            ->get();

        foreach ($salesUsers as $user) {
            $user->update([
                'commission' => $user->commission ?? 5.00, // 5% default commission
                'bonus_commission' => $user->bonus_commission ?? 2.00, // 2% default bonus
            ]);
        }

        if ($salesUsers->count() > 0) {
            $this->command->info("Updated {$salesUsers->count()} sales users with default commission rates.");
        }
    }
}
