import { Platform } from 'react-native';
import { getAccessToken, clearTokens } from '../utils/storage';

const DEFAULT_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5005' : 'http://127.0.0.1:5005';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  path: string;
  method?: HttpMethod;
  includeAuth?: boolean;
  body?: BodyInit | Record<string, unknown> | FormData;
}

export class ApiClientError extends Error {
  constructor(message: string, public readonly status: number, public readonly response?: unknown) {
    super(message);
  }
}

export const apiRequest = async <T>({ path, method = 'GET', includeAuth = true, headers, body, ...rest }: RequestOptions): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('API request', method, url);
  }
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        finalHeaders[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        finalHeaders[key] = value;
      });
    } else {
      Object.assign(finalHeaders, headers as Record<string, string>);
    }
  }

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    delete finalHeaders['Content-Type'];
    payload = body;
  } else if (typeof body === 'string' || body === undefined) {
    payload = body as BodyInit | undefined;
  } else if (body) {
    payload = JSON.stringify(body);
  }

  if (includeAuth) {
    const token = await getAccessToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: payload,
    ...rest
  });

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => undefined);

  if (!response.ok) {
    if (response.status === 401) {
      await clearTokens();
    }
    throw new ApiClientError('REQUEST_FAILED', response.status, data);
  }

  return data as T;
};
