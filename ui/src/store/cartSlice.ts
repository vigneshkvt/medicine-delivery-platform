import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { formatCurrency } from '../utils/formatters';
import { createOrder, CreateOrderInput, CreateOrderResponse } from '../services/orderService';

export interface CartItem {
  medicineId: string;
  name: string;
  price: number;
  currency: string;
  requiresPrescription: boolean;
  quantity: number;
}

export interface PrescriptionAttachment {
  uri: string;
  name: string;
  type: string;
}

export interface CartState {
  items: CartItem[];
  pharmacyId: string | null;
  prescription: PrescriptionAttachment | null;
  paymentMethod: 'CashOnDelivery' | 'Online';
  placingOrder: boolean;
  error: string | null;
  lastOrder?: CreateOrderResponse;
}

const initialState: CartState = {
  items: [],
  pharmacyId: null,
  prescription: null,
  paymentMethod: 'CashOnDelivery',
  placingOrder: false,
  error: null
};

export interface CheckoutPayload {
  pharmacyId: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export const placeOrder = createAsyncThunk('cart/placeOrder', async ({ pharmacyId, deliveryLine1, deliveryLine2, city, state, country, postalCode, latitude, longitude }: CheckoutPayload, { getState, rejectWithValue }) => {
  const rootState = getState() as { cart: CartState };
  const { items, paymentMethod, prescription } = rootState.cart;

  if (items.length === 0) {
    return rejectWithValue('cart.empty');
  }

  const payload: CreateOrderInput = {
    pharmacyId,
    deliveryLine1,
    deliveryLine2,
    city,
    state,
    country,
    postalCode,
    latitude,
    longitude,
    paymentMethod,
    items: items.map((item: CartItem) => ({ medicineId: item.medicineId, quantity: item.quantity })),
    prescription
  };

  try {
    return await createOrder(payload);
  } catch (error) {
    return rejectWithValue('errors.network');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setPharmacy(state, action: PayloadAction<string>) {
      if (state.pharmacyId && state.pharmacyId !== action.payload) {
        state.items = [];
        state.prescription = null;
      }
      state.pharmacyId = action.payload;
    },
    addItem(state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) {
      const existing = state.items.find(item => item.medicineId === action.payload.medicineId);
      if (existing) {
        existing.quantity += action.payload.quantity ?? 1;
      } else {
        state.items.push({
          medicineId: action.payload.medicineId,
          name: action.payload.name,
          price: action.payload.price,
          currency: action.payload.currency,
          requiresPrescription: action.payload.requiresPrescription,
          quantity: action.payload.quantity ?? 1
        });
      }
    },
    updateQuantity(state, action: PayloadAction<{ medicineId: string; quantity: number }>) {
      const item = state.items.find(i => i.medicineId === action.payload.medicineId);
      if (item) {
        item.quantity = action.payload.quantity;
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.medicineId !== action.payload.medicineId);
        }
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.medicineId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
      state.prescription = null;
      state.lastOrder = undefined;
    },
    setPrescription(state, action: PayloadAction<PrescriptionAttachment | null>) {
      state.prescription = action.payload;
    },
    setPaymentMethod(state, action: PayloadAction<'CashOnDelivery' | 'Online'>) {
      state.paymentMethod = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(placeOrder.pending, state => {
        state.placingOrder = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.placingOrder = false;
        state.lastOrder = action.payload as CreateOrderResponse;
        state.items = [];
        state.prescription = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placingOrder = false;
        state.error = (action.payload as string) ?? 'errors.unknown';
      });
  }
});

export const { setPharmacy, addItem, updateQuantity, removeItem, clearCart, setPrescription, setPaymentMethod } = cartSlice.actions;
export const calculateTotals = (state: CartState) => {
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = subtotal > 0 ? 20 : 0;
  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
    formattedSubtotal: formatCurrency(subtotal),
    formattedDelivery: formatCurrency(delivery),
    formattedTotal: formatCurrency(subtotal + delivery)
  };
};
export default cartSlice.reducer;
