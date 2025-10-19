/**
 * Backend Service - Demo Mode
 * Provides simulated data for frontend demonstration
 */

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
  private isConnected = false;
  private readonly isDemoMode = true;

  constructor() {
    console.log('Running in demo mode with simulated data');
  }

  private generateMockAnalysis(): AudioAnalysisData {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octaves = [3, 4, 5];

    return {
      pitch: {
        frequency: 220 + Math.random() * 440,
        note: notes[Math.floor(Math.random() * notes.length)],
        octave: octaves[Math.floor(Math.random() * octaves.length)],
        cents: Math.random() * 50 - 25,
        confidence: 0.8 + Math.random() * 0.2
      },
      volume: {
        average: 0.5 + Math.random() * 0.3,
        peak: 0.7 + Math.random() * 0.3,
        dynamicRange: 0.2 + Math.random() * 0.3
      },
      clarity: {
        score: 0.7 + Math.random() * 0.25,
        factors: {
          noiseLevel: 0.05 + Math.random() * 0.15,
          harmonicity: 0.75 + Math.random() * 0.2,
          stability: 0.8 + Math.random() * 0.15
        }
      },
      technique: {
        breathControl: 0.65 + Math.random() * 0.3,
        vibrato: 0.6 + Math.random() * 0.35,
        articulation: 0.7 + Math.random() * 0.25
      },
      overallScore: 0.7 + Math.random() * 0.25
    };
  }

  private generateMockFeedback(): FeedbackData {
    const allStrengths = [
      'Excellent pitch accuracy on sustained notes',
      'Strong breath control throughout the exercise',
      'Consistent tone quality in middle register',
      'Smooth transitions between notes',
      'Good dynamic range control',
      'Natural vibrato technique'
    ];

    const allImprovements = [
      'Work on higher register stability',
      'Focus on breath support during longer phrases',
      'Improve vibrato consistency',
      'Practice softer dynamics',
      'Strengthen lower register resonance',
      'Work on diction clarity'
    ];

    const allSuggestions = [
      'Practice with a metronome to improve timing',
      'Record yourself to identify areas for improvement',
      'Try humming exercises for better resonance',
      'Work on lip trills for breath control',
      'Practice scales slowly with focus on intonation'
    ];

    return {
      overallScore: 0.7 + Math.random() * 0.25,
      strengths: this.getRandomItems(allStrengths, 2, 3),
      improvements: this.getRandomItems(allImprovements, 2, 3),
      suggestions: this.getRandomItems(allSuggestions, 2, 3),
      nextSteps: [
        'Continue with current exercise level',
        'Try the next difficulty when comfortable'
      ]
    };
  }

  private getRandomItems<T>(array: T[], min: number, max: number): T[] {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  connect(): Promise<void> {
    console.log('Demo connection established');
    this.isConnected = true;
    return Promise.resolve();
  }

  disconnect(): void {
    this.isConnected = false;
  }

  startAudioAnalysis(): void {
    console.log('Audio analysis started');
  }

  sendAudioData(_audioData: Float32Array, _sampleRate: number): void {
    // No-op in demo mode
  }

  stopAudioAnalysis(): void {
    console.log('Audio analysis stopped');
  }

  joinSession(_sessionId: string): void {
    // No-op in demo mode
  }

  leaveSession(_sessionId: string): void {
    // No-op in demo mode
  }

  onAudioAnalysis(callback: (data: AudioAnalysisData) => void): void {
    const interval = setInterval(() => {
      if (this.isConnected) {
        callback(this.generateMockAnalysis());
      }
    }, 100);

    const originalDisconnect = this.disconnect.bind(this);
    this.disconnect = () => {
      clearInterval(interval);
      originalDisconnect();
    };
  }

  onFeedback(callback: (data: FeedbackData) => void): void {
    setTimeout(() => {
      if (this.isConnected) {
        callback(this.generateMockFeedback());
      }
    }, 2000);
  }

  onSessionUpdate(_callback: (data: any) => void): void {
    // No-op in demo mode
  }

  onError(_callback: (error: { message: string; code: string }) => void): void {
    // No-op in demo mode
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async analyzeAudio(_audioData: Float32Array, _sampleRate: number): Promise<AudioAnalysisData> {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    return this.generateMockAnalysis();
  }

  async getFeedback(_pitchData: any, _accuracy: number, _clarity: number, _technique: number): Promise<FeedbackData> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    return this.generateMockFeedback();
  }

  async getAudioDevices(): Promise<any[]> {
    return [
      { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
      { deviceId: 'demo1', label: 'Demo Microphone 1', kind: 'audioinput' }
    ];
  }

  async createSession(_exerciseType: string, _difficulty: string, _duration: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      sessionId: 'demo-' + Date.now(),
      exerciseType: _exerciseType,
      difficulty: _difficulty,
      duration: _duration,
      startedAt: new Date().toISOString()
    };
  }

  async updateSession(_sessionId: string, _metrics: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  getIsDemoMode(): boolean {
    return this.isDemoMode;
  }
}

export const backendService = new BackendService();
