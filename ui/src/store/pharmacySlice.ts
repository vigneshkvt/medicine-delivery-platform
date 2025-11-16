import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getNearbyPharmacies, getManagedPharmacies, onboardPharmacy, OnboardPayload, Pharmacy } from '../services/pharmacyService';

export interface PharmacyState {
  nearby: Pharmacy[];
  managed: Pharmacy[];
  selectedPharmacy: Pharmacy | null;
  loading: boolean;
  error: string | null;
  lastUpdatedAt?: number;
  managedLoading: boolean;
  hasLoadedManaged: boolean;
  onboarding: {
    submitting: boolean;
    error: string | null;
    lastPharmacyId?: string;
  };
}

const initialState: PharmacyState = {
  nearby: [],
  managed: [],
  selectedPharmacy: null,
  loading: false,
  error: null,
  managedLoading: false,
  hasLoadedManaged: false,
  onboarding: {
    submitting: false,
    error: null
  }
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

interface FetchManagedPharmaciesArgs {
  force?: boolean;
}

export const fetchManagedPharmacies = createAsyncThunk<Pharmacy[], FetchManagedPharmaciesArgs | undefined>(
  'pharmacy/managed',
  async (_, { rejectWithValue }) => {
    try {
      return await getManagedPharmacies();
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  },
  {
    condition: (args, { getState }) => {
      const force = args?.force ?? false;
      if (force) {
        return true;
      }

      const state = getState() as { pharmacy: PharmacyState };
      if (state.pharmacy.managedLoading) {
        return false;
      }

      return !state.pharmacy.hasLoadedManaged;
    }
  }
);

export const submitPharmacyProfile = createAsyncThunk(
  'pharmacy/onboard',
  async (payload: OnboardPayload, { rejectWithValue }) => {
    try {
      const response = await onboardPharmacy(payload);
      return response;
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    selectPharmacy(state, action: PayloadAction<string>) {
      const pharmacy = state.nearby.find(p => p.id === action.payload)
        ?? state.managed.find(p => p.id === action.payload)
        ?? null;
      state.selectedPharmacy = pharmacy;
    },
    clearPharmacies(state) {
      state.nearby = [];
      state.managed = [];
      state.selectedPharmacy = null;
      state.hasLoadedManaged = false;
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
        state.managedLoading = false;
        state.managed = action.payload;
        state.hasLoadedManaged = true;
      })
      .addCase(fetchManagedPharmacies.rejected, (state, action) => {
        state.managedLoading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(fetchManagedPharmacies.pending, state => {
        state.managedLoading = true;
        state.error = null;
      })
      .addCase(submitPharmacyProfile.pending, state => {
        state.onboarding.submitting = true;
        state.onboarding.error = null;
      })
      .addCase(submitPharmacyProfile.fulfilled, (state, action) => {
        state.onboarding.submitting = false;
        state.onboarding.lastPharmacyId = action.payload.id;
        state.managed = [...state.managed.filter(p => p.id !== action.payload.id), action.payload];
        state.selectedPharmacy = action.payload;
        state.hasLoadedManaged = true;
      })
      .addCase(submitPharmacyProfile.rejected, (state, action) => {
        state.onboarding.submitting = false;
        state.onboarding.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { selectPharmacy, clearPharmacies } = pharmacySlice.actions;
export default pharmacySlice.reducer;
