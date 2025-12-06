<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarBrand>
 */
class CarBrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $brands = [
            'Toyota',
            'Nissan',
            'Honda',
            'Ford',
            'Chevrolet',
            'BMW',
            'Mercedes-Benz',
            'Audi',
            'Volkswagen',
            'Hyundai',
            'Kia',
            'Mazda',
            'Subaru',
            'Lexus',
            'Jeep',
            'Ram',
            'GMC',
            'Dodge',
            'Mitsubishi',
            'Land Rover',
            'MG',
            'Jetour',
        ];

        return [
            'name' => fake()->unique()->randomElement($brands),
        ];
    }
}
