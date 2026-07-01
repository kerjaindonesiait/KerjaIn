import { Link } from "react-router";
import type { ReactNode } from "react";

type FaqItem = { q: string; a: string };

type ServiceLandingLayoutProps = {
  title: string;
  subtitle: string;
  intro: string;
  bullets: string[];
  steps: { title: string; desc: string }[];
  faqs: FaqItem[];
  ctaLabel?: string;
  ctaHref?: string;
  children?: ReactNode;
};

export function ServiceLandingLayout({
  title,
  subtitle,
  intro,
  bullets,
  steps,
  faqs,
  ctaLabel = "Post pekerjaan gratis",
  ctaHref = "/post-job",
  children,
}: ServiceLandingLayoutProps) {
  return (
    <article className="bg-white">
      <section className="bg-[#172E4D] px-6 py-16 md:py-20">
        <div className="max-w-[900px] mx-auto">
          <p className="text-[#FD6665] text-[13px] font-bold uppercase tracking-widest mb-3">
            KerjaIn Indonesia
          </p>
          <h1 className="font-extrabold text-[36px] sm:text-[48px] text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-white/85 text-[18px] leading-relaxed mb-8 max-w-2xl">{subtitle}</p>
          <Link
            to={ctaHref}
            className="inline-flex items-center bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] px-8 py-4 rounded-full transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      <section className="px-6 py-14 max-w-[900px] mx-auto">
        <p className="text-[#294566] text-[17px] leading-relaxed mb-8">{intro}</p>
        <ul className="grid sm:grid-cols-2 gap-4 mb-12">
          {bullets.map((item) => (
            <li
              key={item}
              className="flex gap-3 rounded-xl border border-[#D8E2F0] bg-[#F7F9FC] px-4 py-3 text-[15px] text-[#172E4D]"
            >
              <span className="text-[#1D4196] font-bold shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {children}

        <h2 className="font-bold text-[28px] text-[#172E4D] mb-6">Cara Kerja</h2>
        <ol className="space-y-5 mb-14">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="w-9 h-9 rounded-full bg-[#1D4196] text-white font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-[#172E4D] mb-1">{step.title}</p>
                <p className="text-[#58708D] text-[15px] leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="font-bold text-[28px] text-[#172E4D] mb-6">Pertanyaan Umum</h2>
        <dl className="space-y-6 mb-14">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <dt className="font-bold text-[#172E4D] mb-2">{faq.q}</dt>
              <dd className="text-[#58708D] text-[15px] leading-relaxed">{faq.a}</dd>
            </div>
          ))}
        </dl>

        <div className="rounded-2xl bg-[#F7F9FC] border border-[#D8E2F0] p-8 text-center">
          <h2 className="font-bold text-[24px] text-[#172E4D] mb-3">Siap mulai?</h2>
          <p className="text-[#58708D] mb-6">
            Post pekerjaan gratis, bandingkan penawaran tukang terverifikasi, bayar aman lewat KerjaIn.
          </p>
          <Link
            to={ctaHref}
            className="inline-flex items-center bg-[#1D4196] hover:bg-[#173577] text-white font-bold text-[15px] px-8 py-4 rounded-full transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>
    </article>
  );
}
