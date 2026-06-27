/** Reset scroll position after navigation or in-page step changes. */
export function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.querySelector("main");
  if (main instanceof HTMLElement) {
    main.scrollTop = 0;
  }
}
