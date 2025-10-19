import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ExerciseSession } from '../../types/exercise.types';

interface SessionProgress {
  exerciseId: string;
  completedSteps: number;
  totalSteps: number;
  currentScore: number;
  startedAt: number;
  lastUpdatedAt: number;
}

interface SessionSliceState {
  currentSession: ExerciseSession | null;
  sessionProgress: SessionProgress | null;
  sessionHistory: ExerciseSession[];
  isActive: boolean;
  isPaused: boolean;
}

const initialState: SessionSliceState = {
  currentSession: null,
  sessionProgress: null,
  sessionHistory: [],
  isActive: false,
  isPaused: false,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{
        sessionId: string;
        exerciseId: string;
        userId: string;
        totalSteps?: number;
      }>
    ) => {
      const { sessionId, exerciseId, userId, totalSteps = 1 } = action.payload;
      const now = Date.now();

      state.currentSession = {
        id: sessionId,
        exerciseId,
        userId,
        startTime: now,
        endTime: now,
        duration: 0,
        score: 0,
        completed: false,
      };

      state.sessionProgress = {
        exerciseId,
        completedSteps: 0,
        totalSteps,
        currentScore: 0,
        startedAt: now,
        lastUpdatedAt: now,
      };

      state.isActive = true;
      state.isPaused = false;
    },

    pauseSession: (state) => {
      if (state.currentSession) {
        state.isPaused = true;
        const now = Date.now();
        state.currentSession.duration = now - state.currentSession.startTime;
        if (state.sessionProgress) {
          state.sessionProgress.lastUpdatedAt = now;
        }
      }
    },

    resumeSession: (state) => {
      if (state.currentSession && state.isPaused) {
        state.isPaused = false;
        const now = Date.now();
        if (state.sessionProgress) {
          state.sessionProgress.lastUpdatedAt = now;
        }
      }
    },

    updateProgress: (
      state,
      action: PayloadAction<{
        completedSteps?: number;
        currentScore?: number;
        metrics?: ExerciseSession['metrics'];
      }>
    ) => {
      const now = Date.now();

      if (state.sessionProgress) {
        if (action.payload.completedSteps !== undefined) {
          state.sessionProgress.completedSteps = action.payload.completedSteps;
        }
        if (action.payload.currentScore !== undefined) {
          state.sessionProgress.currentScore = action.payload.currentScore;
        }
        state.sessionProgress.lastUpdatedAt = now;
      }

      if (state.currentSession) {
        state.currentSession.duration = now - state.currentSession.startTime;
        if (action.payload.currentScore !== undefined) {
          state.currentSession.score = action.payload.currentScore;
        }
        if (action.payload.metrics) {
          state.currentSession.metrics = action.payload.metrics;
        }
      }
    },

    setSessionNotes: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.notes = action.payload;
      }
    },

    setRecordingId: (state, action: PayloadAction<string>) => {
      if (state.currentSession) {
        state.currentSession.recordingId = action.payload;
      }
    },

    endSession: (
      state,
      action: PayloadAction<{ completed?: boolean; finalScore?: number }>
    ) => {
      if (state.currentSession) {
        const now = Date.now();
        state.currentSession.endTime = now;
        state.currentSession.duration = now - state.currentSession.startTime;
        state.currentSession.completed = action.payload.completed ?? true;

        if (action.payload.finalScore !== undefined) {
          state.currentSession.score = action.payload.finalScore;
        }

        state.sessionHistory.unshift({ ...state.currentSession });

        // Keep only last 50 sessions in history
        if (state.sessionHistory.length > 50) {
          state.sessionHistory = state.sessionHistory.slice(0, 50);
        }
      }

      state.currentSession = null;
      state.sessionProgress = null;
      state.isActive = false;
      state.isPaused = false;
    },

    cancelSession: (state) => {
      state.currentSession = null;
      state.sessionProgress = null;
      state.isActive = false;
      state.isPaused = false;
    },

    clearSessionHistory: (state) => {
      state.sessionHistory = [];
    },

    removeSessionFromHistory: (state, action: PayloadAction<string>) => {
      state.sessionHistory = state.sessionHistory.filter(
        (session) => session.id !== action.payload
      );
    },

    loadSessionHistory: (state, action: PayloadAction<ExerciseSession[]>) => {
      state.sessionHistory = action.payload;
    },
  },
});

export const {
  startSession,
  pauseSession,
  resumeSession,
  updateProgress,
  setSessionNotes,
  setRecordingId,
  endSession,
  cancelSession,
  clearSessionHistory,
  removeSessionFromHistory,
  loadSessionHistory,
} = sessionSlice.actions;

export default sessionSlice.reducer;
