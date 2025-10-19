/**
 * Utilities for managing audio recordings in localStorage
 */

export interface SavedRecording {
  id: string;
  name: string;
  duration: number;
  timestamp: number;
  audioData: string; // Base64 encoded audio blob
  mimeType: string;
  size: number; // Size in bytes
}

const STORAGE_KEY = 'coqui_saved_recordings';
const MAX_RECORDINGS = 10; // Limit to prevent localStorage quota issues

/**
 * Convert Blob to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Get all saved recordings from localStorage
 */
export function getSavedRecordings(): SavedRecording[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const recordings = JSON.parse(stored) as SavedRecording[];
    // Sort by timestamp, newest first
    return recordings.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error loading saved recordings:', error);
    return [];
  }
}

/**
 * Save a recording to localStorage
 */
export async function saveRecording(
  blob: Blob,
  duration: number,
  name?: string
): Promise<SavedRecording> {
  try {
    const recordings = getSavedRecordings();

    // Remove oldest recordings if we're at the limit
    if (recordings.length >= MAX_RECORDINGS) {
      recordings.splice(MAX_RECORDINGS - 1);
    }

    const audioData = await blobToBase64(blob);
    const timestamp = Date.now();

    const recording: SavedRecording = {
      id: `recording_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      name: name || `Recording ${new Date(timestamp).toLocaleString()}`,
      duration,
      timestamp,
      audioData,
      mimeType: blob.type,
      size: blob.size,
    };

    recordings.unshift(recording);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));

    return recording;
  } catch (error) {
    console.error('Error saving recording:', error);
    throw new Error('Failed to save recording. Storage may be full.');
  }
}

/**
 * Delete a recording from localStorage
 */
export function deleteRecording(id: string): void {
  try {
    const recordings = getSavedRecordings();
    const filtered = recordings.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw new Error('Failed to delete recording.');
  }
}

/**
 * Get a recording by ID
 */
export function getRecording(id: string): SavedRecording | null {
  const recordings = getSavedRecordings();
  return recordings.find((r) => r.id === id) || null;
}

/**
 * Get recording as Blob
 */
export function getRecordingBlob(recording: SavedRecording): Blob {
  return base64ToBlob(recording.audioData, recording.mimeType);
}

/**
 * Clear all recordings
 */
export function clearAllRecordings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recordings:', error);
    throw new Error('Failed to clear recordings.');
  }
}

/**
 * Get total storage used by recordings (in bytes)
 */
export function getStorageUsed(): number {
  const recordings = getSavedRecordings();
  return recordings.reduce((total, recording) => total + recording.size, 0);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Format duration in milliseconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
