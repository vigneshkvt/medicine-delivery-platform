import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getNearbyPharmacies, getManagedPharmacies, Pharmacy } from '../services/pharmacyService';

export interface PharmacyState {
  nearby: Pharmacy[];
  managed: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  loading: boolean;
  error: string | null;
  lastUpdatedAt?: number;
}

const initialState: PharmacyState = {
  nearby: [],
  managed: [],
  selectedPharmacy: null,
  loading: false,
  error: null
};

export const fetchNearbyPharmacies = createAsyncThunk(
  'pharmacy/nearby',
  async (params: { latitude: number; longitude: number; radiusInKm?: number }, { rejectWithValue }) => {
    try {
      const response = await getNearbyPharmacies(params);
      return response;
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

export const fetchManagedPharmacies = createAsyncThunk('pharmacy/managed', async (_, { rejectWithValue }) => {
  try {
    return await getManagedPharmacies();
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    selectPharmacy(state, action: PayloadAction<string>) {
      const pharmacy = state.nearby.find(p => p.id === action.payload) ?? null;
      state.selectedPharmacy = pharmacy;
    },
    clearPharmacies(state) {
      state.nearby = [];
      state.managed = [];
      state.selectedPharmacy = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNearbyPharmacies.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyPharmacies.fulfilled, (state, action) => {
        state.loading = false;
        state.nearby = action.payload;
        state.lastUpdatedAt = Date.now();
      })
      .addCase(fetchNearbyPharmacies.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(fetchManagedPharmacies.fulfilled, (state, action) => {
        state.managed = action.payload;
      })
      .addCase(fetchManagedPharmacies.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { selectPharmacy, clearPharmacies } = pharmacySlice.actions;
export default pharmacySlice.reducer;
