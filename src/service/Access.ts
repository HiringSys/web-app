import { apiFetch, setAuthToken } from "./api";
import type { LoginRequest, LoginResponse } from "./api/models";

/**
 * The API models identity as `username`, but the login UI only ever collects
 * an e-mail — passed through as-is here.
 */
export async function handleLogin(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: email, password } satisfies LoginRequest),
    });
    setAuthToken(response.accessToken);
    return response;
  } catch {
    return null;
  }
}

export function handleLogout() {
  setAuthToken(null);
}

// The API has no password-recovery endpoint yet (see .sdd/swagger/gaps.md).
export async function handleChangePassword(_email: string, _newPassword: string) {
  return 0;
}
