import type { Middleware, AnyAction } from '@reduxjs/toolkit';
import type { RootState } from '../rootReducer';
import { SLOW_ACTION_THRESHOLD } from '../../utils/constants';

/**
 * Custom logger middleware for Redux actions.
 * Logs action details, timestamps, and state changes in development mode.
 * Only active in development mode - no overhead in production.
 */
export const loggerMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  // Only log in development mode
  if (import.meta.env.MODE === 'production') {
    return next(action);
  }

  const timestamp = new Date().toISOString();
  const prevState = store.getState();

  // Format timestamp for console
  const timeString = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Log action dispatch
  console.group(
    `%c Action @ ${timeString} %c${(action as AnyAction).type}`,
    'color: gray; font-weight: lighter;',
    'color: inherit; font-weight: bold;'
  );

  console.log('%c Previous State:', 'color: #9E9E9E; font-weight: bold;', prevState);
  console.log('%c Action:', 'color: #03A9F4; font-weight: bold;', action as AnyAction);

  // Execute the action
  const result = next(action);

  const nextState = store.getState();
  console.log('%c Next State:', 'color: #4CAF50; font-weight: bold;', nextState);

  // Calculate and log state diff for better debugging
  const diff = calculateStateDiff(prevState, nextState);
  if (Object.keys(diff).length > 0) {
    console.log('%c State Diff:', 'color: #FF9800; font-weight: bold;', diff);
  }

  console.log('%c Timestamp:', 'color: #9E9E9E;', timestamp);

  console.groupEnd();

  return result;
};

/**
 * Calculate differences between previous and next state.
 * Returns an object containing only the changed slices.
 * @param prevState - Previous Redux state
 * @param nextState - Next Redux state
 * @returns Object containing only changed state slices
 */
function calculateStateDiff(
  prevState: Record<string, unknown>,
  nextState: Record<string, unknown>
): Record<string, { previous: unknown; current: unknown }> {
  const diff: Record<string, { previous: unknown; current: unknown }> = {};

  // Check each slice of state
  for (const key in nextState) {
    if (prevState[key] !== nextState[key]) {
      diff[key] = {
        previous: prevState[key],
        current: nextState[key],
      };
    }
  }

  return diff;
}

/**
 * Enhanced logger with performance metrics.
 * Tracks action execution time and provides performance warnings.
 */
export const performanceLoggerMiddleware: Middleware<{}, RootState> =
  () => (next) => (action) => {
    if (import.meta.env.MODE === 'production') {
      return next(action);
    }

    const startTime = performance.now();
    const result = next(action);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Warn if action takes too long
    if (duration > SLOW_ACTION_THRESHOLD) {
      console.warn(
        `%c ⚠️ Slow Action: ${(action as AnyAction).type} took ${duration.toFixed(2)}ms`,
        'color: #FF5722; font-weight: bold;'
      );
    }

    return result;
  };

/**
 * Conditional logger that only logs specific action types.
 * Useful for focusing on specific slices during debugging.
 */
export const createConditionalLogger = (
  actionTypes: string[]
): Middleware<{}, RootState> => {
  return () => (next) => (action) => {
    if (import.meta.env.MODE === 'production') {
      return next(action);
    }

    // Check if action type should be logged
    const typedAction = action as AnyAction;
    const shouldLog = actionTypes.some((type) => typedAction.type.includes(type));

    if (!shouldLog) {
      return next(action);
    }

    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    console.log(
      `%c[${timestamp}] ${typedAction.type}`,
      'color: #673AB7; font-weight: bold;',
      typedAction.payload
    );

    return next(action);
  };
};

/**
 * Action counter middleware.
 * Tracks total number of dispatched actions by type.
 * Exposes __getActionCounts() on window for debugging.
 */
let actionCounts: Record<string, number> = {};

export const actionCounterMiddleware: Middleware<{}, RootState> =
  () => (next) => (action) => {
    if (import.meta.env.MODE !== 'production') {
      const typedAction = action as AnyAction;
      actionCounts[typedAction.type] = (actionCounts[typedAction.type] || 0) + 1;

      // Add method to window for debugging
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__getActionCounts = () => {
          console.table(
            Object.entries(actionCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => ({ Action: type, Count: count }))
          );
          return actionCounts;
        };
      }
    }

    return next(action);
  };

/**
 * Crash reporter middleware.
 * Logs state and action info when an error occurs in a reducer.
 */
export const crashReporterMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    try {
      return next(action);
    } catch (error) {
      console.error('%c 💥 Reducer Crash', 'color: red; font-size: 16px; font-weight: bold;');
      console.error('Action that caused crash:', action as AnyAction);
      console.error('State before crash:', store.getState());
      console.error('Error:', error);

      // In production, you might want to send this to an error tracking service
      if (import.meta.env.MODE === 'production') {
        // sendToErrorTracking({ action, state: store.getState(), error });
      }

      throw error;
    }
  };
