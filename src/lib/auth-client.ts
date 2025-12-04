/**
 * Client-side authentication utilities
 * Manages JWT tokens in localStorage and provides authenticated fetch wrapper
 */

const TOKEN_KEY = "auth-token";

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: "SUPER_ADMIN" | "CLIENT_ADMIN" | "CLIENT_USER";
  tenantId: number | null;
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Authenticated fetch wrapper that automatically adds Authorization header
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Authenticated fetch with JSON response parsing
 */
export async function authFetchJSON<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authFetch(url, options);

  if (!response.ok) {
    // If unauthorized, clear token and redirect to login
    if (response.status === 401) {
      removeAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/client/login";
      }
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

/**
 * Login user and store token
 */
export async function login(
  email: string,
  password: string,
  isAdmin: boolean = false
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const endpoint = isAdmin
    ? "/api/auth/admin/login"
    : "/api/auth/client/login";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success && data.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Register user and store token
 */
export async function register(
  companyName: string,
  fullName: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const response = await fetch("/api/auth/client/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyName, fullName, email, password }),
  });

  const data = await response.json();

  if (data.success && data.token) {
    setAuthToken(data.token);
  }

  return data;
}

/**
 * Logout user and clear token
 */
export async function logout(): Promise<void> {
  removeAuthToken();

  // Call logout endpoint to clear any server-side sessions
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch (error) {
    // Ignore errors - token is already cleared
  }

  // Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/auth/client/login";
  }
}
