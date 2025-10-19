import { useRecordings, useDeleteRecording } from '../hooks/data/useRecordings';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Loader } from '../components/common/Loader';

export function RecordingsPage() {
  const { data: recordings, isLoading } = useRecordings();
  const deleteRecording = useDeleteRecording();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950/20 to-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 animate-fade-in">
          My Recordings
        </h1>

        {recordings?.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-900 to-blue-900/20 border-blue-500/30 animate-slide-in-up">
            <div className="text-6xl mb-4 text-blue-400 font-bold">MIC</div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">No recordings yet</h2>
            <p className="text-gray-500 mb-6">Start practicing to save your first recording!</p>
            <Button
              onClick={() => window.location.href = '/practice'}
              variant="primary"
            >
              Start Practicing
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {recordings?.map((recording, idx) => (
              <Card
                key={recording.id}
                className="p-6 bg-gradient-to-br from-gray-900/80 to-blue-900/20 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {recording.exerciseName || 'Untitled Recording'}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                      <div>
                        <div className="text-gray-500 text-xs">Date</div>
                        <div className="text-white font-semibold">
                          {new Date(recording.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Duration</div>
                        <div className="text-white font-semibold">
                          {Math.floor(recording.duration / 1000)}s
                        </div>
                      </div>
                      {recording.score && (
                        <div>
                          <div className="text-gray-500 text-xs">Score</div>
                          <div className="text-green-400 font-semibold text-lg">
                            {recording.score}%
                          </div>
                        </div>
                      )}
                      {recording.pitchAccuracy && (
                        <div>
                          <div className="text-gray-500 text-xs">Pitch Accuracy</div>
                          <div className="text-blue-400 font-semibold">
                            {recording.pitchAccuracy}%
                          </div>
                        </div>
                      )}
                    </div>

                    {recording.notes && (
                      <div className="text-sm text-gray-400 italic">
                        "{recording.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this recording?')) {
                          deleteRecording.mutate(recording.id);
                        }
                      }}
                      className="text-red-400 border-red-400/50 hover:bg-red-400/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {recordings && recordings.length > 0 && (
          <div className="mt-8 text-center text-gray-500 text-sm">
            Total: {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
