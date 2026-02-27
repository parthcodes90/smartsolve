import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
        <p className="text-sm font-semibold text-red-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          The page you requested does not exist in the admin app.
        </p>
        <Link
          to="/admin/overview"
          className="inline-flex mt-6 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Go to Overview
        </Link>
      </div>
    </div>
  );
}
