// src/store/store.js
import { configureStore } from '@reduxjs/toolkit'
import quoteReducer from './quoteSlice'

export const store = configureStore({
  reducer: {
    quote: quoteReducer,
    // later you can add: goals: goalsReducer, etc.
  },
})
