/**
 * Central export point for all TypeScript types and interfaces
 * Import types from this file throughout the application
 *
 * @example
 * import { User, Exercise, AudioSettings } from '@/types';
 */

// Audio types
export type {
  AudioSettings,
  PitchData,
  AudioMetrics,
  VocalAnalysis,
  AnalysisFeedback,
  AudioState,
  RecordingSession,
  AudioConfig,
  AudioChunk,
  AudioAnalysis,
  PronunciationFeedback,
  ProcessingOptions,
  AudioRecorder,
  VisualizationData,
} from './audio.types';

export { RecordingState } from './audio.types';

// Exercise types
export type {
  ExerciseType,
  DifficultyLevel,
  Exercise,
  ExerciseProgress,
  GenerateExerciseRequest,
  GenerateExerciseResponse,
  ExerciseSession,
  ExerciseFilters,
} from './exercise.types';

// User types
export type {
  VocalRange,
  SubscriptionTier,
  User,
  UserPreferences,
  UserStats,
  Achievement,
  UserSession,
  UpdateUserProfileRequest,
  UpdateUserPreferencesRequest,
  PublicUserProfile,
} from './user.types';
