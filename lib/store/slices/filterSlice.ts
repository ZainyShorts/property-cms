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
  bedrooms: PriceRange
  primaryPriceRange: PriceRange
  resalePriceRange: PriceRange
  rentRange: PriceRange
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
  bedrooms: { min: 0, max: 10 },
  primaryPriceRange: { min: 0, max: 1000000 },
  resalePriceRange: { min: 0, max: 1000000 },
  rentRange: { min: 0, max: 50000 },
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
    updateRangeFilter: (
      state,
      action: PayloadAction<{
        field: "bedrooms" | "primaryPriceRange" | "resalePriceRange" | "rentRange"
        value: PriceRange
      }>,
    ) => {
      const { field, value } = action.payload
      state[field] = value
    },
    resetFilters: () => initialState,
    clearAllFilters: () => initialState, // This is the new action we're adding
  },
})

export const { updateFilter, updateUnitView, updateRangeFilter, resetFilters, clearAllFilters } = filterSlice.actions
export default filterSlice.reducer

