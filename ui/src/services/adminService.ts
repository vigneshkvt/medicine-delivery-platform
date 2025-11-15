import { apiRequest } from './apiClient';
import { Pharmacy } from './pharmacyService';

export interface AdminDashboard {
  totalUsers: number;
  activePharmacies: number;
  pendingPharmacies: number;
  totalOrders: number;
  totalOrderValue: number;
  topPharmacies: Array<{ pharmacyName: string; orders: number; revenue: number }>;
  topMedicines: Array<{ medicineName: string; orders: number; revenue: number }>;
}

export const getAdminDashboard = () =>
  apiRequest<AdminDashboard>({
    path: '/api/admin/dashboard',
    method: 'GET'
  });

export const getPendingPharmacies = () =>
  apiRequest<Pharmacy[]>({
    path: '/api/pharmacies/pending',
    method: 'GET'
  });
