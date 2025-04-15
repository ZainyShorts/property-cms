import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  minBed: "",
  maxBed: "",
  minPrimaryPrice: "",
  maxPrimaryPrice: "",
  minResalePrice: "",
  maxResalePrice: "",
  minRent: "",
  maxRent: "",
};

const rangeSlice = createSlice({
  name: 'range',
  initialState,
  reducers: {
    setMinBed: (state, action) => {
      state.minBed = action.payload;
    },
    setMaxBed: (state, action) => {
      state.maxBed = action.payload;
    },
    setMinPrimaryPrice: (state, action) => {
      state.minPrimaryPrice = action.payload;
    },
    setMaxPrimaryPrice: (state, action) => {
      state.maxPrimaryPrice = action.payload;
    },
    setMinResalePrice: (state, action) => {
      state.minResalePrice = action.payload;
    },
    setMaxResalePrice: (state, action) => {
      state.maxResalePrice = action.payload;
    },
    setMinRent: (state, action) => {
      state.minRent = action.payload;
    },
    setMaxRent: (state, action) => {
      state.maxRent = action.payload;
    }, 
   resetRangess: () => initialState,
    
  },
});

export const { 
  setMinBed,
  setMaxBed,
  setMinPrimaryPrice,
  setMaxPrimaryPrice,
  setMinResalePrice,
  setMaxResalePrice,
  setMinRent,
  setMaxRent, 
  resetRangess,
} = rangeSlice.actions;

export default rangeSlice.reducer;