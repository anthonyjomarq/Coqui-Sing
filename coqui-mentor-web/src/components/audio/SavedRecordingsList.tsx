import { useState, useRef, useEffect } from 'react';
import {
  getSavedRecordings,
  deleteRecording,
  getRecordingBlob,
  formatDuration,
  formatBytes,
  type SavedRecording,
} from '../../utils/recordingStorage';

export interface SavedRecordingsListProps {
  /** Callback when recordings list changes */
  onRecordingsChange?: () => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * SavedRecordingsList component - Displays and manages saved audio recordings
 * Allows playback and deletion of recordings
 */
export function SavedRecordingsList({
  onRecordingsChange,
  className = '',
}: SavedRecordingsListProps) {
  const [recordings, setRecordings] = useState<SavedRecording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load recordings on mount
  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = () => {
    const saved = getSavedRecordings();
    setRecordings(saved);
  };

  const handlePlay = (recording: SavedRecording) => {
    if (playingId === recording.id) {
      // Pause if already playing
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }

    // Create blob URL and play
    const blob = getRecordingBlob(recording);
    const url = URL.createObjectURL(blob);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingId(recording.id);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      deleteRecording(id);
      loadRecordings();
      onRecordingsChange?.();

      // Stop playback if deleting the currently playing recording
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
    }
  };

  const handleDownload = (recording: SavedRecording) => {
    const blob = getRecordingBlob(recording);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.${recording.mimeType.split('/')[1].split(';')[0]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime * 1000);
    };

    const handleEnded = () => {
      setPlayingId(null);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  if (recordings.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center ${className}`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No recordings yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Start recording to save your practice sessions!
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Saved Recordings
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {recordings.length} / 10
        </span>
      </div>

      <div className="space-y-3">
        {recordings.map((recording) => {
          const isPlaying = playingId === recording.id;
          const progress = isPlaying
            ? (currentTime / recording.duration) * 100
            : 0;

          return (
            <div
              key={recording.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {recording.name}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDuration(recording.duration)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(recording.size)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(recording.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => handlePlay(recording)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg
                        className="w-5 h-5 text-gray-700 dark:text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-700 dark:text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(recording)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title="Download"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700 dark:text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(recording.id)}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    title="Delete"
                  >
                    <svg
                      className="w-5 h-5 text-red-600 dark:text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {isPlaying && (
                <div className="mt-3">
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formatDuration(currentTime)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDuration(recording.duration)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
