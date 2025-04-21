"use client"
import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice' 
import rangeReducer from './slices/rangeSlice' 
import masterReducer from './slices/masterFilterSlice' 
import subDevReducer from './slices/subDevFilterSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer, 
    range : rangeReducer,
    masterFilter : masterReducer, 
    subDevFilter : subDevReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
