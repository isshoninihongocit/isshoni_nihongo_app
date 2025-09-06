import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resourcesReducer from './slices/resourcesSlice';
import assignmentsReducer from './slices/assignmentsSlice';
import leaderboardReducer from './slices/leaderboardSlice';
import chatReducer from './slices/chatSlice';
import eventsReducer from './slices/eventsSlice';
import clubReducer from './slices/clubSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resources: resourcesReducer,
    assignments: assignmentsReducer,
    leaderboard: leaderboardReducer,
    chat: chatReducer,
    events: eventsReducer,
    club: clubReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';
