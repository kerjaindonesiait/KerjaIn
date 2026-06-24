import { API_URL } from "../constants";
import type { AuthTokens, Job, Offer, PostJobFormData, TechProfileData, User } from "../types";

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      const retry = await fetch(`${API_URL}${path}`, { ...options, headers });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({}));
        throw new Error(err.error ?? "Request failed");
      }
      return retry.json();
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Request failed (${res.status})`);
  }

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

  createJob(data: PostJobFormData) {
    return request<{ job: Job }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(data),
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
};
