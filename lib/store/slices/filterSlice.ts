"use client"
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Range {
  min?: number
  max?: number
}

interface FilterState {
  project?: string
  unitNumber?: string
  unitHeight?: string
  unitInternalDesign?: string
  unitExternalDesign?: string
  unitView?: string[]
  pictures?: string[] 
  rooms ? : string[] 
  noOfWashroom ? : Range
  unitPurpose?: string
  unitType?: string
  listingDate?: string
  developmentName?: string
  roadLocation?: string
  subDevelopment?: string
  noOfBedRooms?: Range
  plotSizeSqFt?: Range
  BuaSqFt?: Range
  purchasePriceRange?: Range
  marketPriceRange?: Range
  askingPriceRange?: Range
  marketRentRange?: Range
  askingRentRange?: Range
  premiumAndLossRange?: Range
  rentedAt?: string
  rentedTill?: string
  paidTODevelopers?: number
  payableTODevelopers?: number
  startDate?: string
  endDate?: string
}

const initialState: FilterState = {
  project: undefined,
  unitNumber: undefined,
  unitHeight: undefined,
  unitInternalDesign: undefined,
  unitExternalDesign: undefined,
  unitView: [],
  pictures: [], 
  rooms:[], 
  noOfWashroom: undefined,
  unitPurpose: undefined,
  unitType: undefined,
  listingDate: undefined,
  developmentName: undefined,
  roadLocation: undefined,
  subDevelopment: undefined,
  noOfBedRooms: { min: undefined, max: undefined },
  plotSizeSqFt: { min: undefined, max: undefined },
  BuaSqFt: { min: undefined, max: undefined },
  purchasePriceRange: { min: undefined, max: undefined },
  marketPriceRange: { min: undefined, max: undefined },
  askingPriceRange: { min: undefined, max: undefined },
  marketRentRange: { min: undefined, max: undefined },
  askingRentRange: { min: undefined, max: undefined },
  premiumAndLossRange: { min: undefined, max: undefined },
  rentedAt: undefined,
  rentedTill: undefined,
  paidTODevelopers: undefined,
  payableTODevelopers: undefined,
  startDate: undefined,
  endDate: undefined,
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
    updatePictures: (state, action: PayloadAction<string[]>) => {
      state.pictures = action.payload
    },
    updateRangeFilter: (state, action: PayloadAction<{ field: keyof FilterState; range: Range }>) => {
      const { field, range } = action.payload
      if (field in state && typeof state[field] === "object" && state[field] !== null) {
        ;(state[field] as Range) = range
      }
    },
    resetFilters: () => initialState,
    clearAllFilters: () => initialState,
  },
})

export const { updateFilter, updateUnitView, updatePictures, updateRangeFilter, resetFilters, clearAllFilters } =
  filterSlice.actions

export default filterSlice.reducer
