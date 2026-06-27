import type { User } from "../types";

export function defaultRouteForUser(user: User | null | undefined) {
  if (!user) return "/";
  if (user.role === "technician") return "/dasbor-tukang";
  return "/tasks";
}
