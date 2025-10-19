// Audio recording and processing settings
export interface AudioSettings {
  sampleRate: number;
  bufferSize: number;
  fftSize: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

// Pitch detection data
export interface PitchData {
  frequency: number; // Hz
  note: string; // e.g., "A4", "C#3"
  cents: number; // Deviation from target note
  confidence: number; // 0.0 to 1.0
  timestamp: number; // Milliseconds
}

// Audio metrics for vocal analysis
export interface AudioMetrics {
  pitch: PitchData;
  volume: number;
  clarity: number;
  vibrato: {
    rate: number;
    depth: number;
  };
  formants: number[];
}

// Vocal analysis result
export interface VocalAnalysis {
  id: string;
  userId: string;
  timestamp: number;
  metrics: AudioMetrics;
  score: number; // 0-100
  feedback: AnalysisFeedback;
}

// Feedback for vocal performance
export interface AnalysisFeedback {
  pitch: {
    accuracy: number;
    avgDeviation: number;
    suggestions: string[];
  };
  tone: {
    quality: number;
    consistency: number;
    suggestions: string[];
  };
  technique: {
    breath: number;
    resonance: number;
    suggestions: string[];
  };
}

export type AudioState =
  | 'idle'
  | 'initializing'
  | 'recording'
  | 'analyzing'
  | 'paused'
  | 'error';

export interface RecordingSession {
  id: string;
  startTime: number;
  duration: number;
  audioBlob: Blob | null;
  analysis: VocalAnalysis | null;
}

// @deprecated Use AudioSettings instead
export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  duration: number;
}

// @deprecated Use AudioState type instead
export enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PAUSED = 'paused',
  PROCESSING = 'processing',
  ERROR = 'error',
}

// @deprecated Use AudioMetrics for more comprehensive data
export interface AudioAnalysis {
  pitch: number;
  volume: number;
  clarity: number;
  timestamp: number;
}

export interface PronunciationFeedback {
  phoneme: string;
  expected: string;
  actual: string;
  score: number;
  suggestion: string;
}

export interface ProcessingOptions {
  enableAnalysis: boolean;
  enableVisualization: boolean;
  bufferSize: number;
}

export interface AudioRecorder {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  pause: () => void;
  resume: () => void;
  getState: () => RecordingState;
}

export interface VisualizationData {
  waveform: Float32Array;
  frequencies: Float32Array;
  timestamp: number;
}
