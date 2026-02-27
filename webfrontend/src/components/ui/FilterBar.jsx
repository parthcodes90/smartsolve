import { Search, X } from 'lucide-react';

/**
 * FilterBar — UI-only filter controls.
 * Purely presentational — parent owns the state.
 *
 * @param {Array}    filters  — Array of filter configs: [{ key, label, type, options }]
 *                              type: 'search' | 'select'
 *                              options: [{ value, label }] (for select type)
 * @param {Object}   values   — Current filter values keyed by filter key
 * @param {function} onChange — Called with (key, newValue) when a filter changes
 * @param {function} onClear  — Called when "Clear all" is clicked
 *
 * FUTURE INTEGRATION: Add filter configs that match backend query params.
 */
export default function FilterBar({ filters = [], values = {}, onChange, onClear }) {
    const hasActiveFilters = Object.values(values).some((v) => v && v !== '' && v !== 'all');

    return (
        <div className="flex flex-wrap items-center gap-3" role="search" aria-label="Filter controls">
            {filters.map((filter) => {
                if (filter.type === 'search') {
                    return (
                        <div key={filter.key} className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                            <input
                                id={`filter-${filter.key}`}
                                type="text"
                                placeholder={filter.placeholder || `Search ${filter.label}...`}
                                value={values[filter.key] || ''}
                                onChange={(e) => onChange(filter.key, e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                                aria-label={filter.label}
                            />
                        </div>
                    );
                }

                if (filter.type === 'select') {
                    return (
                        <div key={filter.key} className="relative">
                            <select
                                id={`filter-${filter.key}`}
                                value={values[filter.key] || 'all'}
                                onChange={(e) => onChange(filter.key, e.target.value)}
                                className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all cursor-pointer"
                                aria-label={filter.label}
                            >
                                <option value="all">All {filter.label}</option>
                                {(filter.options || []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {/* Custom dropdown arrow */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    );
                }

                return null;
            })}

            {hasActiveFilters && onClear && (
                <button
                    onClick={onClear}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Clear all filters"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}
