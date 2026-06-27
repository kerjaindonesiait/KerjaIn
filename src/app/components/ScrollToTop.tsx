import { useEffect } from "react";
import { useLocation } from "react-router";
import { scrollToTop } from "../../lib/scrollToTop";

/** Scroll to top on every route change (links, back/forward, redirects). */
export function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    scrollToTop();
  }, [pathname, search, hash]);

  return null;
}
