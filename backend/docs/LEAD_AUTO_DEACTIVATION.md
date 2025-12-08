# Lead Auto-Deactivation Feature

## Overview

The Lead Auto-Deactivation feature automatically hides old, inactive leads from the frontend after a specified period. This helps keep your CRM clean and focused on active opportunities while preserving historical data.

## How It Works

Leads that haven't been updated within a configured time period are automatically marked as `is_active = false`. These leads:
- Will not appear in the frontend lead list
- Will not be included in statistics or exports
- Can still be viewed individually if accessed directly
- Can be reactivated at any time
- Are preserved in the database (not deleted)

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Number of days after which inactive leads should be deactivated (default: 90)
LEAD_AUTO_DEACTIVATE_DAYS=90

# How often the deactivation job should run: daily, weekly, or monthly (default: daily)
LEAD_AUTO_DEACTIVATE_SCHEDULE=daily
```

### Configuration File

The configuration is located in `config/leads.php`:

```php
return [
    // Number of days before auto-deactivation
    'auto_deactivate_after_days' => env('LEAD_AUTO_DEACTIVATE_DAYS', 90),
    
    // Auto-deactivate only specific statuses (leave empty for all)
    'auto_deactivate_statuses' => [
        // 'not_converted',  // Uncomment to only deactivate not_converted leads
    ],
    
    // Schedule frequency: 'daily', 'weekly', or 'monthly'
    'auto_deactivate_schedule' => env('LEAD_AUTO_DEACTIVATE_SCHEDULE', 'daily'),
];
```

## Manual Command Usage

### Basic Usage

Deactivate leads older than the configured period (90 days by default):

```bash
php artisan leads:deactivate-old
```

### Command Options

**Dry Run** - Preview what would be deactivated without making changes:
```bash
php artisan leads:deactivate-old --dry-run
```

**Custom Days** - Override the configured period:
```bash
php artisan leads:deactivate-old --days=60
```

**Filter by Status** - Only deactivate leads with a specific status:
```bash
php artisan leads:deactivate-old --status=not_converted
```

**Combined Options**:
```bash
php artisan leads:deactivate-old --days=30 --status=not_converted --dry-run
```

### Command Output Example

```
Checking for leads older than 90 days...
Found 3 lead(s) to deactivate:
+----+-------------------+---------------+---------------------+-----------------+
| ID | Lead Name         | Status        | Updated At          | Days Inactive   |
+----+-------------------+---------------+---------------------+-----------------+
| 61 | Al Futtaim Motors | not_converted | 2025-08-30 11:26:13 | 100.00009269588 |
| 62 | Dubai Auto Center | not_converted | 2025-08-15 14:32:11 | 115.34521234567 |
| 63 | Emirates Motors   | new           | 2025-08-10 09:15:22 | 120.12345678901 |
+----+-------------------+---------------+---------------------+-----------------+

Do you want to deactivate these 3 lead(s)? (yes/no) [yes]:
> Successfully deactivated 3 lead(s).
```

## Scheduled Execution

The command runs automatically based on your configuration:

- **Daily** (default): Runs at 2:00 AM every day
- **Weekly**: Runs at 2:00 AM every Monday
- **Monthly**: Runs at 2:00 AM on the 1st of each month

### Viewing Scheduled Tasks

Check when the next scheduled run will occur:

```bash
php artisan schedule:list
```

Output:
```
0 2 * * *  php artisan leads:deactivate-old --days=90  Next Due: 14 hours from now
```

### Running the Schedule Manually (for testing)

```bash
php artisan schedule:run
```

### Setting Up the Cron Job

To enable automatic execution, add this to your server's crontab:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

This runs Laravel's scheduler every minute, which then executes scheduled tasks at their configured times.

## API Endpoints

### Deactivate a Lead

**Endpoint:** `PATCH /api/leads/{id}/deactivate`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "message": "Lead deactivated successfully.",
  "data": {
    "id": 61,
    "leadName": "Al Futtaim Motors",
    "isActive": false,
    ...
  }
}
```

### Activate a Lead

**Endpoint:** `PATCH /api/leads/{id}/activate`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "message": "Lead activated successfully.",
  "data": {
    "id": 61,
    "leadName": "Al Futtaim Motors",
    "isActive": true,
    ...
  }
}
```

### View Inactive Leads

**Endpoint:** `GET /api/leads?include_inactive=true`

By default, the leads endpoint only returns active leads. Use the `include_inactive` parameter to see all leads.

## Use Cases

### Example 1: Deactivate Old Not-Converted Leads

Keep your pipeline clean by automatically hiding leads that were marked as "not converted" over 30 days ago:

```php
// config/leads.php
'auto_deactivate_after_days' => 30,
'auto_deactivate_statuses' => ['not_converted'],
```

### Example 2: Quarterly Cleanup

Run a quarterly cleanup of all leads older than 180 days:

```bash
php artisan leads:deactivate-old --days=180
```

### Example 3: Status-Specific Management

Different retention periods for different statuses:

```bash
# Deactivate not-converted leads after 30 days
php artisan leads:deactivate-old --days=30 --status=not_converted

# Deactivate new leads (never followed up) after 90 days
php artisan leads:deactivate-old --days=90 --status=new
```

## Logging

All automatic deactivation operations are logged to `storage/logs/laravel.log`:

```
[2025-12-08 02:00:00] production.INFO: Deactivated 15 old leads {"days":90,"status_filter":null,"count":15}
```

Failed deactivation attempts are logged as errors:

```
[2025-12-08 02:00:00] production.ERROR: Failed to deactivate lead ID 123 {"error":"...","lead_id":123}
```

## Database Impact

The feature only updates the `is_active` column:

```sql
-- What the command does
UPDATE leads 
SET is_active = 0 
WHERE is_active = 1 
  AND updated_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

No data is deleted, ensuring historical records remain intact.

## Reactivating Leads

Deactivated leads can be reactivated in several ways:

1. **Via API:**
   ```bash
   curl -X PATCH https://api.example.com/api/leads/61/activate \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Via Update Endpoint:**
   ```bash
   curl -X PATCH https://api.example.com/api/leads/61 \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"is_active": true}'
   ```

3. **Via Tinker:**
   ```bash
   php artisan tinker
   >>> Lead::find(61)->update(['is_active' => true]);
   ```

## Best Practices

1. **Start with Dry Run**: Always test with `--dry-run` first to see what will be affected
2. **Use Status Filters**: Target specific lead statuses to avoid deactivating active opportunities
3. **Monitor Logs**: Check logs after scheduled runs to ensure proper operation
4. **Adjust Period**: Start with a longer period (e.g., 120 days) and adjust based on your needs
5. **Communicate**: Inform your team about the auto-deactivation policy
6. **Regular Reviews**: Periodically review deactivated leads to ensure important ones aren't hidden

## Troubleshooting

### Command Not Running Automatically

1. Verify cron is set up:
   ```bash
   crontab -l
   ```

2. Check Laravel scheduler is working:
   ```bash
   php artisan schedule:list
   php artisan schedule:run
   ```

3. Check logs for errors:
   ```bash
   tail -f storage/logs/laravel.log
   ```

### No Leads Being Deactivated

1. Check if leads exist that meet the criteria:
   ```bash
   php artisan leads:deactivate-old --days=1 --dry-run
   ```

2. Verify lead update timestamps:
   ```bash
   php artisan tinker
   >>> Lead::where('is_active', true)->orderBy('updated_at')->first()->updated_at
   ```

### Reactivation Not Working

Check if the lead exists and is actually inactive:
```bash
php artisan tinker
>>> $lead = Lead::find(61);
>>> $lead->is_active; // Should return false
>>> $lead->update(['is_active' => true]);
```

## Support

For issues or questions:
1. Check the logs in `storage/logs/laravel.log`
2. Run commands with `--dry-run` to preview changes
3. Review this documentation for configuration options
4. Contact your system administrator for cron-related issues