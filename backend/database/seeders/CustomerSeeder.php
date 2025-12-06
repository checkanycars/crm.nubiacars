<?php

namespace Database\Seeders;

use App\CustomerStatus;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create 5 specific customers with different statuses
        Customer::factory()->create([
            'full_name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1 234-567-8900',
            'status' => CustomerStatus::Lead,
            'notes' => 'Interested in purchasing a luxury sedan. Follow up next week.',
        ]);

        Customer::factory()->create([
            'full_name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'phone' => '+1 234-567-8901',
            'status' => CustomerStatus::Active,
            'notes' => 'Recently purchased a vehicle. Very satisfied with the service.',
        ]);

        Customer::factory()->create([
            'full_name' => 'Michael Johnson',
            'email' => 'michael.j@example.com',
            'phone' => '+1 234-567-8902',
            'status' => CustomerStatus::Inactive,
            'notes' => 'No longer interested. Purchased from competitor.',
        ]);

        Customer::factory()->create([
            'full_name' => 'Sarah Williams',
            'email' => 'sarah.w@example.com',
            'phone' => '+1 234-567-8903',
            'status' => CustomerStatus::Lead,
            'notes' => 'Looking for a family SUV. Budget: $40,000.',
        ]);

        Customer::factory()->create([
            'full_name' => 'David Brown',
            'email' => 'david.brown@example.com',
            'phone' => '+1 234-567-8904',
            'status' => CustomerStatus::Active,
            'notes' => 'Repeat customer. Interested in trade-in options.',
        ]);
    }
}
