/** Reserves space while HomeBelowFold lazy-loads to avoid below-the-fold CLS on short viewports. */
export function HomeBelowFoldSkeleton() {
  return (
    <div
      className="bg-white"
      aria-hidden="true"
      style={{ minHeight: "min(720px, 85vh)" }}
    />
  );
}
