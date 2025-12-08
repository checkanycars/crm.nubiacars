<?php

namespace Database\Factories;

use App\LeadCategory;
use App\LeadPriority;
use App\LeadStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lead>
 */
class LeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $carCompanies = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Kia'];
        $sources = ['Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Email', 'Advertisement'];

        return [
            'lead_name' => fake()->company(),
            'contact_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'status' => fake()->randomElement(LeadStatus::cases())->value,
            'category' => fake()->optional()->randomElement(LeadCategory::cases())?->value,
            'source' => fake()->randomElement($sources),
            'car_company' => fake()->randomElement($carCompanies),
            'model' => fake()->word().' '.fake()->randomElement(['Sedan', 'SUV', 'Coupe', 'Hatchback']),
            'trim' => fake()->optional()->randomElement(['Base', 'Sport', 'Limited', 'Premium', 'Platinum', 'GT']),
            'spec' => fake()->optional()->randomElement(['GCC', 'American', 'European', 'Japanese']),
            'model_year' => fake()->numberBetween(2015, 2025),
            'interior_colour' => fake()->optional()->randomElement(['Black', 'Beige', 'Brown', 'Grey', 'White', 'Red']),
            'exterior_colour' => fake()->optional()->randomElement(['Black', 'White', 'Silver', 'Grey', 'Blue', 'Red', 'Green']),
            'gear_box' => fake()->optional()->randomElement(['Automatic', 'Manual', 'CVT', 'DCT']),
            'car_type' => fake()->optional()->randomElement(['new', 'used']),
            'fuel_tank' => fake()->optional()->randomElement(['50L', '60L', '70L', '80L', '90L']),
            'steering_side' => fake()->optional()->randomElement(['Left', 'Right']),
            'export_to' => fake()->optional()->randomElement(['UAE', 'KSA', 'Kuwait', 'Oman', 'Qatar', 'Bahrain']),
            'quantity' => fake()->numberBetween(1, 10),
            'selling_price' => fake()->randomFloat(2, 10000, 200000),
            'cost_price' => fake()->randomFloat(2, 5000, 150000),
            'notes' => fake()->optional()->sentence(10),
            'priority' => fake()->randomElement(LeadPriority::cases())->value,
            'not_converted_reason' => null,
            'assigned_to' => User::query()->where('role', 'sales')->inRandomOrder()->first()?->id,
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the lead is new.
     */
    public function newStatus(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::New->value,
            'not_converted_reason' => null,
        ]);
    }

    /**
     * Indicate that the lead is contacted.
     */
    public function contacted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Contacted->value,
            'not_converted_reason' => null,
        ]);
    }

    /**
     * Indicate that the lead is converted.
     */
    public function converted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::Converted->value,
            'not_converted_reason' => null,
        ]);
    }

    /**
     * Indicate that the lead is not converted.
     */
    public function notConverted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => LeadStatus::NotConverted->value,
            'not_converted_reason' => fake()->randomElement([
                'Price too high',
                'Found another car',
                'Not interested anymore',
                'Budget constraints',
                'Timing not right',
                'Condition not satisfactory',
            ]),
        ]);
    }

    /**
     * Indicate that the lead has high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => LeadPriority::High->value,
        ]);
    }

    /**
     * Indicate that the lead has medium priority.
     */
    public function mediumPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => LeadPriority::Medium->value,
        ]);
    }

    /**
     * Indicate that the lead has low priority.
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => LeadPriority::Low->value,
        ]);
    }

    /**
     * Indicate that the lead is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
