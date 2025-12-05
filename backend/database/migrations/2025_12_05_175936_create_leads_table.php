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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('lead_name');
            $table->string('contact_name');
            $table->string('email');
            $table->string('phone');
            $table->string('status')->default('new');
            $table->string('source');
            $table->string('car_company');
            $table->string('model');
            $table->year('model_year');
            $table->unsignedInteger('kilometers');
            $table->decimal('price', 10, 2);
            $table->text('notes')->nullable();
            $table->string('priority')->default('medium');
            $table->text('not_converted_reason')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('priority');
            $table->index('assigned_to');
            $table->index('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
