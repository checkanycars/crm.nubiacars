import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LeadTimerProps {
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
  compact?: boolean;
}

interface TimeElapsed {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMinutes: number;
}

export function LeadTimer({ createdAt, priority = 'medium', className, compact = false }: LeadTimerProps) {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMinutes: 0,
  });

  const calculateTimeElapsed = (): TimeElapsed => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = now - created;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      days,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
      totalMinutes: minutes,
    };
  };

  useEffect(() => {
    // Initial calculation
    setTimeElapsed(calculateTimeElapsed());

    // Update every second
    const interval = setInterval(() => {
      setTimeElapsed(calculateTimeElapsed());
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  // Determine urgency level based on time elapsed and priority
  const getUrgencyLevel = (): 'critical' | 'urgent' | 'warning' | 'normal' => {
    const { totalMinutes } = timeElapsed;
    
    if (priority === 'high') {
      if (totalMinutes > 120) return 'critical'; // > 2 hours
      if (totalMinutes > 60) return 'urgent'; // > 1 hour
      if (totalMinutes > 30) return 'warning'; // > 30 minutes
      return 'normal';
    } else if (priority === 'medium') {
      if (totalMinutes > 240) return 'critical'; // > 4 hours
      if (totalMinutes > 120) return 'urgent'; // > 2 hours
      if (totalMinutes > 60) return 'warning'; // > 1 hour
      return 'normal';
    } else {
      if (totalMinutes > 480) return 'critical'; // > 8 hours
      if (totalMinutes > 240) return 'urgent'; // > 4 hours
      if (totalMinutes > 120) return 'warning'; // > 2 hours
      return 'normal';
    }
  };

  const urgencyLevel = getUrgencyLevel();

  // Color schemes based on urgency
  const getColorScheme = () => {
    switch (urgencyLevel) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-300',
          text: 'text-red-900',
          badge: 'bg-red-600',
          pulse: 'bg-red-600',
          icon: 'text-red-600',
          glow: 'shadow-red-500/50',
        };
      case 'urgent':
        return {
          bg: 'bg-orange-50 border-orange-300',
          text: 'text-orange-900',
          badge: 'bg-orange-500',
          pulse: 'bg-orange-500',
          icon: 'text-orange-600',
          glow: 'shadow-orange-500/50',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-300',
          text: 'text-yellow-900',
          badge: 'bg-yellow-500',
          pulse: 'bg-yellow-500',
          icon: 'text-yellow-600',
          glow: 'shadow-yellow-500/50',
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-900',
          badge: 'bg-emerald-500',
          pulse: 'bg-emerald-500',
          icon: 'text-emerald-600',
          glow: 'shadow-emerald-500/50',
        };
    }
  };

  const colorScheme = getColorScheme();

  const formatTime = () => {
    if (timeElapsed.days > 0) {
      return `${timeElapsed.days}d ${timeElapsed.hours}h ${timeElapsed.minutes}m`;
    } else if (timeElapsed.hours > 0) {
      return `${timeElapsed.hours}h ${timeElapsed.minutes}m ${timeElapsed.seconds}s`;
    } else if (timeElapsed.minutes > 0) {
      return `${timeElapsed.minutes}m ${timeElapsed.seconds}s`;
    } else {
      return `${timeElapsed.seconds}s`;
    }
  };

  const getUrgencyMessage = () => {
    switch (urgencyLevel) {
      case 'critical':
        return 'URGENT ACTION NEEDED!';
      case 'urgent':
        return 'High Priority Response';
      case 'warning':
        return 'Needs Attention';
      default:
        return 'Fresh Lead';
    }
  };

  // Compact version for space-constrained areas
  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border px-2 py-1 transition-all duration-300',
            colorScheme.bg,
            urgencyLevel === 'critical' && 'animate-pulse',
          )}
        >
          {/* Pulse indicator */}
          <div className="relative flex items-center shrink-0">
            <span className={cn('absolute h-2 w-2 rounded-full opacity-75 animate-ping', colorScheme.pulse)}></span>
            <span className={cn('relative h-1.5 w-1.5 rounded-full', colorScheme.badge)}></span>
          </div>

          {/* Time display */}
          <div className={cn('font-mono text-sm font-bold tabular-nums', colorScheme.text)}>
            {formatTime()}
          </div>

          {/* Urgency icon */}
          {urgencyLevel !== 'normal' && (
            <span className="text-xs shrink-0">
              {urgencyLevel === 'critical' && '🔥'}
              {urgencyLevel === 'urgent' && '⚡'}
              {urgencyLevel === 'warning' && '⚠️'}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border-2 transition-all duration-300',
          colorScheme.bg,
          urgencyLevel === 'critical' && 'animate-pulse shadow-lg',
          urgencyLevel === 'urgent' && 'shadow-md',
        )}
      >
        {/* Animated background gradient for critical leads */}
        {urgencyLevel === 'critical' && (
          <div className="absolute inset-0 bg-linear-to-r from-red-100 via-red-50 to-red-100 animate-gradient-x opacity-60"></div>
        )}

        <div className="relative px-3 py-2">
          {/* Header with icon and pulse indicator */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              {/* Pulse indicator */}
              <div className="relative flex items-center">
                <span className={cn('absolute h-3 w-3 rounded-full opacity-75 animate-ping', colorScheme.pulse)}></span>
                <span className={cn('relative h-2.5 w-2.5 rounded-full', colorScheme.badge)}></span>
              </div>

              {/* Timer icon */}
              <svg
                className={cn('h-4 w-4', colorScheme.icon)}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span className={cn('text-xs font-bold uppercase tracking-wide', colorScheme.text)}>
                {getUrgencyMessage()}
              </span>
            </div>

            {/* Urgency badge */}
            {urgencyLevel !== 'normal' && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold text-white',
                  colorScheme.badge,
                )}
              >
                {urgencyLevel === 'critical' && '🔥'}
                {urgencyLevel === 'urgent' && '⚡'}
                {urgencyLevel === 'warning' && '⚠️'}
              </span>
            )}
          </div>

          {/* Time display */}
          <div className="flex items-baseline justify-between">
            <div className={cn('font-mono text-2xl font-bold tabular-nums', colorScheme.text)}>
              {formatTime()}
            </div>
            
            {/* Elapsed label */}
            <span className={cn('text-xs font-medium', colorScheme.text, 'opacity-70')}>
              elapsed
            </span>
          </div>

          {/* Progress bar for visual representation */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/40">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                colorScheme.badge,
                urgencyLevel === 'critical' && 'animate-pulse',
              )}
              style={{
                width: `${Math.min((timeElapsed.totalMinutes / (priority === 'high' ? 120 : priority === 'medium' ? 240 : 480)) * 100, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Animated border glow for critical */}
        {urgencyLevel === 'critical' && (
          <div className={cn('absolute -inset-0.5 rounded-lg opacity-30 blur-sm animate-pulse', colorScheme.glow)}></div>
        )}
      </div>

      {/* Warning text for critical leads */}
      {urgencyLevel === 'critical' && (
        <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-red-600 animate-bounce">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Immediate Response Required
        </div>
      )}
    </div>
  );
}