/**
 * LoadingSkeleton — Animated pulse skeleton placeholders.
 * Purely presentational.
 *
 * @param {string} variant — 'card' | 'table' | 'text' | 'page'
 * @param {number} count   — Number of skeleton items to render (default: 1)
 */

function SkeletonLine({ className = '' }) {
    return <div className={`bg-gray-200 rounded animate-pulse-slow ${className}`} />;
}

function CardSkeleton() {
    return (
        <div className="card p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <SkeletonLine className="h-3 w-24" />
                    <SkeletonLine className="h-8 w-20" />
                </div>
                <SkeletonLine className="h-12 w-12 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
                <SkeletonLine className="h-5 w-16 rounded-full" />
                <SkeletonLine className="h-3 w-20" />
            </div>
        </div>
    );
}

function TableRowSkeleton({ columns = 5 }) {
    return (
        <tr className="border-b border-gray-100">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <SkeletonLine className={`h-4 ${i === 0 ? 'w-16' : i === 1 ? 'w-40' : 'w-20'}`} />
                </td>
            ))}
        </tr>
    );
}

function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100">
                <SkeletonLine className="h-8 w-64" />
            </div>
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-4">
                                <SkeletonLine className="h-3 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <TableRowSkeleton key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TextSkeleton({ lines = 3 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonLine key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
            ))}
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="space-y-2">
                <SkeletonLine className="h-8 w-48" />
                <SkeletonLine className="h-4 w-72" />
            </div>
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
            {/* Table */}
            <TableSkeleton rows={5} columns={5} />
        </div>
    );
}

export default function LoadingSkeleton({ variant = 'text', count = 1 }) {
    const variants = {
        card: CardSkeleton,
        table: TableSkeleton,
        text: TextSkeleton,
        page: PageSkeleton,
    };

    const Component = variants[variant] || variants.text;

    return (
        <div className="animate-fade-in" role="status" aria-label="Loading...">
            <span className="sr-only">Loading...</span>
            {Array.from({ length: count }).map((_, i) => (
                <Component key={i} />
            ))}
        </div>
    );
}
