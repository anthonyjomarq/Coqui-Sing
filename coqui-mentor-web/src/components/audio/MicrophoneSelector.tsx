import { useEffect, useState, useRef } from 'react';
import { useMicrophone } from '../../hooks/useMicrophone';

interface MicrophoneSelectorProps {
  onDeviceSelected?: (deviceId: string) => void;
  onPermissionGranted?: () => void;
}

export function MicrophoneSelector({
  onDeviceSelected,
  onPermissionGranted,
}: MicrophoneSelectorProps) {
  const {
    stream,
    devices,
    selectedDevice,
    selectDevice,
    requestPermission,
    isPermissionGranted,
    error,
  } = useMicrophone();

  const [isRequesting, setIsRequesting] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    selectDevice(deviceId);
    onDeviceSelected?.(deviceId);
  };

  useEffect(() => {
    if (isPermissionGranted) {
      onPermissionGranted?.();
    }
  }, [isPermissionGranted, onPermissionGranted]);

  useEffect(() => {
    if (!stream) {
      if (analyserRef.current) {
        analyserRef.current = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setVolumeLevel(0);
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedVolume = Math.min(100, (average / 255) * 100);

      setVolumeLevel(normalizedVolume);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };

    updateVolume();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      microphone.disconnect();
      analyser.disconnect();
      audioContext.close();
    };
  }, [stream]);

  const getPermissionStatus = () => {
    if (error) {
      return { label: 'Denied', color: 'text-red-600' };
    }
    if (isPermissionGranted) {
      return { label: 'Granted', color: 'text-secondary-500' };
    }
    return { label: 'Pending', color: 'text-gray-500' };
  };

  const permissionStatus = getPermissionStatus();

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          <h3 className="text-lg font-display font-semibold text-gray-900">Microphone</h3>
        </div>

        {isPermissionGranted && stream && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse" />
            <span className="text-sm text-secondary-600 font-medium">Active</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
        <span className="text-sm font-medium text-gray-700">Permission Status:</span>
        <span className={`text-sm font-semibold ${permissionStatus.color}`}>
          {permissionStatus.label}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isPermissionGranted && (
        <button
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="btn btn-primary w-full px-4 py-3 text-base"
        >
          {isRequesting ? (
            <span className="flex items-center justify-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Requesting Permission...</span>
            </span>
          ) : (
            'Request Microphone Permission'
          )}
        </button>
      )}

      {isPermissionGranted && devices.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="mic-select" className="block text-sm font-medium text-gray-700">
            Select Microphone
          </label>
          <select
            id="mic-select"
            value={selectedDevice || ''}
            onChange={(e) => handleDeviceChange(e.target.value)}
            className="input w-full"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {isPermissionGranted && stream && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Input Level</span>
            <span className="text-xs text-gray-500">{Math.round(volumeLevel)}%</span>
          </div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-100 ease-out rounded-full"
              style={{
                width: `${volumeLevel}%`,
                backgroundColor:
                  volumeLevel > 80
                    ? '#FFEB3B' // accent-500 (yellow - loud)
                    : volumeLevel > 40
                      ? '#66BB6A' // secondary-500 (green - good)
                      : '#81D4FA', // info-500 (blue - quiet)
              }}
            />
          </div>

          <div className="flex space-x-1 h-8 items-end">
            {Array.from({ length: 20 }).map((_, index) => {
              const threshold = (index + 1) * 5;
              const isActive = volumeLevel >= threshold;
              return (
                <div
                  key={index}
                  className="flex-1 rounded-sm transition-all duration-100"
                  style={{
                    backgroundColor: isActive
                      ? threshold > 80
                        ? '#FFEB3B' // accent-500
                        : threshold > 40
                          ? '#66BB6A' // secondary-500
                          : '#81D4FA' // info-500
                      : '#E5E7EB', // gray-200
                    height: `${20 + index * 3}%`,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {!isPermissionGranted && !error && (
        <p className="text-xs text-gray-500 text-center">
          Click the button above to enable your microphone for vocal exercises
        </p>
      )}
    </div>
  );
}
