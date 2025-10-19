/**
 * Browser Compatibility Checks
 * Verifies that the browser supports all required Web APIs
 */

export interface CompatibilityCheck {
  supported: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Check if all required Web APIs are supported
 * @returns Compatibility check result
 */
export function checkBrowserCompatibility(): CompatibilityCheck {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check for Web Audio API
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    missing.push('Web Audio API');
  }

  // Check for MediaRecorder API
  if (!window.MediaRecorder) {
    missing.push('MediaRecorder API');
  }

  // Check for getUserMedia
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    missing.push('getUserMedia API (microphone access)');
  }

  // Check for Canvas API
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    missing.push('Canvas API');
  }

  // Check for localStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
  } catch (e) {
    warnings.push('localStorage (progress will not be saved)');
  }

  // Check for Web Workers
  if (!window.Worker) {
    warnings.push('Web Workers (performance may be reduced)');
  }

  return {
    supported: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get browser name and version
 * @returns Browser information string
 */
export function getBrowserInfo(): string {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = '';

  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edge') === -1) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || '';
  }

  return version ? `${browser} ${version}` : browser;
}
