import { detectPitch, type PitchData } from './pitchDetection';
import { getVolume, getSpectralCentroid, getClarity } from './fftAnalysis';
import type { AudioMetrics } from '../../types/audio.types';

/**
 * Extended audio metrics with additional spectral data
 */
export interface ExtendedAudioMetrics {
  pitch: PitchData | null;
  volumeDb: number;
  clarity: number;
  spectralCentroid: number;
  hasVoice: boolean;
  timestamp: number;
}

export function calculateMetrics(
  analyserNode: AnalyserNode,
  audioContext: AudioContext,
  sensitivity: 'low' | 'medium' | 'high' = 'medium'
): ExtendedAudioMetrics | null {
  try {
    const sampleRate = audioContext.sampleRate;

    const timeDomainData = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(timeDomainData);

    const frequencyData = new Float32Array(analyserNode.frequencyBinCount);
    analyserNode.getFloatFrequencyData(frequencyData);

    const byteFrequencyData = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(byteFrequencyData);

    const pitchData = detectPitch(timeDomainData, sampleRate, true);

    const sensitivityThresholds = {
      low: 0.85,
      medium: 0.7,
      high: 0.5,
    };

    const filteredPitchData =
      pitchData && pitchData.confidence >= sensitivityThresholds[sensitivity]
        ? pitchData
        : null;

    const volumeDb = getVolume(byteFrequencyData);

    const clarity = getClarity(timeDomainData);

    const spectralCentroid = getSpectralCentroid(frequencyData, sampleRate);

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
    return null;
  }
}

export function toAudioMetrics(metrics: ExtendedAudioMetrics): AudioMetrics | null {
  if (!metrics.pitch) return null;

  return {
    pitch: metrics.pitch,
    volume: normalizeVolume(metrics.volumeDb),
    clarity: metrics.clarity,
    vibrato: {
      rate: 0, // Vibrato detection not yet implemented
      depth: 0,
    },
    formants: [], // Formant detection not yet implemented
  };
}

function normalizeVolume(volumeDb: number): number {
  // Map -100 to 0 dB to 0-1 range
  // Use logarithmic scaling for more intuitive perception
  const normalized = (volumeDb + 100) / 100;
  return Math.max(0, Math.min(1, normalized));
}

export function getVolumeCategory(volumeDb: number): 'silent' | 'quiet' | 'normal' | 'loud' {
  if (volumeDb < -60) return 'silent';
  if (volumeDb < -30) return 'quiet';
  if (volumeDb < -10) return 'normal';
  return 'loud';
}

export function getClarityCategory(clarity: number): 'poor' | 'fair' | 'good' | 'excellent' {
  if (clarity < 0.3) return 'poor';
  if (clarity < 0.5) return 'fair';
  if (clarity < 0.7) return 'good';
  return 'excellent';
}

export function getPitchAccuracyCategory(
  cents: number
): 'perfect' | 'good' | 'fair' | 'poor' {
  const absCents = Math.abs(cents);
  if (absCents <= 5) return 'perfect';
  if (absCents <= 15) return 'good';
  if (absCents <= 30) return 'fair';
  return 'poor';
}

export function analyzeMetrics(metrics: ExtendedAudioMetrics): {
  volumeStatus: string;
  clarityStatus: string;
  pitchStatus: string;
  suggestions: string[];
} {
  const suggestions: string[] = [];

  // Volume analysis
  const volumeCategory = getVolumeCategory(metrics.volumeDb);
  let volumeStatus = '';

  switch (volumeCategory) {
    case 'silent':
      volumeStatus = 'Too quiet - speak louder';
      suggestions.push('Increase your volume or move closer to the microphone');
      break;
    case 'quiet':
      volumeStatus = 'Quiet - consider speaking louder';
      suggestions.push('Try projecting your voice more');
      break;
    case 'normal':
      volumeStatus = 'Good volume';
      break;
    case 'loud':
      volumeStatus = 'Very loud';
      suggestions.push('You might be too close to the microphone');
      break;
  }

  // Clarity analysis
  const clarityCategory = getClarityCategory(metrics.clarity);
  let clarityStatus = '';

  switch (clarityCategory) {
    case 'poor':
      clarityStatus = 'Poor clarity - noisy signal';
      suggestions.push('Reduce background noise or check microphone quality');
      break;
    case 'fair':
      clarityStatus = 'Fair clarity';
      suggestions.push('Try to sing with a clearer tone');
      break;
    case 'good':
      clarityStatus = 'Good clarity';
      break;
    case 'excellent':
      clarityStatus = 'Excellent clarity';
      break;
  }

  // Pitch analysis
  let pitchStatus = '';

  if (!metrics.pitch) {
    pitchStatus = 'No pitch detected';
    if (metrics.hasVoice) {
      suggestions.push('Try singing with a more sustained tone');
    }
  } else {
    const pitchCategory = getPitchAccuracyCategory(metrics.pitch.cents);

    switch (pitchCategory) {
      case 'perfect':
        pitchStatus = `Perfect pitch! (${metrics.pitch.note})`;
        break;
      case 'good':
        pitchStatus = `Good pitch (${metrics.pitch.note}, ${metrics.pitch.cents > 0 ? '+' : ''}${metrics.pitch.cents} cents)`;
        break;
      case 'fair':
        pitchStatus = `Fair pitch (${metrics.pitch.note}, ${metrics.pitch.cents > 0 ? '+' : ''}${metrics.pitch.cents} cents)`;
        suggestions.push(
          metrics.pitch.cents > 0
            ? 'Pitch slightly sharp - try singing a bit lower'
            : 'Pitch slightly flat - try singing a bit higher'
        );
        break;
      case 'poor':
        pitchStatus = `Off pitch (${metrics.pitch.note}, ${metrics.pitch.cents > 0 ? '+' : ''}${metrics.pitch.cents} cents)`;
        suggestions.push(
          metrics.pitch.cents > 0
            ? 'Pitch is sharp - sing lower'
            : 'Pitch is flat - sing higher'
        );
        break;
    }
  }

  return {
    volumeStatus,
    clarityStatus,
    pitchStatus,
    suggestions,
  };
}
