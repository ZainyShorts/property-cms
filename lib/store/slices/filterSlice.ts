"use client"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface PriceRange {
  min: number
  max: number
}

interface FilterState {
  roadLocation: string
  developmentName: string
  subDevelopmentName: string
  projectName: string
  projectLocation: string
  unitNumber: string
  unitLocation: string
  vacancyStatus: string 
  unitView: string[]
}

const initialState: FilterState = {
  roadLocation: "",
  developmentName: "",
  subDevelopmentName: "",
  projectName: "",
  projectLocation: "",
  unitNumber: "",
  unitLocation: "",
  vacancyStatus: "", 
  unitView: [],
}

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    updateFilter: (state, action: PayloadAction<Partial<FilterState>>) => {
      return { ...state, ...action.payload }
    },
    updateUnitView: (state, action: PayloadAction<string[]>) => {
      state.unitView = action.payload
    },
   
    resetFilters: () => initialState,
    clearAllFilters: () => initialState, // This is the new action we're adding
  },
})

export const { updateFilter, updateUnitView, resetFilters, clearAllFilters } = filterSlice.actions
export default filterSlice.reducer

