import { useEffect, useState } from 'react';

interface KeyboardHintProps {
  isRecording: boolean;
  isPaused: boolean;
}

export function KeyboardHint({ isRecording, isPaused }: KeyboardHintProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r' || e.key.toLowerCase() === 's' || e.key === 'Escape') {
        setPressedKey(e.key.toLowerCase() === 'escape' ? 'Esc' : e.key.toUpperCase());
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-black/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-3 text-sm z-40">
      <div className="font-mono text-purple-300 mb-2 font-bold">Keyboard Shortcuts</div>

      <div className="space-y-1 text-xs">
        <div className={`flex items-center gap-2 ${pressedKey === 'R' ? 'text-green-400' : 'text-gray-400'}`}>
          <kbd className={`px-2 py-1 rounded ${pressedKey === 'R' ? 'bg-green-500 text-black' : 'bg-gray-700'}`}>R</kbd>
          <span>
            {!isRecording ? 'Start recording' : isPaused ? 'Resume' : 'Pause'}
          </span>
        </div>

        <div className={`flex items-center gap-2 ${pressedKey === 'S' || pressedKey === 'Esc' ? 'text-red-400' : 'text-gray-400'}`}>
          <kbd className={`px-2 py-1 rounded ${pressedKey === 'S' ? 'bg-red-500 text-white' : 'bg-gray-700'}`}>S</kbd>
          <span>Stop recording</span>
        </div>

        <div className={`flex items-center gap-2 ${pressedKey === 'Esc' ? 'text-red-400' : 'text-gray-400'}`}>
          <kbd className={`px-2 py-1 rounded ${pressedKey === 'Esc' ? 'bg-red-500 text-white' : 'bg-gray-700'}`}>Esc</kbd>
          <span>Stop recording</span>
        </div>
      </div>

      {pressedKey && (
        <div className="mt-2 text-green-400 text-xs font-semibold animate-pulse">
          Key pressed: {pressedKey}
        </div>
      )}
    </div>
  );
}
