/** Public routes where session check can run after first paint. */
export function shouldDeferAuthCheck(): boolean {
  if (typeof window === "undefined") return false;

  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  if (path === "/" || path === "/how-it-works" || path === "/tasks") return true;
  if (path === "/servis-ac" || path === "/jasa-tukang") return true;
  if (path.startsWith("/servis-ac/")) return true;
  if (path.startsWith("/tukang/")) return true;
  if (
    path === "/masuk" ||
    path === "/daftar" ||
    path === "/daftar-tukang" ||
    path === "/lupa-sandi" ||
    path === "/atur-ulang-sandi" ||
    path === "/verifikasi-email"
  ) {
    return true;
  }

  return false;
}
