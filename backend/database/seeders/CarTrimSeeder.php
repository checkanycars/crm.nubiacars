<?php

namespace Database\Seeders;

use App\Models\CarModel;
use App\Models\CarTrim;
use Illuminate\Database\Seeder;

class CarTrimSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trimsData = [
            'Land Cruiser' => [
                ['trim_name' => 'GXR', 'body_type' => 'SUV', 'popularity_level' => 'High'],
                ['trim_name' => 'VXR', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
            'Hilux' => [
                ['trim_name' => 'Adventure', 'body_type' => 'Pickup', 'popularity_level' => 'High'],
                ['trim_name' => 'GLX', 'body_type' => 'Pickup', 'popularity_level' => 'Medium'],
            ],
            'Camry' => [
                ['trim_name' => 'SE', 'body_type' => 'Sedan', 'popularity_level' => 'High'],
                ['trim_name' => 'XLE', 'body_type' => 'Sedan', 'popularity_level' => 'High'],
            ],
            'Patrol' => [
                ['trim_name' => 'LE Platinum', 'body_type' => 'SUV', 'popularity_level' => 'High'],
                ['trim_name' => 'Nismo', 'body_type' => 'SUV', 'popularity_level' => 'Medium'],
            ],
            'Sunny' => [
                ['trim_name' => 'SV', 'body_type' => 'Sedan', 'popularity_level' => 'Medium'],
                ['trim_name' => 'SL', 'body_type' => 'Sedan', 'popularity_level' => 'Low'],
            ],
            'X-Trail' => [
                ['trim_name' => 'SL AWD', 'body_type' => 'SUV', 'popularity_level' => 'Medium'],
            ],
            'Pajero' => [
                ['trim_name' => 'GLS', 'body_type' => 'SUV', 'popularity_level' => 'Medium'],
            ],
            'T2' => [
                ['trim_name' => 'Luxury', 'body_type' => 'SUV', 'popularity_level' => 'Medium'],
            ],
            'ZS' => [
                ['trim_name' => 'Comfort', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
            'Defender' => [
                ['trim_name' => '110 SE', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
            'Range Rover' => [
                ['trim_name' => 'Autobiography', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
            'Sportage' => [
                ['trim_name' => 'EX', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
            'Tucson' => [
                ['trim_name' => 'Ultimate', 'body_type' => 'SUV', 'popularity_level' => 'High'],
            ],
        ];

        foreach ($trimsData as $modelName => $trims) {
            $model = CarModel::where('model_name', $modelName)->first();

            if ($model) {
                foreach ($trims as $trimData) {
                    CarTrim::create([
                        'model_id' => $model->id,
                        'trim_name' => $trimData['trim_name'],
                        'body_type' => $trimData['body_type'],
                        'popularity_level' => $trimData['popularity_level'],
                    ]);
                }
            }
        }
    }
}
