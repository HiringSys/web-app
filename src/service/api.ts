const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
