import { useRouteError, Link } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
        <p className="text-xl text-gray-400 mb-4">Something went wrong</p>
        {error?.statusText || error?.message ? (
          <p className="text-gray-500 mb-8 font-mono text-sm">
            {error.statusText || error.message}
          </p>
        ) : null}
        <Link
          to="/"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
