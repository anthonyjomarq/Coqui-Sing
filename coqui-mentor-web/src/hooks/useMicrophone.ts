import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMicrophoneReturn {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedDevice: string | null;
  selectDevice: (deviceId: string) => void;
  requestPermission: () => Promise<void>;
  isPermissionGranted: boolean;
  error: string | null;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((device) => device.kind === 'audioinput');
      setDevices(audioInputs);

      if (audioInputs.length > 0 && !selectedDevice) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
    } catch (err) {
      setError(`Failed to enumerate devices: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [selectedDevice]);

  const requestPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('getUserMedia is not supported in this browser');
      return;
    }

    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        audio: selectedDevice
          ? {
              deviceId: { exact: selectedDevice },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
              sampleRate: 44100,
            }
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: true,
              sampleRate: 44100,
            },
        video: false,
      };

      stopCurrentStream();

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsPermissionGranted(true);

      await enumerateDevices();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone device found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Microphone is already in use by another application.');
        } else if (err.name === 'OverconstrainedError') {
          setError('The selected microphone device could not be accessed. Trying default device...');
          setSelectedDevice(null);
        } else {
          setError(`Failed to access microphone: ${err.message}`);
        }
      } else {
        setError('An unknown error occurred while accessing the microphone');
      }

      setIsPermissionGranted(false);
      stopCurrentStream();
    }
  }, [selectedDevice, stopCurrentStream, enumerateDevices]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDevice(deviceId);
  }, []);

  useEffect(() => {
    if (isPermissionGranted && selectedDevice) {
      requestPermission();
    }
  }, [selectedDevice]);

  useEffect(() => {
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  useEffect(() => {
    return () => {
      stopCurrentStream();
    };
  }, [stopCurrentStream]);

  return {
    stream,
    devices,
    selectedDevice,
    selectDevice,
    requestPermission,
    isPermissionGranted,
    error,
  };
}
