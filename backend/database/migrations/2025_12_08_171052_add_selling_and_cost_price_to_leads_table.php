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
            $table->decimal('selling_price', 10, 2)->nullable()->after('quantity');
            $table->decimal('cost_price', 10, 2)->nullable()->after('selling_price');
            $table->dropColumn('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->decimal('price', 10, 2)->after('quantity');
            $table->dropColumn(['selling_price', 'cost_price']);
        });
    }
};
