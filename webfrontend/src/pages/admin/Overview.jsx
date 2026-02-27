import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareWarning, AlertCircle, Clock, CheckCircle2, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import PageHeader from '../../components/ui/PageHeader';
import KPICard from '../../components/ui/KPICard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import PriorityPill from '../../components/ui/PriorityPill';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import { getOverviewStats, getComplaints } from '../../adapters/dataAdapter';

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

    const statusSummary = [
        { label: 'Open', count: stats?.openComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-open' },
        { label: 'In Progress', count: stats?.inProgressComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-inprogress' },
        { label: 'Resolved', count: stats?.resolvedComplaints ?? 0, total: stats?.totalComplaints ?? 1, color: 'bg-status-resolved' },
        {
            label: 'Other',
            count: Math.max(0, (stats?.totalComplaints ?? 0) - (stats?.openComplaints ?? 0) - (stats?.inProgressComplaints ?? 0) - (stats?.resolvedComplaints ?? 0)),
            total: stats?.totalComplaints ?? 1,
            color: 'bg-gray-400',
        },
    ];

    const totalForPie = stats?.totalComplaints ?? 0;
    const performancePieData = totalForPie > 0
        ? [
            { name: 'Open', value: stats?.openComplaints ?? 0, color: '#f59e0b' },
            { name: 'In Progress', value: stats?.inProgressComplaints ?? 0, color: '#3b82f6' },
            { name: 'Resolved', value: stats?.resolvedComplaints ?? 0, color: '#22c55e' },
            {
                name: 'Other',
                value: Math.max(0, totalForPie - (stats?.openComplaints ?? 0) - (stats?.inProgressComplaints ?? 0) - (stats?.resolvedComplaints ?? 0)),
                color: '#9ca3af',
            },
        ].filter((item) => item.value > 0)
        : [];

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

            {isFromMock && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 animate-fade-in" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Backend unavailable — showing sample data. Live data will appear when the server is reachable.</p>
                </div>
            )}

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

            <section aria-label="Status and performance analytics" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h2>
                    <div className="card p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            {statusSummary.map((item) => {
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
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h2>
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-700">
                            <PieChartIcon className="w-4 h-4" />
                            <p className="text-sm font-medium">Complaint lifecycle breakdown</p>
                        </div>
                        {performancePieData.length > 0 ? (
                            <div className="h-72" aria-label="Performance analytics pie chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={performancePieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={92}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={false}
                                        >
                                            {performancePieData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                                        <Legend verticalAlign="bottom" height={32} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No complaint data available for analytics yet.</p>
                        )}
                    </div>
                </div>
            </section>

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
