/**
 * API Client - Authenticated fetch wrapper for all API calls
 * Automatically includes Authorization header with Bearer token
 */

import { getAuthToken, removeAuthToken } from "./auth-client";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      removeAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/client/login";
      }
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "GET",
  });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "DELETE",
  });
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(
  url: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}
