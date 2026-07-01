import { ServiceLandingLayout } from "../components/ServiceLandingLayout";

export default function ServisAc() {
  return (
    <ServiceLandingLayout
        title="Servis AC Tangerang — Teknisi Terpercaya, Datang Hari Ini"
        subtitle="Cuci AC, isi freon, perbaikan AC bocor, dan servis berkala. Post pekerjaan, terima penawaran, pilih teknisi yang cocok."
        intro="KerjaIn menghubungkan kamu dengan teknisi AC terverifikasi di Tangerang dan sekitarnya. Ceritakan masalah AC-mu, tentukan budget, lalu bandingkan penawaran dari teknisi yang siap datang ke rumah. Cocok untuk AC rumah, kantor, ruko, dan apartemen."
        bullets={[
          "Servis AC split, cassette, standing, dan multi-split",
          "Cuci indoor & outdoor, isi freon, cek kebocoran",
          "Perbaikan AC tidak dingin, bocor, atau berisik",
          "Teknisi terverifikasi dengan ulasan pelanggan nyata",
          "Area: BSD, Serpong, Bintaro, Alam Sutera, dan sekitarnya",
          "Post pekerjaan gratis — bayar setelah pekerjaan selesai",
        ]}
        steps={[
          {
            title: "Ceritakan masalah AC",
            desc: "Jelaskan gejala (tidak dingin, bocor, bau, dll.) dan lokasi rumahmu di Tangerang.",
          },
          {
            title: "Tentukan budget",
            desc: "Atur kisaran harga yang kamu siap bayar. Teknisi akan kirim penawaran sesuai kebutuhan.",
          },
          {
            title: "Pilih teknisi & selesai",
            desc: "Bandingkan penawaran, chat teknisi, dan selesaikan pembayaran dengan aman lewat KerjaIn.",
          },
        ]}
        faqs={[
          {
            q: "Berapa biaya servis AC di Tangerang?",
            a: "Biaya bervariasi tergantung jenis AC dan pekerjaan. Cuci AC biasanya Rp 80–150 ribu per unit, servis + isi freon Rp 200–500 ribu. Post pekerjaan di KerjaIn untuk dapat penawaran spesifik.",
          },
          {
            q: "Apakah teknisi datang ke rumah?",
            a: "Ya. Semua pekerjaan servis AC dilakukan on-site di lokasi kamu. Teknisi akan konfirmasi jadwal setelah penawaran diterima.",
          },
          {
            q: "Berapa lama proses servis AC?",
            a: "Cuci AC standar sekitar 1–2 jam. Perbaikan kompresor atau kebocoran bisa lebih lama tergantung tingkat kerusakan.",
          },
          {
            q: "Apakah ada garansi?",
            a: "Garansi tergantung teknisi dan jenis pekerjaan. Tanyakan saat menerima penawaran — ulasan teknisi di KerjaIn membantu kamu memilih yang terpercaya.",
          },
        ]}
      />
  );
}
