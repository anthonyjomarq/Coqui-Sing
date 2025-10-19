import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExercise } from '../hooks/data/useExercises';
import { Loader } from '../components/common/Loader';

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: exercise, isLoading, error } = useExercise(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Exercise not found</h1>
          <Link
            to="/exercises"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-block"
          >
            Back to Exercises
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/exercises')}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back to Exercises
        </button>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{exercise.title}</h1>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {exercise.type}
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {exercise.difficulty}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  {exercise.duration} min
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            <p className="text-gray-300 text-lg">{exercise.description}</p>
          </div>

          {exercise.instructions && Array.isArray(exercise.instructions) && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Instructions</h2>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction: string, idx: number) => (
                  <li key={idx} className="text-gray-300">
                    {idx + 1}. {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {exercise.targetRange && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Target Range</h2>
              <p className="text-gray-300">
                Practice range for this exercise
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/', { state: { exerciseId: exercise.id } })}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
