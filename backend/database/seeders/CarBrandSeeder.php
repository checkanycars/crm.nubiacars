<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use Illuminate\Database\Seeder;

class CarBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            'Toyota',
            'Nissan',
            'Mitsubishi',
            'Jetour',
            'MG',
            'Land Rover',
            'Kia',
            'Hyundai',
        ];

        foreach ($brands as $brand) {
            CarBrand::create([
                'name' => $brand,
            ]);
        }
    }
}
