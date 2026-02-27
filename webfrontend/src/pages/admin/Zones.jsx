import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import FilterBar from '../../components/ui/FilterBar';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import { getZones } from '../../adapters/dataAdapter';

/**
 * Zones — Operational zones management page.
 * Displays zones in a structured DataTable with filtering.
 *
 * FUTURE INTEGRATION:
 * - Link to map visualization when map feature is ready.
 * - Add zone creation/edit actions when admin write APIs exist.
 */

const FILTER_CONFIG = [
    { key: 'search', label: 'zones', type: 'search', placeholder: 'Search by name or head...' },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
        ],
    },
];

const COLUMNS = [
    {
        key: 'id',
        label: 'ID',
        render: (val) => <span className="font-mono text-xs font-semibold text-gray-900">{val}</span>,
    },
    {
        key: 'name',
        label: 'Zone Name',
        render: (val) => <span className="font-medium text-gray-900">{val}</span>,
    },
    { key: 'area', label: 'Area' },
    {
        key: 'activeComplaints',
        label: 'Active Complaints',
        render: (val) => (
            <span className={`font-semibold ${val > 10 ? 'text-red-600' : val > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {val}
            </span>
        ),
    },
    { key: 'totalComplaints', label: 'Total' },
    {
        key: 'status',
        label: 'Status',
        render: (val) => <StatusBadge status={val} />,
    },
    { key: 'head', label: 'Zone Head' },
];

export default function Zones() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFromMock, setIsFromMock] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getZones();
            setZones(result.data);
            setIsFromMock(result.isFromMock);
            if (result.error) setError(result.error);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return zones.filter((z) => {
            if (filters.search) {
                const q = filters.search.toLowerCase();
                if (![z.name, z.head, z.id].some((f) => (f || '').toLowerCase().includes(q))) return false;
            }
            if (filters.status && filters.status !== 'all') {
                if (z.status.toLowerCase() !== filters.status) return false;
            }
            return true;
        });
    }, [zones, filters]);

    if (loading) return <LoadingSkeleton variant="page" />;
    if (error && zones.length === 0) return <ErrorState variant="offline" message={error} onRetry={fetchData} />;

    return (
        <div className="space-y-6">
            <PageHeader title="Zones" subtitle={`${filteredData.length} operational zones`} />

            {isFromMock && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 animate-fade-in" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Backend unavailable — showing sample data.</p>
                </div>
            )}

            <FilterBar
                filters={FILTER_CONFIG}
                values={filters}
                onChange={(k, v) => setFilters((p) => ({ ...p, [k]: v }))}
                onClear={() => setFilters({})}
            />

            <DataTable
                columns={COLUMNS}
                data={filteredData}
                emptyTitle="No zones found"
                emptyMessage="Try adjusting your filters."
                defaultPageSize={10}
            />
        </div>
    );
}
