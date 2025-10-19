export function getVolume(buffer: Uint8Array): number {
  let sumSquares = 0;
  let count = 0;

  for (let i = 0; i < buffer.length; i++) {
    const normalized = buffer[i] / 255.0;
    sumSquares += normalized * normalized;
    count++;
  }

  if (count === 0) return -100;

  const rms = Math.sqrt(sumSquares / count);

  // Convert to decibels (dB)
  // Using 20 * log10(rms) where rms is 0-1
  if (rms === 0) return -100;

  const db = 20 * Math.log10(rms);

  // Clamp to range -100 to 0
  return Math.max(-100, Math.min(0, db));
}

/**
 * Calculate spectral centroid (brightness of sound)
 * Higher values indicate brighter/sharper tones
 * @param frequencies - Frequency domain data (Float32Array from AnalyserNode)
 * @param sampleRate - Audio sample rate in Hz
 * @returns Spectral centroid in Hz (typically 0-8000)
 */
export function getSpectralCentroid(frequencies: Float32Array, sampleRate: number): number {
  let weightedSum = 0;
  let magnitudeSum = 0;

  const binWidth = sampleRate / (frequencies.length * 2);

  for (let i = 0; i < frequencies.length; i++) {
    const magnitude = frequencies[i];
    const frequency = i * binWidth;

    weightedSum += frequency * magnitude;
    magnitudeSum += magnitude;
  }

  if (magnitudeSum === 0) return 0;

  const centroid = weightedSum / magnitudeSum;

  return Math.round(centroid);
}

/**
 * Calculate zero-crossing rate (measure of signal clarity/noisiness)
 * Higher values indicate more noise or complex waveforms
 * @param buffer - Time-domain audio data
 * @returns Clarity score from 0 (noisy) to 1 (pure tone)
 */
export function getClarity(buffer: Float32Array): number {
  if (buffer.length < 2) return 0;

  let zeroCrossings = 0;

  // Count zero crossings
  for (let i = 1; i < buffer.length; i++) {
    if ((buffer[i - 1] >= 0 && buffer[i] < 0) || (buffer[i - 1] < 0 && buffer[i] >= 0)) {
      zeroCrossings++;
    }
  }

  // Calculate zero-crossing rate
  const zcr = zeroCrossings / buffer.length;

  // Normalize to 0-1 range
  // Pure tones have low ZCR (~0.02-0.1), noise has high ZCR (~0.4-0.5)
  // Invert so 1 = clear, 0 = noisy
  const maxExpectedZcr = 0.5;
  const clarity = 1 - Math.min(zcr / maxExpectedZcr, 1);

  return clarity;
}

/**
 * Calculate spectral flux (measure of spectral change)
 * Useful for detecting onsets and transients
 * @param currentSpectrum - Current frame frequency data
 * @param previousSpectrum - Previous frame frequency data
 * @returns Spectral flux value (0 to ~1), higher = more change
 */
export function getSpectralFlux(
  currentSpectrum: Float32Array,
  previousSpectrum: Float32Array
): number {
  if (currentSpectrum.length !== previousSpectrum.length) return 0;

  let flux = 0;

  for (let i = 0; i < currentSpectrum.length; i++) {
    const diff = currentSpectrum[i] - previousSpectrum[i];
    if (diff > 0) {
      flux += diff * diff;
    }
  }

  // Normalize
  const normalizedFlux = Math.sqrt(flux / currentSpectrum.length);

  return Math.min(normalizedFlux, 1);
}

/**
 * Calculate spectral rolloff (frequency below which 85% of energy is contained)
 * Indicates brightness/darkness of timbre
 * @param frequencies - Frequency domain data
 * @param sampleRate - Audio sample rate in Hz
 * @param threshold - Energy threshold (default 0.85 = 85%)
 * @returns Rolloff frequency in Hz
 */
export function getSpectralRolloff(
  frequencies: Float32Array,
  sampleRate: number,
  threshold: number = 0.85
): number {
  // Calculate total energy
  let totalEnergy = 0;
  for (let i = 0; i < frequencies.length; i++) {
    totalEnergy += frequencies[i];
  }

  const targetEnergy = totalEnergy * threshold;
  let cumulativeEnergy = 0;
  const binWidth = sampleRate / (frequencies.length * 2);

  // Find frequency bin where cumulative energy reaches threshold
  for (let i = 0; i < frequencies.length; i++) {
    cumulativeEnergy += frequencies[i];
    if (cumulativeEnergy >= targetEnergy) {
      return Math.round(i * binWidth);
    }
  }

  return Math.round((frequencies.length - 1) * binWidth);
}

export function getVoiceProbability(frequencies: Float32Array, timeData: Float32Array): number {
  // Voice characteristics:
  // 1. Moderate spectral centroid (500-3000 Hz)
  // 2. Multiple harmonics (not a pure tone)
  // 3. Moderate clarity (not too noisy, not too pure)

  const centroid = getSpectralCentroid(frequencies, 44100);
  const clarity = getClarity(timeData);

  // Check if centroid is in voice range
  const centroidScore = centroid >= 500 && centroid <= 3000 ? 1 : 0.5;

  // Voice has moderate clarity (0.3-0.8)
  const clarityScore = clarity >= 0.3 && clarity <= 0.8 ? 1 : 0.5;

  // Combine scores
  const voiceProbability = (centroidScore + clarityScore) / 2;

  return voiceProbability;
}

/**
 * Get fundamental frequency from frequency spectrum
 * Finds the frequency bin with the highest magnitude
 * @param frequencies - Frequency domain data
 * @param sampleRate - Audio sample rate in Hz
 * @returns Fundamental frequency in Hz, or 0 if none found
 */
export function getFundamentalFrequency(
  frequencies: Float32Array,
  sampleRate: number
): number {
  let maxMagnitude = 0;
  let maxIndex = 0;

  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] > maxMagnitude) {
      maxMagnitude = frequencies[i];
      maxIndex = i;
    }
  }

  if (maxMagnitude === 0) return 0;

  const binWidth = sampleRate / (frequencies.length * 2);
  return Math.round(maxIndex * binWidth);
}
