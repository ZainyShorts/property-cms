"use client"
import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice' 
import rangeReducer from './slices/rangeSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer, 
    range : rangeReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
