import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareWarning, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import KPICard from '../../components/ui/KPICard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityPill from '../../components/ui/PriorityPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import { getOverviewStats, getComplaints } from '../../adapters/dataAdapter';

/**
 * Overview — Admin dashboard overview page.
 * Shows KPI cards, recent complaints, and status breakdown.
 *
 * FUTURE INTEGRATION:
 * - KPI data will come from getOverviewStats() once a stats API exists.
 * - Recent complaints from getComplaints() with limit parameter.
 */

export default function Overview() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentComplaints, setRecentComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFromMock, setIsFromMock] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsResult, complaintsResult] = await Promise.all([
                getOverviewStats(),
                getComplaints(),
            ]);

            setStats(statsResult.data);
            // Show only the 5 most recent complaints
            setRecentComplaints(complaintsResult.data.slice(0, 5));
            setIsFromMock(statsResult.isFromMock || complaintsResult.isFromMock);
            if (statsResult.error) setError(statsResult.error);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <LoadingSkeleton variant="page" />;

    if (error && !stats) {
        return <ErrorState variant="offline" message={error} onRetry={fetchData} />;
    }

    const kpiCards = [
        {
            title: 'Total Complaints',
            value: stats?.totalComplaints ?? '—',
            trend: stats?.trends?.total?.direction || 'neutral',
            trendValue: stats?.trends?.total?.value || '',
            icon: <MessageSquareWarning className="w-6 h-6" />,
            accent: 'bg-accent-500',
        },
        {
            title: 'Open',
            value: stats?.openComplaints ?? '—',
            trend: stats?.trends?.open?.direction || 'neutral',
            trendValue: stats?.trends?.open?.value || '',
            icon: <AlertCircle className="w-6 h-6" />,
            accent: 'bg-status-open',
        },
        {
            title: 'In Progress',
            value: stats?.inProgressComplaints ?? '—',
            trend: stats?.trends?.inProgress?.direction || 'neutral',
            trendValue: stats?.trends?.inProgress?.value || '',
            icon: <Clock className="w-6 h-6" />,
            accent: 'bg-status-inprogress',
        },
        {
            title: 'Resolved',
            value: stats?.resolvedComplaints ?? '—',
            trend: stats?.trends?.resolved?.direction || 'neutral',
            trendValue: stats?.trends?.resolved?.value || '',
            icon: <CheckCircle2 className="w-6 h-6" />,
            accent: 'bg-status-resolved',
        },
    ];

    const recentColumns = [
        {
            key: 'id',
            label: 'ID',
            render: (val) => <span className="font-mono text-xs font-semibold text-gray-900">{val}</span>,
        },
        { key: 'title', label: 'Title' },
        {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (val) => <PriorityPill priority={val} />,
        },
        { key: 'zone', label: 'Zone' },
    ];

    return (
        <div className="space-y-8">
            <PageHeader
                title="Dashboard Overview"
                subtitle="Real-time summary of civic complaints across all zones"
            />

            {/* Backend warning banner */}
            {isFromMock && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 animate-fade-in" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Backend unavailable — showing sample data. Live data will appear when the server is reachable.</p>
                </div>
            )}

            {/* KPI cards */}
            <section aria-label="Key metrics">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiCards.map((card) => (
                        <KPICard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            trend={card.trend}
                            trendValue={card.trendValue}
                            icon={card.icon}
                            accentColor={card.accent}
                        />
                    ))}
                </div>
            </section>

            {/* Status breakdown */}
            <section aria-label="Status distribution">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
                <div className="card p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { label: 'Open', count: stats?.openComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-open' },
                            { label: 'In Progress', count: stats?.inProgressComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-inprogress' },
                            { label: 'Resolved', count: stats?.resolvedComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-resolved' },
                            { label: 'Other', count: Math.max(0, (stats?.totalComplaints ?? 0) - (stats?.openComplaints ?? 0) - (stats?.inProgressComplaints ?? 0) - (stats?.resolvedComplaints ?? 0)), total: stats?.totalComplaints ?? 1, color: 'bg-gray-400' },
                        ].map((item) => {
                            const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
                            return (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-700">{item.label}</span>
                                        <span className="text-gray-500">{pct}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">{item.count} complaints</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Recent complaints */}
            <section aria-label="Recent complaints">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
                    <button
                        onClick={() => navigate('/admin/complaints')}
                        className="text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors"
                    >
                        View all →
                    </button>
                </div>
                <DataTable
                    columns={recentColumns}
                    data={recentComplaints}
                    onRowClick={(row) => navigate(`/admin/complaints/${row.id}`)}
                    defaultPageSize={5}
                />
            </section>
        </div>
    );
}
