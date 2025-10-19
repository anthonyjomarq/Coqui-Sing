/**
 * Throttle Hook
 * Limits the rate at which a function can fire
 * Useful for high-frequency updates like audio metrics
 */

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Throttle a value update
 * @param value - Value to throttle
 * @param delay - Delay in milliseconds (default: 33ms = ~30fps)
 * @returns Throttled value
 */
export function useThrottle<T>(value: T, delay: number = 33): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecutedRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecute = now - lastExecutedRef.current;

    if (timeSinceLastExecute >= delay) {
      lastExecutedRef.current = now;
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        setThrottledValue(value);
      }, delay - timeSinceLastExecute);

      return () => clearTimeout(timerId);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * Throttle a callback function
 * @param callback - Function to throttle
 * @param delay - Delay in milliseconds (default: 33ms = ~30fps)
 * @returns Throttled callback
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 33
): T {
  const lastExecutedRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastExecute = now - lastExecutedRef.current;

      if (timeSinceLastExecute >= delay) {
        lastExecutedRef.current = now;
        return callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastExecutedRef.current = Date.now();
          callback(...args);
        }, delay - timeSinceLastExecute);
      }
    },
    [callback, delay]
  ) as T;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
