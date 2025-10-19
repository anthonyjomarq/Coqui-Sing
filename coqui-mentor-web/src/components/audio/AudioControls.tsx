import { useEffect, useState, useCallback } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';

export interface AudioControlsProps {
  onRecordingComplete?: (blob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingPause?: () => void;
  onRecordingResume?: () => void;
  showTimer?: boolean;
  showStatus?: boolean;
  enableKeyboardShortcuts?: boolean;
  className?: string;
}

export function AudioControls({
  onRecordingComplete,
  onRecordingStart,
  onRecordingPause,
  onRecordingResume,
  showTimer = true,
  showStatus = true,
  enableKeyboardShortcuts = true,
  className = '',
}: AudioControlsProps) {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    audioState,
    audioBlob,
    isRecording,
    isPaused,
    error,
  } = useAudioRecorder();

  const [duration, setDuration] = useState(0);

  // Update duration from session
  useEffect(() => {
    if (audioState.currentSession) {
      setDuration(audioState.currentSession.duration);
    } else {
      setDuration(0);
    }
  }, [audioState.currentSession]);

  // Call callback when recording is complete
  useEffect(() => {
    if (audioBlob && onRecordingComplete) {
      onRecordingComplete(audioBlob);
    }
  }, [audioBlob, onRecordingComplete]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Space: start/pause recording
      if (e.code === 'Space') {
        e.preventDefault();
        if (!isRecording && !isPaused) {
          handleStartRecording();
        } else if (isRecording && !isPaused) {
          handlePauseRecording();
        } else if (isPaused) {
          handleResumeRecording();
        }
      }

      // Escape: stop recording
      if (e.code === 'Escape') {
        e.preventDefault();
        if (isRecording || isPaused) {
          handleStopRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isPaused, enableKeyboardShortcuts]);

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
      onRecordingStart?.();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }, [startRecording, onRecordingStart]);

  const handlePauseRecording = useCallback(() => {
    pauseRecording();
    onRecordingPause?.();
  }, [pauseRecording, onRecordingPause]);

  const handleResumeRecording = useCallback(() => {
    resumeRecording();
    onRecordingResume?.();
  }, [resumeRecording, onRecordingResume]);

  const handleStopRecording = useCallback(async () => {
    try {
      await stopRecording();
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }, [stopRecording]);

  // Format duration as MM:SS
  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Status display
  const getStatusDisplay = () => {
    if (audioState.status === 'analyzing') {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <div className="animate-spin h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Analyzing...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Error</span>
        </div>
      );
    }

    if (isPaused) {
      return (
        <div className="flex items-center space-x-2 text-orange-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Paused</span>
        </div>
      );
    }

    if (isRecording) {
      return (
        <div className="flex items-center space-x-2 text-red-600">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600"></span>
          </span>
          <span className="text-sm font-medium">Recording</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">Ready</span>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* Status Bar */}
      {showStatus && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>{getStatusDisplay()}</div>
          {showTimer && (
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-mono text-lg font-semibold text-gray-700 dark:text-gray-300">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {/* Record/Pause Button */}
        {!isRecording && !isPaused && (
          <button
            onClick={handleStartRecording}
            disabled={audioState.status === 'analyzing'}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-2xl hover:shadow-red-500/50 active:scale-95 hover:scale-110"
            title="Start Recording (Space)"
          >
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 012 0v2a1 1 0 11-2 0V9zm6 0a1 1 0 00-2 0v2a1 1 0 102 0V9z" />
            </svg>
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Record
            </span>
          </button>
        )}

        {isRecording && !isPaused && (
          <>
            {/* Pause Button */}
            <button
              onClick={handlePauseRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-2xl hover:shadow-orange-500/50 active:scale-95 hover:scale-110 animate-pulse"
              title="Pause Recording (Space)"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Pause
              </span>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStopRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-2xl hover:shadow-gray-600/50 active:scale-95 hover:scale-110"
              title="Stop Recording (Esc)"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Stop
              </span>
            </button>
          </>
        )}

        {isPaused && (
          <>
            {/* Resume Button */}
            <button
              onClick={handleResumeRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-2xl hover:shadow-green-500/50 active:scale-95 hover:scale-110"
              title="Resume Recording (Space)"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Resume
              </span>
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStopRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-2xl hover:shadow-gray-600/50 active:scale-95 hover:scale-110"
              title="Stop Recording (Esc)"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Stop
              </span>
            </button>
          </>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      {enableKeyboardShortcuts && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                Space
              </kbd>
              <span>Record/Pause</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                Esc
              </kbd>
              <span>Stop</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Recording Error
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
