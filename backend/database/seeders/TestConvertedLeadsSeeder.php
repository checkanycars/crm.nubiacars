<?php

namespace Database\Seeders;

use App\LeadCategory;
use App\LeadPriority;
use App\LeadStatus;
use App\Models\Customer;
use App\Models\Lead;
use App\Models\User;
use App\UserRole;
use Illuminate\Database\Seeder;

class TestConvertedLeadsSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        $this->command->info('Creating test converted leads for finance approval...');

        // Get or create test customers
        $customers = $this->createTestCustomers();

        // Get sales users
        $salesUsers = User::where('role', UserRole::Sales)->get();

        if ($salesUsers->isEmpty()) {
            $this->command->warn('No sales users found. Creating a test sales user...');
            $salesUser = User::create([
                'name' => 'Test Sales User',
                'email' => 'sales.test@nubiacars.com',
                'password' => bcrypt('password'),
                'role' => UserRole::Sales,
                'commission' => 5.00,
                'bonus_commission' => 2.00,
                'target_price' => 100000,
            ]);
            $salesUsers = collect([$salesUser]);
        }

        // Create test converted leads with various scenarios
        $testLeads = [
            [
                'lead_name' => 'BMW X5 - Premium Deal',
                'car_company' => 'BMW',
                'model' => 'X5',
                'model_year' => 2024,
                'trim' => 'xDrive40i',
                'spec' => 'M Sport Package',
                'selling_price' => 95000.00,
                'cost_price' => 85000.00,
                'quantity' => 1,
                'category' => LeadCategory::LocalNew,
                'priority' => LeadPriority::High,
                'notes' => 'High-value premium SUV deal. Customer ready to purchase.',
            ],
            [
                'lead_name' => 'Mercedes-Benz S-Class - Luxury Export',
                'car_company' => 'Mercedes-Benz',
                'model' => 'S-Class',
                'model_year' => 2024,
                'trim' => 'S500',
                'spec' => 'AMG Line',
                'selling_price' => 150000.00,
                'cost_price' => 135000.00,
                'quantity' => 1,
                'category' => LeadCategory::PremiumExport,
                'priority' => LeadPriority::High,
                'export_to' => 'Europe',
                'export_to_country' => 'Germany',
                'notes' => 'Export deal to Germany. Premium luxury sedan.',
            ],
            [
                'lead_name' => 'Toyota Camry - Fleet Deal',
                'car_company' => 'Toyota',
                'model' => 'Camry',
                'model_year' => 2023,
                'trim' => 'SE',
                'spec' => 'Standard',
                'selling_price' => 32000.00,
                'cost_price' => 28000.00,
                'quantity' => 5,
                'category' => LeadCategory::LocalNew,
                'priority' => LeadPriority::Medium,
                'notes' => 'Fleet deal for corporate client. 5 units.',
            ],
            [
                'lead_name' => 'Nissan Patrol - Used Vehicle',
                'car_company' => 'Nissan',
                'model' => 'Patrol',
                'model_year' => 2021,
                'trim' => 'Platinum',
                'spec' => 'Full Option',
                'selling_price' => 125000.00,
                'cost_price' => 110000.00,
                'quantity' => 1,
                'category' => LeadCategory::LocalUsed,
                'priority' => LeadPriority::Medium,
                'car_type' => 'used',
                'notes' => 'Pre-owned SUV in excellent condition.',
            ],
            [
                'lead_name' => 'Land Cruiser - Export Deal',
                'car_company' => 'Toyota',
                'model' => 'Land Cruiser',
                'model_year' => 2024,
                'trim' => 'GR Sport',
                'spec' => 'Full Option',
                'selling_price' => 180000.00,
                'cost_price' => 165000.00,
                'quantity' => 2,
                'category' => LeadCategory::RegularExport,
                'priority' => LeadPriority::High,
                'export_to' => 'Africa',
                'export_to_country' => 'Kenya',
                'notes' => 'Export deal to Kenya. 2 units for a dealer.',
            ],
            [
                'lead_name' => 'Lexus ES350 - Low Margin Deal',
                'car_company' => 'Lexus',
                'model' => 'ES',
                'model_year' => 2023,
                'trim' => 'ES350',
                'spec' => 'Luxury Package',
                'selling_price' => 58000.00,
                'cost_price' => 56000.00,
                'quantity' => 1,
                'category' => LeadCategory::LocalNew,
                'priority' => LeadPriority::Low,
                'notes' => 'Low profit margin deal. Returning customer.',
            ],
            [
                'lead_name' => 'Porsche Cayenne - High-End Deal',
                'car_company' => 'Porsche',
                'model' => 'Cayenne',
                'model_year' => 2024,
                'trim' => 'S',
                'spec' => 'Sport Chrono Package',
                'selling_price' => 185000.00,
                'cost_price' => 170000.00,
                'quantity' => 1,
                'category' => LeadCategory::LocalNew,
                'priority' => LeadPriority::High,
                'notes' => 'Premium sports SUV. VIP customer.',
            ],
            [
                'lead_name' => 'Honda Accord - Standard Deal',
                'car_company' => 'Honda',
                'model' => 'Accord',
                'model_year' => 2023,
                'trim' => 'Sport',
                'spec' => 'Standard',
                'selling_price' => 35000.00,
                'cost_price' => 31000.00,
                'quantity' => 1,
                'category' => LeadCategory::LocalNew,
                'priority' => LeadPriority::Medium,
                'notes' => 'Standard sedan deal. Quick turnaround.',
            ],
        ];

        foreach ($testLeads as $index => $leadData) {
            $customer = $customers->random();
            $salesUser = $salesUsers->random();

            Lead::create([
                'lead_name' => $leadData['lead_name'],
                'customer_id' => $customer->id,
                'status' => LeadStatus::Converted,
                'category' => $leadData['category'],
                'source' => 'Walk-in',
                'car_company' => $leadData['car_company'],
                'model' => $leadData['model'],
                'trim' => $leadData['trim'] ?? null,
                'spec' => $leadData['spec'] ?? null,
                'model_year' => $leadData['model_year'],
                'interior_colour' => $this->getRandomColor(),
                'exterior_colour' => $this->getRandomColor(),
                'gear_box' => 'Automatic',
                'car_type' => $leadData['car_type'] ?? 'new',
                'fuel_tank' => 'Petrol',
                'steering_side' => 'Left',
                'export_to' => $leadData['export_to'] ?? null,
                'export_to_country' => $leadData['export_to_country'] ?? null,
                'quantity' => $leadData['quantity'],
                'selling_price' => $leadData['selling_price'],
                'cost_price' => $leadData['cost_price'],
                'notes' => $leadData['notes'],
                'priority' => $leadData['priority'],
                'assigned_to' => $salesUser->id,
                'is_active' => true,
                'finance_approved' => null, // Pending approval
                'approved_by' => null,
                'approved_at' => null,
                'rejection_reason' => null,
                'commission_paid' => false,
            ]);

            $this->command->info("Created: {$leadData['lead_name']}");
        }

        // Create a few already approved leads for testing
        $this->createApprovedLeads($customers, $salesUsers);

        // Create a few rejected leads for testing
        $this->createRejectedLeads($customers, $salesUsers);

        $this->command->info('✓ Test converted leads created successfully!');
        $this->command->info('  - 8 pending approval leads');
        $this->command->info('  - 3 approved leads');
        $this->command->info('  - 2 rejected leads');
    }

    /**
     * Create or get test customers
     */
    private function createTestCustomers()
    {
        $customers = collect();

        $testCustomers = [
            ['name' => 'Ahmed Al-Mansouri', 'email' => 'ahmed.mansouri@example.com', 'phone' => '+971501234567'],
            ['name' => 'Sarah Johnson', 'email' => 'sarah.johnson@example.com', 'phone' => '+971502345678'],
            ['name' => 'Mohammed Al-Farsi', 'email' => 'mohammed.farsi@example.com', 'phone' => '+971503456789'],
            ['name' => 'Emily Williams', 'email' => 'emily.williams@example.com', 'phone' => '+971504567890'],
            ['name' => 'Omar Abdullah', 'email' => 'omar.abdullah@example.com', 'phone' => '+971505678901'],
        ];

        foreach ($testCustomers as $customerData) {
            $customer = Customer::firstOrCreate(
                ['email' => $customerData['email']],
                [
                    'full_name' => $customerData['name'],
                    'phone' => $customerData['phone'],
                    'status' => 'lead',
                    'notes' => 'Test customer for finance approval testing',
                ]
            );
            $customers->push($customer);
        }

        return $customers;
    }

    /**
     * Create approved leads for testing
     */
    private function createApprovedLeads($customers, $salesUsers)
    {
        $financeUser = User::where('role', UserRole::Finance)->first();

        if (! $financeUser) {
            $financeUser = User::where('role', UserRole::Manager)->first();
        }

        if (! $financeUser) {
            return;
        }

        $approvedLeads = [
            [
                'lead_name' => 'Audi Q7 - Approved Deal',
                'car_company' => 'Audi',
                'model' => 'Q7',
                'selling_price' => 120000.00,
                'cost_price' => 108000.00,
            ],
            [
                'lead_name' => 'Range Rover - Approved Export',
                'car_company' => 'Land Rover',
                'model' => 'Range Rover',
                'selling_price' => 200000.00,
                'cost_price' => 185000.00,
            ],
            [
                'lead_name' => 'Chevrolet Tahoe - Approved Fleet',
                'car_company' => 'Chevrolet',
                'model' => 'Tahoe',
                'selling_price' => 75000.00,
                'cost_price' => 68000.00,
            ],
        ];

        foreach ($approvedLeads as $leadData) {
            Lead::create([
                'lead_name' => $leadData['lead_name'],
                'customer_id' => $customers->random()->id,
                'status' => LeadStatus::Converted,
                'category' => LeadCategory::LocalNew,
                'source' => 'Referral',
                'car_company' => $leadData['car_company'],
                'model' => $leadData['model'],
                'model_year' => 2024,
                'quantity' => 1,
                'selling_price' => $leadData['selling_price'],
                'cost_price' => $leadData['cost_price'],
                'notes' => 'Approved test lead',
                'priority' => LeadPriority::Medium,
                'assigned_to' => $salesUsers->random()->id,
                'is_active' => true,
                'finance_approved' => true,
                'approved_by' => $financeUser->id,
                'approved_at' => now()->subDays(rand(1, 5)),
                'commission_paid' => rand(0, 1) === 1,
            ]);
        }
    }

    /**
     * Create rejected leads for testing
     */
    private function createRejectedLeads($customers, $salesUsers)
    {
        $financeUser = User::where('role', UserRole::Finance)->first();

        if (! $financeUser) {
            $financeUser = User::where('role', UserRole::Manager)->first();
        }

        if (! $financeUser) {
            return;
        }

        $rejectedLeads = [
            [
                'lead_name' => 'Ford Explorer - Rejected Deal',
                'car_company' => 'Ford',
                'model' => 'Explorer',
                'selling_price' => 65000.00,
                'cost_price' => 64000.00,
                'reason' => 'Profit margin too low (1.5%). Does not meet minimum 5% margin requirement.',
            ],
            [
                'lead_name' => 'Mazda CX-9 - Pricing Issue',
                'car_company' => 'Mazda',
                'model' => 'CX-9',
                'selling_price' => 52000.00,
                'cost_price' => 51500.00,
                'reason' => 'Pricing below market value. Customer information incomplete.',
            ],
        ];

        foreach ($rejectedLeads as $leadData) {
            Lead::create([
                'lead_name' => $leadData['lead_name'],
                'customer_id' => $customers->random()->id,
                'status' => LeadStatus::Converted,
                'category' => LeadCategory::LocalNew,
                'source' => 'Phone Call',
                'car_company' => $leadData['car_company'],
                'model' => $leadData['model'],
                'model_year' => 2023,
                'quantity' => 1,
                'selling_price' => $leadData['selling_price'],
                'cost_price' => $leadData['cost_price'],
                'notes' => 'Rejected test lead',
                'priority' => LeadPriority::Low,
                'assigned_to' => $salesUsers->random()->id,
                'is_active' => true,
                'finance_approved' => false,
                'approved_by' => $financeUser->id,
                'approved_at' => now()->subDays(rand(1, 3)),
                'rejection_reason' => $leadData['reason'],
                'commission_paid' => false,
            ]);
        }
    }

    /**
     * Get random color
     */
    private function getRandomColor(): string
    {
        $colors = ['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Brown', 'Beige'];

        return $colors[array_rand($colors)];
    }
}
