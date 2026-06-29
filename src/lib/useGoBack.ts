import { useCallback } from "react";
import { useNavigate } from "react-router";

/** Browser/app back with a safe fallback when there is no prior history entry. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, fallback]);
}
