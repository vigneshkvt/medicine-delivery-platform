import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'medify.accessToken';
const REFRESH_TOKEN_KEY = 'medify.refreshToken';
const SESSION_KEY = 'medify.session';

let secureStoreAvailability: Promise<boolean> | null = null;

const isSecureStoreAvailable = async () => {
  if (!secureStoreAvailability) {
    secureStoreAvailability = SecureStore.isAvailableAsync().catch(() => false);
  }

  return (await secureStoreAvailability) ?? false;
};

export interface SessionMetadata {
  role: 'Customer' | 'Pharmacist' | 'Admin';
  preferredLanguage: 'en' | 'ta';
}

export const saveTokens = async (accessToken: string, refreshToken?: string) => {
  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    return;
  }

  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAccessToken = async () => {
  if (await isSecureStoreAvailable()) {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  if (await isSecureStoreAvailable()) {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }

  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const saveSessionMetadata = async (metadata: SessionMetadata) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(metadata));
};

export const getSessionMetadata = async (): Promise<SessionMetadata | null> => {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionMetadata;
  } catch (error) {
    return null;
  }
};

export const clearTokens = async () => {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }

  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const clearSessionMetadata = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};
