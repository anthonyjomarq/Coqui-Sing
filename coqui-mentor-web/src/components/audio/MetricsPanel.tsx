import type { ExtendedAudioMetrics } from '../../utils/audio/audioMetrics';

export interface MetricsPanelProps {
  metrics: ExtendedAudioMetrics | null;
  className?: string;
}

function getVolumeColor(volumeDb: number): string {
  if (volumeDb < -60) return 'bg-red-500';
  if (volumeDb < -30) return 'bg-yellow-500';
  if (volumeDb < -10) return 'bg-green-500';
  return 'bg-blue-500';
}

function getClarityColor(clarity: number): string {
  if (clarity < 0.3) return 'bg-red-500';
  if (clarity < 0.5) return 'bg-yellow-500';
  if (clarity < 0.7) return 'bg-green-500';
  return 'bg-blue-500';
}

function getCentroidColor(centroid: number): string {
  if (centroid < 500) return 'bg-purple-500'; // Dark/bass
  if (centroid < 1500) return 'bg-blue-500'; // Normal voice range
  if (centroid < 3000) return 'bg-green-500'; // Bright
  return 'bg-yellow-500'; // Very bright
}

/**
 * MetricsPanel Component
 * Shows volume, clarity, and spectral metrics
 */
export function MetricsPanel({ metrics, className = '' }: MetricsPanelProps) {
  if (!metrics) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Audio Metrics
        </h3>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No audio data available
        </div>
      </div>
    );
  }

  const { volumeDb, clarity, spectralCentroid, hasVoice } = metrics;

  // Normalize values for display
  const volumePercent = Math.round(((volumeDb + 100) / 100) * 100);
  const clarityPercent = Math.round(clarity * 100);

  // Determine brightness category
  const getBrightness = (centroid: number): string => {
    if (centroid < 500) return 'Dark';
    if (centroid < 1500) return 'Warm';
    if (centroid < 3000) return 'Bright';
    return 'Very Bright';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Metrics</h3>
        {hasVoice && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="relative w-2 h-2">
              <div className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <div className="relative w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Voice Detected
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Volume Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Volume
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {volumeDb.toFixed(1)} dB
            </span>
          </div>

          {/* Volume Bar */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-300 ease-out ${getVolumeColor(volumeDb)}`}
              style={{
                width: `${Math.max(0, Math.min(100, volumePercent))}%`,
                boxShadow: volumePercent > 50 ? 'inset 0 0 10px rgba(255,255,255,0.3)' : 'none',
              }}
            />
            {/* Threshold markers */}
            <div className="absolute top-0 left-1/3 w-0.5 h-full bg-white/30" />
            <div className="absolute top-0 left-2/3 w-0.5 h-full bg-white/30" />
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Quiet</span>
            <span>Normal</span>
            <span>Loud</span>
          </div>
        </div>

        {/* Clarity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Clarity
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {clarityPercent}%
            </span>
          </div>

          {/* Clarity Bar */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full transition-all duration-300 ease-out ${getClarityColor(clarity)} relative`}
              style={{
                width: `${clarityPercent}%`,
                boxShadow: clarityPercent > 70 ? 'inset 0 0 10px rgba(255,255,255,0.3)' : 'none',
              }}
            >
              {clarityPercent > 70 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Spectral Centroid (Tone Brightness) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tone Brightness
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {spectralCentroid} Hz
            </span>
          </div>

          {/* Brightness Indicator */}
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            {/* Gradient background showing brightness spectrum */}
            <div className="absolute inset-0 flex">
              <div className="flex-1 bg-gradient-to-r from-purple-500/40 to-purple-500/30" />
              <div className="flex-1 bg-gradient-to-r from-blue-500/40 to-blue-500/30" />
              <div className="flex-1 bg-gradient-to-r from-green-500/40 to-green-500/30" />
              <div className="flex-1 bg-gradient-to-r from-yellow-500/40 to-yellow-500/30" />
            </div>

            {/* Position indicator */}
            <div
              className="absolute top-0 bottom-0 w-3 transition-all duration-300 ease-out rounded-full"
              style={{
                left: `${Math.min(100, (spectralCentroid / 4000) * 100)}%`,
                transform: 'translateX(-50%)',
                backgroundColor: getCentroidColor(spectralCentroid).includes('purple')
                  ? '#a855f7'
                  : getCentroidColor(spectralCentroid).includes('blue')
                    ? '#3b82f6'
                    : getCentroidColor(spectralCentroid).includes('green')
                      ? '#22c55e'
                      : '#eab308',
                boxShadow: `0 0 10px ${
                  getCentroidColor(spectralCentroid).includes('purple')
                    ? 'rgba(168, 85, 247, 0.5)'
                    : getCentroidColor(spectralCentroid).includes('blue')
                      ? 'rgba(59, 130, 246, 0.5)'
                      : getCentroidColor(spectralCentroid).includes('green')
                        ? 'rgba(34, 197, 94, 0.5)'
                        : 'rgba(234, 179, 8, 0.5)'
                }`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Dark</span>
            <span>Warm</span>
            <span>Bright</span>
            <span>Sharp</span>
          </div>

          <div className="text-center mt-2">
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
              {getBrightness(spectralCentroid)}
            </span>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            <span className="font-semibold">Volume:</span> Measures loudness of your voice
          </p>
          <p>
            <span className="font-semibold">Clarity:</span> Quality and purity of your tone
          </p>
          <p>
            <span className="font-semibold">Brightness:</span> Tonal color from dark to bright
          </p>
        </div>
      </div>
    </div>
  );
}
