const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/** True when no real backend is configured — services fall back to local mocks. */
export function isMockMode(): boolean {
  return !BASE_URL;
}

const TOKEN_STORAGE_KEY = "hiringsys.accessToken";
const EMAIL_STORAGE_KEY = "hiringsys.accountEmail";

let authToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
let accountEmail: string | null = localStorage.getItem(EMAIL_STORAGE_KEY);

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/** E-mail of the currently logged-in account, kept only for display/reuse in the UI (e.g. account settings). */
export function setAccountEmail(email: string | null) {
  accountEmail = email;
  if (email) {
    localStorage.setItem(EMAIL_STORAGE_KEY, email);
  } else {
    localStorage.removeItem(EMAIL_STORAGE_KEY);
  }
}

export function getAccountEmail(): string | null {
  return accountEmail;
}

function authHeaders(): HeadersInit {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
}

/** The API's error payloads use `message` (e.g. business-rule 409s) or `mensagem` (import endpoint) depending on the route. */
function extractErrorMessage(body: string): string | undefined {
  if (!body) return undefined;
  try {
    const parsed = JSON.parse(body);
    return parsed?.message ?? parsed?.mensagem ?? undefined;
  } catch {
    return undefined;
  }
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }

  const isFormData = init?.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const message = extractErrorMessage(body) ?? `Request to ${path} failed with status ${response.status}`;
    throw new Error(message);
  }

  return response;
}

/** JSON request/response. Safe for endpoints that reply 200 with an empty body (e.g. deletes). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(path, init);
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** For endpoints that return a binary payload (e.g. file downloads). */
export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await request(path, init);
  return response.blob();
}
