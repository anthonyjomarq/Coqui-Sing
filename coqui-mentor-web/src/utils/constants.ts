/**
 * Application-wide constants
 * Central location for all magic numbers and configuration values
 */

// =============================================================================
// AUDIO CONSTANTS
// =============================================================================

/**
 * Audio sample rate in Hz
 * Standard CD quality audio sample rate
 */
export const AUDIO_SAMPLE_RATE = 44100;

/**
 * Audio buffer size in samples
 * Used for processing audio chunks
 */
export const AUDIO_BUFFER_SIZE = 4096;

/**
 * FFT (Fast Fourier Transform) size for frequency analysis
 * Must be a power of 2. Higher values = better frequency resolution
 */
export const FFT_SIZE = 2048;

/**
 * Number of audio channels (1 = mono, 2 = stereo)
 */
export const AUDIO_CHANNEL_COUNT = 1;

/**
 * Smoothing constant for audio visualization
 * Range: 0-1, where 0 = no smoothing, 1 = maximum smoothing
 */
export const AUDIO_SMOOTHING_CONSTANT = 0.8;

/**
 * Default audio settings for recording
 */
export const DEFAULT_AUDIO_SETTINGS = {
  sampleRate: AUDIO_SAMPLE_RATE,
  bufferSize: AUDIO_BUFFER_SIZE,
  fftSize: FFT_SIZE,
  channelCount: AUDIO_CHANNEL_COUNT,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const;

// =============================================================================
// RECORDING CONSTANTS
// =============================================================================

/**
 * Interval for collecting audio data chunks (milliseconds)
 */
export const RECORDING_DATA_INTERVAL = 100;

/**
 * Interval for updating recording duration display (milliseconds)
 */
export const RECORDING_DURATION_UPDATE_INTERVAL = 1000;

/**
 * Interval for real-time audio analysis (milliseconds)
 */
export const AUDIO_ANALYSIS_INTERVAL = 100;

/**
 * Supported MIME types for MediaRecorder, in order of preference
 */
export const SUPPORTED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
] as const;

// =============================================================================
// PERFORMANCE CONSTANTS
// =============================================================================

/**
 * Threshold for slow action warning (milliseconds)
 * Actions taking longer than this will trigger a performance warning
 */
export const SLOW_ACTION_THRESHOLD = 10;

/**
 * Debounce delay for search input (milliseconds)
 */
export const SEARCH_DEBOUNCE_DELAY = 500;

/**
 * Debounce delay for auto-save (milliseconds)
 */
export const AUTO_SAVE_DEBOUNCE_DELAY = 1000;

/**
 * Debounce delay for window resize (milliseconds)
 */
export const RESIZE_DEBOUNCE_DELAY = 250;

// =============================================================================
// REDUX DEVTOOLS CONSTANTS
// =============================================================================

/**
 * Maximum number of actions to keep in Redux DevTools
 */
export const REDUX_DEVTOOLS_MAX_AGE = 50;

/**
 * Maximum number of stack trace frames in Redux DevTools
 */
export const REDUX_DEVTOOLS_TRACE_LIMIT = 25;

// =============================================================================
// VISUALIZATION CONSTANTS
// =============================================================================

/**
 * Default width for audio visualizer (pixels)
 */
export const VISUALIZER_DEFAULT_WIDTH = 800;

/**
 * Default height for audio visualizer (pixels)
 */
export const VISUALIZER_DEFAULT_HEIGHT = 200;

/**
 * Default color for audio visualizer waveform
 */
export const VISUALIZER_DEFAULT_COLOR = '#10b981'; // Tailwind green-500

/**
 * Default background color for audio visualizer
 */
export const VISUALIZER_DEFAULT_BG_COLOR = '#1f2937'; // Tailwind gray-800

/**
 * Default line width for audio visualizer (pixels)
 */
export const VISUALIZER_DEFAULT_LINE_WIDTH = 2;

/**
 * Available FFT sizes for audio analysis
 */
export const FFT_SIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768] as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Size of audio control buttons (pixels)
 */
export const AUDIO_CONTROL_BUTTON_SIZE = 64;

/**
 * Mock analysis delay for simulating server processing (milliseconds)
 */
export const MOCK_ANALYSIS_DELAY = 2000;

// =============================================================================
// ERROR MESSAGES
// =============================================================================

export const ERROR_MESSAGES = {
  MEDIA_DEVICES_NOT_SUPPORTED: 'Media devices API not supported in this browser',
  NO_MICROPHONE_STREAM: 'No microphone stream available',
  FAILED_TO_INITIALIZE_AUDIO: 'Failed to initialize audio recorder',
  FAILED_TO_START_RECORDING: 'Failed to start recording',
  FAILED_TO_ANALYZE_RECORDING: 'Failed to analyze recording',
  FAILED_TO_FETCH_DEVICES: 'Failed to fetch audio devices',
  FAILED_TO_GET_CANVAS_CONTEXT: 'Failed to get canvas 2D context',
  FAILED_TO_INITIALIZE_VISUALIZER: 'Failed to initialize audio visualizer',
  ALREADY_RECORDING: 'Already recording',
  NOT_RECORDING: 'Not currently recording',
  NOT_PAUSED: 'Not currently paused',
  ALREADY_PAUSED: 'Already paused',
} as const;

// =============================================================================
// STATE MACHINE CONSTANTS
// =============================================================================

/**
 * Audio recording states
 */
export const AUDIO_STATES = {
  IDLE: 'idle',
  INITIALIZING: 'initializing',
  RECORDING: 'recording',
  PAUSED: 'paused',
  ANALYZING: 'analyzing',
  ERROR: 'error',
} as const;

/**
 * Valid state transitions for the audio state machine
 */
export const VALID_STATE_TRANSITIONS = {
  [AUDIO_STATES.IDLE]: [AUDIO_STATES.INITIALIZING, AUDIO_STATES.RECORDING],
  [AUDIO_STATES.INITIALIZING]: [AUDIO_STATES.IDLE, AUDIO_STATES.ERROR],
  [AUDIO_STATES.RECORDING]: [AUDIO_STATES.PAUSED, AUDIO_STATES.ANALYZING],
  [AUDIO_STATES.PAUSED]: [AUDIO_STATES.RECORDING, AUDIO_STATES.ANALYZING],
  [AUDIO_STATES.ANALYZING]: [AUDIO_STATES.IDLE, AUDIO_STATES.ERROR],
  [AUDIO_STATES.ERROR]: [AUDIO_STATES.IDLE],
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type FFTSize = typeof FFT_SIZES[number];
export type AudioState = typeof AUDIO_STATES[keyof typeof AUDIO_STATES];
export type SupportedMimeType = typeof SUPPORTED_MIME_TYPES[number];
