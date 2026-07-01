import { ServiceLandingLayout } from "../components/ServiceLandingLayout";

export default function JasaTukang() {
  return (
    <ServiceLandingLayout
        title="Jasa Tukang Terpercaya — Plumbing, Perawatan Rumah & Darurat"
        subtitle="Post pekerjaan, terima penawaran dari tukang terverifikasi, dan pilih yang paling cocok untuk budget dan jadwalmu."
        intro="KerjaIn adalah marketplace jasa rumah yang menghubungkan pelanggan dengan tukang terpercaya. Dari pipa bocor dan saluran mampet hingga perbaikan pintu dan perawatan umum — kamu tentukan pekerjaan dan harga, tukang yang tertarik akan kirim penawaran."
        bullets={[
          "Plumbing: pipa bocor, saluran mampet, water heater",
          "Perawatan rumah: tukang serba bisa, perbaikan pintu, keramik",
          "Pekerjaan darurat dengan respons cepat",
          "Tukang terverifikasi identitas (KTP + selfie)",
          "Sistem penawaran — bandingkan harga sebelum memilih",
          "Pembayaran aman setelah pekerjaan selesai",
        ]}
        steps={[
          {
            title: "Post pekerjaan",
            desc: "Ceritakan masalah, upload foto jika perlu, dan tentukan budget yang kamu siap bayar.",
          },
          {
            title: "Terima penawaran",
            desc: "Tukang di area kamu akan kirim penawaran dengan harga dan estimasi waktu pengerjaan.",
          },
          {
            title: "Pilih & selesaikan",
            desc: "Bandingkan profil dan ulasan, chat tukang, lalu bayar dengan aman setelah pekerjaan beres.",
          },
        ]}
        faqs={[
          {
            q: "Apakah posting pekerjaan gratis?",
            a: "Ya, posting pekerjaan di KerjaIn gratis. Kamu hanya bayar setelah pekerjaan selesai dan kamu puas dengan hasilnya.",
          },
          {
            q: "Bagaimana cara memastikan tukang terpercaya?",
            a: "Semua tukang melewati verifikasi identitas. Kamu juga bisa lihat ulasan dari pelanggan sebelumnya di profil tukang.",
          },
          {
            q: "Area mana saja yang dilayani?",
            a: "Saat ini KerjaIn fokus di Jakarta dan Tangerang (BSD, Serpong, Bintaro, dan sekitarnya). Area terus diperluas.",
          },
          {
            q: "Bisakah saya daftar sebagai tukang?",
            a: "Ya. Kunjungi halaman daftar tukang untuk mendaftar, verifikasi identitas, dan mulai terima pekerjaan.",
          },
        ]}
        ctaLabel="Post pekerjaan sekarang"
        ctaHref="/post-job"
      />
  );
}
