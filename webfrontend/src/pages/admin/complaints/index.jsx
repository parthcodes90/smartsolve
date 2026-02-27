import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import DataTable from '../../../components/ui/DataTable';
import FilterBar from '../../../components/ui/FilterBar';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityPill from '../../../components/ui/PriorityPill';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import { getComplaints } from '../../../adapters/dataAdapter';

/**
 * ComplaintsList — Complaints listing with filters, sorting, and pagination.
 * Uses DataTable and FilterBar for structured display.
 * Data comes through the adapter layer.
 *
 * FUTURE INTEGRATION:
 * - Server-side filtering/pagination when backend supports query params.
 * - Real-time updates when WebSocket layer is added.
 */

const FILTER_CONFIG = [
    { key: 'search', label: 'complaints', type: 'search', placeholder: 'Search by ID, title, or zone...' },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'open', label: 'Open' },
            { value: 'in progress', label: 'In Progress' },
            { value: 'assigned', label: 'Assigned' },
            { value: 'pending', label: 'Pending' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
        ],
    },
    {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
            { value: 'critical', label: 'Critical' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
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
        key: 'title',
        label: 'Title',
        render: (val) => <span className="font-medium text-gray-900 max-w-xs truncate block">{val}</span>,
    },
    { key: 'category', label: 'Category' },
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
    { key: 'department', label: 'Department' },
];

export default function ComplaintsList() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFromMock, setIsFromMock] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getComplaints();
            setComplaints(result.data);
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

    // Client-side filtering
    const filteredData = useMemo(() => {
        return complaints.filter((c) => {
            // Search filter
            if (filters.search) {
                const q = filters.search.toLowerCase();
                const match = [c.id, c.title, c.zone, c.category, c.department]
                    .filter(Boolean)
                    .some((field) => field.toLowerCase().includes(q));
                if (!match) return false;
            }
            // Status filter
            if (filters.status && filters.status !== 'all') {
                if (c.status.toLowerCase() !== filters.status.toLowerCase()) return false;
            }
            // Priority filter
            if (filters.priority && filters.priority !== 'all') {
                if (c.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
            }
            return true;
        });
    }, [complaints, filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleClearFilters = () => setFilters({});

    if (loading) return <LoadingSkeleton variant="page" />;

    if (error && complaints.length === 0) {
        return <ErrorState variant="offline" message={error} onRetry={fetchData} />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Complaints"
                subtitle={`${filteredData.length} complaints ${filters.search || filters.status || filters.priority ? '(filtered)' : 'total'}`}
            />

            {/* Backend warning */}
            {isFromMock && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 animate-fade-in" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Backend unavailable — showing sample data.</p>
                </div>
            )}

            {/* Filters */}
            <FilterBar
                filters={FILTER_CONFIG}
                values={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
            />

            {/* Complaints table */}
            <DataTable
                columns={COLUMNS}
                data={filteredData}
                onRowClick={(row) => navigate(`/admin/complaints/${row.id}`)}
                emptyTitle="No complaints found"
                emptyMessage="Try adjusting your filters or check back later."
                defaultPageSize={10}
            />
        </div>
    );
}
