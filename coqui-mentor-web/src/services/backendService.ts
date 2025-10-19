/**
 * Backend Service
 * Handles communication with the Coqui MelodyMentor backend API
 */

import { io, Socket } from 'socket.io-client';

export interface AudioAnalysisData {
  pitch: {
    frequency: number;
    note: string;
    octave: number;
    cents: number;
    confidence: number;
  };
  volume: {
    average: number;
    peak: number;
    dynamicRange: number;
  };
  clarity: {
    score: number;
    factors: {
      noiseLevel: number;
      harmonicity: number;
      stability: number;
    };
  };
  technique: {
    breathControl: number;
    vibrato: number;
    articulation: number;
  };
  overallScore: number;
}

export interface FeedbackData {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  nextSteps: string[];
}

class BackendService {
  private socket: Socket | null = null;
  private isConnected = false;
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  }

  /**
   * Connect to the backend WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.backendUrl, {
          transports: ['websocket'],
          timeout: 5000,
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Backend connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
        });

        // Handle errors
        this.socket.on('error', (error) => {
          console.error('Backend error:', error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the backend
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Start audio analysis
   */
  startAudioAnalysis(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('audio:start');
    }
  }

  /**
   * Send audio data for analysis
   */
  sendAudioData(audioData: Float32Array, sampleRate: number): void {
    if (this.socket && this.isConnected) {
      // Convert Float32Array to regular array for JSON serialization
      const audioArray = Array.from(audioData);
      this.socket.emit('audio:data', {
        audioData: audioArray,
        sampleRate
      });
    }
  }

  /**
   * Stop audio analysis
   */
  stopAudioAnalysis(): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('audio:stop');
    }
  }

  /**
   * Join a practice session
   */
  joinSession(sessionId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('session:join', sessionId);
    }
  }

  /**
   * Leave a practice session
   */
  leaveSession(sessionId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('session:leave', sessionId);
    }
  }

  /**
   * Set up audio analysis listener
   */
  onAudioAnalysis(callback: (data: AudioAnalysisData) => void): void {
    if (this.socket) {
      this.socket.on('audio:analysis', callback);
    }
  }

  /**
   * Set up feedback listener
   */
  onFeedback(callback: (data: FeedbackData) => void): void {
    if (this.socket) {
      this.socket.on('audio:feedback', callback);
    }
  }

  /**
   * Set up session update listener
   */
  onSessionUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('session:update', callback);
    }
  }

  /**
   * Set up error listener
   */
  onError(callback: (error: { message: string; code: string }) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send audio data to backend for analysis via HTTP
   */
  async analyzeAudio(audioData: Float32Array, sampleRate: number): Promise<AudioAnalysisData> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/audio/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: Array.from(audioData),
          sampleRate,
          duration: audioData.length / sampleRate
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw error;
    }
  }

  /**
   * Get AI feedback on performance
   */
  async getFeedback(pitchData: any, accuracy: number, clarity: number, technique: number): Promise<FeedbackData> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/audio/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pitchData,
          accuracy,
          clarity,
          technique
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  }

  /**
   * Get available audio devices
   */
  async getAudioDevices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/audio/devices`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data.devices;
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  /**
   * Create a new practice session
   */
  async createSession(exerciseType: string, difficulty: string, duration: number): Promise<any> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseType,
          difficulty,
          duration
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Update session metrics
   */
  async updateSession(sessionId: string, metrics: any): Promise<void> {
    try {
      const response = await fetch(`${this.backendUrl}/api/v1/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const backendService = new BackendService();
