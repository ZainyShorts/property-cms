"use client"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Range {
  min?: number
  max?: number
}

interface FilterState {
  masterDevelopment?: string
  subDevelopment?: string
  project?: string
  unitNumber?: string
  unitHeight?: number
  unitInternalDesign?: string
  unitExternalDesign?: string
  plotSizeSqFt?: number
  buaSqFt?: number
  unitType?: string
  unitView?: string[]
  pictures?: string[]
  unitPurpose?: string
  listingDate?: string
  chequeFrequency?: string
  rentalPriceRange?: Range
  salePriceRange?: Range
  originalPriceRange?: Range
  startDate?: string
  endDate?: string
  rentedAt?: string
  rentedTill?: string
  vacantOn?: string
  paidTODevelopers?: string
  payableTODevelopers?: string
  premiumAndLossRange?: Range
}

const initialState: FilterState = {
  masterDevelopment: undefined,
  subDevelopment: undefined,
  project: undefined,
  unitNumber: undefined,
  unitHeight: undefined,
  unitInternalDesign: undefined,
  unitExternalDesign: undefined,
  plotSizeSqFt: undefined,
  buaSqFt: undefined,
  unitType: undefined,
  unitView: [],
  pictures: [],
  unitPurpose: undefined,
  listingDate: undefined,
  chequeFrequency: undefined,
  rentalPriceRange: { min: undefined, max: undefined },
  salePriceRange: { min: undefined, max: undefined },
  originalPriceRange: { min: undefined, max: undefined },
  startDate: undefined,
  endDate: undefined,
  rentedAt: undefined,
  rentedTill: undefined,
  vacantOn: undefined,
  paidTODevelopers: undefined,
  payableTODevelopers: undefined,
  premiumAndLossRange: { min: undefined, max: undefined },
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
    clearAllFilters: () => initialState,
  },
})

export const { updateFilter, updateUnitView, resetFilters, clearAllFilters } = filterSlice.actions
export default filterSlice.reducer
