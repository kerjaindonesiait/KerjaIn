import { API_URL } from "../constants";
import type { AuthTokens, Job, Offer, PostJobFormData, TechProfileData, User } from "../types";
import { ApiError } from "../types";

const TOKEN_KEY = "kerjain_access";
const REFRESH_KEY = "kerjain_refresh";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function parseError(res: Response): Promise<never> {
  if (res.status === 413) {
    throw new ApiError("Foto terlalu besar. Gunakan gambar di bawah 5 MB.");
  }
  const err = await res.json().catch(() => ({} as { error?: string; details?: Record<string, string> }));
  throw new ApiError(err.error ?? `Request failed (${res.status})`, err.details);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const isJsonBody = options.body && !(options.body instanceof FormData);
  if (isJsonBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      const retry = await fetch(`${API_URL}${path}`, { ...options, headers });
      if (!retry.ok) await parseError(retry);
      return retry.json();
    }
  }

  if (!res.ok) await parseError(res);

  return res.json();
}

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    setTokens(data.accessToken, refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export const api = {
  register(email: string, password: string, fullName: string, role: "user" | "technician" = "user") {
    return request<AuthTokens>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, role }),
    });
  },

  login(email: string, password: string) {
    return request<AuthTokens>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<{ user: User }>("/api/auth/me");
  },

  logout() {
    return request<{ ok: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });
  },

  googleAuthUrl() {
    return `${API_URL}/auth/google`;
  },

  facebookAuthUrl() {
    return `${API_URL}/auth/facebook`;
  },

  oauthAuthUrl(provider: "google" | "facebook", opts?: { role?: "user" | "technician" }) {
    const qs = opts?.role === "technician" ? "?role=technician" : "";
    return `${API_URL}/auth/${provider}${qs}`;
  },

  getJobs(params?: { search?: string; area?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.area) qs.set("area", params.area);
    const q = qs.toString();
    return request<{ jobs: Job[] }>(`/api/jobs${q ? `?${q}` : ""}`);
  },

  getJob(id: string) {
    return request<{ job: Job }>(`/api/jobs/${id}`);
  },

  getMyJobs() {
    return request<{ jobs: Job[] }>("/api/jobs/mine");
  },

  cancelJob(id: string) {
    return request<{ job: Job }>(`/api/jobs/${id}/cancel`, { method: "POST" });
  },

  createJob(data: PostJobFormData) {
    return request<{ job: Job }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  uploadJobPhoto(fileBase64: string, contentType: string) {
    return request<{ url: string; path: string }>("/api/upload/job-photo", {
      method: "POST",
      body: JSON.stringify({ fileBase64, contentType }),
    });
  },

  deleteJobPhoto(path: string) {
    return request<{ ok: boolean }>("/api/upload/job-photo", {
      method: "DELETE",
      body: JSON.stringify({ path }),
    });
  },

  getOffers(jobId: string) {
    return request<{ offers: Offer[] }>(`/api/offers/job/${jobId}`);
  },

  createOffer(jobId: string, body: { price: number; message?: string; availability?: string; scheduledTime?: string }) {
    return request<{ offer: Offer }>(`/api/offers/job/${jobId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  acceptOffer(offerId: string) {
    return request<{ offer: Offer; jobId: string }>(`/api/offers/${offerId}/accept`, { method: "POST" });
  },

  saveTechnicianProfile(data: TechProfileData) {
    return request("/api/technicians/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  createPayment(body: { jobId: string; offerId: string; method: string }) {
    return request("/api/payments", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  confirmPayment(paymentId: string) {
    return request(`/api/payments/${paymentId}/confirm`, { method: "POST" });
  },

  forgotPassword(email: string) {
    return request<{ ok: boolean; message: string; devResetLink?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword(token: string, password: string) {
    return request<{ ok: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  verifyEmail(token: string) {
    return request<{ ok: boolean; user: User | null }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  },

  resendVerification() {
    return request<{ ok: boolean; devVerifyLink?: string }>("/api/auth/resend-verification", {
      method: "POST",
    });
  },

  updateProfile(body: { fullName?: string; avatarUrl?: string; phone?: string }) {
    return request<{ user: User }>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  changePassword(currentPassword: string, newPassword: string) {
    return request<{ ok: boolean }>("/api/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
