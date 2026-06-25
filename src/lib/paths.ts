/** Build in-app URLs with query params for discovery → tasks flow */
export function tasksUrl(opts?: { search?: string; id?: string; area?: string }) {
  const qs = new URLSearchParams();
  if (opts?.search?.trim()) qs.set("search", opts.search.trim());
  if (opts?.id) qs.set("id", opts.id);
  if (opts?.area?.trim()) qs.set("area", opts.area.trim());
  const q = qs.toString();
  return `/tasks${q ? `?${q}` : ""}`;
}

export function categoriesUrl(search?: string) {
  if (!search?.trim()) return "/categories";
  return `/categories?search=${encodeURIComponent(search.trim())}`;
}
