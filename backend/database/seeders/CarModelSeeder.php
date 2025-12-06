<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Database\Seeder;

class CarModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modelsData = [
            'Toyota' => ['Land Cruiser', 'Hilux', 'Camry'],
            'Nissan' => ['Patrol', 'Sunny', 'X-Trail'],
            'Mitsubishi' => ['Pajero'],
            'Jetour' => ['T2'],
            'MG' => ['ZS'],
            'Land Rover' => ['Defender', 'Range Rover'],
            'Kia' => ['Sportage'],
            'Hyundai' => ['Tucson'],
        ];

        foreach ($modelsData as $brandName => $models) {
            $brand = CarBrand::where('name', $brandName)->first();

            if ($brand) {
                foreach ($models as $modelName) {
                    CarModel::create([
                        'brand_id' => $brand->id,
                        'model_name' => $modelName,
                    ]);
                }
            }
        }
    }
}
