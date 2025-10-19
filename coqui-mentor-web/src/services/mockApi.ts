/**
 * Mock API with localStorage persistence
 * Simulates backend with realistic delays
 */

import type { Exercise, Recording, UserStats, PracticeSession } from '../types/exercise.types';
import { sampleExercises } from '../data/sampleExercises';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  EXERCISES: 'melodymentor_exercises',
  RECORDINGS: 'melodymentor_recordings',
  SESSIONS: 'melodymentor_sessions',
  SETTINGS: 'melodymentor_settings',
};

// Initialize with sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(sampleExercises));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RECORDINGS)) {
    localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
  }
};

initializeData();

export const mockApi = {
  // Exercises
  async getExercises(): Promise<Exercise[]> {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return data ? JSON.parse(data) : sampleExercises;
  },

  async getExerciseById(id: string): Promise<Exercise | null> {
    await delay(300);
    const exercises = await this.getExercises();
    return exercises.find(ex => ex.id === id) || null;
  },

  async toggleFavorite(id: string): Promise<Exercise> {
    await delay(200);
    const exercises = await this.getExercises();
    const exercise = exercises.find(ex => ex.id === id);
    if (exercise) {
      exercise.isFavorite = !exercise.isFavorite;
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    }
    return exercise!;
  },

  // Recordings
  async saveRecording(recording: Omit<Recording, 'id'>): Promise<Recording> {
    await delay(800);
    const recordings = await this.getRecordings();
    const newRecording: Recording = {
      ...recording,
      id: `rec_${Date.now()}`,
    };
    recordings.unshift(newRecording);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify(recordings));
    return newRecording;
  },

  async getRecordings(): Promise<Recording[]> {
    await delay(500);
    const data = localStorage.getItem(STORAGE_KEYS.RECORDINGS);
    return data ? JSON.parse(data) : [];
  },

  async deleteRecording(id: string): Promise<void> {
    await delay(300);
    const recordings = await this.getRecordings();
    const filtered = recordings.filter(rec => rec.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify(filtered));
  },

  // Sessions
  async savePracticeSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    await delay(500);
    const sessions = await this.getPracticeSessions();
    const newSession: PracticeSession = {
      ...session,
      id: `session_${Date.now()}`,
    };
    sessions.unshift(newSession);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    return newSession;
  },

  async getPracticeSessions(): Promise<PracticeSession[]> {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  },

  // Progress
  async getUserProgress(): Promise<UserStats> {
    await delay(600);
    const sessions = await this.getPracticeSessions();

    const totalPracticeTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = sessions.length;
    const averageScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length
      : 0;

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let checkDate = new Date(today);

    while (true) {
      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });

      if (hasSession) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Calculate trend
    const recentScores = sessions.slice(0, 5).map(s => s.score);
    const olderScores = sessions.slice(5, 10).map(s => s.score);
    const recentAvg = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 5) trend = 'up';
    else if (recentAvg < olderAvg - 5) trend = 'down';

    return {
      totalPracticeTime,
      totalSessions,
      currentStreak,
      longestStreak: currentStreak, // Simplified for now
      averageScore,
      trend,
      recentSessions: sessions.slice(0, 5),
    };
  },

  // Settings
  async getSettings(): Promise<any> {
    await delay(200);
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  },

  async updateSettings(settings: any): Promise<any> {
    await delay(300);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },
};
