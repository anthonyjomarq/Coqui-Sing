import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdvancedAudioVisualizer } from '../components/audio/AdvancedAudioVisualizer';
import { AudioControls } from '../components/audio/AudioControls';
import { CompatibilityWarning } from '../components/common/CompatibilityWarning';
import { MetricsPanel } from '../components/audio/MetricsPanel';
import { MicrophoneSelector } from '../components/audio/MicrophoneSelector';
import { PitchDisplay } from '../components/audio/PitchDisplay';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMicrophone } from '../hooks/useMicrophone';
import { usePitchDetection } from '../hooks/usePitchDetection';

export function HomePage() {
  const [isAnalysisEnabled, setIsAnalysisEnabled] = useState(true);

  const {
    stream,
    requestPermission,
    isPermissionGranted,
    error: micError
  } = useMicrophone();

  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused
  } = useAudioRecorder();

  const {
    currentPitch,
    currentMetrics
  } = usePitchDetection({
    audioStream: stream,
    enabled: isRecording && isAnalysisEnabled
  });

  useEffect(() => {
    if (!isPermissionGranted && !micError) {
      requestPermission();
    }
  }, []);

  useKeyboardShortcuts({
    onRecord: () => {
      if (!isRecording) {
        startRecording();
      } else if (isPaused) {
        resumeRecording();
      } else {
        pauseRecording();
      }
    },
    onStop: () => {
      if (isRecording || isPaused) {
        stopRecording();
      }
    },
    enabled: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <CompatibilityWarning />
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Coqui Sing
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Real-Time Vocal Analysis and Training
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <Link
              to="/exercises"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold text-lg hover:scale-105 transition-transform"
            >
              Browse Exercises
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg hover:bg-white/20 transition-colors"
            >
              About This Project
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full">React + TypeScript</span>
            <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full">Web Audio API</span>
            <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-full">Real-time Analysis</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Live Audio Analysis</h2>

          <div className="mb-6">
            <MicrophoneSelector />

            {micError && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {micError}
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnalysisEnabled}
                onChange={(e) => setIsAnalysisEnabled(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-white font-medium">Enable Real-Time Analysis</span>
            </label>
          </div>

          {isRecording && stream && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Audio Visualization</h3>
              <AdvancedAudioVisualizer
                audioStream={stream}
                isRecording={isRecording}
                width={1200}
                height={600}
              />
            </div>
          )}

          {isRecording && isAnalysisEnabled && (
            <>
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-3">Pitch Analysis</h3>
                <PitchDisplay pitchData={currentPitch} />
              </div>

              {currentMetrics && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Audio Metrics</h3>
                  <MetricsPanel metrics={currentMetrics} />
                </div>
              )}
            </>
          )}

          <div className="mb-6">
            <AudioControls />
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>Press <kbd className="px-2 py-1 bg-gray-700 rounded">R</kbd> to record/pause</p>
            <p>Press <kbd className="px-2 py-1 bg-gray-700 rounded">S</kbd> or <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd> to stop</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-2">Real-Time Pitch Detection</h3>
            <p className="text-gray-400">
              Accurate pitch analysis with visual feedback
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-2">Audio Visualization</h3>
            <p className="text-gray-400">
              Professional waveform and spectrogram display
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-bold text-white mb-2">Progress Tracking</h3>
            <p className="text-gray-400">
              Monitor your vocal improvement over time
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
