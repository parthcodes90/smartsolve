/**
 * PriorityPill — Renders a colored pill for priority levels.
 * Purely presentational.
 *
 * @param {string} priority — 'low' | 'medium' | 'high' | 'critical' (case-insensitive)
 *
 * FUTURE INTEGRATION: Priority values may change with backend. Update PRIORITY_CONFIG.
 */

const PRIORITY_CONFIG = {
    critical: { label: 'Critical', bg: 'bg-priority-critical-light', text: 'text-priority-critical-dark', border: 'border-priority-critical/20' },
    high: { label: 'High', bg: 'bg-priority-high-light', text: 'text-priority-high-dark', border: 'border-priority-high/20' },
    medium: { label: 'Medium', bg: 'bg-priority-medium-light', text: 'text-priority-medium-dark', border: 'border-priority-medium/20' },
    low: { label: 'Low', bg: 'bg-priority-low-light', text: 'text-priority-low-dark', border: 'border-priority-low/20' },
};

const DEFAULT_PRIORITY = { label: 'N/A', bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' };

export default function PriorityPill({ priority }) {
    const key = (priority || '').toLowerCase().trim();
    const config = PRIORITY_CONFIG[key] || { ...DEFAULT_PRIORITY, label: priority || 'N/A' };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}
            aria-label={`Priority: ${config.label}`}
        >
            {config.label}
        </span>
    );
}
