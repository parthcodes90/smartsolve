import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";

const DEFAULT_TIMEOUT_MS = 15000;
export const UPLOAD_TIMEOUT_MS = 60000;
const MAX_RETRIES = 3;

const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!baseURL) {
  console.warn("[api] EXPO_PUBLIC_API_BASE_URL is not set.");
}

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  raw?: unknown;

  constructor(message: string, options: { status?: number; code?: string; raw?: unknown } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.raw = options.raw;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isNetworkError = (error: AxiosError): boolean => {
  return !error.response && (!!error.code || error.message.toLowerCase().includes("network"));
};

const getNormalizedMessage = (error: AxiosError<ApiResponse<unknown>>): string => {
  const status = error.response?.status;
  const backendMessage = error.response?.data?.error;

  if (backendMessage) return backendMessage;
  if (!status || isNetworkError(error)) return "Network error. Please check your connection and try again.";
  if (status >= 500) return "Something went wrong, try again";
  if (status >= 400) return error.message || "Request failed";

  return "Unexpected error";
};

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const nextConfig = { ...config };
  if (nextConfig.data instanceof FormData) {
    nextConfig.timeout = UPLOAD_TIMEOUT_MS;
  } else {
    nextConfig.timeout = nextConfig.timeout ?? DEFAULT_TIMEOUT_MS;
  }
  return nextConfig;
});

api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const config = error.config as (InternalAxiosRequestConfig & { __retryCount?: number }) | undefined;

    if (config && isNetworkError(error)) {
      config.__retryCount = config.__retryCount ?? 0;

      if (config.__retryCount < MAX_RETRIES) {
        config.__retryCount += 1;
        const delay = 500 * (2 ** (config.__retryCount - 1));
        await sleep(delay);
        return api.request(config);
      }
    }

    throw new ApiClientError(getNormalizedMessage(error), {
      status: error.response?.status,
      code: error.code,
      raw: error.response?.data ?? error,
    });
  }
);

export default api;
