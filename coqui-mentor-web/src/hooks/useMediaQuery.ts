import { useState, useEffect } from 'react';

/**
 * A hook for matching CSS media queries in React components.
 *
 * @param query - The media query string to match (e.g., "(min-width: 768px)")
 * @returns boolean - True if the media query matches, false otherwise
 *
 * @example
 * ```tsx
 * function Component() {
 *   const isMobile = useMediaQuery('(max-width: 768px)');
 *   const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
 *   const isDesktop = useMediaQuery('(min-width: 1025px)');
 *   const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileNav />}
 *       {isTablet && <TabletNav />}
 *       {isDesktop && <DesktopNav />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Tailwind breakpoints
 * ```tsx
 * const isSm = useMediaQuery('(min-width: 640px)');
 * const isMd = useMediaQuery('(min-width: 768px)');
 * const isLg = useMediaQuery('(min-width: 1024px)');
 * const isXl = useMediaQuery('(min-width: 1280px)');
 * const is2Xl = useMediaQuery('(min-width: 1536px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = (query: string): boolean => {
    // Prevent SSR issues
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Update state when media query match changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Listen for changes
    // Use addEventListener for modern browsers, addListener for older ones
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else {
      // @ts-ignore - Legacy support for older browsers
      mediaQueryList.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else {
        // @ts-ignore - Legacy support for older browsers
        mediaQueryList.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Common Tailwind CSS breakpoints as constants
 */
export const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

/**
 * Hook variants for common Tailwind breakpoints
 */
export const useIsMobile = () => !useMediaQuery(BREAKPOINTS.md);
export const useIsTablet = () =>
  useMediaQuery(BREAKPOINTS.md) && !useMediaQuery(BREAKPOINTS.lg);
export const useIsDesktop = () => useMediaQuery(BREAKPOINTS.lg);
