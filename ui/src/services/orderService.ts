import { apiRequest } from './apiClient';

export interface OrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  requiresPrescription: boolean;
}

export interface OrderDetail {
  orderId: string;
  orderNumber: string;
  pharmacyId: string;
  pharmacyName: string;
  customerId: string;
  customerEmail: string;
  deliveryLine1: string;
  deliveryLine2?: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAtUtc: string;
  estimatedDeliveryAtUtc?: string | null;
  items: OrderItem[];
  prescriptionFileName?: string | null;
  prescriptionStatus?: string | null;
}

export interface CreateOrderItemInput {
  medicineId: string;
  quantity: number;
}

export interface CreateOrderInput {
  pharmacyId: string;
  deliveryLine1: string;
  deliveryLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  items: CreateOrderItemInput[];
  paymentMethod: 'CashOnDelivery' | 'Online';
  prescription?: { uri: string; name: string; type: string } | null;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
}

export const getMyOrders = () =>
  apiRequest<OrderDetail[]>({
    path: '/api/orders/my',
    method: 'GET'
  });

export const getPharmacyOrders = (pharmacyId: string, status?: string) => {
  const statusQuery = status ? `&status=${encodeURIComponent(status)}` : '';
  return apiRequest<OrderDetail[]>({
    path: `/api/orders/pharmacy/${pharmacyId}?pharmacyId=${pharmacyId}${statusQuery}`,
    method: 'GET'
  });
};

export const createOrder = async (input: CreateOrderInput) => {
  const formData = new FormData();
  formData.append('PharmacyId', input.pharmacyId);
  formData.append('DeliveryLine1', input.deliveryLine1);
  if (input.deliveryLine2) {
    formData.append('DeliveryLine2', input.deliveryLine2);
  }
  formData.append('City', input.city);
  formData.append('State', input.state);
  formData.append('Country', input.country);
  formData.append('PostalCode', input.postalCode);
  formData.append('Latitude', String(input.latitude));
  formData.append('Longitude', String(input.longitude));
  formData.append('PaymentMethod', input.paymentMethod);

  input.items.forEach((item, index) => {
    formData.append(`Items[${index}].MedicineId`, item.medicineId);
    formData.append(`Items[${index}].Quantity`, String(item.quantity));
  });

  if (input.prescription) {
    formData.append('Prescription', {
      uri: input.prescription.uri,
      name: input.prescription.name,
      type: input.prescription.type
    } as unknown as Blob);
  }

  return apiRequest<CreateOrderResponse>({
    path: '/api/orders',
    method: 'POST',
    body: formData
  });
};

export const updateOrderStatus = (orderId: string, pharmacyId: string, status: string, estimatedDeliveryAtUtc?: string) =>
  apiRequest<void>({
    path: `/api/orders/${orderId}/status?pharmacyId=${pharmacyId}`,
    method: 'PATCH',
    body: {
      status,
      estimatedDeliveryAtUtc
    }
  });

export const reviewPrescription = (orderId: string, pharmacyId: string, status: string, notes?: string) =>
  apiRequest<void>({
    path: `/api/orders/${orderId}/prescription/review?pharmacyId=${pharmacyId}`,
    method: 'POST',
    body: {
      status,
      notes
    }
  });
