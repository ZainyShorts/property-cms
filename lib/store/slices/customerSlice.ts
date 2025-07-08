import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomerFilterState {
  customerSegment: string;
  customerCategory: string;
  customerSubCategory: string;
  customerType: string[];
  customerSubType: string[];
  customerBusinessSector: string;
  customerNationality: string;
  customerName: string;
  contactPerson: string;
  customerDepartment: string;
  customerDesignation: string;
  telOffice: string;
  tellDirect: string;
  mobile1: string;
  mobile2: string;
  emailAddress: string;
  webAddress: string;
  officeLocation: string;
}

const initialState: CustomerFilterState = {
  customerSegment: '',
  customerCategory: '',
  customerSubCategory: '',
  customerType: [],
  customerSubType: [],
  customerBusinessSector: '',
  customerNationality: '',
  customerName: '',
  contactPerson: '',
  customerDepartment: '',
  customerDesignation: '',
  telOffice: '',
  tellDirect: '',
  mobile1: '',
  mobile2: '',
  emailAddress: '',
  webAddress: '',
  officeLocation: '',
};

const customerFilterSlice = createSlice({
  name: 'customerFilter',
  initialState,
  reducers: {
    setCustomerSegment: (state, action: PayloadAction<string>) => {
      state.customerSegment = action.payload;
    },
    setCustomerCategory: (state, action: PayloadAction<string>) => {
      state.customerCategory = action.payload;
    },
    setCustomerSubCategory: (state, action: PayloadAction<string>) => {
      state.customerSubCategory = action.payload;
    },
    setCustomerType: (state, action: PayloadAction<string[]>) => {
      state.customerType = action.payload;
    },
    setCustomerSubType: (state, action: PayloadAction<string[]>) => {
      state.customerSubType = action.payload;
    },
    setCustomerBusinessSector: (state, action: PayloadAction<string>) => {
      state.customerBusinessSector = action.payload;
    },
    setCustomerNationality: (state, action: PayloadAction<string>) => {
      state.customerNationality = action.payload;
    },
    setCustomerName: (state, action: PayloadAction<string>) => {
      state.customerName = action.payload;
    },
    setContactPerson: (state, action: PayloadAction<string>) => {
      state.contactPerson = action.payload;
    },
    setCustomerDepartment: (state, action: PayloadAction<string>) => {
      state.customerDepartment = action.payload;
    },
    setCustomerDesignation: (state, action: PayloadAction<string>) => {
      state.customerDesignation = action.payload;
    },
    setTelOffice: (state, action: PayloadAction<string>) => {
      state.telOffice = action.payload;
    },
    setTellDirect: (state, action: PayloadAction<string>) => {
      state.tellDirect = action.payload;
    },
    setMobile1: (state, action: PayloadAction<string>) => {
      state.mobile1 = action.payload;
    },
    setMobile2: (state, action: PayloadAction<string>) => {
      state.mobile2 = action.payload;
    },
    setEmailAddress: (state, action: PayloadAction<string>) => {
      state.emailAddress = action.payload;
    },
    setWebAddress: (state, action: PayloadAction<string>) => {
      state.webAddress = action.payload;
    },
    setOfficeLocation: (state, action: PayloadAction<string>) => {
      state.officeLocation = action.payload;
    },
    resetCustomerFilters: () => initialState,
  },
});

export const {
  setCustomerSegment,
  setCustomerCategory,
  setCustomerSubCategory,
  setCustomerType,
  setCustomerSubType,
  setCustomerBusinessSector,
  setCustomerNationality,
  setCustomerName,
  setContactPerson,
  setCustomerDepartment,
  setCustomerDesignation,
  setTelOffice,
  setTellDirect,
  setMobile1,
  setMobile2,
  setEmailAddress,
  setWebAddress,
  setOfficeLocation,
  resetCustomerFilters,
} = customerFilterSlice.actions;

export default customerFilterSlice.reducer;
