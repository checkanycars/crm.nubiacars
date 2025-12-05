<?php

namespace Database\Factories;

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
            'source' => fake()->randomElement($sources),
            'car_company' => fake()->randomElement($carCompanies),
            'model' => fake()->word().' '.fake()->randomElement(['Sedan', 'SUV', 'Coupe', 'Hatchback']),
            'model_year' => fake()->numberBetween(2015, 2025),
            'kilometers' => fake()->numberBetween(0, 200000),
            'price' => fake()->randomFloat(2, 5000, 150000),
            'notes' => fake()->optional()->sentence(10),
            'priority' => fake()->randomElement(LeadPriority::cases())->value,
            'not_converted_reason' => null,
            'assigned_to' => User::query()->where('role', 'sales')->inRandomOrder()->first()?->id,
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
}
