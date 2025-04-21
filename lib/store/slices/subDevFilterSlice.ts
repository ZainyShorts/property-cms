import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SubDevFilterState {
  subDevelopment?: string;
  plotNumber?: number;
  plotPermission?: string;
  plotStatus?: string;
  facilitiesCategories?: string[];
  amentiesCategories?: string[];
}

const initialState: SubDevFilterState = {
  subDevelopment: '',
  plotNumber: undefined,
  plotPermission: '',
  plotStatus: '',
  facilitiesCategories: [],
  amentiesCategories: [],
};

const subDevFilterSlice = createSlice({
  name: 'subDevFilter',
  initialState,
  reducers: {
    setSubDevelopment(state, action: PayloadAction<string>) {
      state.subDevelopment = action.payload;
    },
    setPlotNumber(state, action: PayloadAction<number>) {
      state.plotNumber = action.payload;
    },
    setPlotPermission(state, action: PayloadAction<string>) {
      state.plotPermission = action.payload;
    },
    setPlotStatus(state, action: PayloadAction<string>) {
      state.plotStatus = action.payload;
    },
    setFacilitiesCategories(state, action: PayloadAction<string[]>) {
      state.facilitiesCategories = action.payload;
    },
    setAmentiesCategories(state, action: PayloadAction<string[]>) {
      state.amentiesCategories = action.payload;
    },
    resetSubDevFilter: () => initialState,

  },
});

export const {
  setSubDevelopment,
  setPlotNumber,
  setPlotPermission,
  setPlotStatus,
  setFacilitiesCategories,
  setAmentiesCategories,
  resetSubDevFilter,
} = subDevFilterSlice.actions;

export default subDevFilterSlice.reducer;
