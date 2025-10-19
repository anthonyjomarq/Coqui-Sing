/**
 * Custom React Hooks
 *
 * This module exports all custom hooks used throughout the application.
 * Import hooks from this central location for consistency.
 *
 * @example
 * ```tsx
 * import { useToggle, useLocalStorage, useMediaQuery } from './hooks';
 * ```
 */

// Audio-related hooks
export { useAudioContext } from './useAudioContext';
export { useMicrophone } from './useMicrophone';
export { useAudioRecorder } from './useAudioRecorder';
export type { UseAudioRecorderReturn } from './useAudioRecorder';

// Utility hooks
export { useToggle } from './useToggle';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop, BREAKPOINTS } from './useMediaQuery';
export { useDebounce, useDebouncedCallback } from './useDebounce';
export {
  useEventListener,
  useWindowResize,
  useWindowScroll,
  useKeyPress,
  useClickOutside,
} from './useEventListener';
