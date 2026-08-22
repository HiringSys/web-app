import { apiFetch } from "./api";

export async function handleLogin(email: string, password: string) {
  try {
    return await apiFetch<number>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return 0;
  }
}

export async function handleChangePassword(email: string, newPassword: string) {
  try {
    return await apiFetch<number>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ email, newPassword }),
    });
  } catch {
    return 0;
  }
}
