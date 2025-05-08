import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface projectFilterState { 
  masterDevelopment : string; 
  subDevelopment : string;
  propertyType?: string;
  projectName?: string;
  projectQuality?: string;
  constructionStatus?: any;
  facilitiesCategories?: string[];
  amentiesCategories?: string[];
  launchDate? : string;  
  startDate?: string;   
  saleStatus : string; 
  percentOfConstruction : any;  
  plotPermission?: string[];
  plotStatus?: string;
  uponCompletion?: string;
  installmentDate?: string;
  postHandOver?: string;
  completionDate?:string;
  endDate?: string;
}

const initialState: projectFilterState = { 
  masterDevelopment : '', 
  subDevelopment : '',
  propertyType: '', 
  projectName: '',  
  projectQuality: '',
  constructionStatus: null,
  facilitiesCategories: [],
  amentiesCategories: [], 
  launchDate : '', 
  saleStatus : '', 
  percentOfConstruction: null, 
  plotPermission: [],
  plotStatus: '',
  completionDate : '', 
  uponCompletion: "",
  installmentDate: "",
  postHandOver: "",
  startDate: '',
  endDate: '',    
};

const projectFilterSlice = createSlice({
  name: 'projectFilter',
  initialState,
  reducers: {  
    setPropertyType: (state, action: PayloadAction<string>) => {
        state.propertyType = action.payload;
      },
    setmasterDevelopment: (state, action: PayloadAction<string>) => {
        state.masterDevelopment = action.payload;
      },
    setsubDevelopment: (state, action: PayloadAction<string>) => {
      state.subDevelopment = action.payload;
    },
    setProjectName: (state, action: PayloadAction<string>) => {
      state.projectName = action.payload;
    },
    setProjectQuality: (state, action: PayloadAction<string>) => {
      state.projectQuality = action.payload;
    }, 
    setSaleStatus: (state, action: PayloadAction<string>) => {
      state.saleStatus = action.payload;
    },
    setConstructionStatus: (state, action: PayloadAction<number>) => {
      state.constructionStatus = action.payload;
    }, 
    setpercentOfConstruction: (state, action: PayloadAction<number>) => {
      state.percentOfConstruction = action.payload;
    },
    setFacilitiesCategories: (state, action: PayloadAction<string[]>) => {
      state.facilitiesCategories = action.payload;
    },
    setAmentiesCategories: (state, action: PayloadAction<string[]>) => {
      state.amentiesCategories = action.payload;
    }, 
    setCompletionDate : (state, action: PayloadAction<string>) => {
      state.completionDate = action.payload;
    },  
    setLaunchDate : (state, action: PayloadAction<string>) => {
      state.launchDate = action.payload;
    }, 
    setUponCompletion : (state, action: PayloadAction<string>) => {
      state.uponCompletion = action.payload;
    },  
    setPlotPermission(state, action: PayloadAction<string[]>) {
      state.plotPermission = action.payload;
    },
    setPlotStatus(state, action: PayloadAction<string>) {
      state.plotStatus = action.payload;
    },
    setInstallmentDate : (state, action: PayloadAction<string>) => {
      state.installmentDate = action.payload;
    }, 
    setPostHandOver : (state, action: PayloadAction<string>) => {
      state.postHandOver = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {  
  setmasterDevelopment,  
  setsubDevelopment, 
  setPropertyType,
  setProjectName,
  setProjectQuality,
  setConstructionStatus,
  setFacilitiesCategories,
  setAmentiesCategories,
  setStartDate,
  setEndDate, 
  setpercentOfConstruction,
  resetFilters,  
  setCompletionDate,  
  setInstallmentDate, 
  setPostHandOver, 
  setUponCompletion, 
  setPlotPermission,
  setPlotStatus,
  setSaleStatus,
  setLaunchDate
} = projectFilterSlice.actions;

export default projectFilterSlice.reducer;
