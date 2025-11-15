import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as AuthService from '../services/authService';
import { clearTokens, clearSessionMetadata } from '../utils/storage';
import i18n from '../localization';

export interface AuthState {
  token: string | null;
  role: 'Customer' | 'Pharmacist' | 'Admin' | null;
  preferredLanguage: 'en' | 'ta';
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  role: null,
  preferredLanguage: 'en',
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk('auth/login', async (payload: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await AuthService.login(payload);
    i18n.changeLanguage(response.preferredLanguage).catch(() => undefined);
    return response;
  } catch (error) {
    return rejectWithValue('auth.invalidCredentials');
  }
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: { email: string; password: string; firstName: string; lastName: string; preferredLanguage: 'en' | 'ta' }, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(payload);
      i18n.changeLanguage(response.preferredLanguage).catch(() => undefined);
      return response;
    } catch (error) {
      return rejectWithValue('auth.registrationFailed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<{ token: string; role: 'Customer' | 'Pharmacist' | 'Admin'; preferredLanguage: 'en' | 'ta' }>) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.preferredLanguage = action.payload.preferredLanguage;
    },
    logout(state) {
      state.token = null;
      state.role = null;
      state.error = null;
      state.preferredLanguage = 'en';
      clearTokens().catch(() => undefined);
      clearSessionMetadata().catch(() => undefined);
    }
  },
  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.preferredLanguage = action.payload.preferredLanguage;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.preferredLanguage = action.payload.preferredLanguage;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { logout, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
