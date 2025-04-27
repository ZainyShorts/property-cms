import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Range {
  min?: number;
  max?: number;
}

interface MasterFilterState {
  developmentName?: string;
  roadLocation?: string;
  locationQuality?: string;
  buaAreaSqFtRange?: Range;
  totalAreaSqFtRange?: Range; 
  country? : string; 
  city : string;
  facilitiesCategories?: string[];
  amentiesCategories?: string[];
  startDate?: string;
  endDate?: string;
}

const initialState: MasterFilterState = {
  developmentName: '',
  roadLocation: '',
  locationQuality: '', 
  country : '', 
  city :'',
  buaAreaSqFtRange: {},
  totalAreaSqFtRange: {},
  facilitiesCategories: [],
  amentiesCategories: [],
};

const masterFilterSlice = createSlice({
  name: 'masterFilter',
  initialState,
  reducers: {
    setDevelopmentName: (state, action: PayloadAction<string>) => {
      state.developmentName = action.payload;
    },
    setRoadLocation: (state, action: PayloadAction<string>) => {
      state.roadLocation = action.payload;
    },
    setLocationQuality: (state, action: PayloadAction<string>) => {
      state.locationQuality = action.payload;
    },
    setBuaAreaSqFtRange: (state, action: PayloadAction<Range>) => {
      state.buaAreaSqFtRange = action.payload;
    }, 
    setCountry(state, action: PayloadAction<string>) {
      state.country = action.payload;
    }, 
    setCity(state, action: PayloadAction<string>) {
      state.city = action.payload;
    },
    setTotalAreaSqFtRange: (state, action: PayloadAction<Range>) => {
      state.totalAreaSqFtRange = action.payload;
    },
    setFacilitiesCategories: (state, action: PayloadAction<string[]>) => {
      state.facilitiesCategories = action.payload;
    },
    setAmentiesCategories: (state, action: PayloadAction<string[]>) => {
      state.amentiesCategories = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setDevelopmentName,
  setRoadLocation,
  setLocationQuality,
  setBuaAreaSqFtRange, 
   setCountry, 
    setCity,
  setTotalAreaSqFtRange,
  setFacilitiesCategories,
  setAmentiesCategories,
  resetFilters,
} = masterFilterSlice.actions;

export default masterFilterSlice.reducer;
