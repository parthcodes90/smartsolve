import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import FilterBar from '../../components/ui/FilterBar';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ErrorState from '../../components/ui/ErrorState';
import { getDepartments } from '../../adapters/dataAdapter';

/**
 * Departments — Department management page.
 * Displays departments in a structured DataTable.
 *
 * FUTURE INTEGRATION:
 * - Add department performance metrics when analytics API exists.
 * - Add staff assignment features when admin write APIs are ready.
 */

const FILTER_CONFIG = [
    { key: 'search', label: 'departments', type: 'search', placeholder: 'Search by name or head...' },
];

const COLUMNS = [
    {
        key: 'id',
        label: 'ID',
        render: (val) => <span className="font-mono text-xs font-semibold text-gray-900">{val}</span>,
    },
    {
        key: 'name',
        label: 'Department',
        render: (val) => <span className="font-medium text-gray-900">{val}</span>,
    },
    { key: 'head', label: 'Head of Dept.' },
    {
        key: 'activeComplaints',
        label: 'Active Complaints',
        render: (val) => (
            <span className={`font-semibold ${val > 10 ? 'text-red-600' : val > 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {val}
            </span>
        ),
    },
    {
        key: 'avgResolutionTime',
        label: 'Avg. Resolution',
        render: (val) => <span className="text-gray-600">{val}</span>,
    },
    {
        key: 'staff',
        label: 'Staff',
        render: (val) => <span className="text-gray-700 font-medium">{val}</span>,
    },
];

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFromMock, setIsFromMock] = useState(false);
    const [filters, setFilters] = useState({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getDepartments();
            setDepartments(result.data);
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
        return departments.filter((d) => {
            if (filters.search) {
                const q = filters.search.toLowerCase();
                if (![d.name, d.head, d.id].some((f) => (f || '').toLowerCase().includes(q))) return false;
            }
            return true;
        });
    }, [departments, filters]);

    if (loading) return <LoadingSkeleton variant="page" />;
    if (error && departments.length === 0) return <ErrorState variant="offline" message={error} onRetry={fetchData} />;

    return (
        <div className="space-y-6">
            <PageHeader title="Departments" subtitle={`${filteredData.length} departments`} />

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
                emptyTitle="No departments found"
                emptyMessage="Try adjusting your search."
                defaultPageSize={10}
            />
        </div>
    );
}
