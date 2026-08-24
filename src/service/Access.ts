import { apiFetch, isMockMode, setAuthToken, setAccountEmail } from "./api";
import type { LoginRequest, LoginResponse, RecuperacaoSenhaRequest, RecuperacaoSenhaResponse } from "./api/models";

export async function handleLogin(email: string, password: string): Promise<LoginResponse | null> {
  try {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password } satisfies LoginRequest),
    });
    setAuthToken(response.accessToken);
    setAccountEmail(email);
    return response;
  } catch {
    if (isMockMode()) {
      const response: LoginResponse = { accessToken: "mock-token" };
      setAuthToken(response.accessToken);
      setAccountEmail(email);
      return response;
    }
    return null;
  }
}

export function handleLogout() {
  setAuthToken(null);
  setAccountEmail(null);
}

export async function handleRecoverPassword(email: string): Promise<boolean> {
  try {
    await apiFetch<RecuperacaoSenhaResponse>("/auth/password-recovery", {
      method: "POST",
      body: JSON.stringify({ email } satisfies RecuperacaoSenhaRequest),
    });
    return true;
  } catch {
    return false;
  }
}
