<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic deactivation of old leads
$schedule = config('leads.auto_deactivate_schedule', 'daily');
$days = config('leads.auto_deactivate_after_days', 90);
$statuses = config('leads.auto_deactivate_statuses', []);

// Build command options
$options = ['--days' => $days];

// Schedule the command based on configuration
$scheduledCommand = match ($schedule) {
    'weekly' => Schedule::command('leads:deactivate-old', $options)->weekly(),
    'monthly' => Schedule::command('leads:deactivate-old', $options)->monthly(),
    default => Schedule::command('leads:deactivate-old', $options)->daily(),
};

// Run at 2 AM to avoid peak hours
$scheduledCommand->at('02:00');

// If specific statuses are configured, schedule separate jobs for each
if (! empty($statuses)) {
    foreach ($statuses as $status) {
        $statusOptions = array_merge($options, ['--status' => $status]);

        match ($schedule) {
            'weekly' => Schedule::command('leads:deactivate-old', $statusOptions)->weekly()->at('02:30'),
            'monthly' => Schedule::command('leads:deactivate-old', $statusOptions)->monthly()->at('02:30'),
            default => Schedule::command('leads:deactivate-old', $statusOptions)->daily()->at('02:30'),
        };
    }
}
