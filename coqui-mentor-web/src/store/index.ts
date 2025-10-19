import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './rootReducer';
import {
  loggerMiddleware,
  performanceLoggerMiddleware,
  actionCounterMiddleware,
  crashReporterMiddleware,
} from './middleware/logger';
import {
  REDUX_DEVTOOLS_MAX_AGE,
  REDUX_DEVTOOLS_TRACE_LIMIT,
} from '../utils/constants';

const isDevelopment = import.meta.env.MODE !== 'production';

/**
 * Action sanitizer to hide sensitive data in DevTools.
 * Prevents sensitive user data from being logged in Redux DevTools.
 * @param action - Redux action to sanitize
 * @returns Sanitized action with hidden sensitive fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actionSanitizer = (action: any) => {
  // Hide sensitive fields from actions
  if (action.type === 'user/setUser' && action.payload) {
    return {
      ...action,
      payload: {
        ...action.payload,
        email: '***HIDDEN***',
        // Keep other non-sensitive fields visible
        id: action.payload.id,
        name: action.payload.name,
      },
    };
  }
  return action;
};

/**
 * State sanitizer to hide sensitive data in DevTools.
 * Prevents sensitive user data from appearing in state snapshots.
 * @param state - Redux state to sanitize
 * @returns Sanitized state with hidden sensitive fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stateSanitizer = (state: any) => {
  if (state.user?.currentUser) {
    return {
      ...state,
      user: {
        ...state.user,
        currentUser: {
          ...state.user.currentUser,
          email: '***HIDDEN***',
        },
      },
    };
  }
  return state;
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for non-serializable checks
        ignoredActions: ['audioContext/setContext'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.audioContext', 'payload.mediaStream'],
        // Ignore these paths in the state
        ignoredPaths: ['audio.context', 'audio.stream'],
      },
    });

    // Add custom middleware only in development
    if (isDevelopment) {
      return middleware
        .concat(crashReporterMiddleware)
        .concat(performanceLoggerMiddleware)
        .concat(actionCounterMiddleware)
        .concat(loggerMiddleware);
    }

    return middleware;
  },
  devTools:
    isDevelopment && {
      name: 'Coqui Mentor',
      trace: true, // Enable action stack traces
      traceLimit: REDUX_DEVTOOLS_TRACE_LIMIT,
      actionSanitizer,
      stateSanitizer,
      // Customize features
      features: {
        pause: true, // Pause recording
        lock: true, // Lock/unlock dispatching
        persist: true, // Persist state between sessions
        export: true, // Export/import state
        import: 'custom', // Custom import
        jump: true, // Jump to state
        skip: true, // Skip actions
        reorder: true, // Reorder actions
        dispatch: true, // Dispatch custom actions
        test: true, // Generate tests
      },
      // Maximum number of actions to keep
      maxAge: REDUX_DEVTOOLS_MAX_AGE,
    },
});

// Export types for TypeScript
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
