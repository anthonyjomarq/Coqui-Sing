/**
 * Frequency Conversion Utilities
 * Functions for converting between note names and frequencies
 */

import {
  NOTE_FREQUENCIES,
  NOTE_NAMES,
  A4_FREQUENCY,
  CENTS_PER_OCTAVE,
  SEMITONES_PER_OCTAVE,
} from './constants';

export interface NoteData {
  /** Note name with octave (e.g., "A4", "C#5") */
  note: string;
  /** Deviation from perfect pitch in cents (-50 to +50) */
  cents: number;
  /** Frequency in Hz */
  frequency: number;
  /** Octave number */
  octave: number;
}

/**
 * Convert a note name to its frequency in Hz
 * @param note - Note name with octave (e.g., "A4", "C#5", "Bb3")
 * @returns Frequency in Hz, or null if note is invalid
 * @example
 * noteToFrequency("A4") // returns 440
 * noteToFrequency("C4") // returns 261.63
 */
export function noteToFrequency(note: string): number | null {
  const frequency = NOTE_FREQUENCIES[note];
  return frequency !== undefined ? frequency : null;
}

/**
 * Convert a frequency to the nearest note with cents deviation
 * Uses equal temperament tuning (A4 = 440 Hz)
 * @param frequency - Frequency in Hz
 * @returns Object containing note name, cents deviation, and octave
 * @example
 * frequencyToNote(440) // { note: "A4", cents: 0, frequency: 440, octave: 4 }
 * frequencyToNote(445) // { note: "A4", cents: ~19, frequency: 445, octave: 4 }
 */
export function frequencyToNote(frequency: number): NoteData {
  // Calculate the number of semitones from A4 (440 Hz)
  const semitonesFromA4 = SEMITONES_PER_OCTAVE * Math.log2(frequency / A4_FREQUENCY);

  // Round to nearest semitone to get the note
  const nearestSemitone = Math.round(semitonesFromA4);

  // Calculate cents deviation from the nearest note
  const cents = Math.round((semitonesFromA4 - nearestSemitone) * 100);

  // Calculate which note and octave
  // A4 is index 9 in octave 4
  const a4Index = 9; // A is the 10th note (index 9) in the chromatic scale
  const a4Octave = 4;

  const noteIndex = (a4Index + nearestSemitone) % SEMITONES_PER_OCTAVE;
  const normalizedNoteIndex = noteIndex >= 0 ? noteIndex : noteIndex + SEMITONES_PER_OCTAVE;

  const octaveOffset = Math.floor((a4Index + nearestSemitone) / SEMITONES_PER_OCTAVE);
  const octave = a4Octave + octaveOffset;

  const noteName = NOTE_NAMES[normalizedNoteIndex];
  const note = `${noteName}${octave}`;

  return {
    note,
    cents,
    frequency,
    octave,
  };
}

/**
 * Calculate the cents difference between two frequencies
 * @param frequency1 - First frequency in Hz
 * @param frequency2 - Second frequency in Hz
 * @returns Difference in cents
 */
export function centsBetweenFrequencies(frequency1: number, frequency2: number): number {
  return Math.round(CENTS_PER_OCTAVE * Math.log2(frequency2 / frequency1));
}

/**
 * Check if a frequency is within a certain number of cents from a target note
 * @param frequency - Frequency to check in Hz
 * @param targetNote - Target note name (e.g., "A4")
 * @param toleranceCents - Acceptable deviation in cents (default: 5)
 * @returns True if frequency is within tolerance
 */
export function isInTune(
  frequency: number,
  targetNote: string,
  toleranceCents: number = 5
): boolean {
  const targetFreq = noteToFrequency(targetNote);
  if (targetFreq === null) return false;

  const cents = Math.abs(centsBetweenFrequencies(targetFreq, frequency));
  return cents <= toleranceCents;
}

/**
 * Get the frequency of a note offset by a number of cents
 * @param frequency - Base frequency in Hz
 * @param cents - Number of cents to offset (+/-)
 * @returns New frequency in Hz
 */
export function frequencyWithCentsOffset(frequency: number, cents: number): number {
  return frequency * Math.pow(2, cents / CENTS_PER_OCTAVE);
}

/**
 * Get all notes within a frequency range
 * @param minFreq - Minimum frequency in Hz
 * @param maxFreq - Maximum frequency in Hz
 * @returns Array of note names within the range
 */
export function getNotesInRange(minFreq: number, maxFreq: number): string[] {
  return Object.entries(NOTE_FREQUENCIES)
    .filter(([_, freq]) => freq >= minFreq && freq <= maxFreq)
    .map(([note, _]) => note)
    .filter(note => !note.includes('b')); // Filter out flat notes to avoid duplicates
}
