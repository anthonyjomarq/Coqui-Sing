import { useState, useEffect } from 'react';

/**
 * A hook for debouncing a value. The debounced value will only update after
 * the specified delay has passed without the value changing.
 *
 * @template T - The type of the value to debounce
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // API call with debounced value
 *       fetchSearchResults(debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 *
 * @example With custom delay
 * ```tsx
 * const debouncedValue = useDebounce(value, 1000); // 1 second delay
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up a timeout to update the debounced value after the delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to clear the timeout if value changes before delay
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A hook for debouncing a callback function. The callback will only be invoked
 * after the specified delay has passed without the function being called again.
 *
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced callback function
 *
 * @example
 * ```tsx
 * function AutoSaveComponent() {
 *   const [content, setContent] = useState('');
 *
 *   const debouncedSave = useDebouncedCallback(
 *     (value: string) => {
 *       saveToServer(value);
 *     },
 *     1000
 *   );
 *
 *   const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
 *     const newValue = e.target.value;
 *     setContent(newValue);
 *     debouncedSave(newValue); // Will only save after 1s of no typing
 *   };
 *
 *   return <textarea value={content} onChange={handleChange} />;
 * }
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  const debouncedCallback = (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay) as unknown as number;

    setTimeoutId(newTimeoutId);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}
