export type UserRole = "user" | "technician";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}
