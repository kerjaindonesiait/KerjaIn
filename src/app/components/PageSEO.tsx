import { usePageSEO } from "../../lib/seo";

/** Applies route-based title, description, robots, and Open Graph tags. */
export function PageSEO() {
  usePageSEO();
  return null;
}
