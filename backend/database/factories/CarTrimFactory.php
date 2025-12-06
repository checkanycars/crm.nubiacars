<?php

namespace Database\Factories;

use App\Models\CarModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CarTrim>
 */
class CarTrimFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $trimNames = [
            'GXR',
            'VXR',
            'Adventure',
            'GLX',
            'SE',
            'XLE',
            'LE Platinum',
            'Nismo',
            'SV',
            'SL',
            'SL AWD',
            'GLS',
            'Luxury',
            'Comfort',
            '110 SE',
            'Autobiography',
            'EX',
            'Ultimate',
            'Base',
            'Sport',
            'Limited',
            'Premium',
        ];

        $bodyTypes = [
            'SUV',
            'Sedan',
            'Pickup',
            'Coupe',
            'Hatchback',
            'Crossover',
            'Van',
            'Wagon',
        ];

        $popularityLevels = ['High', 'Medium', 'Low'];

        return [
            'model_id' => CarModel::factory(),
            'trim_name' => fake()->randomElement($trimNames),
            'body_type' => fake()->randomElement($bodyTypes),
            'popularity_level' => fake()->randomElement($popularityLevels),
        ];
    }
}
