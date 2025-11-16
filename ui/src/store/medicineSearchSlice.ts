import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { MedicineSearchResult, searchMedicines } from '../services/medicineCatalogService';

export interface MedicineSearchState {
  query: string;
  results: MedicineSearchResult[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicineSearchState = {
  query: '',
  results: [],
  loading: false,
  error: null
};

export const performMedicineSearch = createAsyncThunk(
  'medicineSearch/search',
  async (term: string, { rejectWithValue }) => {
    try {
      const response = await searchMedicines(term);
      return { term, results: response };
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

const medicineSearchSlice = createSlice({
  name: 'medicineSearch',
  initialState,
  reducers: {
    clearSearch(state) {
      state.query = '';
      state.results = [];
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(performMedicineSearch.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.query = action.meta.arg;
      })
      .addCase(performMedicineSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.query = action.payload.term;
      })
      .addCase(performMedicineSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { clearSearch } = medicineSearchSlice.actions;
export default medicineSearchSlice.reducer;
