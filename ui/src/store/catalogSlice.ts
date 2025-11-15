import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getPharmacyInventory, MedicineItem } from '../services/pharmacyService';

export interface CatalogState {
  items: MedicineItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  items: [],
  loading: false,
  error: null
};

export const fetchInventory = createAsyncThunk('catalog/fetch', async (pharmacyId: string, { rejectWithValue }) => {
  try {
    const response = await getPharmacyInventory(pharmacyId);
    return response;
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    clearCatalog(state) {
      state.items = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchInventory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { clearCatalog } = catalogSlice.actions;
export default catalogSlice.reducer;
