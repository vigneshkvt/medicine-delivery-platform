import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import locationReducer from './locationSlice';
import pharmacyReducer from './pharmacySlice';
import catalogReducer from './catalogSlice';
import cartReducer from './cartSlice';
import ordersReducer from './ordersSlice';
import adminReducer from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    location: locationReducer,
    pharmacy: pharmacyReducer,
    catalog: catalogReducer,
    cart: cartReducer,
    orders: ordersReducer,
    admin: adminReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
