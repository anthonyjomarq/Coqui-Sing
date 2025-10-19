import { useProgress } from '../hooks/data/useProgress';
import { Card } from '../components/common/Card';
import { Loader } from '../components/common/Loader';

export function ProgressPage() {
  const { data: progress, isLoading } = useProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-green-950/20 to-gray-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-green-950/20 to-gray-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-8 animate-fade-in">
          Your Progress
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/20 border-purple-500/30 animate-slide-in-left">
            <div>
              <div className="text-sm text-gray-400 mb-2">Total Practice Time</div>
              <div className="text-3xl font-bold text-white">
                {formatTime(progress?.totalPracticeTime || 0)}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/20 border-blue-500/30 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <div>
              <div className="text-sm text-gray-400 mb-2">Practice Sessions</div>
              <div className="text-3xl font-bold text-white">
                {progress?.totalSessions || 0}
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/30 to-blue-900/20 border-green-500/30 animate-slide-in-right">
            <div>
              <div className="text-sm text-gray-400 mb-2">Current Streak</div>
              <div className="text-3xl font-bold text-white">
                {progress?.currentStreak || 0}
                <span className="text-base ml-1 text-gray-400">days</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-pink-900/30 to-purple-900/20 border-pink-500/30 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <div>
              <div className="text-sm text-gray-400 mb-2">Average Score</div>
              <div className="text-3xl font-bold text-white">
                {Math.round(progress?.averageScore || 0)}%
                {progress?.trend === 'up' && <span className="text-green-400 text-lg ml-2">↑</span>}
                {progress?.trend === 'down' && <span className="text-red-400 text-lg ml-2">↓</span>}
                {progress?.trend === 'stable' && <span className="text-gray-400 text-lg ml-2">→</span>}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-purple-900/20 border-purple-500/30 animate-slide-in-up">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Practice Sessions
          </h2>

          {progress?.recentSessions && progress.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {progress.recentSessions.map((session, idx) => (
                <div
                  key={session.id}
                  className="flex justify-between items-center py-4 px-4 bg-gray-950/50 rounded-lg border border-gray-800 hover:border-purple-500/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${
                      session.score >= 80 ? 'text-yellow-400' :
                      session.score >= 60 ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {session.score >= 80 ? '★' : session.score >= 60 ? '★' : '•'}
                    </div>
                    <div>
                      <div className="text-white font-semibold">
                        {session.exerciseName || 'Practice Session'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(session.date).toLocaleDateString()} • {Math.floor(session.duration / 60000)} minutes
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      session.score >= 80 ? 'text-green-400' :
                      session.score >= 60 ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      {session.score}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.pitchAccuracy}% pitch accuracy
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-600 font-bold">STATS</div>
              <h3 className="text-xl font-bold text-gray-400 mb-2">No practice sessions yet</h3>
              <p className="text-gray-500">Start practicing to see your progress!</p>
            </div>
          )}
        </Card>

        {/* Motivational Message */}
        {progress && progress.totalSessions > 0 && (
          <Card className="p-6 mt-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30 text-center animate-fade-in-delay-2">
            <div className={`text-2xl mb-2 font-bold ${
              progress.currentStreak >= 7 ? 'text-orange-400' :
              progress.currentStreak >= 3 ? 'text-green-400' :
              'text-blue-400'
            }`}>
              {progress.currentStreak >= 7 ? 'Amazing!' : progress.currentStreak >= 3 ? 'Great job!' : 'Keep going!'}
            </div>
            <p className="text-gray-300">
              {progress.currentStreak >= 7
                ? 'You\'re on fire! Keep up that incredible streak!'
                : progress.currentStreak >= 3
                  ? 'You\'re building a great habit! Keep it up!'
                  : 'Practice daily to build your skills faster!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
