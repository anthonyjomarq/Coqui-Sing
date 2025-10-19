/**
 * Audio Processing Web Worker
 * Runs pitch detection and audio analysis off the main thread
 * for improved performance and 60fps UI
 */

import { detectPitch } from '../utils/audio/pitchDetection';
import { getVolume, getSpectralCentroid, getClarity } from '../utils/audio/fftAnalysis';
import type { ExtendedAudioMetrics } from '../utils/audio/audioMetrics';

/**
 * Message types for worker communication
 */
export interface AudioProcessorMessage {
  type: 'process';
  payload: {
    timeDomainData: Float32Array;
    frequencyData: Float32Array;
    byteFrequencyData: Uint8Array;
    sampleRate: number;
    sensitivity: 'low' | 'medium' | 'high';
  };
}

export interface AudioProcessorResult {
  type: 'result' | 'error';
  payload: ExtendedAudioMetrics | null;
  error?: string;
  processingTime?: number;
}

/**
 * Process audio data and return metrics
 * This runs in the worker thread, keeping the main thread free
 */
function processAudioData(
  timeDomainData: Float32Array,
  frequencyData: Float32Array,
  byteFrequencyData: Uint8Array,
  sampleRate: number,
  sensitivity: 'low' | 'medium' | 'high'
): ExtendedAudioMetrics | null {
  try {
    // Detect pitch from time-domain data
    const pitchData = detectPitch(timeDomainData, sampleRate, true);

    // Apply sensitivity threshold
    const sensitivityThresholds = {
      low: 0.85,
      medium: 0.7,
      high: 0.5,
    };

    const filteredPitchData =
      pitchData && pitchData.confidence >= sensitivityThresholds[sensitivity]
        ? pitchData
        : null;

    // Calculate volume
    const volumeDb = getVolume(byteFrequencyData);

    // Calculate clarity
    const clarity = getClarity(timeDomainData);

    // Calculate spectral centroid
    const spectralCentroid = getSpectralCentroid(frequencyData, sampleRate);

    // Determine if voice is present
    const hasVoice = volumeDb > -50 && clarity > 0.2;

    return {
      pitch: filteredPitchData,
      volumeDb,
      clarity,
      spectralCentroid,
      hasVoice,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error in audio processing worker:', error);
    return null;
  }
}

/**
 * Worker message handler
 */
self.onmessage = (event: MessageEvent<AudioProcessorMessage>) => {
  const { type, payload } = event.data;

  if (type === 'process') {
    try {
      const startTime = performance.now();

      const metrics = processAudioData(
        payload.timeDomainData,
        payload.frequencyData,
        payload.byteFrequencyData,
        payload.sampleRate,
        payload.sensitivity
      );

      const processingTime = performance.now() - startTime;

      const result: AudioProcessorResult = {
        type: 'result',
        payload: metrics,
        processingTime,
      };

      self.postMessage(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const result: AudioProcessorResult = {
        type: 'error',
        payload: null,
        error: errorMessage,
      };

      self.postMessage(result);
    }
  }
};

// Export empty object to make this a module
export {};
