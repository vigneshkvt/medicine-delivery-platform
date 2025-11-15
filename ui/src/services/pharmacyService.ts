import { apiRequest } from './apiClient';

export interface Pharmacy {
  id: string;
  name: string;
  description: string;
  contactNumber: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryAvailable: boolean;
  openingTime: string;
  closingTime: string;
  rating: number;
  reviewCount: number;
}

export interface MedicineItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  stockQuantity: number;
  requiresPrescription: boolean;
  expiryDateUtc?: string | null;
}

interface NearbyParams {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
}

export const getNearbyPharmacies = (params: NearbyParams) =>
  apiRequest<Pharmacy[]>({
    path: `/api/pharmacies/nearby?latitude=${params.latitude}&longitude=${params.longitude}&radiusInKm=${params.radiusInKm ?? 5}`,
    method: 'GET',
    includeAuth: false
  });

export const getPharmacyInventory = (pharmacyId: string) =>
  apiRequest<MedicineItem[]>({
    path: `/api/pharmacies/${pharmacyId}/inventory`,
    method: 'GET',
    includeAuth: false
  });

export const getManagedPharmacies = () =>
  apiRequest<Pharmacy[]>({
    path: '/api/pharmacies/mine',
    method: 'GET'
  });

export const getPendingPharmacies = () =>
  apiRequest<Pharmacy[]>({
    path: '/api/pharmacies/pending',
    method: 'GET'
  });

export interface OnboardPayload {
  tenantName: string;
  legalName: string;
  taxRegistrationNumber: string;
  pharmacyName: string;
  description?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  contactNumber: string;
  email: string;
}

export const onboardPharmacy = (payload: OnboardPayload) =>
  apiRequest<Pharmacy>({
    path: '/api/pharmacies/onboard',
    method: 'POST',
    body: payload as unknown as Record<string, unknown>
  });

export const approvePharmacy = (pharmacyId: string) =>
  apiRequest<void>({
    path: `/api/pharmacies/${pharmacyId}/approve`,
    method: 'POST'
  });
