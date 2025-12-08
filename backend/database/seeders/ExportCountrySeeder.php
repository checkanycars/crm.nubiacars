<?php

namespace Database\Seeders;

use App\Models\ExportCountry;
use Illuminate\Database\Seeder;

class ExportCountrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $countries = [
            // Africa
            'South Africa',
            'Kenya',
            'Tanzania',
            'Uganda',
            'Nigeria',
            'Ghana',
            'Ethiopia',
            'Egypt',
            'Morocco',
            'Algeria',
            'Tunisia',
            'Libya',
            'Sudan',
            'Mozambique',
            'Zimbabwe',
            'Zambia',
            'Botswana',
            'Namibia',
            'Rwanda',
            'Malawi',

            // Asia
            'Afghanistan',
            'Pakistan',
            'India',
            'Bangladesh',
            'Sri Lanka',
            'Nepal',
            'Myanmar',
            'Thailand',
            'Vietnam',
            'Cambodia',
            'Laos',
            'Malaysia',
            'Singapore',
            'Indonesia',
            'Philippines',
            'Japan',
            'South Korea',
            'China',
            'Hong Kong',
            'Taiwan',
            'Mongolia',
            'Kazakhstan',
            'Uzbekistan',
            'Turkmenistan',
            'Kyrgyzstan',
            'Tajikistan',
            'Azerbaijan',
            'Georgia',
            'Armenia',

            // Europe
            'United Kingdom',
            'Ireland',
            'France',
            'Germany',
            'Italy',
            'Spain',
            'Portugal',
            'Netherlands',
            'Belgium',
            'Switzerland',
            'Austria',
            'Poland',
            'Czech Republic',
            'Slovakia',
            'Hungary',
            'Romania',
            'Bulgaria',
            'Greece',
            'Turkey',
            'Russia',
            'Ukraine',
            'Belarus',
            'Sweden',
            'Norway',
            'Denmark',
            'Finland',
            'Iceland',

            // Americas
            'United States',
            'Canada',
            'Mexico',
            'Brazil',
            'Argentina',
            'Chile',
            'Colombia',
            'Peru',
            'Venezuela',
            'Ecuador',
            'Bolivia',
            'Paraguay',
            'Uruguay',
            'Guyana',
            'Suriname',
            'Jamaica',
            'Trinidad and Tobago',
            'Barbados',
            'Haiti',
            'Dominican Republic',
            'Costa Rica',
            'Panama',
            'Guatemala',
            'Honduras',
            'Nicaragua',
            'El Salvador',

            // Oceania
            'Australia',
            'New Zealand',
            'Papua New Guinea',
            'Fiji',
            'Solomon Islands',
            'Vanuatu',
            'Samoa',

            // Middle East (Outside GCC)
            'Lebanon',
            'Jordan',
            'Iraq',
            'Syria',
            'Yemen',
            'Palestine',
            'Israel',
        ];

        foreach ($countries as $country) {
            ExportCountry::create([
                'name' => $country,
                'is_active' => true,
            ]);
        }
    }
}
