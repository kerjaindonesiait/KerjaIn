import { useEffect, useRef, useState, type ReactNode } from "react";

type HeroIntroProps = {
  children: ReactNode;
};

export function HeroIntro({ children }: HeroIntroProps) {
  const [heroIn, setHeroIn] = useState(false);
  const [flash, setFlash] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const seen = sessionStorage.getItem("kerjain_intro_seen");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setHeroIn(true);
      setOverlayGone(true);
      return;
    }

    const v = videoRef.current;
    if (!v) {
      setHeroIn(true);
      setOverlayGone(true);
      return;
    }

    let flashT: ReturnType<typeof setTimeout> | undefined;
    let endT: ReturnType<typeof setTimeout> | undefined;
    let cleanT: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      sessionStorage.setItem("kerjain_intro_seen", "1");
      setFlash(true);
      setHeroIn(true);
      cleanT = setTimeout(() => setOverlayGone(true), 500);
    };

    const onMeta = () => {
      const d = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 3;
      flashT = setTimeout(() => setFlash(true), Math.max(0, (d - 0.35) * 1000));
      endT = setTimeout(finish, (d + 0.15) * 1000);
    };

    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", finish);
    v.play().catch(finish);

    return () => {
      if (flashT) clearTimeout(flashT);
      if (endT) clearTimeout(endT);
      if (cleanT) clearTimeout(cleanT);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", finish);
    };
  }, []);

  const skip = () => {
    sessionStorage.setItem("kerjain_intro_seen", "1");
    videoRef.current?.pause();
    setFlash(true);
    setHeroIn(true);
    setTimeout(() => setOverlayGone(true), 350);
  };

  return (
    <section className="hero-wrap">
      <div className={`hero ${heroIn ? "hero--in" : ""}`}>{children}</div>

      {!overlayGone && (
        <div className={`intro ${heroIn ? "intro--lift" : ""}`}>
          <video
            ref={videoRef}
            className="intro__video"
            poster="/intro/kerjain-intro-first_frame.jpg"
            muted
            autoPlay
            playsInline
            preload="auto"
          >
            <source src="/intro/kerjain-intro-video.webm" type="video/webm" />
            <source src="/intro/kerjain-intro-video.mp4" type="video/mp4" />
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
