import { LeadTimer } from '@/components/ui/lead-timer';

export function LeadTimerDemo() {
  // Create demo timestamps for different scenarios
  const now = new Date();
  
  // Fresh lead (30 seconds ago)
  const freshLead = new Date(now.getTime() - 30 * 1000).toISOString();
  
  // Recent lead (5 minutes ago)
  const recentLead = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
  
  // Warning lead (45 minutes ago)
  const warningHighLead = new Date(now.getTime() - 45 * 60 * 1000).toISOString();
  const warningMediumLead = new Date(now.getTime() - 90 * 60 * 1000).toISOString();
  const warningLowLead = new Date(now.getTime() - 150 * 60 * 1000).toISOString();
  
  // Urgent lead (90 minutes ago for high priority)
  const urgentHighLead = new Date(now.getTime() - 90 * 60 * 1000).toISOString();
  const urgentMediumLead = new Date(now.getTime() - 150 * 60 * 1000).toISOString();
  const urgentLowLead = new Date(now.getTime() - 300 * 60 * 1000).toISOString();
  
  // Critical lead (3 hours ago for high priority)
  const criticalHighLead = new Date(now.getTime() - 180 * 60 * 1000).toISOString();
  const criticalMediumLead = new Date(now.getTime() - 300 * 60 * 1000).toISOString();
  const criticalLowLead = new Date(now.getTime() - 600 * 60 * 1000).toISOString();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            🕒 Lead Timer Component
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A pressure-inducing timer that helps sales teams prioritize and respond to leads quickly.
            The timer changes color and urgency based on elapsed time and priority level.
          </p>
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                ⏱️
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Updates</h3>
                <p className="text-sm text-gray-600">Timer updates every second with smooth animations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                🎨
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Color-coded Urgency</h3>
                <p className="text-sm text-gray-600">Visual indicators change based on elapsed time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Priority-aware</h3>
                <p className="text-sm text-gray-600">Different thresholds for high, medium, and low priority leads</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                ⚡
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Animated Alerts</h3>
                <p className="text-sm text-gray-600">Pulsing animations and progress bars for critical leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Urgency Thresholds */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⏰ Urgency Thresholds</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-3 px-4 font-semibold text-gray-900">Priority Level</th>
                  <th className="py-3 px-4 font-semibold text-emerald-600">Normal</th>
                  <th className="py-3 px-4 font-semibold text-yellow-600">Warning</th>
                  <th className="py-3 px-4 font-semibold text-orange-600">Urgent</th>
                  <th className="py-3 px-4 font-semibold text-red-600">Critical</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">🔴 High Priority</td>
                  <td className="py-3 px-4 text-sm text-gray-600">0-30 min</td>
                  <td className="py-3 px-4 text-sm text-gray-600">30-60 min</td>
                  <td className="py-3 px-4 text-sm text-gray-600">1-2 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">&gt; 2 hours</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium">🟡 Medium Priority</td>
                  <td className="py-3 px-4 text-sm text-gray-600">0-60 min</td>
                  <td className="py-3 px-4 text-sm text-gray-600">1-2 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">2-4 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">&gt; 4 hours</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">🟢 Low Priority</td>
                  <td className="py-3 px-4 text-sm text-gray-600">0-2 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">2-4 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">4-8 hours</td>
                  <td className="py-3 px-4 text-sm text-gray-600">&gt; 8 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Examples - High Priority */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔴 High Priority Leads</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fresh Lead (30s ago)</h3>
              <LeadTimer createdAt={freshLead} priority="high" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warning (45 min ago)</h3>
              <LeadTimer createdAt={warningHighLead} priority="high" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Urgent (90 min ago)</h3>
              <LeadTimer createdAt={urgentHighLead} priority="high" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Critical (3 hours ago)</h3>
              <LeadTimer createdAt={criticalHighLead} priority="high" />
            </div>
          </div>
        </div>

        {/* Live Examples - Medium Priority */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🟡 Medium Priority Leads</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent (5 min ago)</h3>
              <LeadTimer createdAt={recentLead} priority="medium" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warning (90 min ago)</h3>
              <LeadTimer createdAt={warningMediumLead} priority="medium" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Urgent (2.5 hours ago)</h3>
              <LeadTimer createdAt={urgentMediumLead} priority="medium" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Critical (5 hours ago)</h3>
              <LeadTimer createdAt={criticalMediumLead} priority="medium" />
            </div>
          </div>
        </div>

        {/* Live Examples - Low Priority */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🟢 Low Priority Leads</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent (5 min ago)</h3>
              <LeadTimer createdAt={recentLead} priority="low" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Warning (2.5 hours ago)</h3>
              <LeadTimer createdAt={warningLowLead} priority="low" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Urgent (5 hours ago)</h3>
              <LeadTimer createdAt={urgentLowLead} priority="low" />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Critical (10 hours ago)</h3>
              <LeadTimer createdAt={criticalLowLead} priority="low" />
            </div>
          </div>
        </div>

        {/* Compact Version */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📏 Compact Version</h2>
          <p className="text-gray-600 mb-6">Use the compact variant when space is limited, such as in table rows or dense layouts.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Normal</h3>
              <LeadTimer createdAt={recentLead} priority="high" compact />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Warning</h3>
              <LeadTimer createdAt={warningHighLead} priority="high" compact />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Critical</h3>
              <LeadTimer createdAt={criticalHighLead} priority="high" compact />
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 Usage Example</h2>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100">
              <code>{`import { LeadTimer } from '@/components/ui/lead-timer';

// Basic usage
<LeadTimer 
  createdAt={lead.createdAt} 
  priority={lead.priority}
/>

// Compact version
<LeadTimer 
  createdAt={lead.createdAt} 
  priority={lead.priority}
  compact
/>

// With custom className
<LeadTimer 
  createdAt={lead.createdAt} 
  priority="high"
  className="mb-4"
/>`}</code>
            </pre>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">📝 Implementation Notes</h2>
          <ul className="space-y-3 text-blue-900">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Real-time Updates:</strong> Timer automatically updates every second using React hooks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Performance:</strong> Optimized with proper cleanup to prevent memory leaks</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Visual Feedback:</strong> Progress bar fills up as time approaches critical threshold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Animations:</strong> CSS animations for pulse effects and gradient backgrounds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Responsive:</strong> Works great on all screen sizes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Only shows on "new" leads:</strong> Timer is hidden once lead is converted or marked as not converted</span>
            </li>
          </ul>
        </div>

        {/* Benefits */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-purple-900 mb-4">🎯 Benefits for Sales Teams</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Faster Response Times</h3>
              <p className="text-sm text-gray-600">Visual pressure encourages immediate action on new leads</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-gray-900 mb-2">Better Prioritization</h3>
              <p className="text-sm text-gray-600">Color-coded system helps identify which leads need attention first</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl mb-2">💯</div>
              <h3 className="font-bold text-gray-900 mb-2">Improved Conversion</h3>
              <p className="text-sm text-gray-600">Quick responses lead to higher conversion rates</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-3xl mb-2">👁️</div>
              <h3 className="font-bold text-gray-900 mb-2">Clear Visibility</h3>
              <p className="text-sm text-gray-600">Managers can easily spot aging leads at a glance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}