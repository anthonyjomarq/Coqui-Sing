import { Link, useSearchParams } from 'react-router-dom';

export function PracticePage() {
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get('exercise');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Under Development
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The practice mode is currently being built. Check back soon for interactive vocal exercises!
          </p>
          {exerciseId && (
            <p className="text-sm text-gray-400 mb-8">
              Exercise ID: {exerciseId}
            </p>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/exercises"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition-transform"
            >
              Browse Exercises
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
