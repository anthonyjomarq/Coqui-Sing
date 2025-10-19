export type ExerciseType =
  | 'pitch-matching'
  | 'scale-practice'
  | 'interval-training'
  | 'rhythm-practice'
  | 'vowel-exercise'
  | 'breathing'
  | 'vocal-warmup'
  | 'song-practice'
  | 'warmup'
  | 'scale'
  | 'interval'
  | 'song';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface TargetRange {
  low: string;
  high: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  duration: number;
  targetRange?: string | TargetRange;
  targetNotes?: string[];
  instructions?: string[];
  audioReference?: string;
  key?: string;
  tempo?: number;
  bpm?: number;
  tags?: string[];
  createdAt?: number;
  updatedAt?: number;
  isFavorite?: boolean;
}

export interface ExerciseProgress {
  exerciseId: string;
  userId: string;
  attempts: number;
  completions: number;
  bestScore: number;
  averageScore: number;
  lastScore: number;
  lastAttemptDate: number;
  totalTimeSpent: number;
  mastered: boolean;
  notes?: string;
}

export interface GenerateExerciseRequest {
  type: ExerciseType;
  difficulty: DifficultyLevel;
  vocalRange?: string;
  focusAreas?: string[];
  maxDuration?: number;
  preferences?: {
    key?: string;
    tempo?: number;
    style?: string;
  };
}

export interface GenerateExerciseResponse {
  exercise: Exercise;
  reasoning?: string;
  estimatedMasteryTime?: number;
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  userId: string;
  startTime: number;
  endTime: number;
  duration: number;
  score: number;
  completed: boolean;
  recordingId?: string;
  metrics?: {
    pitchAccuracy: number;
    rhythmAccuracy: number;
    toneQuality: number;
    consistency: number;
  };
  notes?: string;
}

export interface ExerciseFilters {
  types?: ExerciseType[];
  difficulties?: DifficultyLevel[];
  tags?: string[];
  durationRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
  matchVocalRange?: boolean;
}

export interface Recording {
  id: string;
  exerciseName?: string;
  date: number;
  duration: number;
  score?: number;
  pitchAccuracy?: number;
  notes?: string;
  audioBlob?: Blob;
  audioUrl?: string;
}

export interface UserStats {
  totalPracticeTime: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak?: number;
  averageScore: number;
  trend?: 'up' | 'down' | 'stable';
  recentSessions?: PracticeSession[];
}

export interface PracticeSession {
  id: string;
  exerciseName: string;
  date: number;
  duration: number;
  score: number;
  pitchAccuracy: number;
}
