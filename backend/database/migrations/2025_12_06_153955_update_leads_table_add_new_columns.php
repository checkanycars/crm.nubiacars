<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Remove kilometers column
            $table->dropColumn('kilometers');
            
            // Add new columns
            $table->string('interior_colour')->nullable()->after('spec');
            $table->string('exterior_colour')->nullable()->after('interior_colour');
            $table->string('gear_box')->nullable()->after('exterior_colour');
            $table->enum('car_type', ['new', 'used'])->nullable()->after('gear_box');
            $table->string('fuel_tank')->nullable()->after('car_type');
            $table->string('steering_side')->nullable()->after('fuel_tank');
            $table->string('export_to')->nullable()->after('steering_side');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Remove new columns
            $table->dropColumn([
                'interior_colour',
                'exterior_colour',
                'gear_box',
                'car_type',
                'fuel_tank',
                'steering_side',
                'export_to',
            ]);
            
            // Restore kilometers column
            $table->unsignedInteger('kilometers')->after('model_year');
        });
    }
};
