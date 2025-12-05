# Timezone Configuration Documentation

## Overview

The application timezone has been configured to **Asia/Dubai (UAE)**, which is UTC+4:00. This ensures all timestamps and dates in the application are displayed in Dubai time.

## Configuration Changes

### 1. Application Timezone

**File:** `backend/config/app.php`

```php
'timezone' => 'Asia/Dubai',
```

This setting affects:
- Laravel's `now()` helper function
- Carbon date/time instances
- All timestamps displayed in the application
- Log file timestamps
- Queue job timestamps

### 2. Database Timezone

**File:** `backend/config/database.php`

Added timezone configuration to MySQL and MariaDB connections:

```php
'mysql' => [
    // ... other settings
    'timezone' => '+04:00',
],

'mariadb' => [
    // ... other settings
    'timezone' => '+04:00',
],
```

This ensures database queries and stored timestamps use Dubai timezone.

## Timezone Details

| Property | Value |
|----------|-------|
| Timezone Name | Asia/Dubai |
| UTC Offset | +04:00 |
| DST | No daylight saving time |
| Country | United Arab Emirates |

## Usage Examples

### In Controllers and Services

```php
use Illuminate\Support\Facades\Date;

// Get current time in Dubai timezone
$currentTime = now(); // 2025-12-05 15:30:00

// Get current timestamp
$timestamp = now()->timestamp;

// Format date for display
$formatted = now()->format('Y-m-d H:i:s'); // 2025-12-05 15:30:00

// ISO 8601 format (UTC)
$iso = now()->toISOString(); // 2025-12-05T11:30:00.000000Z

// For API responses with timezone info
$dateTime = now()->toDateTimeString(); // 2025-12-05 15:30:00
```

### In Blade Templates

```blade
{{-- Display current time --}}
{{ now()->format('d/m/Y H:i:s') }}

{{-- Display user created at time --}}
{{ $user->created_at->format('d/m/Y H:i:s') }}

{{-- Display relative time --}}
{{ $user->created_at->diffForHumans() }} {{-- e.g., "2 hours ago" --}}
```

### In API Resources

```php
public function toArray(Request $request): array
{
    return [
        'id' => $this->id,
        'name' => $this->name,
        'created_at' => $this->created_at?->toISOString(),
        'updated_at' => $this->updated_at?->toISOString(),
    ];
}
```

## API Endpoint - Server Time

A dedicated endpoint is available to check the current server time:

**Endpoint:** `GET /api/server-time`

**Response:**
```json
{
  "timezone": "Asia/Dubai",
  "current_time": "2025-12-05 15:30:00",
  "current_time_iso": "2025-12-05T11:30:00.000000Z",
  "timestamp": 1733405400
}
```

**Usage:**
```bash
curl http://localhost:8000/api/server-time
```

## Important Notes

### ISO 8601 Format
When using `toISOString()`, Carbon converts the time to UTC:
- **Dubai Time:** 2025-12-05 15:30:00
- **ISO Format (UTC):** 2025-12-05T11:30:00.000000Z

This is the recommended format for API responses as it's timezone-agnostic.

### Database Storage
- Timestamps in the database are stored in the configured timezone (+04:00)
- Laravel automatically handles conversion between database and application timezone
- Use `$casts` in models for automatic Carbon casting:
  ```php
  protected function casts(): array
  {
      return [
          'created_at' => 'datetime',
          'updated_at' => 'datetime',
      ];
  }
  ```

### Migration Timestamps
All migration timestamps will use Dubai timezone:
```php
$table->timestamps(); // created_at and updated_at will use Asia/Dubai
```

## Testing Timezone Configuration

### Via Tinker
```bash
php artisan tinker
```

```php
// Check configured timezone
config('app.timezone'); // "Asia/Dubai"

// Get current time
now()->toDateTimeString(); // "2025-12-05 15:30:00"

// Get current time in ISO format (UTC)
now()->toISOString(); // "2025-12-05T11:30:00.000000Z"

// Get timezone offset
now()->format('P'); // "+04:00"
```

### Via API Endpoint
```bash
# Using curl
curl http://localhost:8000/api/server-time

# Using httpie
http GET http://localhost:8000/api/server-time
```

## Common Carbon Methods

```php
// Current date/time
now(); // 2025-12-05 15:30:00

// Specific date
Carbon::parse('2025-12-31 23:59:59');

// Today at specific time
today()->setTime(9, 0); // Today at 9:00 AM

// Tomorrow
tomorrow();

// Yesterday
yesterday();

// Add/subtract time
now()->addHours(2);
now()->subDays(7);

// Start/end of day
now()->startOfDay(); // 2025-12-05 00:00:00
now()->endOfDay();   // 2025-12-05 23:59:59

// Start/end of month
now()->startOfMonth();
now()->endOfMonth();

// Comparison
$date1->isBefore($date2);
$date1->isAfter($date2);
$date1->isSameDay($date2);

// Difference
$date1->diffInDays($date2);
$date1->diffInHours($date2);
$date1->diffForHumans(); // "2 hours ago"
```

## Best Practices

1. **Always use `now()` helper** instead of `new DateTime()` or `date()`
2. **Use Carbon methods** for date manipulation
3. **Return ISO 8601 format** in API responses for timezone independence
4. **Don't hardcode timezones** - always use `config('app.timezone')`
5. **Test across timezones** when dealing with international users
6. **Use `diffForHumans()`** for user-friendly relative times
7. **Store dates in database** using Laravel's timestamp columns
8. **Cast timestamp columns** to `datetime` in models

## Troubleshooting

### Time Appears Wrong
1. Clear config cache: `php artisan config:clear`
2. Clear all caches: `php artisan optimize:clear`
3. Verify config: `php artisan tinker` → `config('app.timezone')`

### Database Times Don't Match
- Check database timezone configuration in `config/database.php`
- Verify MySQL timezone: `SELECT @@global.time_zone, @@session.time_zone;`
- Restart database connection after config changes

### API Returns Wrong Time
- Ensure you're using `toISOString()` for API responses
- ISO format is always in UTC, which is correct behavior
- Frontend should convert to local timezone if needed

## Environment Variables

While the timezone is hardcoded in the config file, you can make it environment-specific:

```php
// In config/app.php
'timezone' => env('APP_TIMEZONE', 'Asia/Dubai'),
```

```env
# In .env file
APP_TIMEZONE=Asia/Dubai
```

## Related Links

- [PHP Supported Timezones](https://www.php.net/manual/en/timezones.php)
- [Laravel Carbon Documentation](https://carbon.nesbot.com/docs/)
- [ISO 8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)
- [UAE Timezone Information](https://www.timeanddate.com/time/zone/uae/dubai)