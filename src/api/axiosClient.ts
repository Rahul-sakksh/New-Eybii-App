import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import {API_BASE_URL} from './endpoints';

// ----------- Token Storage (replace with SecureStore / MMKV if needed) -----------
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => authToken;

// ----------- Axios Instance -----------
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ----------- Request Interceptor (attach auth token) -----------
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  error => {
    console.error('[Axios] Request Error:', error);
    return Promise.reject(error);
  },
);

// ----------- Response Interceptor (global error handling) -----------
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async error => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized — token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: Implement token refresh logic here
      // Example:
      // const newToken = await refreshAuthToken();
      // setAuthToken(newToken);
      // return axiosClient(originalRequest);

      console.warn('[Axios] Unauthorized — token may have expired.');
    }

    // Network error
    if (!error.response) {
      console.error('[Axios] Network Error — no response received');
    } else {
      console.error(
        `[Axios] Error ${error.response.status}:`,
        error.response.data,
      );
    }

    return Promise.reject(error);
  },
);

// ----------- Helper Methods -----------

/** GET request */
export const apiGet = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => axiosClient.get<T>(url, config);

/** POST request */
export const apiPost = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => axiosClient.post<T>(url, data, config);

/** PUT request */
export const apiPut = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => axiosClient.put<T>(url, data, config);

/** PATCH request */
export const apiPatch = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => axiosClient.patch<T>(url, data, config);

/** DELETE request */
export const apiDelete = <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosResponse<T>> => axiosClient.delete<T>(url, config);

export default axiosClient;
