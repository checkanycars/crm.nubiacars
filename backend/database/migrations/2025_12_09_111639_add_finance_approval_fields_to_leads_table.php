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
            $table->boolean('finance_approved')->nullable()->after('assigned_to');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete()->after('finance_approved');
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
            $table->boolean('commission_paid')->default(false)->after('rejection_reason');

            // Indexes
            $table->index('finance_approved');
            $table->index('approved_by');
            $table->index('commission_paid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['finance_approved']);
            $table->dropIndex(['approved_by']);
            $table->dropIndex(['commission_paid']);

            $table->dropForeign(['approved_by']);
            $table->dropColumn([
                'finance_approved',
                'approved_by',
                'approved_at',
                'rejection_reason',
                'commission_paid',
            ]);
        });
    }
};
