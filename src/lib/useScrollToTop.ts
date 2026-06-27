import { useEffect } from "react";
import { scrollToTop } from "./scrollToTop";

/** Scroll to top when step/screen state changes within a page. */
export function useScrollToTop(...deps: unknown[]) {
  useEffect(() => {
    scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller supplies explicit deps
  }, deps);
}
