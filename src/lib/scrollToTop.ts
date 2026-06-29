/** Dismiss keyboard and reset iOS Safari input zoom before navigation. */
export function releaseMobileZoom() {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
}

/** Reset scroll position after navigation or in-page step changes. */
export function scrollToTop() {
  releaseMobileZoom();
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) {
    main.scrollTop = 0;
  }
}
