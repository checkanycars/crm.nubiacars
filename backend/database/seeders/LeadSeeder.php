<?php

namespace Database\Seeders;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get sales users
        $sales1 = User::where('email', 'sales1@example.com')->first();
        $sales2 = User::where('email', 'sales2@example.com')->first();

        // Create 3 sample leads
        Lead::create([
            'lead_name' => 'Al Futtaim Motors',
            'contact_name' => 'Ahmed Ali',
            'email' => 'ahmed.ali@example.com',
            'phone' => '+971-50-123-4567',
            'status' => 'new',
            'source' => 'Website',
            'car_company' => 'Toyota',
            'model' => 'Camry',
            'model_year' => 2023,
            'kilometers' => 15000,
            'price' => 85000.00,
            'notes' => 'Interested in buying a used Camry',
            'priority' => 'high',
            'assigned_to' => $sales1->id,
        ]);

        Lead::create([
            'lead_name' => 'Dubai Auto Trading',
            'contact_name' => 'Sarah Mohammed',
            'email' => 'sarah.m@example.com',
            'phone' => '+971-55-987-6543',
            'status' => 'new',
            'source' => 'Phone Call',
            'car_company' => 'BMW',
            'model' => 'X5',
            'model_year' => 2022,
            'kilometers' => 25000,
            'price' => 150000.00,
            'notes' => 'Looking for luxury SUV',
            'priority' => 'medium',
            'assigned_to' => $sales2->id,
        ]);

        Lead::create([
            'lead_name' => 'Emirates Car Centre',
            'contact_name' => 'Khalid Hassan',
            'email' => 'khalid.h@example.com',
            'phone' => '+971-52-456-7890',
            'status' => 'new',
            'source' => 'Walk-in',
            'car_company' => 'Mercedes-Benz',
            'model' => 'C-Class',
            'model_year' => 2024,
            'kilometers' => 5000,
            'price' => 180000.00,
            'notes' => 'Very interested, wants to see the car today',
            'priority' => 'high',
            'assigned_to' => $sales1->id,
        ]);
    }
}
