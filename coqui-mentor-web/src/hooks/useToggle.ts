import { useState, useCallback } from 'react';

/**
 * A hook for managing boolean toggle state.
 *
 * @param initialValue - The initial boolean state (default: false)
 * @returns A tuple containing:
 *   - value: The current boolean state
 *   - toggle: Function to toggle the state
 *   - setTrue: Function to set state to true
 *   - setFalse: Function to set state to false
 *   - setValue: Function to set state to a specific boolean value
 *
 * @example
 * ```tsx
 * function Component() {
 *   const [isOpen, toggle, setTrue, setFalse] = useToggle(false);
 *
 *   return (
 *     <div>
 *       <button onClick={toggle}>Toggle</button>
 *       <button onClick={setTrue}>Open</button>
 *       <button onClick={setFalse}>Close</button>
 *       {isOpen && <Modal />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setTrue, setFalse, set];
}
