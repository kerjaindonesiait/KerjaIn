/** Shared horizontal bounds: aligns page content with header logo (left) and Keluar (right). */
export const APP_SHELL_MAX = "max-w-[1200px]";

export const appShellClass = `${APP_SHELL_MAX} mx-auto w-full px-6`;

/** Tasks map/list: full-bleed on mobile, inset on desktop to match header rails. */
export const appShellClassMobileFlush = `${APP_SHELL_MAX} mx-auto w-full px-0 md:px-6`;
