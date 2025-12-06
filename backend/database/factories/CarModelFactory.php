<?php

namespace Database\Factories;

use App\Models\CarBrand;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarModel>
 */
class CarModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $modelNames = [
            'Land Cruiser',
            'Hilux',
            'Camry',
            'Corolla',
            'RAV4',
            'Patrol',
            'Sunny',
            'X-Trail',
            'Altima',
            'Maxima',
            'Pajero',
            'Outlander',
            'Eclipse',
            'T2',
            'Dashing',
            'X70',
            'ZS',
            'HS',
            'RX5',
            'Defender',
            'Range Rover',
            'Discovery',
            'Sportage',
            'Sorento',
            'Seltos',
            'Tucson',
            'Santa Fe',
            'Elantra',
        ];

        return [
            'brand_id' => CarBrand::factory(),
            'model_name' => fake()->randomElement($modelNames),
        ];
    }
}
