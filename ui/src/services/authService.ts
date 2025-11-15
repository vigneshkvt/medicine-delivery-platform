import { apiRequest } from './apiClient';
import { saveTokens, saveSessionMetadata } from '../utils/storage';

export interface AuthResponse {
  token: string;
  role: 'Customer' | 'Pharmacist' | 'Admin';
  preferredLanguage: 'en' | 'ta';
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredLanguage: 'en' | 'ta';
}

export const login = async (payload: LoginPayload) => {
  const response = await apiRequest<AuthResponse>({
    path: '/api/auth/login',
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
    includeAuth: false
  });

  await saveTokens(response.token);
  await saveSessionMetadata({ role: response.role, preferredLanguage: response.preferredLanguage });
  return response;
};

export const register = async (payload: RegisterPayload) => {
  const response = await apiRequest<AuthResponse>({
    path: '/api/auth/register',
    method: 'POST',
    body: payload as unknown as Record<string, unknown>,
    includeAuth: false
  });

  await saveTokens(response.token);
  await saveSessionMetadata({ role: response.role, preferredLanguage: response.preferredLanguage });
  return response;
};
