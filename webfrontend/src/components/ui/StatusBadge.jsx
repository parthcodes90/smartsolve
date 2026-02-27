/**
 * StatusBadge — Renders a colored badge for complaint status.
 * Purely presentational.
 *
 * @param {string} status — Status string (case-insensitive). Unknown statuses render in neutral gray.
 *
 * FUTURE INTEGRATION: Status values may change when backend schemas stabilize.
 * Update the STATUS_CONFIG map to match new status enum values.
 */

const STATUS_CONFIG = {
    open: { label: 'Open', bg: 'bg-status-open-light', text: 'text-status-open-dark', dot: 'bg-status-open' },
    pending: { label: 'Pending', bg: 'bg-status-pending-light', text: 'text-status-pending-dark', dot: 'bg-status-pending' },
    in_progress: { label: 'In Progress', bg: 'bg-status-inprogress-light', text: 'text-status-inprogress-dark', dot: 'bg-status-inprogress' },
    'in progress': { label: 'In Progress', bg: 'bg-status-inprogress-light', text: 'text-status-inprogress-dark', dot: 'bg-status-inprogress' },
    ai_analysis: { label: 'AI Analysis', bg: 'bg-status-pending-light', text: 'text-status-pending-dark', dot: 'bg-status-pending' },
    assigned: { label: 'Assigned', bg: 'bg-status-inprogress-light', text: 'text-status-inprogress-dark', dot: 'bg-status-inprogress' },
    resolved: { label: 'Resolved', bg: 'bg-status-resolved-light', text: 'text-status-resolved-dark', dot: 'bg-status-resolved' },
    closed: { label: 'Closed', bg: 'bg-status-closed-light', text: 'text-status-closed-dark', dot: 'bg-status-closed' },
};

const DEFAULT_STATUS = { label: 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

export default function StatusBadge({ status }) {
    const key = (status || '').toLowerCase().trim();
    const config = STATUS_CONFIG[key] || { ...DEFAULT_STATUS, label: status || 'Unknown' };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
            role="status"
            aria-label={`Status: ${config.label}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
            {config.label}
        </span>
    );
}
