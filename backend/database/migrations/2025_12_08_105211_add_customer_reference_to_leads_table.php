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
            // Add customer_id foreign key (nullable for backward compatibility)
            $table->foreignId('customer_id')->nullable()->after('lead_name')->constrained('customers')->onDelete('set null');

            // Remove old contact fields
            $table->dropColumn(['contact_name', 'email', 'phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            // Add back the old columns
            $table->string('contact_name')->after('lead_name');
            $table->string('email')->nullable()->after('contact_name');
            $table->string('phone')->nullable()->after('email');

            // Remove customer_id foreign key
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
};
