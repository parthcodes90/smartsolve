import { AlertTriangle, WifiOff, RefreshCw } from 'lucide-react';

/**
 * ErrorState — Error / backend unavailable display.
 * Purely presentational.
 *
 * @param {string}   title   — Error heading
 * @param {string}   message — Error details
 * @param {function} onRetry — Retry handler (optional)
 * @param {string}   variant — 'error' | 'offline' (changes icon and color)
 */
export default function ErrorState({
    title,
    message,
    onRetry,
    variant = 'error',
}) {
    const isOffline = variant === 'offline';

    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in" role="alert">
            <div className={`p-4 rounded-2xl mb-4 ${isOffline ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'}`}>
                {isOffline ? <WifiOff className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title || (isOffline ? 'Backend Unavailable' : 'Something went wrong')}
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
                {message || (isOffline
                    ? 'The server is currently unreachable. Displaying cached or sample data.'
                    : 'An unexpected error occurred. Please try again.'
                )}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}
