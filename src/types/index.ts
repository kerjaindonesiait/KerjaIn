export type UserRole = "user" | "technician";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
  phone?: string | null;
  createdAt: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  category: string;
  title: string;
  description: string;
  photos: string[];
  area: string;
  alamat?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  lokasiType: string;
  waktuType: string;
  tanggal?: string | null;
  budgetType: string;
  budgetRaw?: number | null;
  price: string;
  status: string;
  urgency?: string | null;
  offers: number | null;
  ownerId?: string;
  isOwner?: boolean;
  remote: boolean;
  flexible: boolean;
  date?: string | null;
  time?: string | null;
  initials?: string;
  poster?: {
    name: string;
    initials: string;
    color: string;
    rating: number;
    reviews: number;
    memberSince: string;
    completionRate: number;
  } | null;
  createdAt: string;
}

export interface Offer {
  id: string;
  jobId: string;
  technicianId: string;
  price: number;
  priceFormatted: string;
  message?: string | null;
  availability: string;
  scheduledTime?: string | null;
  status: string;
  technicianName: string;
  createdAt: string;
}

/** Raw shape from GET /api/offers/mine (nested job from DB). */
export interface MineOffer {
  id: string;
  job_id: string;
  technician_id: string;
  price: number;
  message?: string | null;
  availability: string;
  scheduled_time?: string | null;
  status: string;
  created_at: string;
  job?: Job | Record<string, unknown> | null;
}

export interface PostJobFormData {
  layanan: string;
  deskripsi: string;
  photos: string[];
  lokasiType: "lokasi" | "remote";
  area: string;
  alamat: string;
  waktuType: string;
  tanggal: string;
  budgetType: "tetap" | "minta";
  budget: string;
}

export interface TechProfileData {
  phone: string;
  area: string;
  nik: string;
  ktpPhoto: string | null;
  selfiePhoto: string | null;
  keahlian: string[];
  pengalaman: string;
  tarif: string;
  bio: string;
}

export interface RegisterResponse {
  ok: boolean;
  user: User;
  devVerifyLink?: string;
}

export interface LoginResponse {
  user: User;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
}

export interface TechnicianPublic {
  id: string;
  name: string;
  avatarUrl: string | null;
  memberSince: string;
  area: string | null;
  keahlian: string[];
  pengalaman: string | null;
  tarif: string | null;
  bio: string | null;
  completedJobs: number;
  completionRate: number | null;
  rating: number;
  reviewCount: number;
  verified: boolean;
}

export interface AdminTechnician {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  area: string | null;
  nik: string | null;
  ktpPhotoUrl: string | null;
  selfiePhotoUrl: string | null;
  keahlian: string[];
  verified: boolean;
  memberSince: string;
  hasKtpSubmission: boolean;
}

export interface AdminUser {
  userId: string;
  email: string;
  fullName: string | null;
  role: string;
  emailVerified: boolean;
  memberSince: string;
}

export interface AppSettings {
  requireVerifiedToQuote: boolean;
  maintenanceMode: boolean;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  technicianId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ConversationPreview {
  jobId: string;
  jobTitle: string;
  technicianId: string;
  otherPartyName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  isLastFromMe: boolean;
}

export interface JobChatThread {
  job: { id: string; title: string };
  technicianId: string;
  owner: { id: string; name: string };
  technician: { id: string; name: string };
  messages: ChatMessage[];
}
