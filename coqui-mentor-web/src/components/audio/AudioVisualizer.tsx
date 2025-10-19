import { useRef, useEffect, useState } from 'react';
import {
  VISUALIZER_DEFAULT_WIDTH,
  VISUALIZER_DEFAULT_HEIGHT,
  VISUALIZER_DEFAULT_COLOR,
  VISUALIZER_DEFAULT_BG_COLOR,
  VISUALIZER_DEFAULT_LINE_WIDTH,
  FFT_SIZE,
  AUDIO_SMOOTHING_CONSTANT,
  ERROR_MESSAGES,
  type FFTSize,
} from '../../utils/constants';

export type VisualizerMode = 'waveform' | 'bars' | 'circular';
export type ColorScheme = 'default' | 'accuracy' | 'rainbow' | 'custom';

export interface AudioVisualizerProps {
  audioStream: MediaStream | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  lineWidth?: number;
  fftSize?: FFTSize;
  mode?: VisualizerMode;
  colorScheme?: ColorScheme;
  glowEffect?: boolean;
  pitchAccuracy?: number; // For accuracy-based coloring (in cents)
}

/**
 * AudioVisualizer component - Real-time waveform visualization using Canvas API
 * Displays audio input as a live waveform with configurable appearance
 */
export function AudioVisualizer({
  audioStream,
  width = VISUALIZER_DEFAULT_WIDTH,
  height = VISUALIZER_DEFAULT_HEIGHT,
  color = VISUALIZER_DEFAULT_COLOR,
  backgroundColor = VISUALIZER_DEFAULT_BG_COLOR,
  lineWidth = VISUALIZER_DEFAULT_LINE_WIDTH,
  fftSize = FFT_SIZE,
  mode = 'waveform',
  colorScheme = 'default',
  glowEffect = false,
  pitchAccuracy = 0,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Web Audio API and connect stream
  useEffect(() => {
    if (!audioStream) {
      setIsActive(false);
      return;
    }

    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error('[AudioVisualizer] Stream has no audio tracks');
      setError('Stream has no audio tracks');
      setIsActive(false);
      return;
    }

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

        if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

        const analyser = audioContext.createAnalyser();
      analyser.fftSize = fftSize;
      analyser.smoothingTimeConstant = AUDIO_SMOOTHING_CONSTANT;
      analyserRef.current = analyser;

        const source = audioContext.createMediaStreamSource(audioStream);
      sourceRef.current = source;

      // Connect source to analyser (don't connect to destination to avoid feedback)
      source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      setIsActive(true);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to initialize audio visualizer';
      console.error('AudioVisualizer error:', errorMessage);
      setError(errorMessage);
      setIsActive(false);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch((err) => {
          console.error('Error closing audio context:', err);
        });
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      dataArrayRef.current = null;
      setIsActive(false);
    };
  }, [audioStream, fftSize]);

  // Animation loop for drawing waveform
  useEffect(() => {
    if (!isActive || !canvasRef.current || !analyserRef.current || !dataArrayRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');

    if (!canvasContext) {
      setError(ERROR_MESSAGES.FAILED_TO_GET_CANVAS_CONTEXT);
      return;
    }

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const bufferLength = dataArray.length;

    const getColor = (index: number, total: number): string => {
      if (colorScheme === 'accuracy') {
        const cents = Math.abs(pitchAccuracy);
        if (cents <= 5) return '#10B981'; // Green - perfect
        if (cents <= 15) return '#F59E0B'; // Yellow - close
        if (cents <= 30) return '#EF4444'; // Red - off
        return '#EF4444'; // Red - way off
      }

      if (colorScheme === 'rainbow') {
        const hue = (index / total) * 360;
        return `hsl(${hue}, 70%, 60%)`;
      }

      return color;
    };

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) {
        return;
      }

        animationFrameRef.current = requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasContext.fillStyle = backgroundColor;
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === 'bars') {
          analyser.getByteFrequencyData(dataArray);
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;

          const barColor = getColor(i, bufferLength);
          canvasContext.fillStyle = barColor;

          if (glowEffect) {
            canvasContext.shadowBlur = 10;
            canvasContext.shadowColor = barColor;
          }

          canvasContext.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }

        canvasContext.shadowBlur = 0;
      } else if (mode === 'circular') {
          analyser.getByteFrequencyData(dataArray);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 3;

        for (let i = 0; i < bufferLength; i++) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const barHeight = (dataArray[i] / 255) * (radius / 2);

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barHeight);
          const y2 = centerY + Math.sin(angle) * (radius + barHeight);

          canvasContext.strokeStyle = getColor(i, bufferLength);
          canvasContext.lineWidth = 2;

          if (glowEffect) {
            canvasContext.shadowBlur = 8;
            canvasContext.shadowColor = getColor(i, bufferLength);
          }

          canvasContext.beginPath();
          canvasContext.moveTo(x1, y1);
          canvasContext.lineTo(x2, y2);
          canvasContext.stroke();
        }

        canvasContext.shadowBlur = 0;
      } else {
          canvasContext.lineWidth = lineWidth;
        canvasContext.strokeStyle = getColor(0, 1);

        if (glowEffect) {
          canvasContext.shadowBlur = 15;
          canvasContext.shadowColor = getColor(0, 1);
        }

        canvasContext.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0; // Normalize to 0-2 range
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            canvasContext.moveTo(x, y);
          } else {
            canvasContext.lineTo(x, y);
          }

          x += sliceWidth;
        }

          canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();

        canvasContext.shadowBlur = 0;
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, color, backgroundColor, lineWidth, mode, colorScheme, glowEffect, pitchAccuracy]);

  // Handle canvas resize
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const dpr = window.devicePixelRatio || 1;

        canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

        canvas.width = width * dpr;
      canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }
  }, [width, height]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-red-500 bg-red-50 dark:bg-red-900/20"
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">
            Visualizer Error
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!audioStream) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"
        style={{ width, height }}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No audio stream
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Start recording to see waveform
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        className="rounded-lg shadow-lg ring-1 ring-gray-200 dark:ring-gray-700"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
      {isActive && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <div className="flex items-center space-x-1 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
            </span>
            <span>LIVE</span>
          </div>
        </div>
      )}
    </div>
  );
}
