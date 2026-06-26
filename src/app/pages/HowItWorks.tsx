import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  CheckCircle,
  DoorOpen,
  Droplets,
  Flame,
  Home,
  Layers,
  Lock,
  MessageCircle,
  PaintBucket,
  Shield,
  Star,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import step1Image from "../../assets/cara-kerja/step-1-ceritakan.png";
import step2Image from "../../assets/cara-kerja/step-2-budget.png";
import step3Image from "../../assets/cara-kerja/step-3-penawaran.png";
import step4Image from "../../assets/cara-kerja/step-4-dikerjain.png";

type Step = {
  id: number;
  label: string;
  title: string;
  desc: string;
  color: string;
  image: string;
  side: "left" | "right";
};

type Service = {
  Icon: LucideIcon;
  label: string;
};

const STEPS: Step[] = [
  {
    id: 1,
    label: "Ceritakan",
    title: "Ceritakan Masalahnya",
    desc: "Jelaskan apa yang perlu dibereskan di rumahmu. Semakin detail, semakin cepat kamu mendapat tukang yang tepat.",
    color: "#FCDDD8",
    image: step1Image,
    side: "right",
  },
  {
    id: 2,
    label: "Budget",
    title: "Atur Budget",
    desc: "Tentukan kisaran biaya atau biarkan tukang memberi penawaran sesuai keahlian mereka.",
    color: "#C5EFE0",
    image: step2Image,
    side: "left",
  },
  {
    id: 3,
    label: "Penawaran",
    title: "Pilih Penawaran",
    desc: "Bandingkan harga, profil, rating, dan ulasan tukang. Semua terverifikasi, tidak perlu tebak-tebakan.",
    color: "#FFF0BC",
    image: step3Image,
    side: "right",
  },
  {
    id: 4,
    label: "Di-KerjaIn",
    title: "Di-KerjaIn!",
    desc: "Tukang datang sesuai jadwal dan pekerjaan mulai dibereskan. Bayar setelah kamu puas, bukan sebelumnya.",
    color: "#C4D8F5",
    image: step4Image,
    side: "left",
  },
];

const SERVICES: Service[] = [
  { Icon: Droplets, label: "Pipa Bocor Darurat" },
  { Icon: Droplets, label: "Deteksi Kebocoran" },
  { Icon: Layers, label: "Saluran Mampet" },
  { Icon: Flame, label: "Pemanas Air" },
  { Icon: Zap, label: "Instalasi Listrik" },
  { Icon: Zap, label: "Ganti Stop Kontak" },
  { Icon: Zap, label: "Pasang Lampu" },
  { Icon: PaintBucket, label: "Cat Tembok" },
  { Icon: Home, label: "Renovasi Kamar Mandi" },
  { Icon: DoorOpen, label: "Perbaikan Pintu & Kunci" },
  { Icon: Wind, label: "Servis AC" },
  { Icon: Wind, label: "Pasang AC Baru" },
];

const SERVICE_MARQUEE_CSS = `
  @keyframes ki-services-left {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  .ki-services-marquee {
    animation: ki-services-left 56s linear infinite;
  }

  .ki-services-marquee:hover {
    animation-play-state: paused;
  }
`;

const TRUST_ITEMS = [
  {
    Icon: Shield,
    title: "Perlindungan ekstra untuk pekerjaan tertentu",
    badge: "Diasuransikan",
    badgeColor: "#E8EFFF",
    badgeText: "#1D4196",
    desc: "Pekerjaan yang memenuhi syarat bisa mendapat perlindungan tambahan jika terjadi kerusakan properti saat pengerjaan.",
  },
  {
    Icon: Star,
    title: "Rating & Ulasan",
    badge: "100% terverifikasi",
    badgeColor: "#E8F7EF",
    badgeText: "#1A6B45",
    desc: "    Lihat rating, ulasan, dan rekam jejak tukang dari pekerjaan sebelumnya.",
  },
  {
    Icon: MessageCircle,
    title: "Chat tetap di KerjaIn",
    badge: "Privasi terjaga",
    badgeColor: "#F0EEFF",
    badgeText: "#5236AB",
    desc: "Semua komunikasi pekerjaan tersimpan rapi di KerjaIn, dari tanya jawab awal sampai pekerjaan selesai.",
  },
  {
    Icon: Lock,
    title: "Pembayaran aman",
    badge: "KerjaIn Pay",
    badgeColor: "#FFF0ED",
    badgeText: "#C23B30",
    desc: "Dana disimpan aman di KerjaIn sampai pekerjaan selesai dan kamu konfirmasi. Lebih jelas, rapi, dan tanpa ribet uang tunai.",
  },
];

const TRUST_PILLS = [
  "Post Kerjaan gratis",
  "Tanpa kontrak mengikat",
  "Tukang terverifikasi",
  "Ulasan asli",
  "Pembayaran aman",
];

function StepCard({ step }: { step: Step }) {
  const visual = (
    <div
      className="relative min-h-[220px] flex-1 overflow-hidden rounded-2xl md:min-h-[300px]"
      style={{ background: step.color }}
    >
      <img
        src={step.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[17px] font-extrabold text-[#172E4D] shadow-sm backdrop-blur">
        {step.id}
      </div>
      <p className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-2 text-[12px] font-extrabold uppercase tracking-widest text-[#294566]/70 shadow-sm backdrop-blur">
        {step.label}
      </p>
    </div>
  );

  const content = (
    <div className="flex flex-1 flex-col justify-center px-1 py-2 md:px-2">
      <p className="mb-2 text-[12px] font-extrabold uppercase tracking-widest text-[#1D4196]">Langkah {step.id}</p>
      <h3 className="mb-3 text-[28px] font-extrabold leading-tight text-[#172E4D] md:text-[34px]">{step.title}</h3>
      <p className="max-w-md text-[15px] leading-relaxed text-[#58708D] md:text-[16px]">{step.desc}</p>
    </div>
  );

  return (
    <article
      id={`step-${step.id}`}
      className="scroll-mt-40 rounded-2xl border border-[#D8E2F0] bg-white p-5 md:p-6"
    >
      <div className={`flex flex-col gap-6 md:flex-row ${step.side === "left" ? "md:[&>*:first-child]:order-2" : ""}`}>
        {visual}
        {content}
      </div>
    </article>
  );
}

function ServiceMarquee() {
  return (
    <div className="overflow-hidden py-1">
      <div className="ki-services-marquee grid w-max grid-flow-col grid-rows-2 gap-3">
        {[...SERVICES, ...SERVICES].map(({ Icon, label }, index) => (
          <div
            key={`${label}-${index}`}
            className="flex h-[145px] w-[220px] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-white bg-white p-5 text-center sm:w-[260px] lg:w-[280px]"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3FB]">
              <Icon size={23} className="text-[#1D4196]" />
            </span>
            <span className="text-[13px] font-bold leading-snug text-[#172E4D] md:text-[14px]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = Number(entry.target.id.replace("step-", ""));
          if (Number.isFinite(id)) setActiveStep(id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    STEPS.forEach((step) => {
      const node = document.getElementById(`step-${step.id}`);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToStep = (id: number) => {
    document.getElementById(`step-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bg-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{SERVICE_MARQUEE_CSS}</style>
      <section className="relative overflow-hidden bg-[#172E4D]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute right-[-80px] top-[-100px] hidden h-[560px] w-[560px] rounded-full bg-[#1D4196]/20 blur-3xl sm:block" />
          <div className="absolute bottom-[-110px] left-[18%] hidden h-[420px] w-[420px] rounded-full bg-[#FD6665]/10 blur-3xl sm:block" />
        </div>

        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center px-5 py-20 text-center md:px-6 md:py-28">
          <div className="mb-8 inline-flex w-full max-w-[300px] items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/75 sm:max-w-full sm:text-[13px]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#FD6665]" />
            <span className="min-w-0 leading-snug">Tukang plumbing & perawatan rumah di Jakarta</span>
          </div>

          <h1 className="mb-6 w-full max-w-3xl text-[38px] font-extrabold leading-[1.06] tracking-tight text-white sm:text-[64px] md:text-[76px]">
            Post Kerjaan.
            <br />
            <span className="text-[#FD6665]">
              Terima <span className="block sm:inline">penawaran.</span>
            </span>
            <br />
            Masalah beres!
          </h1>

          <p className="mb-10 w-full max-w-[300px] text-[15px] leading-relaxed text-white/70 sm:max-w-xl md:text-[18px]">
            KerjaIn membantu kamu menemukan tukang plumbing dan perawatan rumah di Jakarta dengan penawaran cepat dan pembayaran aman.
          </p>

          <div className="flex w-full max-w-[300px] flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Link
              to="/post-job"
              className="rounded-full bg-[#1D4196] px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#173577]"
            >
              Post Kerjaan gratis
            </Link>
            <Link
              to="/tasks"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/20"
            >
              Lihat pekerjaan
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-12 pt-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-widest text-[#1D4196]">Cara kerja</p>
          <h2 className="mx-auto max-w-[300px] text-[28px] font-extrabold leading-tight text-[#172E4D] sm:max-w-none sm:text-[34px] md:whitespace-nowrap md:text-[50px]">
              Rumah Beres dalam 4 Langkah
          </h2>
        </div>

        <div className="sticky top-[72px] z-40 -mx-6 mb-8 border-y border-[#D8E2F0] bg-white/95 px-4 py-4 shadow-sm backdrop-blur md:mx-0 md:rounded-2xl md:border">
          <div className="flex justify-center gap-2 overflow-x-auto py-0.5">
            {STEPS.map((step) => {
              const active = activeStep === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => scrollToStep(step.id)}
                  className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-[12px] font-extrabold transition-colors md:px-5 md:text-[13px] ${
                    active ? "bg-[#1D4196] text-white" : "bg-[#EEF3FB] text-[#58708D] hover:text-[#1D4196]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                      active ? "bg-[#FD6665] text-white" : "bg-[#D8E2F0] text-[#1D4196]"
                    }`}
                  >
                    {step.id}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {STEPS.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </section>

      <section className="bg-[#F7F9FC] py-20">
        <div className="mx-auto max-w-[1180px] px-6">
          <div className="mb-7">
            <h2 className="mb-2 text-[32px] font-extrabold leading-tight text-[#172E4D] md:text-[44px]">
              Semua urusan rumah, bisa di-KerjaIn.
            </h2>
            <p className="max-w-2xl text-[15px] leading-relaxed text-[#58708D] md:text-[16px]">
              Kalau kebutuhanmu ringan, jelas, dan berhubungan dengan rumah, ceritakan saja detailnya.
              Contoh yang kami kerjakan:
            </p>
          </div>

          <div className="-mx-6 overflow-hidden px-6">
            <ServiceMarquee />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 py-24">
        <div className="mb-12 text-center">
          <p className="mb-4 text-[13px] font-extrabold uppercase tracking-widest text-[#1D4196]">Perlindungan</p>
          <h2 className="mx-auto mb-4 max-w-5xl text-[38px] font-extrabold leading-tight text-[#172E4D] md:text-[64px]">
            Tenang dari awal sampai pekerjaan selesai
          </h2>
          <p className="mx-auto max-w-2xl text-[17px] leading-relaxed text-[#58708D] md:text-[20px]">
            Dari memilih tukang, chat, sampai pembayaran, KerjaIn bantu prosesnya tetap jelas, rapi, dan aman.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TRUST_ITEMS.map(({ Icon, title, badge, badgeColor, badgeText, desc }) => (
            <article key={title} className="flex gap-5 rounded-2xl bg-[#F7F9FC] p-8 transition-shadow hover:shadow-md">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#EEF3FB]">
                <Icon size={30} className="text-[#1D4196]" />
              </div>
              <div>
                <h3 className="mb-2 text-[22px] font-extrabold leading-snug text-[#172E4D]">{title}</h3>
                <span
                  className="mb-3 inline-block rounded-full px-3 py-1 text-[12px] font-extrabold"
                  style={{ background: badgeColor, color: badgeText }}
                >
                  {badge}
                </span>
                <p className="text-[16px] leading-relaxed text-[#58708D]">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#172E4D] px-6 py-16 text-center md:py-20">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-3 text-[12px] font-extrabold uppercase tracking-widest text-[#FD6665]">
            Mulai Sekarang
          </p>
          <h2 className="mx-auto mb-4 max-w-3xl text-[36px] font-extrabold leading-tight text-white md:text-[56px]">
            Siap membereskan pekerjaan rumah?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[16px] leading-relaxed text-white/70 md:text-[18px]">
            Post Kerjaan sekarang, jelaskan kebutuhanmu, lalu tunggu penawaran dari tukang yang sesuai.
          </p>

          <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/post-job"
              className="rounded-full bg-[#FD6665] px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#f05251]"
            >
              Post Kerjaan gratis
            </Link>
            <Link
              to="/tasks"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-white/20"
            >
              Lihat pekerjaan tersedia
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-white/15 pt-8">
            {TRUST_PILLS.map((item) => (
              <span key={item} className="flex items-center gap-2 text-[14px] font-semibold text-white/80">
                <CheckCircle size={18} className="text-[#69D893]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
