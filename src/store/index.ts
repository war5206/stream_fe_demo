// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import sessionsReducer from './sessionsSlice'
import messagesReducer from './messagesSlice'

export const store = configureStore({
  reducer: {
    sessions: sessionsReducer,
    messages: messagesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
