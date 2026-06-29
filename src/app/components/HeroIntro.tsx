import { useEffect, useRef, useState, type ReactNode } from "react";

const INTRO_SEEN_KEY = "kerjain_intro_seen";
const INTRO_MP4 = "/intro/kerjain-intro-video.mp4";
const INTRO_POSTER = "/intro/kerjain-intro-first%20frame.png";
const HARD_FALLBACK_MS = 4500;

type HeroIntroProps = {
  children: ReactNode;
};

function revealHero(setHeroIn: (v: boolean) => void, setOverlayGone: (v: boolean) => void) {
  setHeroIn(true);
  setOverlayGone(true);
}

export function HeroIntro({ children }: HeroIntroProps) {
  const [heroIn, setHeroIn] = useState(false);
  const [flash, setFlash] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    const seen = sessionStorage.getItem(INTRO_SEEN_KEY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      revealHero(setHeroIn, setOverlayGone);
      return;
    }

    let flashT: ReturnType<typeof setTimeout> | undefined;
    let endT: ReturnType<typeof setTimeout> | undefined;
    let cleanT: ReturnType<typeof setTimeout> | undefined;
    let hardFallbackT: ReturnType<typeof setTimeout> | undefined;
    let detachVideo: (() => void) | undefined;
    let cancelled = false;

    const finish = () => {
      if (finishedRef.current || cancelled) return;
      finishedRef.current = true;
      if (flashT) clearTimeout(flashT);
      if (endT) clearTimeout(endT);
      if (hardFallbackT) clearTimeout(hardFallbackT);
      detachVideo?.();
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
      setFlash(true);
      setHeroIn(true);
      cleanT = setTimeout(() => setOverlayGone(true), 500);
    };

    const skipIntro = () => {
      if (finishedRef.current || cancelled) return;
      finishedRef.current = true;
      if (flashT) clearTimeout(flashT);
      if (endT) clearTimeout(endT);
      if (hardFallbackT) clearTimeout(hardFallbackT);
      detachVideo?.();
      revealHero(setHeroIn, setOverlayGone);
    };

    const bindVideo = () => {
      const v = videoRef.current;
      if (!v) {
        skipIntro();
        return;
      }

      const onMeta = () => {
        const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 3;
        if (flashT) clearTimeout(flashT);
        if (endT) clearTimeout(endT);
        flashT = setTimeout(() => setFlash(true), Math.max(0, (d - 0.35) * 1000));
        endT = setTimeout(finish, (d + 0.15) * 1000);
      };
      const onError = () => finish();

      v.addEventListener("loadedmetadata", onMeta);
      v.addEventListener("ended", finish);
      v.addEventListener("error", onError);
      v.play().catch(finish);

      detachVideo = () => {
        v.removeEventListener("loadedmetadata", onMeta);
        v.removeEventListener("ended", finish);
        v.removeEventListener("error", onError);
      };
    };

    (async () => {
      try {
        const res = await fetch(INTRO_MP4, { method: "HEAD" });
        if (!res.ok) {
          skipIntro();
          return;
        }
      } catch {
        skipIntro();
        return;
      }

      if (cancelled) return;

      setShowIntro(true);
      hardFallbackT = setTimeout(finish, HARD_FALLBACK_MS);
      requestAnimationFrame(bindVideo);
    })();

    return () => {
      cancelled = true;
      if (flashT) clearTimeout(flashT);
      if (endT) clearTimeout(endT);
      if (cleanT) clearTimeout(cleanT);
      if (hardFallbackT) clearTimeout(hardFallbackT);
      detachVideo?.();
    };
  }, []);

  const skip = () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    videoRef.current?.pause();
    setFlash(true);
    setHeroIn(true);
    setTimeout(() => setOverlayGone(true), 350);
  };

  return (
    <section className="hero-wrap">
      <div className={`hero ${heroIn ? "hero--in" : ""}`}>{children}</div>

      {showIntro && !overlayGone && (
        <div className={`intro ${heroIn ? "intro--lift" : ""}`}>
          <video
            ref={videoRef}
            className="intro__video"
            poster={INTRO_POSTER}
            muted
            autoPlay
            playsInline
            preload="auto"
          >
            <source src={INTRO_MP4} type="video/mp4" />
          </video>
          <div className={`intro__flash ${flash ? "intro__flash--on" : ""}`} />
          <button type="button" className="intro__skip" onClick={skip}>
            Skip
          </button>
        </div>
      )}
    </section>
  );
}
