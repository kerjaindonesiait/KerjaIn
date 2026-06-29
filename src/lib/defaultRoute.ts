import type { User } from "../types";

export function defaultRouteForUser(user: User | null | undefined) {
  if (!user) return "/";
  if (user.role === "technician") {
    if (!user.technicianOnboardingComplete) return "/daftar-tukang?resume=1";
    return "/dasbor-tukang";
  }
  return "/tasks";
}
