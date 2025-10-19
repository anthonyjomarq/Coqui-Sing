import { useEffect, useRef } from 'react';

/**
 * A hook for adding event listeners with automatic cleanup.
 * Supports both window/document events and element-specific events.
 *
 * @template K - The event type (e.g., 'click', 'scroll', 'resize')
 * @param eventName - The name of the event to listen for
 * @param handler - The event handler function
 * @param element - The element to attach the listener to (default: window)
 * @param options - Optional event listener options (capture, passive, etc.)
 *
 * @example Window event
 * ```tsx
 * function Component() {
 *   useEventListener('resize', () => {
 *     console.log('Window resized!');
 *   });
 *
 *   return <div>Resize the window</div>;
 * }
 * ```
 *
 * @example Element-specific event
 * ```tsx
 * function Component() {
 *   const divRef = useRef<HTMLDivElement>(null);
 *
 *   useEventListener(
 *     'click',
 *     (event) => {
 *       console.log('Div clicked!', event);
 *     },
 *     divRef
 *   );
 *
 *   return <div ref={divRef}>Click me</div>;
 * }
 * ```
 *
 * @example Keyboard event
 * ```tsx
 * function Component() {
 *   useEventListener('keydown', (event) => {
 *     if (event.key === 'Escape') {
 *       closeModal();
 *     }
 *   });
 *
 *   return <div>Press Escape to close</div>;
 * }
 * ```
 *
 * @example With options
 * ```tsx
 * useEventListener(
 *   'scroll',
 *   handleScroll,
 *   window,
 *   { passive: true }
 * );
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: AddEventListenerOptions
): void;

export function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<T>,
  options?: AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: React.RefObject<Document>,
  options?: AddEventListenerOptions
): void;

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KD extends keyof DocumentEventMap,
  T extends HTMLElement | Document = HTMLDivElement
>(
  eventName: KW | KH | KD,
  handler: (
    event: WindowEventMap[KW] | HTMLElementEventMap[KH] | DocumentEventMap[KD] | Event
  ) => void,
  element?: React.RefObject<T>,
  options?: AddEventListenerOptions
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  // Update ref.current value if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current ?? window;

    if (!targetElement?.addEventListener) {
      return;
    }

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = (event) => savedHandler.current(event);

    // Add event listener
    targetElement.addEventListener(eventName, eventListener as EventListener, options);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener as EventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Common event listener hooks for convenience
 */

/**
 * Hook for listening to window resize events
 */
export function useWindowResize(handler: (event: UIEvent) => void) {
  useEventListener('resize', handler);
}

/**
 * Hook for listening to window scroll events
 */
export function useWindowScroll(handler: (event: Event) => void, options?: AddEventListenerOptions) {
  useEventListener('scroll', handler, undefined, options);
}

/**
 * Hook for listening to keyboard events
 */
export function useKeyPress(
  key: string,
  handler: (event: KeyboardEvent) => void,
  element?: React.RefObject<HTMLElement>
) {
  const keyHandler = (event: KeyboardEvent) => {
    if (event.key === key) {
      handler(event);
    }
  };

  useEventListener('keydown', keyHandler, element as any);
}

/**
 * Hook for listening to click outside of an element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      const el = ref?.current;
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener as any);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener as any);
    };
  }, [ref, handler]);
}
