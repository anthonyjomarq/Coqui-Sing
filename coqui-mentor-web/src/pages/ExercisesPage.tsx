import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercises, useToggleFavorite } from '../hooks/data/useExercises';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';

export function ExercisesPage() {
  const { data: exercises, isLoading } = useExercises();
  const toggleFavorite = useToggleFavorite();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = exercises?.filter(ex => {
    if (typeFilter !== 'all' && ex.type !== typeFilter) return false;
    if (searchQuery && !ex.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-purple-950/20 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 animate-fade-in">
          Exercise Library
        </h1>

        {/* Search */}
        <div className="mb-6 animate-slide-in-up">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Type Filters */}
        <div className="flex gap-3 mb-8 flex-wrap animate-fade-in-delay-1">
          {['all', 'warmup', 'scale', 'interval', 'song'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg capitalize font-semibold transition-all duration-200 ${
                typeFilter === type
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:scale-105'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-gray-400 mb-4">
          Showing {filtered.length} of {exercises?.length || 0} exercises
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exercise, idx) => (
            <Card
              key={exercise.id}
              className="p-6 bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white">{exercise.title}</h3>
                <button
                  onClick={() => toggleFavorite.mutate(exercise.id)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {exercise.isFavorite ? '⭐' : '☆'}
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-2 py-1 text-xs bg-purple-600 text-white rounded capitalize">
                  {exercise.type}
                </span>
                <span className={`px-2 py-1 text-xs text-white rounded capitalize ${
                  exercise.difficulty === 'beginner' ? 'bg-green-600' :
                  exercise.difficulty === 'intermediate' ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}>
                  {exercise.difficulty}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{exercise.description}</p>

              <div className="text-sm text-gray-500 mb-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400 font-semibold">Duration:</span>
                  <span>{exercise.duration} minutes</span>
                </div>
                {exercise.targetRange && (
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-semibold">Range:</span>
                    <span>
                      {typeof exercise.targetRange === 'string'
                        ? exercise.targetRange
                        : `${exercise.targetRange.low} - ${exercise.targetRange.high}`}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate(`/practice?exercise=${exercise.id}`)}
                variant="primary"
                className="w-full hover:scale-105 transition-transform"
              >
                Start Practice →
              </Button>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-gray-600 font-bold">SEARCH</div>
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No exercises found</h2>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
