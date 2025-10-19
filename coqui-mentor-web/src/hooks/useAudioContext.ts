import { useState, useEffect, useRef } from 'react';

interface UseAudioContextReturn {
  audioContext: AudioContext | null;
  isInitialized: boolean;
  error: string | null;
}

export function useAudioContext(): UseAudioContextReturn {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resumeAttemptedRef = useRef<boolean>(false);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!AudioContextClass) {
      setError('Web Audio API is not supported in this browser');
      return;
    }

    try {
      const context = new AudioContextClass();
      setAudioContext(context);

      const resumeAudioContext = async () => {
        if (context.state === 'suspended' && !resumeAttemptedRef.current) {
          resumeAttemptedRef.current = true;
          try {
            await context.resume();
            setIsInitialized(true);
            removeResumeListeners();
          } catch (err) {
            const errorMsg = `Failed to resume audio context: ${err instanceof Error ? err.message : 'Unknown error'}`;
            console.error('[useAudioContext]', errorMsg);
            setError(errorMsg);
          }
        } else if (context.state === 'running') {
          setIsInitialized(true);
          removeResumeListeners();
        }
      };

      const removeResumeListeners = () => {
        document.removeEventListener('click', resumeAudioContext);
        document.removeEventListener('touchstart', resumeAudioContext);
        document.removeEventListener('keydown', resumeAudioContext);
      };

      document.addEventListener('click', resumeAudioContext);
      document.addEventListener('touchstart', resumeAudioContext);
      document.addEventListener('keydown', resumeAudioContext);

      resumeAudioContext();

      return () => {
        removeResumeListeners();
        if (context.state !== 'closed') {
          context.close().catch((err) => {
            console.error('Error closing audio context:', err);
          });
        }
      };
    } catch (err) {
      setError(`Failed to create audio context: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  return { audioContext, isInitialized, error };
}
