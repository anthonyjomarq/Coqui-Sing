import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import audioReducer from './slices/audioSlice';
import sessionReducer from './slices/sessionSlice';
import uiReducer from './slices/uiSlice';

/**
 * Root reducer combining all slice reducers.
 * This makes it easier to manage and organize reducers as the app grows.
 */
export const rootReducer = combineReducers({
  user: userReducer,
  audio: audioReducer,
  session: sessionReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
