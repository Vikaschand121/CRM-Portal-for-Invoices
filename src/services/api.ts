import type { ApiError } from '../types';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...restConfig } = config;
    const isFormData = restConfig.body instanceof FormData;

    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };

    if (!isFormData && !defaultHeaders['Content-Type']) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (requiresAuth && this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...restConfig,
        headers: defaultHeaders,
      });

      if (response.status === 401) {
        this.setToken(null);

        if (requiresAuth && typeof window !== 'undefined') {
          const currentPath = window.location?.pathname ?? '';
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }
        }

        throw {
          message: 'Unauthorized',
          status: 401,
        } as ApiError;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error: ApiError = {
          message: errorData.message || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        };
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      headers: {
        ...config?.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const api = new ApiService(API_BASE_URL);
