<?php

namespace App\Console\Commands;

use App\Models\Lead;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class DeactivateOldLeads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'leads:deactivate-old
                            {--days= : Number of days after which leads should be deactivated (default: from config)}
                            {--status= : Only deactivate leads with specific status (e.g., not_converted)}
                            {--dry-run : Show what would be deactivated without actually doing it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate leads that have been inactive for a certain period of time';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $days = $this->option('days') ?? config('leads.auto_deactivate_after_days', 90);
        $status = $this->option('status');
        $dryRun = $this->option('dry-run');

        $this->info("Checking for leads older than {$days} days...");

        // Build query for leads to deactivate
        $query = Lead::where('is_active', true)
            ->where('updated_at', '<', now()->subDays($days));

        // Filter by status if provided
        if ($status) {
            $query->where('status', $status);
            $this->info("Filtering by status: {$status}");
        }

        // Get the leads
        $leads = $query->get();
        $count = $leads->count();

        if ($count === 0) {
            $this->info('No leads found to deactivate.');

            return self::SUCCESS;
        }

        // Display leads to be deactivated
        $this->info("Found {$count} lead(s) to deactivate:");

        $tableData = $leads->map(function ($lead) {
            return [
                'ID' => $lead->id,
                'Lead Name' => $lead->lead_name,
                'Status' => $lead->status->value,
                'Updated At' => $lead->updated_at->format('Y-m-d H:i:s'),
                'Days Inactive' => $lead->updated_at->diffInDays(now()),
            ];
        })->toArray();

        $this->table(
            ['ID', 'Lead Name', 'Status', 'Updated At', 'Days Inactive'],
            $tableData
        );

        if ($dryRun) {
            $this->warn('Dry run mode - no changes made.');

            return self::SUCCESS;
        }

        // Confirm before proceeding
        if (! $this->confirm("Do you want to deactivate these {$count} lead(s)?", true)) {
            $this->info('Operation cancelled.');

            return self::SUCCESS;
        }

        // Deactivate the leads
        $deactivatedCount = 0;
        foreach ($leads as $lead) {
            try {
                $lead->update(['is_active' => false]);
                $deactivatedCount++;
            } catch (\Exception $e) {
                $this->error("Failed to deactivate lead ID {$lead->id}: {$e->getMessage()}");
                Log::error("Failed to deactivate lead ID {$lead->id}", [
                    'error' => $e->getMessage(),
                    'lead_id' => $lead->id,
                ]);
            }
        }

        $this->info("Successfully deactivated {$deactivatedCount} lead(s).");

        // Log the operation
        Log::info("Deactivated {$deactivatedCount} old leads", [
            'days' => $days,
            'status_filter' => $status,
            'count' => $deactivatedCount,
        ]);

        return self::SUCCESS;
    }
}
