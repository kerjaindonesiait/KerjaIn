import { API_URL } from "../constants";
import type {
  AppSettings,
  AdminTechnician,
  AdminUser,
  Job,
  LoginResponse,
  MineOffer,
  Offer,
  PostJobFormData,
  RegisterResponse,
  Review,
  TechnicianPublic,
  TechProfileData,
  User,
} from "../types";

const LEGACY_ACCESS_KEY = "kerjain_access";
const LEGACY_REFRESH_KEY = "kerjain_refresh";

/** Remove tokens from the old localStorage auth model. */
export function clearLegacyTokens() {
  localStorage.removeItem(LEGACY_ACCESS_KEY);
  localStorage.removeItem(LEGACY_REFRESH_KEY);
}

async function parseError(res: Response): Promise<string> {
  const err = await res.json().catch(() => ({}));
  return (err as { error?: string }).error ?? `Request failed (${res.status})`;
}

async function request<T>(path: string, options: RequestInit = {}, retryOn401 = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && retryOn401 && path !== "/api/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retry = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
      if (!retry.ok) throw new Error(await parseError(retry));
      return retry.json();
    }
  }

  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const api = {
  register(email: string, password: string, fullName: string, role: "user" | "technician" = "user") {
    return request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, role }),
    }, false);
  },

  login(email: string, password: string) {
    return request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false);
  },

  me() {
    return request<{ user: User }>("/api/auth/me");
  },

  logout() {
    return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }, false);
  },

  oauthAuthUrl(provider: "google" | "facebook", opts?: { role?: "user" | "technician"; next?: string }) {
    const params = new URLSearchParams();
    if (opts?.role === "technician") params.set("role", "technician");
    if (opts?.next) params.set("next", opts.next);
    const qs = params.toString();
    return `${API_URL}/auth/${provider}${qs ? `?${qs}` : ""}`;
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

  getAssignedJobs(params?: { status?: string }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    const q = qs.toString();
    return request<{ jobs: Job[] }>(`/api/jobs/assigned${q ? `?${q}` : ""}`);
  },

  cancelJob(id: string) {
    return request<{ job: Job }>(`/api/jobs/${id}/cancel`, { method: "POST" });
  },

  completeJob(id: string) {
    return request<{ job: Job }>(`/api/jobs/${id}/complete`, { method: "POST" });
  },

  getOffersMine() {
    return request<{ offers: MineOffer[] }>("/api/offers/mine");
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

  uploadKtpDocument(fileBase64: string, contentType: string, kind: "ktp" | "selfie") {
    return request<{ path: string; previewUrl: string | null }>("/api/upload/ktp-document", {
      method: "POST",
      body: JSON.stringify({ fileBase64, contentType, kind }),
    });
  },

  deleteKtpDocument(path: string) {
    return request<{ ok: boolean }>("/api/upload/ktp-document", {
      method: "DELETE",
      body: JSON.stringify({ path }),
    });
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

  forgotPassword(email: string) {
    return request<{ ok: boolean; message: string; devResetLink?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false);
  },

  resetPassword(token: string, password: string) {
    return request<{ ok: boolean }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }, false);
  },

  verifyEmail(token: string) {
    return request<{ ok: boolean; user: User | null }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }, false);
  },

  resendVerification() {
    return request<{ ok: boolean; devVerifyLink?: string }>("/api/auth/resend-verification", {
      method: "POST",
    });
  },

  resendVerificationEmail(email: string) {
    return request<{ ok: boolean; message: string; devVerifyLink?: string }>("/api/auth/resend-verification-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false);
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

  getTechnicianPublic(id: string) {
    return request<{ technician: TechnicianPublic }>(`/api/technicians/${id}/public`);
  },

  getTechnicianReviews(id: string, limit = 10) {
    return request<{ reviews: Review[] }>(`/api/reviews/technician/${id}?limit=${limit}`);
  },

  getJobReview(jobId: string) {
    return request<{ review: Review | null }>(`/api/reviews/job/${jobId}`);
  },

  submitReview(jobId: string, body: { rating: number; comment?: string }) {
    return request<{ review: Review }>(`/api/reviews/job/${jobId}`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getAppConfig() {
    return request<{ config: AppSettings }>("/api/app/config");
  },

  adminMe() {
    return request<{ isAdmin: boolean }>("/api/admin/me");
  },

  adminStats() {
    return request<{
      stats: {
        pendingVerification: number;
        verifiedTechnicians: number;
        totalTechnicians: number;
        openJobs: number;
        pendingEmailVerification: number;
      };
    }>("/api/admin/stats");
  },

  adminTechnicians(filter: "pending" | "verified" | "unverified" | "all" = "pending") {
    return request<{ technicians: AdminTechnician[] }>(`/api/admin/technicians?filter=${filter}`);
  },

  adminUsers(filter: "unverified_email" | "all" = "unverified_email") {
    return request<{ users: AdminUser[] }>(`/api/admin/users?filter=${filter}`);
  },

  adminVerifyUserEmail(userId: string, verified = true) {
    return request<{ user: AdminUser }>(`/api/admin/users/${userId}/email-verified`, {
      method: "PATCH",
      body: JSON.stringify({ verified }),
    });
  },

  adminVerifyTechnician(userId: string, verified: boolean) {
    return request<{ technician: AdminTechnician; devDashboardLink?: string }>(
      `/api/admin/technicians/${userId}/verified`,
      { method: "PATCH", body: JSON.stringify({ verified }) },
    );
  },

  adminGetSettings() {
    return request<{ settings: AppSettings }>("/api/admin/settings");
  },

  adminUpdateSettings(patch: Partial<AppSettings>) {
    return request<{ settings: AppSettings }>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
};
