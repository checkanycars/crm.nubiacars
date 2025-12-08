import { useState, useEffect } from 'react';
import { leadsService } from '../../services/leadsService';
import type { PerformanceStatistics } from '../../services/leadsService';

export function PerformanceWidget() {
  const [performance, setPerformance] = useState<PerformanceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await leadsService.getPerformance();
        setPerformance(data);
      } catch (err: any) {
        console.error('Failed to fetch performance data:', err);
        setError(err?.response?.data?.message || 'Failed to load performance data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCommissionDetails = () => {
    if (!performance) return '';
    
    const details = [];
    if (performance.commission.base_commission > 0) {
      details.push(`Base: ${formatCurrency(performance.commission.base_commission)}`);
    }
    if (performance.commission.bonus_commission > 0) {
      details.push(`Bonus: ${formatCurrency(performance.commission.bonus_commission)}`);
    }
    
    return details.length > 0 ? details.join(' + ') : 'No commission yet';
  };

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading performance data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
        </div>
        <div className="p-6">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return null;
  }

  const progressPercentage = performance.target.progress_percentage;
  const isOverTarget = progressPercentage > 100;
  const displayPercentage = Math.min(progressPercentage, 100);

  return (
    <div className="rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <p className="text-sm text-gray-500 mt-1">
              {performance.user_name} • {performance.user_role.charAt(0).toUpperCase() + performance.user_role.slice(1)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Total Deals:</span>
            <span className="font-semibold text-blue-600">{performance.deals.total_converted}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Target Box */}
          <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <h3 className="text-sm font-semibold text-gray-700">Target</h3>
              </div>
              {isOverTarget && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Exceeded!
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-900">
                    {formatCurrency(performance.target.achieved)}
                  </span>
                  <span className="text-sm text-gray-600">
                    of {formatCurrency(performance.target.amount)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isOverTarget
                        ? 'bg-linear-to-r from-green-500 to-green-600'
                        : 'bg-linear-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${displayPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-semibold text-blue-900">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className={`text-sm font-semibold ${
                    performance.target.remaining === 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {formatCurrency(performance.target.remaining)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Box */}
          <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💰</span>
              <h3 className="text-sm font-semibold text-gray-700">Commission</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold text-purple-900 mb-1">
                  {formatCurrency(performance.commission.base_commission)}
                </div>
                <p className="text-xs text-gray-600">Base Commission</p>
              </div>

              <div className="pt-3 border-t border-purple-200 space-y-2">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">Commission Rates:</div>
                  <ul className="space-y-1 text-xs">
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>AED 2k-4k profit: <strong>3%</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
                      <span>AED 4k-7k profit: <strong>7%</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-purple-600"></span>
                      <span>&gt;AED 7k profit: <strong>10%</strong></span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-500">
                * Applied on deals up to AED 35k target
              </div>
            </div>
          </div>

          {/* Bonus Commission Box */}
          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎁</span>
              <h3 className="text-sm font-semibold text-gray-700">Bonus Commission</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-3xl font-bold text-green-900 mb-1">
                  {formatCurrency(performance.commission.bonus_commission)}
                </div>
                <p className="text-xs text-gray-600">Bonus Earned</p>
              </div>

              <div className="pt-3 border-t border-green-200 space-y-2">
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-2">Bonus Tiers:</div>
                  <ul className="space-y-2 text-xs">
                    <li className={`flex items-center justify-between px-3 py-2 rounded ${
                      performance.target.achieved > 35000 && performance.target.achieved <= 50000
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <span>AED 35k - 50k</span>
                      <strong className="text-green-700">AED 500</strong>
                    </li>
                    <li className={`flex items-center justify-between px-3 py-2 rounded ${
                      performance.target.achieved > 50000
                        ? 'bg-green-100 border border-green-300'
                        : 'bg-white border border-gray-200'
                    }`}>
                      <span>&gt; AED 50k</span>
                      <strong className="text-green-700">AED 1,000</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Commission Summary */}
        <div className="mt-6 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Earnings</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(performance.commission.total_commission)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Sales Value</p>
              <p className="text-2xl font-semibold mt-1">
                {formatCurrency(performance.deals.total_sales_value)}
              </p>
            </div>
          </div>
          {performance.commission.total_commission > 0 && (
            <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-90">
              {getCommissionDetails()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}