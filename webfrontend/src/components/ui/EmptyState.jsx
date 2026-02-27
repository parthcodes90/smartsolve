import { Inbox } from 'lucide-react';

/**
 * EmptyState — Centered empty data placeholder.
 * Purely presentational.
 *
 * @param {ReactNode} icon        — Lucide icon (default: Inbox)
 * @param {string}    title       — Heading text
 * @param {string}    description — Descriptive text
 * @param {string}    actionLabel — Optional button label
 * @param {function}  onAction    — Optional button click handler
 */
export default function EmptyState({
    icon,
    title = 'No data found',
    description = 'There are no items to display at this time.',
    actionLabel,
    onAction,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in" role="status">
            <div className="p-4 rounded-2xl bg-gray-100 text-gray-400 mb-4">
                {icon || <Inbox className="w-10 h-10" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
