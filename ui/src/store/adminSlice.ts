import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAdminDashboard, getPendingPharmacies, AdminDashboard } from '../services/adminService';
import type { Pharmacy } from '../services/pharmacyService';

export interface AdminState {
  dashboard: AdminDashboard | null;
  pendingPharmacies: Pharmacy[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  dashboard: null,
  pendingPharmacies: [],
  loading: false,
  error: null
};

export const fetchAdminDashboard = createAsyncThunk('admin/dashboard', async (_, { rejectWithValue }) => {
  try {
    return await getAdminDashboard();
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

export const fetchPendingPharmacies = createAsyncThunk('admin/pendingPharmacies', async (_, { rejectWithValue }) => {
  try {
    return await getPendingPharmacies();
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdmin(state) {
      state.dashboard = null;
      state.pendingPharmacies = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAdminDashboard.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload as AdminDashboard;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(fetchPendingPharmacies.fulfilled, (state, action) => {
        state.pendingPharmacies = action.payload as Pharmacy[];
      })
      .addCase(fetchPendingPharmacies.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;
