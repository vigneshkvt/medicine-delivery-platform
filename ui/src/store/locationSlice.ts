import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Coordinates, getCurrentLocation } from '../services/locationService';

type PermissionStatus = 'unknown' | 'granted' | 'denied';

export interface LocationState {
  permission: PermissionStatus;
  currentLocation: Coordinates | null;
  selectedLocation: {
    label: string;
    latitude: number;
    longitude: number;
  } | null;
  loading: boolean;
  error: string | null;
  hasOnboarded: boolean;
}

const initialState: LocationState = {
  permission: 'unknown',
  currentLocation: null,
  selectedLocation: null,
  loading: false,
  error: null,
  hasOnboarded: false
};

export const resolveCurrentLocation = createAsyncThunk('location/current', async (_, { rejectWithValue }) => {
  try {
    const coords = await getCurrentLocation();
    if (!coords) {
      return rejectWithValue('onboarding.permissionDenied');
    }
    return coords;
  } catch (error) {
    return rejectWithValue('onboarding.unavailable');
  }
});

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setPermission(state, action: PayloadAction<PermissionStatus>) {
      state.permission = action.payload;
    },
    setManualLocation(state, action: PayloadAction<{ label: string; latitude: number; longitude: number }>) {
      state.selectedLocation = action.payload;
      state.permission = 'granted';
      state.hasOnboarded = true;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(resolveCurrentLocation.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveCurrentLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.permission = 'granted';
        state.currentLocation = action.payload as Coordinates;
        state.selectedLocation = {
          label: 'Current location',
          latitude: action.payload.latitude,
          longitude: action.payload.longitude
        };
        state.hasOnboarded = true;
      })
      .addCase(resolveCurrentLocation.rejected, (state, action) => {
        state.loading = false;
        state.permission = 'denied';
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { setPermission, setManualLocation } = locationSlice.actions;
export default locationSlice.reducer;
