import { useEffect, useRef, useState } from 'react';

interface AdvancedAudioVisualizerProps {
  audioStream: MediaStream | null;
  isRecording: boolean;
  width?: number;
  height?: number;
}

export function AdvancedAudioVisualizer({
  audioStream,
  isRecording,
  width = 1200,
  height = 600
}: AdvancedAudioVisualizerProps) {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramCanvasRef = useRef<HTMLCanvasElement>(null);
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null);

  const [startTime, setStartTime] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const spectrogramDataRef = useRef<ImageData | null>(null);

  const NOTES = [
    'C6', 'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5',
    'C5', 'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4',
    'C4', 'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3',
    'C3', 'B2', 'A#2', 'A2', 'G#2', 'G2', 'F#2', 'F2', 'E2', 'D#2', 'D2', 'C#2',
    'C2'
  ];

  const NOTE_FREQUENCIES: { [key: string]: number } = {
    'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78,
    'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00,
    'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
    'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
    'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
    'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
    'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
    'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
    'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
    'C6': 1046.50
  };

  const WAVEFORM_HEIGHT = height * 0.25;
  const SPECTROGRAM_HEIGHT = height * 0.65;
  const TIMELINE_HEIGHT = height * 0.1;

  useEffect(() => {
    if (!audioStream || !isRecording) {
      cleanup();
      return;
    }

    const tracks = audioStream.getAudioTracks();
    if (tracks.length === 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 8192;
      analyserRef.current.smoothingTimeConstant = 0.8;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(audioStream);
      sourceRef.current.connect(analyserRef.current);

      setStartTime(Date.now());

      const spectrogramCanvas = spectrogramCanvasRef.current;
      if (spectrogramCanvas) {
        const ctx = spectrogramCanvas.getContext('2d');
        if (ctx) {
          spectrogramDataRef.current = ctx.createImageData(spectrogramCanvas.width, spectrogramCanvas.height);
        }
      }

      visualize();
    } catch (err) {
      console.error('Audio setup error:', err);
    }

    return cleanup;
  }, [audioStream, isRecording]);

  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
      audioContextRef.current = null;
    }
    setStartTime(null);
  };

  const visualize = () => {
    if (!analyserRef.current || !isRecording) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;

      const bufferLength = analyserRef.current!.frequencyBinCount;
      const waveformData = new Uint8Array(bufferLength);
      const frequencyData = new Uint8Array(bufferLength);

      analyserRef.current!.getByteTimeDomainData(waveformData);
      analyserRef.current!.getByteFrequencyData(frequencyData);

      drawWaveform(waveformData);
      drawSpectrogram(frequencyData);
      drawTimeline(elapsed);
    };

    draw();
  };

  const drawWaveform = (data: Uint8Array) => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = canvas.width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
  };

  const drawSpectrogram = (frequencyData: Uint8Array) => {
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binCount = analyserRef.current?.frequencyBinCount || 1024;
    const noteHeight = canvas.height / NOTES.length;

    if (!spectrogramDataRef.current) {
      spectrogramDataRef.current = ctx.createImageData(canvas.width, canvas.height);
    }

    const imageData = spectrogramDataRef.current;
    const data = imageData.data;

    for (let y = 0; y < canvas.height - 1; y++) {
      for (let x = 0; x < canvas.width - 1; x++) {
        const sourceIndex = (y * canvas.width + x + 1) * 4;
        const targetIndex = (y * canvas.width + x) * 4;
        data[targetIndex] = data[sourceIndex];
        data[targetIndex + 1] = data[sourceIndex + 1];
        data[targetIndex + 2] = data[sourceIndex + 2];
        data[targetIndex + 3] = data[sourceIndex + 3];
      }
    }

    const x = canvas.width - 1;
    NOTES.forEach((note, noteIdx) => {
      const noteFreq = NOTE_FREQUENCIES[note];
      const binIndex = Math.round((noteFreq * binCount) / (sampleRate / 2));

      if (binIndex < frequencyData.length) {
        const intensity = frequencyData[binIndex];
        const startY = Math.floor(noteIdx * noteHeight);
        const endY = Math.floor((noteIdx + 1) * noteHeight);

        for (let y = startY; y < endY; y++) {
          if (y >= canvas.height) continue;

          const pixelIndex = (y * canvas.width + x) * 4;

          if (intensity > 30) {
            const normalizedIntensity = Math.min(intensity / 255, 1);
            const hue = 60 - (normalizedIntensity * 60);
            const [r, g, b] = hslToRgb(hue / 360, 1, 0.5);

            data[pixelIndex] = r;
            data[pixelIndex + 1] = g;
            data[pixelIndex + 2] = b;
            data[pixelIndex + 3] = Math.floor(normalizedIntensity * 255);
          } else {
            data[pixelIndex] = 15;
            data[pixelIndex + 1] = 23;
            data[pixelIndex + 2] = 42;
            data[pixelIndex + 3] = 255;
          }
        }
      }
    });

    ctx.putImageData(imageData, 0, 0);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    NOTES.forEach((note, idx) => {
      const y = idx * noteHeight;
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(note, 55, y + noteHeight / 2 + 4);
    });
  };

  const drawTimeline = (elapsed: number) => {
    const canvas = timelineCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';

    const maxTime = Math.max(elapsed, 10);
    const timeStep = maxTime > 60 ? 10 : maxTime > 30 ? 5 : 1;

    for (let t = 0; t <= maxTime; t += timeStep) {
      const x = (t / maxTime) * canvas.width;

      ctx.strokeStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 8);
      ctx.stroke();

      ctx.fillText(`${t}s`, x, 22);
    }

    const currentX = (elapsed / maxTime) * canvas.width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, canvas.height);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'right';
    ctx.fillText(`${elapsed.toFixed(1)}s`, canvas.width - 10, 22);
  };

  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  if (!audioStream || !isRecording) {
    return (
      <div
        className="bg-gray-900 rounded-lg flex items-center justify-center border border-gray-700"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">Audio Visualizer</div>
          <div className="text-sm">Start recording to see waveform and spectrogram</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
      <div className="absolute top-2 left-2 text-xs font-semibold text-orange-400 bg-black/50 px-2 py-1 rounded z-10">
        Waveform
      </div>
      <div className="absolute" style={{ top: WAVEFORM_HEIGHT + 8, left: 8 }}>
        <div className="text-xs font-semibold text-orange-400 bg-black/50 px-2 py-1 rounded z-10">
          Chromatic Scale
        </div>
      </div>

      <canvas
        ref={waveformCanvasRef}
        width={width}
        height={WAVEFORM_HEIGHT}
        className="block"
      />

      <canvas
        ref={spectrogramCanvasRef}
        width={width}
        height={SPECTROGRAM_HEIGHT}
        className="block"
      />

      <canvas
        ref={timelineCanvasRef}
        width={width}
        height={TIMELINE_HEIGHT}
        className="block"
      />
    </div>
  );
}
