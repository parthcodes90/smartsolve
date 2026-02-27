import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * KPICard — Displays a key performance indicator metric.
 * Purely presentational. No data fetching.
 *
 * @param {string}        title      — Metric label (e.g. "Total Complaints")
 * @param {string|number} value      — Metric value
 * @param {string}        trend      — 'up' | 'down' | 'neutral'
 * @param {string}        trendValue — e.g. "+12%" or "-3%"
 * @param {ReactNode}     icon       — Lucide icon component instance
 * @param {string}        accentColor — Tailwind color class for accent strip (default: accent-500)
 *
 * FUTURE INTEGRATION: Pass live data from dataAdapter.getOverviewStats()
 */
export default function KPICard({
    title,
    value,
    trend = 'neutral',
    trendValue = '',
    icon,
    accentColor = 'bg-accent-500',
}) {
    const trendConfig = {
        up: { icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
        down: { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
        neutral: { icon: Minus, color: 'text-gray-500', bg: 'bg-gray-50' },
    };

    const t = trendConfig[trend] || trendConfig.neutral;
    const TrendIcon = t.icon;

    return (
        <div className="card-hover relative overflow-hidden group" role="article" aria-label={`${title}: ${value}`}>
            {/* Accent strip */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} opacity-80 group-hover:opacity-100 transition-opacity`} />

            <div className="p-6 pt-5">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                    </div>
                    {icon && (
                        <div className="p-3 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                            {icon}
                        </div>
                    )}
                </div>

                {trendValue && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${t.color} ${t.bg}`}>
                            <TrendIcon className="w-3 h-3" />
                            {trendValue}
                        </span>
                        <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}
