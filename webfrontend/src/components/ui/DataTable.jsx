import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * DataTable — Configurable, sortable, paginated table.
 * Purely presentational. No data fetching logic.
 *
 * @param {Array}    columns      — Column configs: [{ key, label, sortable?, render? }]
 *                                  render: (value, row) => ReactNode
 * @param {Array}    data         — Array of row objects
 * @param {boolean}  loading      — Show skeleton state
 * @param {string}   emptyTitle   — Title when no data
 * @param {string}   emptyMessage — Message when no data
 * @param {function} onRowClick   — Optional (row) => void
 * @param {number}   defaultPageSize — Rows per page (default: 10)
 *
 * FUTURE INTEGRATION: When backend supports server-side sorting/pagination,
 * add onSort and onPageChange callbacks and disable client-side logic.
 */
export default function DataTable({
    columns = [],
    data = [],
    loading = false,
    emptyTitle,
    emptyMessage,
    onRowClick,
    defaultPageSize = 10,
}) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);

    // Client-side sorting
    const sortedData = useMemo(() => {
        if (!sortKey) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortKey] ?? '';
            const bVal = b[sortKey] ?? '';
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir]);

    // Client-side pagination
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Reset to page 1 when data or pageSize changes
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setCurrentPage(1);
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="card overflow-hidden animate-fade-in">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            {columns.map((col) => (
                                <th key={col.key} className="p-4 text-left">
                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse-slow" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-100">
                                {columns.map((col) => (
                                    <td key={col.key} className="p-4">
                                        <div className={`h-4 bg-gray-200 rounded animate-pulse-slow ${col.key === columns[0]?.key ? 'w-16' : 'w-28'}`} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="card">
                <EmptyState title={emptyTitle} description={emptyMessage} />
            </div>
        );
    }

    const SortIcon = ({ columnKey }) => {
        if (sortKey !== columnKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;
        return sortDir === 'asc'
            ? <ChevronUp className="w-3.5 h-3.5 text-accent-600" />
            : <ChevronDown className="w-3.5 h-3.5 text-accent-600" />;
    };

    return (
        <div className="card overflow-hidden animate-fade-in">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left" role="table">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-gray-700 transition-colors' : ''
                                        }`}
                                    onClick={col.sortable !== false ? () => handleSort(col.key) : undefined}
                                    scope="col"
                                    aria-sort={
                                        sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'
                                    }
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.label}
                                        {col.sortable !== false && <SortIcon columnKey={col.key} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {paginatedData.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className={`transition-colors ${onRowClick
                                        ? 'cursor-pointer hover:bg-accent-50/50 active:bg-accent-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                                onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(row); } : undefined}
                                role={onRowClick ? 'button' : undefined}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="p-4 text-sm text-gray-700">
                                        {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Showing</span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="appearance-none px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700 cursor-pointer focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                        aria-label="Rows per page"
                    >
                        {[5, 10, 20, 50].map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span>of {sortedData.length} results</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 1) return true;
                            return false;
                        })
                        .map((page, idx, arr) => {
                            const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                            return (
                                <span key={page} className="flex items-center">
                                    {showEllipsis && <span className="px-1 text-gray-400">…</span>}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-accent-600 text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-200'
                                            }`}
                                        aria-label={`Page ${page}`}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                    >
                                        {page}
                                    </button>
                                </span>
                            );
                        })}

                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
