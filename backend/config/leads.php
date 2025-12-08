<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Auto-Deactivation Settings
    |--------------------------------------------------------------------------
    |
    | These settings control the automatic deactivation of leads based on
    | their inactivity period. Leads that haven't been updated within the
    | specified number of days will be automatically deactivated.
    |
    */

    'auto_deactivate_after_days' => env('LEAD_AUTO_DEACTIVATE_DAYS', 90),

    /*
    |--------------------------------------------------------------------------
    | Auto-Deactivate Specific Statuses
    |--------------------------------------------------------------------------
    |
    | If you want to automatically deactivate only leads with specific statuses,
    | you can specify them here. Leave empty to deactivate all old leads
    | regardless of status.
    |
    | Available statuses: 'new', 'converted', 'not_converted'
    |
    */

    'auto_deactivate_statuses' => [
        // 'not_converted',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto-Deactivation Schedule
    |--------------------------------------------------------------------------
    |
    | Determines when the automatic deactivation job should run.
    | This uses Laravel's scheduling syntax.
    |
    | Options: 'daily', 'weekly', 'monthly'
    |
    */

    'auto_deactivate_schedule' => env('LEAD_AUTO_DEACTIVATE_SCHEDULE', 'daily'),

];
