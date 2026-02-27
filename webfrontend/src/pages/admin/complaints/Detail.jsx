import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Building2, AlertCircle } from 'lucide-react';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import PriorityPill from '../../../components/ui/PriorityPill';
import LoadingSkeleton from '../../../components/ui/LoadingSkeleton';
import ErrorState from '../../../components/ui/ErrorState';
import { getComplaintById } from '../../../adapters/dataAdapter';

/**
 * ComplaintDetail — Drill-down view for a single complaint.
 * Displays structured detail cards using reusable components.
 *
 * FUTURE INTEGRATION:
 * - Add timeline/history section when audit log API exists.
 * - Add assignment actions when role-based UI is implemented.
 * - AI analysis section can be restored when AI service stabilizes.
 */

export default function ComplaintDetail() {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFromMock, setIsFromMock] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getComplaintById(id);
            setComplaint(result.data);
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
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse-slow" />
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse-slow" />
                </div>
                <LoadingSkeleton variant="text" count={1} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingSkeleton variant="card" />
                    <LoadingSkeleton variant="card" />
                </div>
            </div>
        );
    }

    if (error && !complaint) {
        return <ErrorState variant="offline" message={error} onRetry={fetchData} />;
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Intl.DateTimeFormat('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(new Date(dateStr));
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Back navigation + header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/complaints"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Back to complaints list"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <PageHeader
                    title={`Complaint ${complaint?.id || id}`}
                    subtitle={complaint?.title}
                />
            </div>

            {/* Backend warning */}
            {isFromMock && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>Backend unavailable — showing sample data.</p>
                </div>
            )}

            {/* Status and priority bar */}
            <div className="card p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Status:</span>
                        <StatusBadge status={complaint?.status} />
                    </div>
                    <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Priority:</span>
                        <PriorityPill priority={complaint?.priority} />
                    </div>
                    <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(complaint?.reportedAt)}</span>
                    </div>
                </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main description */}
                <div className="lg:col-span-2">
                    <div className="card p-6 space-y-5">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{complaint?.description || 'No description provided.'}</p>

                        {/* Category */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</h3>
                            <p className="text-gray-900 font-medium">{complaint?.category || 'Uncategorized'}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="space-y-6">
                    {/* Reporter info */}
                    <div className="card p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Reporter</h2>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{complaint?.reportedBy || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">Citizen Reporter</p>
                            </div>
                        </div>
                    </div>

                    {/* Assignment */}
                    <div className="card p-6 space-y-4">
                        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Assignment</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{complaint?.department || 'Unassigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Zone</p>
                                    <p className="text-sm font-medium text-gray-900">{complaint?.zone || 'Unassigned'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    {complaint?.location && (
                        <div className="card p-6 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Location</h2>
                            <p className="text-sm text-gray-700">{complaint.location}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* FUTURE INTEGRATION PLACEHOLDER:
       * Timeline / Activity log section will go here once audit trail API is available.
       * Use a vertical timeline component with status change events.
       */}
        </div>
    );
}
