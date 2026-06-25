import { API_URL } from "../constants";
import type { AuthSession, CompletedFeedJob, Job, JobMessage, JobProgressPhoto, JobWorkspace, Offer, PostJobFormData, Review, TechProfileData, TechnicianOffer, TechnicianProfile, TechnicianPublicProfile, User, AppConfig, AdminTechnician, AdminStats } from "../types";
import { ApiError } from "../types";

const FETCH_CREDENTIALS: RequestCredentials = "include";

async function parseError(res: Response): Promise<never> {
  if (res.status === 413) {
    throw new ApiError("Foto terlalu besar. Gunakan gambar di bawah 5 MB.");
  }
  const err = await res.json().catch(() => ({} as { error?: string; details?: Record<string, string> }));
  throw new ApiError(err.error ?? `Request failed (${res.status})`, err.details);
}

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: FETCH_CREDENTIALS,
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  const isJsonBody = options.body && !(options.body instanceof FormData);
  if (isJsonBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: FETCH_CREDENTIALS,
  });

  if (res.status === 401 && !retried && !path.includes("/auth/refresh") && !path.includes("/auth/login")) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, options, true);
    }
  }

  if (!res.ok) await parseError(res);

  return res.json();
}

export const api = {
  register(email: string, password: string, fullName: string, role: "user" | "technician" = "user") {
    return request<AuthSession>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, role }),
    });
  },

  login(email: string, password: string) {
    return request<AuthSession>("/api/auth/login", {
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

  getJobs(params?: { search?: string; area?: string; sort?: string }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.area && params.area !== "Semua area") qs.set("area", params.area);
    if (params?.sort) qs.set("sort", params.sort);
    const q = qs.toString();
    return request<{ jobs: Job[] }>(`/api/jobs${q ? `?${q}` : ""}`);
  },

  getJob(id: string) {
    return request<{ job: Job }>(`/api/jobs/${id}`);
  },

  getMyJobs() {
    return request<{ jobs: Job[] }>("/api/jobs/mine");
  },

  getAssignedJobs() {
    return request<{ jobs: Job[] }>("/api/jobs/assigned");
  },

  getJobWorkspace(jobId: string) {
    return request<{ workspace: JobWorkspace }>(`/api/jobs/${jobId}/workspace`);
  },

  sendJobMessage(jobId: string, body: string) {
    return request<{ message: JobMessage }>(`/api/jobs/${jobId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
  },

  updateJobSchedule(jobId: string, body: { scheduledAt?: string; tanggal?: string }) {
    return request<{ job: Job }>(`/api/jobs/${jobId}/schedule`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  addJobProgressPhoto(jobId: string, url: string, caption?: string) {
    return request<{ photo: JobProgressPhoto }>(`/api/jobs/${jobId}/progress-photos`, {
      method: "POST",
      body: JSON.stringify({ url, caption }),
    });
  },

  completeJob(jobId: string) {
    return request<{ job: Job }>(`/api/jobs/${jobId}/complete`, { method: "POST" });
  },

  getCompletedFeed(tab: string, limit = 12) {
    const qs = new URLSearchParams({ tab, limit: String(limit) });
    return request<{ jobs: CompletedFeedJob[] }>(`/api/jobs/completed/feed?${qs}`);
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

  getTechnicianReviews(technicianId: string, limit = 10) {
    return request<{ reviews: Review[] }>(`/api/reviews/technician/${technicianId}?limit=${limit}`);
  },

  uploadProgressPhoto(jobId: string, fileBase64: string, contentType: string) {
    return request<{ url: string; path: string }>("/api/upload/progress-photo", {
      method: "POST",
      body: JSON.stringify({ jobId, fileBase64, contentType }),
    });
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

  getMyOffers() {
    return request<{ offers: TechnicianOffer[] }>("/api/offers/mine");
  },

  getTechnicianProfile() {
    return request<{ profile: TechnicianProfile | null }>("/api/technicians/profile");
  },

  getTechnicianPublic(id: string) {
    return request<{ technician: TechnicianPublicProfile }>(`/api/technicians/${id}/public`);
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

  getAppConfig() {
    return request<{ config: AppConfig }>("/api/app/config");
  },

  adminMe() {
    return request<{ isAdmin: boolean }>("/api/admin/me");
  },

  adminStats() {
    return request<{ stats: AdminStats }>("/api/admin/stats");
  },

  adminTechnicians(filter: "pending" | "verified" | "unverified" | "all" = "pending") {
    return request<{ technicians: AdminTechnician[] }>(`/api/admin/technicians?filter=${filter}`);
  },

  adminSetVerified(userId: string, verified: boolean, sendEmail = true) {
    return request<{ technician: AdminTechnician; devDashboardLink?: string }>(
      `/api/admin/technicians/${userId}/verified`,
      {
        method: "PATCH",
        body: JSON.stringify({ verified, sendEmail }),
      }
    );
  },

  adminGetSettings() {
    return request<{ settings: AppConfig }>("/api/admin/settings");
  },

  adminUpdateSettings(body: Partial<AppConfig>) {
    return request<{ settings: AppConfig }>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
};
