/**
 * PageHeader — Consistent page title with optional subtitle and action slot.
 * Purely presentational.
 *
 * @param {string}    title    — Page heading
 * @param {string}    subtitle — Optional subtitle / description
 * @param {ReactNode} children — Right-side action area (buttons, etc.)
 */
export default function PageHeader({ title, subtitle, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
            {children && (
                <div className="flex items-center gap-3 flex-shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
}
