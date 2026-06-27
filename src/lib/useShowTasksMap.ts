import { useEffect, useState } from "react";

/** Map visible on landscape phones, tablets, and desktop — hidden on portrait phones. */
const SHOW_MAP_QUERY = "(orientation: landscape), (min-width: 768px)";

export function useShowTasksMap() {
  const [showMap, setShowMap] = useState(
    () => typeof window !== "undefined" && window.matchMedia(SHOW_MAP_QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(SHOW_MAP_QUERY);
    const update = () => setShowMap(mq.matches);
    mq.addEventListener("change", update);
    update();
    return () => mq.removeEventListener("change", update);
  }, []);

  return showMap;
}
