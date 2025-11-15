import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getMyOrders, getPharmacyOrders, updateOrderStatus, reviewPrescription, OrderDetail } from '../services/orderService';

export interface OrdersState {
  myOrders: OrderDetail[];
  pharmacyOrders: Record<string, OrderDetail[]>;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  myOrders: [],
  pharmacyOrders: {},
  loading: false,
  error: null
};

export const fetchMyOrders = createAsyncThunk('orders/my', async (_, { rejectWithValue }) => {
  try {
    return await getMyOrders();
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

export const fetchPharmacyOrders = createAsyncThunk(
  'orders/pharmacy',
  async ({ pharmacyId, status }: { pharmacyId: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await getPharmacyOrders(pharmacyId, status);
      return { pharmacyId, orders: response };
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

export const changeOrderStatus = createAsyncThunk(
  'orders/status',
  async (
    { orderId, pharmacyId, status, estimatedDeliveryAtUtc }: { orderId: string; pharmacyId: string; status: string; estimatedDeliveryAtUtc?: string },
    { rejectWithValue }
  ) => {
    try {
      await updateOrderStatus(orderId, pharmacyId, status, estimatedDeliveryAtUtc);
      return { orderId, pharmacyId, status, estimatedDeliveryAtUtc };
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

export const submitPrescriptionReview = createAsyncThunk(
  'orders/prescriptionReview',
  async ({ orderId, pharmacyId, status, notes }: { orderId: string; pharmacyId: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      await reviewPrescription(orderId, pharmacyId, status, notes);
      return { orderId, pharmacyId, status, notes };
    } catch (error) {
      return rejectWithValue('errors.network');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetOrders(state) {
      state.myOrders = [];
      state.pharmacyOrders = {};
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMyOrders.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action: PayloadAction<OrderDetail[]>) => {
        state.loading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(fetchPharmacyOrders.fulfilled, (state, action) => {
        state.pharmacyOrders[action.payload.pharmacyId] = action.payload.orders;
      })
      .addCase(fetchPharmacyOrders.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'errors.unknown';
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        const { pharmacyId, orderId, status, estimatedDeliveryAtUtc } = action.payload;
        const orders = state.pharmacyOrders[pharmacyId];
        if (!orders) {
          return;
        }
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          order.status = status;
          order.estimatedDeliveryAtUtc = estimatedDeliveryAtUtc ?? order.estimatedDeliveryAtUtc;
        }
      })
      .addCase(submitPrescriptionReview.fulfilled, (state, action) => {
        const { pharmacyId, orderId, status } = action.payload;
        const orders = state.pharmacyOrders[pharmacyId];
        if (!orders) {
          return;
        }
        const order = orders.find(o => o.orderId === orderId);
        if (order) {
          order.prescriptionStatus = status;
        }
      });
  }
});

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
