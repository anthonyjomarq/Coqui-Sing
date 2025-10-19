import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type {
  AudioState,
  AudioSettings,
  AudioMetrics,
  RecordingSession,
} from '../../types/audio.types';
import {
  DEFAULT_AUDIO_SETTINGS,
  ERROR_MESSAGES,
  MOCK_ANALYSIS_DELAY,
} from '../../utils/constants';

interface DeviceState {
  available: MediaDeviceInfo[];
  selected: string | null;
}

interface AudioSliceState {
  status: AudioState;
  isRecording: boolean;
  isPaused: boolean;
  currentSession: RecordingSession | null;
  audioSettings: AudioSettings;
  currentMetrics: AudioMetrics | null;
  error: string | null;
  devices: DeviceState;
}

// State transition validation helpers
const canInitialize = (status: AudioState): boolean => {
  return status === 'idle' || status === 'error';
};

const canStartRecording = (status: AudioState): boolean => {
  return status === 'idle';
};

const canPauseRecording = (status: AudioState): boolean => {
  return status === 'recording';
};

const canResumeRecording = (status: AudioState): boolean => {
  return status === 'paused';
};

const canStopRecording = (status: AudioState): boolean => {
  return status === 'recording' || status === 'paused';
};

const canAnalyze = (status: AudioState): boolean => {
  return status === 'recording' || status === 'paused';
};

const defaultAudioSettings: AudioSettings = DEFAULT_AUDIO_SETTINGS;

const initialState: AudioSliceState = {
  status: 'idle',
  isRecording: false,
  isPaused: false,
  currentSession: null,
  audioSettings: defaultAudioSettings,
  currentMetrics: null,
  error: null,
  devices: {
    available: [],
    selected: null,
  },
};

// Async thunks for audio operations
export const initializeAudio = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>('audio/initializeAudio', async (_, { rejectWithValue }) => {
  try {
    // Check if browser supports required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(ERROR_MESSAGES.MEDIA_DEVICES_NOT_SUPPORTED);
    }

    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Stop the stream immediately (we just wanted to check permissions)
    stream.getTracks().forEach((track) => track.stop());

    return;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(ERROR_MESSAGES.FAILED_TO_INITIALIZE_AUDIO);
  }
});

export const fetchAudioDevices = createAsyncThunk<
  MediaDeviceInfo[],
  void,
  { rejectValue: string }
>('audio/fetchAudioDevices', async (_, { rejectWithValue }) => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(
      (device) => device.kind === 'audioinput'
    );
    return audioInputDevices;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(ERROR_MESSAGES.FAILED_TO_FETCH_DEVICES);
  }
});

export const analyzeRecording = createAsyncThunk<
  RecordingSession['analysis'],
  { sessionId: string; audioBlob: Blob },
  { rejectValue: string }
>('audio/analyzeRecording', async ({ sessionId }, { rejectWithValue }) => {
  try {
    // This is a placeholder that simulates analysis
    // In production, this would call an API endpoint or use Web Audio API for analysis
    await new Promise((resolve) => setTimeout(resolve, MOCK_ANALYSIS_DELAY));

    // Mock analysis result
    const mockAnalysis = {
      id: `analysis_${sessionId}`,
      userId: 'user_123',
      timestamp: Date.now(),
      metrics: {
        pitch: {
          frequency: 440,
          note: 'A4',
          cents: 0,
          confidence: 0.95,
          timestamp: Date.now(),
        },
        volume: 0.8,
        clarity: 0.85,
        vibrato: {
          rate: 5.5,
          depth: 0.3,
        },
        formants: [800, 1200, 2800],
      },
      score: 85,
      feedback: {
        pitch: {
          accuracy: 0.9,
          avgDeviation: 10,
          suggestions: ['Great pitch control!'],
        },
        tone: {
          quality: 0.85,
          consistency: 0.88,
          suggestions: ['Try to maintain consistent tone throughout'],
        },
        technique: {
          breath: 0.8,
          resonance: 0.82,
          suggestions: ['Focus on breath support'],
        },
      },
    };

    return mockAnalysis;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(ERROR_MESSAGES.FAILED_TO_ANALYZE_RECORDING);
  }
});

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    // Initialization actions
    initialize: (state) => {
      if (!canInitialize(state.status)) {
        console.warn(
          `Cannot initialize from state: ${state.status}. Must be 'idle' or 'error'.`
        );
        return;
      }
      state.status = 'initializing';
      state.error = null;
    },
    initializeSuccess: (state) => {
      if (state.status !== 'initializing') {
        console.warn(
          `Cannot complete initialization from state: ${state.status}. Must be 'initializing'.`
        );
        return;
      }
      state.status = 'idle';
      state.error = null;
    },
    initializeError: (state, action: PayloadAction<string>) => {
      if (state.status !== 'initializing') {
        console.warn(
          `Cannot fail initialization from state: ${state.status}. Must be 'initializing'.`
        );
        return;
      }
      state.status = 'error';
      state.error = action.payload;
    },

    // Recording control actions
    startRecording: (state, action: PayloadAction<{ sessionId: string }>) => {
      if (!canStartRecording(state.status)) {
        console.warn(
          `Cannot start recording from state: ${state.status}. Must be 'idle'.`
        );
        state.error = `Cannot start recording: current state is ${state.status}`;
        return;
      }
      if (state.isRecording) {
        console.warn('Cannot start recording: already recording');
        state.error = 'Already recording';
        return;
      }
      state.status = 'recording';
      state.isRecording = true;
      state.isPaused = false;
      state.currentSession = {
        id: action.payload.sessionId,
        startTime: Date.now(),
        duration: 0,
        audioBlob: null,
        analysis: null,
      };
      state.error = null;
    },
    pauseRecording: (state) => {
      if (!canPauseRecording(state.status)) {
        console.warn(
          `Cannot pause recording from state: ${state.status}. Must be 'recording'.`
        );
        state.error = `Cannot pause: current state is ${state.status}`;
        return;
      }
      if (!state.isRecording) {
        console.warn('Cannot pause: not recording');
        state.error = 'Not currently recording';
        return;
      }
      if (state.isPaused) {
        console.warn('Cannot pause: already paused');
        state.error = 'Already paused';
        return;
      }
      state.status = 'paused';
      state.isPaused = true;
    },
    resumeRecording: (state) => {
      if (!canResumeRecording(state.status)) {
        console.warn(
          `Cannot resume recording from state: ${state.status}. Must be 'paused'.`
        );
        state.error = `Cannot resume: current state is ${state.status}`;
        return;
      }
      if (!state.isPaused) {
        console.warn('Cannot resume: not paused');
        state.error = 'Not currently paused';
        return;
      }
      state.status = 'recording';
      state.isPaused = false;
    },
    stopRecording: (
      state,
      action: PayloadAction<{ duration: number; audioBlob: Blob | null }>
    ) => {
      if (!canStopRecording(state.status)) {
        console.warn(
          `Cannot stop recording from state: ${state.status}. Must be 'recording' or 'paused'.`
        );
        state.error = `Cannot stop recording: current state is ${state.status}`;
        return;
      }
      if (!state.isRecording) {
        console.warn('Cannot stop: not recording');
        state.error = 'Not currently recording';
        return;
      }
      state.status = 'analyzing';
      state.isRecording = false;
      state.isPaused = false;
      if (state.currentSession) {
        state.currentSession.duration = action.payload.duration;
        state.currentSession.audioBlob = action.payload.audioBlob;
      }
    },

    // Metrics and analysis actions
    updateMetrics: (state, action: PayloadAction<AudioMetrics>) => {
      if (state.status !== 'recording' && state.status !== 'paused') {
        console.warn(
          `Cannot update metrics from state: ${state.status}. Must be 'recording' or 'paused'.`
        );
        return;
      }
      state.currentMetrics = action.payload;
    },
    updateSessionDuration: (state, action: PayloadAction<number>) => {
      if (!state.currentSession) {
        console.warn('Cannot update session duration: no active session');
        return;
      }
      if (state.status !== 'recording' && state.status !== 'paused') {
        console.warn(
          `Cannot update session duration from state: ${state.status}. Must be 'recording' or 'paused'.`
        );
        return;
      }
      state.currentSession.duration = action.payload;
    },
    setAnalysis: (
      state,
      action: PayloadAction<RecordingSession['analysis']>
    ) => {
      if (state.status !== 'analyzing') {
        console.warn(
          `Cannot set analysis from state: ${state.status}. Must be 'analyzing'.`
        );
        return;
      }
      if (!state.currentSession) {
        console.warn('Cannot set analysis: no active session');
        state.status = 'idle';
        return;
      }
      state.currentSession.analysis = action.payload;
      state.status = 'idle';
    },

    // New action for starting analysis
    startAnalysis: (state) => {
      if (!canAnalyze(state.status)) {
        console.warn(
          `Cannot start analysis from state: ${state.status}. Must be 'recording' or 'paused'.`
        );
        state.error = `Cannot analyze: current state is ${state.status}`;
        return;
      }
      if (!state.currentSession) {
        console.warn('Cannot start analysis: no active session');
        state.error = 'No active recording session';
        return;
      }
      state.status = 'analyzing';
      state.isRecording = false;
      state.isPaused = false;
    },

    // Device management actions
    setDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.devices.available = action.payload;
      if (action.payload.length > 0 && !state.devices.selected) {
        state.devices.selected = action.payload[0].deviceId;
      }
    },
    selectDevice: (state, action: PayloadAction<string>) => {
      state.devices.selected = action.payload;
    },

    // Settings management
    updateSettings: (state, action: PayloadAction<Partial<AudioSettings>>) => {
      state.audioSettings = {
        ...state.audioSettings,
        ...action.payload,
      };
    },
    resetSettings: (state) => {
      state.audioSettings = defaultAudioSettings;
    },

    // Error and reset actions
    setError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.error = action.payload;
      state.isRecording = false;
      state.isPaused = false;
    },
    clearError: (state) => {
      state.error = null;
      if (state.status === 'error') {
        state.status = 'idle';
      }
    },
    reset: (state) => {
      state.status = 'idle';
      state.isRecording = false;
      state.isPaused = false;
      state.currentSession = null;
      state.currentMetrics = null;
      state.error = null;
    },
    resetSession: (state) => {
      state.currentSession = null;
      state.currentMetrics = null;
      state.isRecording = false;
      state.isPaused = false;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // initializeAudio async thunk
    builder
      .addCase(initializeAudio.pending, (state) => {
        if (!canInitialize(state.status)) {
          console.warn(
            `Cannot initialize from state: ${state.status}. Initialization request ignored.`
          );
          return;
        }
        state.status = 'initializing';
        state.error = null;
      })
      .addCase(initializeAudio.fulfilled, (state) => {
        if (state.status !== 'initializing') {
          console.warn(
            `Unexpected state during initialization completion: ${state.status}`
          );
          return;
        }
        state.status = 'idle';
        state.error = null;
      })
      .addCase(initializeAudio.rejected, (state, action) => {
        if (state.status !== 'initializing') {
          console.warn(
            `Unexpected state during initialization failure: ${state.status}`
          );
          return;
        }
        state.status = 'error';
        state.error = action.payload || 'Failed to initialize audio';
      });

    // fetchAudioDevices async thunk
    builder
      .addCase(fetchAudioDevices.pending, (state) => {
        // Can fetch devices from any state except error
        if (state.status === 'error') {
          console.warn('Cannot fetch devices in error state');
          return;
        }
      })
      .addCase(fetchAudioDevices.fulfilled, (state, action) => {
        state.devices.available = action.payload;
        if (action.payload.length > 0 && !state.devices.selected) {
          state.devices.selected = action.payload[0].deviceId;
        }
      })
      .addCase(fetchAudioDevices.rejected, (_state, action) => {
        console.error('Failed to fetch audio devices:', action.payload);
        // Don't change state status, just log the error
        // User can continue with default device
      });

    // analyzeRecording async thunk
    builder
      .addCase(analyzeRecording.pending, (state) => {
        // Should only analyze after stopRecording sets status to 'analyzing'
        if (state.status !== 'analyzing') {
          console.warn(
            `Cannot analyze from state: ${state.status}. Must be 'analyzing'.`
          );
          return;
        }
      })
      .addCase(analyzeRecording.fulfilled, (state, action) => {
        if (state.status !== 'analyzing') {
          console.warn(
            `Unexpected state during analysis completion: ${state.status}`
          );
          return;
        }
        if (!state.currentSession) {
          console.warn('No active session to store analysis results');
          state.status = 'idle';
          return;
        }
        state.currentSession.analysis = action.payload;
        state.status = 'idle';
      })
      .addCase(analyzeRecording.rejected, (state, action) => {
        if (state.status !== 'analyzing') {
          console.warn(
            `Unexpected state during analysis failure: ${state.status}`
          );
          return;
        }
        state.status = 'error';
        state.error = action.payload || 'Failed to analyze recording';
      });
  },
});

export const {
  initialize,
  initializeSuccess,
  initializeError,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  updateMetrics,
  updateSessionDuration,
  setAnalysis,
  startAnalysis,
  setDevices,
  selectDevice,
  updateSettings,
  resetSettings,
  setError,
  clearError,
  reset,
  resetSession,
} = audioSlice.actions;

export default audioSlice.reducer;
