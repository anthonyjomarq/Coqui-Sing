export type VocalRange =
  | 'soprano'
  | 'mezzo-soprano'
  | 'alto'
  | 'tenor'
  | 'baritone'
  | 'bass'
  | 'countertenor'
  | 'not-set';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'professional';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  vocalRange: VocalRange;
  vocalRangeNotes?: {
    lowest: string;
    highest: string;
  };
  preferences: UserPreferences;
  stats: UserStats;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: number;
  createdAt: number;
  lastLoginAt: number;
  onboardingCompleted: boolean;
  timezone?: string;
  language: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  soundEffects: boolean;
  hapticFeedback: boolean;
  autoStartRecording: boolean;
  showPitchGuide: boolean;
  realTimeFeedback: boolean;
  metronome: {
    enabled: boolean;
    volume: number;
    sound: 'click' | 'beep' | 'wood';
  };
  notifications: {
    practice: boolean;
    achievements: boolean;
    weeklyReport: boolean;
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareProgress: boolean;
    allowAnalytics: boolean;
    publicProfile: boolean;
  };
  audioQuality: 'standard' | 'high' | 'lossless';
  defaultFilters?: {
    difficulty?: string[];
    type?: string[];
  };
}

export interface UserStats {
  totalPracticeTime: number;
  exercisesCompleted: number;
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: number;
  averageSessionDuration: number;
  skillLevel: number;
  experiencePoints: number;
  level: number;
  achievements: Achievement[];
  progressByType: {
    [key: string]: {
      completed: number;
      averageScore: number;
      timeSpent: number;
    };
  };
  weeklyGoal?: {
    targetMinutes: number;
    completedMinutes: number;
    startDate: number;
  };
  favoriteExercises: string[];
  recentExercises: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'practice' | 'skill' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: number;
  progress: number;
  requirement: string;
  xpReward: number;
}

export interface UserSession {
  userId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  device?: {
    type: 'web' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  ipAddress?: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  avatar?: string;
  vocalRange?: VocalRange;
  vocalRangeNotes?: {
    lowest: string;
    highest: string;
  };
  timezone?: string;
  language?: string;
}

export interface UpdateUserPreferencesRequest {
  preferences: Partial<UserPreferences>;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  avatar?: string;
  vocalRange: VocalRange;
  memberSince: number;
  publicStats?: {
    totalPracticeTime: number;
    level: number;
    achievementCount: number;
    currentStreak: number;
  };
}
