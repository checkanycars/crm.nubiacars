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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('target_price', 10, 2)->nullable()->after('password');
            $table->decimal('commission', 10, 2)->nullable()->after('target_price');
            $table->decimal('bonus_commission', 10, 2)->nullable()->after('commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['target_price', 'commission', 'bonus_commission']);
        });
    }
};
