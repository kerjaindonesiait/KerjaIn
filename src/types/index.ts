export type UserRole = "user" | "technician";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  emailVerified: boolean;
  phone: string | null;
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
  /** True when exact address is hidden (browse / pre-assignment). */
  locationPrivate?: boolean;
  assignedTechnicianId?: string | null;
  scheduledAt?: string | null;
  technicianMarkedCompleteAt?: string | null;
  completedAt?: string | null;
  lokasiType: string;
  waktuType: string;
  tanggal?: string | null;
  budgetType: string;
  budgetRaw?: number | null;
  price: string;
  status: string;
  urgency?: string | null;
  offers: number;
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

export interface JobMessage {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface JobProgressPhoto {
  id: string;
  jobId: string;
  uploadedBy: string;
  url: string;
  caption: string | null;
  createdAt: string;
}

export interface JobWorkspaceCounterpart {
  id: string;
  name: string;
  phone: string | null;
  role: "technician" | "customer";
}

export interface JobWorkspace {
  job: Job;
  viewerRole: "owner" | "technician";
  counterpart: JobWorkspaceCounterpart | null;
  acceptedOffer: { id: string; price: number; priceFormatted: string } | null;
  payment: {
    id: string;
    status: string;
    amount: number;
    total: number;
    escrowReleaseAt: string | null;
    releasedAt: string | null;
  } | null;
  messages: JobMessage[];
  progressPhotos: JobProgressPhoto[];
  review: Review | null;
  canReview: boolean;
}

export interface TechnicianOffer {
  id: string;
  jobId: string;
  price: number;
  priceFormatted: string;
  message: string | null;
  availability: string;
  scheduledTime: string | null;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    area: string;
    status: string;
    jobNumber: string;
  } | null;
}

export interface TechnicianProfile {
  area: string | null;
  keahlian: string[];
  pengalaman: string | null;
  tarif: string | null;
  bio: string | null;
  verified?: boolean;
  ktpPhotoUrl?: string | null;
  selfiePhotoUrl?: string | null;
  nik?: string | null;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  reviewerName?: string | null;
  createdAt: string;
}

export interface CompletedFeedJob {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  price: string;
  area: string;
  rating: number | null;
  completedAt: string | null;
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
  technicianVerified?: boolean;
  createdAt: string;
}

export interface TechnicianPublicProfile {
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
  verified?: boolean;
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

export class ApiError extends Error {
  details?: Record<string, string>;

  constructor(message: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
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

export interface AuthSession {
  user: User;
  devVerifyLink?: string;
}

/** @deprecated Use AuthSession — tokens are httpOnly cookies */
export interface AuthTokens extends AuthSession {
  accessToken?: string;
  refreshToken?: string;
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

export interface AppConfig {
  requireVerifiedToQuote: boolean;
  maintenanceMode: boolean;
}

export interface AdminStats {
  pendingVerification: number;
  verifiedTechnicians: number;
  totalTechnicians: number;
  openJobs: number;
}
