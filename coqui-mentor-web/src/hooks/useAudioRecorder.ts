import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import {
  startRecording as startRecordingAction,
  pauseRecording as pauseRecordingAction,
  resumeRecording as resumeRecordingAction,
  stopRecording as stopRecordingAction,
  updateMetrics,
  updateSessionDuration,
  setError,
  initializeAudio,
  fetchAudioDevices,
  analyzeRecording,
} from '../store/slices/audioSlice';
import { useAudioContext } from './useAudioContext';
import { useMicrophone } from './useMicrophone';
import type { AudioMetrics } from '../types/audio.types';
import type { RootState } from '../store';
import {
  SUPPORTED_MIME_TYPES,
  RECORDING_DATA_INTERVAL,
  RECORDING_DURATION_UPDATE_INTERVAL,
  AUDIO_ANALYSIS_INTERVAL,
  ERROR_MESSAGES,
} from '../utils/constants';

export interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => void;
  resumeRecording: () => void;

  // State from Redux
  audioState: RootState['audio'];

  audioBlob: Blob | null;

  initialize: () => Promise<void>;

  audioContext: AudioContext | null;
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  selectDevice: (deviceId: string) => void;

  isInitialized: boolean;
  isRecording: boolean;
  isPaused: boolean;

  // Errors (consolidated from all sources)
  error: string | null;
}

interface RecorderState {
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  startTime: number;
  sessionId: string | null;
}

/**
 * Helper function to get supported MIME type for MediaRecorder.
 * Tries types in order of preference and returns the first supported type.
 * @returns Supported MIME type string, or empty string if none supported
 */
function getSupportedMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  // Fallback to default (browser will choose)
  return '';
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const dispatch = useAppDispatch();

  const { audioContext, isInitialized: audioContextInitialized, error: audioContextError } =
    useAudioContext();
  const {
    stream,
    devices,
    selectedDevice,
    selectDevice,
    requestPermission,
    isPermissionGranted,
    error: microphoneError,
  } = useMicrophone();

  const audioState = useAppSelector((state) => state.audio);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const recorderStateRef = useRef<RecorderState>({
    mediaRecorder: null,
    audioChunks: [],
    startTime: 0,
    sessionId: null,
  });

  const analysisIntervalRef = useRef<number | null>(null);

  const error =
    audioState.error || audioContextError || microphoneError || null;

  // Initialize audio system
  const initialize = useCallback(async () => {
    try {
        await dispatch(initializeAudio()).unwrap();

        await requestPermission();

        await dispatch(fetchAudioDevices()).unwrap();

      setIsInitialized(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_INITIALIZE_AUDIO;
      dispatch(setError(errorMessage));
      setIsInitialized(false);
    }
  }, [dispatch, requestPermission]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!isInitialized && !error) {
      initialize();
    }
  }, []);

  // Start mock audio analysis (simulates real-time pitch/volume detection)
  const startAudioAnalysis = useCallback(() => {
    if (!audioContext || !stream) return;

    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    analysisIntervalRef.current = setInterval(() => {
      const mockMetrics: AudioMetrics = {
        pitch: {
          frequency: 440 + Math.random() * 100 - 50, // A4 ± 50Hz
          note: 'A4',
          cents: Math.random() * 50 - 25,
          confidence: 0.8 + Math.random() * 0.2,
          timestamp: Date.now(),
        },
        volume: 0.5 + Math.random() * 0.5,
        clarity: 0.7 + Math.random() * 0.3,
        vibrato: {
          rate: 5 + Math.random() * 2,
          depth: 0.2 + Math.random() * 0.3,
        },
        formants: [800, 1200, 2800],
      };

      dispatch(updateMetrics(mockMetrics));
    }, AUDIO_ANALYSIS_INTERVAL);
  }, [audioContext, stream, dispatch]);

  // Stop audio analysis
  const stopAudioAnalysis = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  // Update session duration
  const updateDuration = useCallback(() => {
    const { startTime, sessionId } = recorderStateRef.current;
    if (sessionId && startTime > 0) {
      const duration = Date.now() - startTime;
      dispatch(updateSessionDuration(duration));
    }
  }, [dispatch]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      if (!stream) {
        throw new Error(ERROR_MESSAGES.NO_MICROPHONE_STREAM);
      }

      if (!isPermissionGranted) {
        await requestPermission();
      }

      if (!stream) {
        throw new Error(ERROR_MESSAGES.NO_MICROPHONE_STREAM);
      }

        const mimeType = getSupportedMimeType();

        const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        recorderStateRef.current = {
        mediaRecorder,
        audioChunks: [],
        startTime: Date.now(),
        sessionId,
      };

        mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderStateRef.current.audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const { audioChunks } = recorderStateRef.current;
        const blob = new Blob(audioChunks, {
          type: mimeType || 'audio/webm',
        });
        setAudioBlob(blob);
      };

      mediaRecorder.onerror = (event) => {
        const errorMessage = `MediaRecorder error: ${event}`;
        console.error(errorMessage);
        dispatch(setError(errorMessage));
        stopAudioAnalysis();
      };

        mediaRecorder.start(RECORDING_DATA_INTERVAL);

        dispatch(startRecordingAction({ sessionId }));

        startAudioAnalysis();

        const durationInterval = setInterval(updateDuration, RECORDING_DURATION_UPDATE_INTERVAL);
      (recorderStateRef.current as any).durationInterval = durationInterval;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : ERROR_MESSAGES.FAILED_TO_START_RECORDING;
      dispatch(setError(errorMessage));
      throw err;
    }
  }, [
    stream,
    isPermissionGranted,
    requestPermission,
    dispatch,
    startAudioAnalysis,
    updateDuration,
    stopAudioAnalysis,
  ]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    const { mediaRecorder } = recorderStateRef.current;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      dispatch(pauseRecordingAction());
      stopAudioAnalysis();

      if ((recorderStateRef.current as any).durationInterval) {
        clearInterval((recorderStateRef.current as any).durationInterval);
        (recorderStateRef.current as any).durationInterval = null;
      }
    }
  }, [dispatch, stopAudioAnalysis]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    const { mediaRecorder } = recorderStateRef.current;

    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      dispatch(resumeRecordingAction());
      startAudioAnalysis();

      const durationInterval = setInterval(updateDuration, RECORDING_DURATION_UPDATE_INTERVAL);
      (recorderStateRef.current as any).durationInterval = durationInterval;
    }
  }, [dispatch, startAudioAnalysis, updateDuration]);

  // Stop recording
  const stopRecording = useCallback(async () => {
    const { mediaRecorder, startTime, sessionId, audioChunks } =
      recorderStateRef.current;

    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      return;
    }

    mediaRecorder.stop();

    stopAudioAnalysis();

    if ((recorderStateRef.current as any).durationInterval) {
      clearInterval((recorderStateRef.current as any).durationInterval);
    }

    const duration = Date.now() - startTime;

    const mimeType = getSupportedMimeType();
    const blob = new Blob(audioChunks, {
      type: mimeType || 'audio/webm',
    });

    setAudioBlob(blob);

    dispatch(
      stopRecordingAction({
        duration,
        audioBlob: blob,
      })
    );

    if (sessionId && blob.size > 0) {
      try {
        await dispatch(
          analyzeRecording({
            sessionId,
            audioBlob: blob,
          })
        ).unwrap();
      } catch (err) {
        console.error('Failed to analyze recording:', err);
          }
    }
  }, [dispatch, stopAudioAnalysis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const { mediaRecorder } = recorderStateRef.current;

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

        stopAudioAnalysis();

        if ((recorderStateRef.current as any).durationInterval) {
        clearInterval((recorderStateRef.current as any).durationInterval);
      }
    };
  }, [stopAudioAnalysis]);

  return {
      startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,

      audioState,
    audioBlob,

      initialize,

      audioContext,
    stream,
    devices,
    selectedDevice,
    selectDevice,

      isInitialized: isInitialized && audioContextInitialized && isPermissionGranted,
    isRecording: audioState.isRecording,
    isPaused: audioState.isPaused,

      error,
  };
}
