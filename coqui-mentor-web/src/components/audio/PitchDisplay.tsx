import { PitchData } from '../../types/audio.types';
import { useEffect, useState } from 'react';

interface PitchDisplayProps {
  pitchData: PitchData | null;
}

export function PitchDisplay({ pitchData }: PitchDisplayProps) {
  const [showHint, setShowHint] = useState(false);

  // Show hint after 3 seconds of no pitch
  useEffect(() => {
    if (!pitchData) {
      const timer = setTimeout(() => setShowHint(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [pitchData]);

  if (!pitchData) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-center border-2 border-dashed border-gray-700">
        {/* Animated Listening Icon */}
        <div className="relative inline-block mb-4">
          <div className="text-6xl animate-pulse text-purple-400 font-bold">MIC</div>
          {/* Listening indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-6 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-4 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>

        {/* Main message */}
        <div className="text-2xl font-semibold text-gray-300 mb-2">
          Listening for pitch...
        </div>

        {/* Hint that appears after 3 seconds */}
        {showHint && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg animate-fade-in">
            <div className="text-purple-300 font-semibold mb-2">Try this:</div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Hum a steady "Ahhhh" sound</p>
              <p>• Sing a note (try middle C)</p>
              <p>• Get closer to your microphone</p>
              <p>• Increase your volume a bit</p>
            </div>
          </div>
        )}

        {/* Technical info */}
        <div className="mt-4 text-xs text-gray-500">
          Waiting for audio signal...
        </div>
      </div>
    );
  }

  // Helper functions for when pitch IS detected
  const getCentsColor = (cents: number) => {
    const absCents = Math.abs(cents);
    if (absCents < 5) return 'text-green-400';
    if (absCents < 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGaugeColor = (cents: number) => {
    const absCents = Math.abs(cents);
    if (absCents < 5) return 'bg-green-500';
    if (absCents < 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBackgroundGlow = (cents: number) => {
    const absCents = Math.abs(cents);
    if (absCents < 5) return 'from-green-900/50 to-blue-900/50 shadow-green-500/20';
    if (absCents < 20) return 'from-yellow-900/50 to-orange-900/50 shadow-yellow-500/20';
    return 'from-red-900/50 to-pink-900/50 shadow-red-500/20';
  };

  return (
    <div className={`bg-gradient-to-br ${getBackgroundGlow(pitchData.cents)} rounded-xl p-8 border border-purple-500/30 shadow-xl transition-all duration-300 relative`}>
      {/* Success indicator when in tune */}
      {Math.abs(pitchData.cents) < 5 && (
        <div className="absolute top-4 right-4 text-2xl animate-bounce text-green-400 font-bold">
          ✓
        </div>
      )}

      {/* Note Display */}
      <div className="text-center mb-6">
        <div className={`text-8xl font-bold mb-2 ${getCentsColor(pitchData.cents)} transition-colors duration-200 drop-shadow-lg`}>
          {pitchData.note}
        </div>
        <div className="text-3xl text-gray-300 font-semibold">
          {Math.round(pitchData.frequency)} Hz
        </div>
      </div>

      {/* Cents Deviation Gauge */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
          <span>♭ Flat</span>
          <span className="text-green-400">Perfect</span>
          <span>♯ Sharp</span>
        </div>
        <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          {/* Background zones */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-red-500/20" />
            <div className="flex-1 bg-yellow-500/20" />
            <div className="w-20 bg-green-500/30" />
            <div className="flex-1 bg-yellow-500/20" />
            <div className="flex-1 bg-red-500/20" />
          </div>

          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />

          {/* Indicator with glow */}
          <div
            className={`absolute top-0 bottom-0 w-2 ${getGaugeColor(pitchData.cents)} transition-all duration-100 shadow-lg`}
            style={{
              left: `calc(${((pitchData.cents + 50) / 100) * 100}% - 4px)`,
              boxShadow: '0 0 10px currentColor'
            }}
          />
        </div>
        <div className={`text-center mt-3 text-2xl font-bold ${getCentsColor(pitchData.cents)}`}>
          {pitchData.cents > 0 ? '+' : ''}{pitchData.cents.toFixed(1)}¢
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-4">
        {Math.abs(pitchData.cents) < 5 && (
          <div className="text-green-400 font-semibold text-lg animate-pulse">
            Perfect pitch! Keep it up!
          </div>
        )}
        {Math.abs(pitchData.cents) >= 5 && Math.abs(pitchData.cents) < 20 && (
          <div className="text-yellow-400 font-semibold">
            {pitchData.cents > 0 ? '↑ Slightly sharp' : '↓ Slightly flat'}
          </div>
        )}
        {Math.abs(pitchData.cents) >= 20 && (
          <div className="text-red-400 font-semibold">
            {pitchData.cents > 0 ? '↑ Too sharp' : '↓ Too flat'}
          </div>
        )}
      </div>

      {/* Confidence */}
      <div className="flex justify-between items-center text-sm bg-black/20 rounded-lg p-3">
        <span className="text-gray-400 font-medium">Confidence:</span>
        <div className="flex items-center gap-3">
          <div className="w-40 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                pitchData.confidence > 0.8 ? 'bg-green-500' :
                pitchData.confidence > 0.6 ? 'bg-blue-500' :
                'bg-yellow-500'
              }`}
              style={{ width: `${pitchData.confidence * 100}%` }}
            />
          </div>
          <span className="text-gray-300 w-12 text-right font-bold">
            {Math.round(pitchData.confidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
