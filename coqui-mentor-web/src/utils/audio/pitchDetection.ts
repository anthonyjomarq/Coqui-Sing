import { frequencyToNote, type NoteData } from './frequency';
import {
  MIN_FREQUENCY,
  MAX_FREQUENCY,
  MIN_CONFIDENCE_THRESHOLD,
  PITCH_SMOOTHING_BUFFER_SIZE,
} from './constants';

export interface PitchData extends NoteData {
  confidence: number;
  timestamp: number;
}

/**
 * Rolling buffer for pitch smoothing
 */
class PitchSmoothingBuffer {
  private buffer: number[] = [];
  private maxSize: number;

  constructor(maxSize: number = PITCH_SMOOTHING_BUFFER_SIZE) {
    this.maxSize = maxSize;
  }

  add(frequency: number): void {
    this.buffer.push(frequency);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
  }

  getSmoothed(): number {
    if (this.buffer.length === 0) return 0;
    const sum = this.buffer.reduce((acc, val) => acc + val, 0);
    return sum / this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }

  get length(): number {
    return this.buffer.length;
  }
}

// Global smoothing buffer instance
const smoothingBuffer = new PitchSmoothingBuffer();

function normalizeBuffer(buffer: Float32Array): Float32Array {
  const normalized = new Float32Array(buffer.length);
  let max = 0;

  // Find maximum absolute value
  for (let i = 0; i < buffer.length; i++) {
    const abs = Math.abs(buffer[i]);
    if (abs > max) max = abs;
  }

  // Normalize if max > 0
  if (max > 0) {
    for (let i = 0; i < buffer.length; i++) {
      normalized[i] = buffer[i] / max;
    }
  }

  return normalized;
}

function autocorrelate(buffer: Float32Array, sampleRate: number): Float32Array {
  const size = buffer.length;
  const maxSamples = Math.floor(sampleRate / MIN_FREQUENCY);
  const autocorrelation = new Float32Array(maxSamples);

  // Calculate autocorrelation for each lag
  for (let lag = 0; lag < maxSamples; lag++) {
    let sum = 0;
    for (let i = 0; i < size - lag; i++) {
      sum += buffer[i] * buffer[i + lag];
    }
    autocorrelation[lag] = sum;
  }

  return autocorrelation;
}

function findPeak(
  autocorrelation: Float32Array,
  sampleRate: number
): { index: number; confidence: number } | null {
  const minSamples = Math.floor(sampleRate / MAX_FREQUENCY);
  const maxSamples = Math.floor(sampleRate / MIN_FREQUENCY);

  // Find first zero crossing (where autocorrelation goes negative)
  let zeroCrossing = minSamples;
  for (let i = minSamples; i < maxSamples; i++) {
    if (autocorrelation[i] < 0) {
      zeroCrossing = i;
      break;
    }
  }

  // Find the first peak after zero crossing
  let peakIndex = -1;
  let peakValue = -Infinity;

  for (let i = zeroCrossing; i < maxSamples - 1; i++) {
    if (
      autocorrelation[i] > autocorrelation[i - 1] &&
      autocorrelation[i] > autocorrelation[i + 1] &&
      autocorrelation[i] > peakValue
    ) {
      peakValue = autocorrelation[i];
      peakIndex = i;
    }
  }

  if (peakIndex === -1) return null;

  // Calculate confidence based on peak prominence
  // Confidence is ratio of peak to the zero-lag autocorrelation
  const maxAutocorrelation = autocorrelation[0];
  const confidence = maxAutocorrelation > 0 ? peakValue / maxAutocorrelation : 0;

  return { index: peakIndex, confidence };
}

function parabolicInterpolation(autocorrelation: Float32Array, peakIndex: number): number {
  if (peakIndex <= 0 || peakIndex >= autocorrelation.length - 1) {
    return peakIndex;
  }

  const y0 = autocorrelation[peakIndex - 1];
  const y1 = autocorrelation[peakIndex];
  const y2 = autocorrelation[peakIndex + 1];

  // Parabolic interpolation formula
  const delta = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2);

  return peakIndex + delta;
}

export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  enableSmoothing: boolean = true
): PitchData | null {
  // Check for silence (very low energy)
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / buffer.length);

  if (rms < 0.01) {
    if (enableSmoothing) {
      smoothingBuffer.clear();
    }
    return null;
  }

  // Normalize buffer
  const normalized = normalizeBuffer(buffer);

  // Calculate autocorrelation
  const autocorrelation = autocorrelate(normalized, sampleRate);

  // Find peak
  const peak = findPeak(autocorrelation, sampleRate);

  if (!peak || peak.confidence < MIN_CONFIDENCE_THRESHOLD) {
    if (enableSmoothing) {
      smoothingBuffer.clear();
    }
    return null;
  }

  // Use parabolic interpolation for better accuracy
  const interpolatedIndex = parabolicInterpolation(autocorrelation, peak.index);

  // Calculate frequency
  let frequency = sampleRate / interpolatedIndex;

  // Apply smoothing if enabled
  if (enableSmoothing) {
    smoothingBuffer.add(frequency);
    frequency = smoothingBuffer.getSmoothed();
  }

  // Clamp frequency to valid range
  if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
    if (enableSmoothing) {
      smoothingBuffer.clear();
    }
    return null;
  }

  // Convert frequency to note
  const noteData = frequencyToNote(frequency);

  return {
    ...noteData,
    confidence: Math.min(peak.confidence, 1.0),
    timestamp: Date.now(),
  };
}

/**
 * Clear the pitch smoothing buffer
 * Call this when starting a new recording or when there's a long pause
 */
export function clearPitchSmoothing(): void {
  smoothingBuffer.clear();
}

export function detectPitchWithSensitivity(
  buffer: Float32Array,
  sampleRate: number,
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): PitchData | null {
  const result = detectPitch(buffer, sampleRate, true);

  if (!result) return null;

  // Adjust confidence threshold based on sensitivity
  const thresholds = {
    low: 0.85,
    medium: 0.7,
    high: 0.5,
  };

  const threshold = thresholds[sensitivity];

  if (result.confidence < threshold) {
    return null;
  }

  return result;
}
