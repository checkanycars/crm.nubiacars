<?php

namespace Database\Factories;

use App\CustomerStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'status' => fake()->randomElement(CustomerStatus::cases()),
            'notes' => fake()->optional(0.7)->paragraph(),
        ];
    }

    /**
     * Indicate that the customer is a lead.
     */
    public function lead(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CustomerStatus::Lead,
        ]);
    }

    /**
     * Indicate that the customer is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CustomerStatus::Active,
        ]);
    }

    /**
     * Indicate that the customer is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => CustomerStatus::Inactive,
        ]);
    }
}
