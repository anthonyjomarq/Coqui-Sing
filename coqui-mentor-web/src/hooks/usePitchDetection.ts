import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateMetrics, type ExtendedAudioMetrics } from '../utils/audio/audioMetrics';
import type { PitchData } from '../utils/audio/pitchDetection';
import { FFT_SIZE, SMOOTHING_FACTOR } from '../utils/audio/constants';
import { backendService, type AudioAnalysisData, type FeedbackData } from '../services/backendService';

export interface UsePitchDetectionOptions {
  audioStream: MediaStream | null;
  enabled: boolean;
  sensitivity?: 'low' | 'medium' | 'high';
  fftSize?: number;
  useBackend?: boolean;
  sessionId?: string;
}

export interface UsePitchDetectionReturn {
  currentPitch: PitchData | null;
  currentMetrics: ExtendedAudioMetrics | null;
  isDetecting: boolean;
  error: string | null;
  backendAnalysis: AudioAnalysisData | null;
  feedback: FeedbackData | null;
  isBackendConnected: boolean;
}

export function usePitchDetection({
  audioStream,
  enabled,
  sensitivity = 'medium',
  fftSize = FFT_SIZE,
  useBackend = false,
  sessionId,
}: UsePitchDetectionOptions): UsePitchDetectionReturn {
  const [currentPitch, setCurrentPitch] = useState<PitchData | null>(null);
  const [currentMetrics, setCurrentMetrics] = useState<ExtendedAudioMetrics | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendAnalysis, setBackendAnalysis] = useState<AudioAnalysisData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Refs to prevent re-renders during animation frame
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);
  const backendConnectedRef = useRef(false);
  const audioBufferRef = useRef<Float32Array[]>([]);

  const analyze = useCallback(() => {
    if (!isActiveRef.current || !analyserRef.current || !audioContextRef.current) {
      return;
    }

    try {
        const metrics = calculateMetrics(
        analyserRef.current,
        audioContextRef.current,
        sensitivity
      );

      if (metrics) {
        setCurrentMetrics(metrics);
        setCurrentPitch(metrics.pitch);

            if (useBackend && backendConnectedRef.current && metrics.pitch) {
                const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Float32Array(bufferLength);
          analyserRef.current.getFloatTimeDomainData(dataArray);
          
                audioBufferRef.current.push(new Float32Array(dataArray));
          
          // Send to backend every 5 frames to avoid overwhelming
          if (audioBufferRef.current.length >= 5) {
            const combinedBuffer = new Float32Array(
              audioBufferRef.current.reduce((acc, chunk) => acc + chunk.length, 0)
            );
            
            let offset = 0;
            for (const chunk of audioBufferRef.current) {
              combinedBuffer.set(chunk, offset);
              offset += chunk.length;
            }
            
            backendService.sendAudioData(combinedBuffer, audioContextRef.current.sampleRate);
            audioBufferRef.current = [];
          }
        }
      } else {
        setCurrentMetrics(null);
        setCurrentPitch(null);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis error';
      setError(errorMessage);
    }

    if (isActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyze);
    }
  }, [sensitivity, useBackend]);

  const initializeAnalysis = useCallback(() => {
    if (!audioStream || !enabled) {
      return;
    }

    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error('[usePitchDetection] Stream has no audio tracks');
      setError('No audio stream');
      return;
    }

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

        const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = SMOOTHING_FACTOR;
      analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(audioStream);
      sourceNodeRef.current = source;

      // Connect source to analyser (don't connect to destination to avoid feedback)
      source.connect(analyser);

        isActiveRef.current = true;
      setIsDetecting(true);
      setError(null);

        animationFrameRef.current = requestAnimationFrame(analyze);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize pitch detection';
      setError(errorMessage);
      setIsDetecting(false);
    }
  }, [audioStream, enabled, fftSize, analyze]);

  const cleanup = useCallback(() => {
    isActiveRef.current = false;
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore disconnect errors
      }
      sourceNodeRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current
        .close()
        .catch(() => {
          // Ignore close errors
        })
        .finally(() => {
          audioContextRef.current = null;
        });
    }

    setIsDetecting(false);
    setCurrentPitch(null);
    setCurrentMetrics(null);
  }, []);

  useEffect(() => {
    if (audioStream && enabled) {
      initializeAnalysis();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [audioStream, enabled, initializeAnalysis, cleanup]);

  useEffect(() => {
    if (useBackend) {
      const connectToBackend = async () => {
        try {
          await backendService.connect();
          backendConnectedRef.current = true;
          setIsBackendConnected(true);
          
                backendService.onAudioAnalysis((data) => {
            setBackendAnalysis(data);
          });
          
          backendService.onFeedback((data) => {
            setFeedback(data);
          });
          
          backendService.onError((error) => {
            setError(`Backend error: ${error.message}`);
          });
          
                if (sessionId) {
            backendService.joinSession(sessionId);
          }
          
                backendService.startAudioAnalysis();
        } catch (error) {
          console.error('Failed to connect to backend:', error);
          setError('Failed to connect to backend');
          setIsBackendConnected(false);
        }
      };
      
      connectToBackend();
      
      return () => {
        backendService.stopAudioAnalysis();
        if (sessionId) {
          backendService.leaveSession(sessionId);
        }
        backendService.disconnect();
        backendConnectedRef.current = false;
        setIsBackendConnected(false);
      };
    }
  }, [useBackend, sessionId]);

  useEffect(() => {
    // Sensitivity changes are handled in the analyze function
    // No need to reinitialize
  }, [sensitivity]);

  return {
    currentPitch,
    currentMetrics,
    isDetecting,
    error,
    backendAnalysis,
    feedback,
    isBackendConnected,
  };
}
