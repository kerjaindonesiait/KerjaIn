import { useParams } from "react-router";
import { ServiceLandingLayout } from "../components/ServiceLandingLayout";
import { AREA_LABELS, SERVICE_AREAS, type ServiceArea } from "../../lib/publicRoutes";

function isServiceArea(value: string | undefined): value is ServiceArea {
  return !!value && (SERVICE_AREAS as readonly string[]).includes(value);
}

export default function ServisAcArea() {
  const { area: areaParam } = useParams<{ area: string }>();
  const area = isServiceArea(areaParam) ? areaParam : "bsd";
  const label = AREA_LABELS[area];

  return (
    <ServiceLandingLayout
        title={`Servis AC ${label} — Teknisi Terpercaya di Dekatmu`}
        subtitle={`Butuh servis AC di ${label}? Post pekerjaan, terima penawaran teknisi lokal, dan pilih yang paling cocok.`}
        intro={`KerjaIn melayani servis AC di ${label} dan sekitarnya. Baik untuk perumahan, apartemen, ruko, maupun kantor — kamu bisa post pekerjaan dengan detail masalah AC, tentukan budget, dan bandingkan penawaran dari teknisi yang familiar dengan area ${label}.`}
        bullets={[
          `Teknisi AC aktif melayani ${label} dan sekitarnya`,
          "Cuci AC, servis berkala, isi freon, cek kebocoran",
          "Perbaikan AC tidak dingin, bocor, atau bunyi berisik",
          "Post pekerjaan gratis — tanpa biaya di muka",
          "Ulasan teknisi dari pelanggan nyata di KerjaIn",
          "Pembayaran aman setelah pekerjaan selesai",
        ]}
        steps={[
          {
            title: "Post pekerjaan servis AC",
            desc: `Jelaskan masalah AC dan alamat di ${label}. Upload foto unit AC jika membantu teknisi memberi estimasi.`,
          },
          {
            title: "Bandingkan penawaran",
            desc: "Teknisi di area kamu kirim harga, estimasi waktu, dan catatan pekerjaan. Pilih yang sesuai budget.",
          },
          {
            title: "Teknisi datang & selesai",
            desc: "Setelah deal, teknisi datang ke lokasi. Bayar dengan aman lewat KerjaIn setelah pekerjaan beres.",
          },
        ]}
        faqs={[
          {
            q: `Berapa biaya servis AC di ${label}?`,
            a: "Biaya tergantung jenis unit dan pekerjaan. Cuci AC biasanya Rp 80–150 ribu, servis lengkap Rp 200–500 ribu. Post pekerjaan untuk penawaran spesifik dari teknisi lokal.",
          },
          {
            q: "Apakah teknisi bisa datang hari ini?",
            a: "Banyak teknisi di KerjaIn bisa datang same-day tergantung ketersediaan. Sebutkan urgensi saat posting pekerjaan.",
          },
          {
            q: `Area selain ${label} juga dilayani?`,
            a: "Ya. KerjaIn melayani seluruh Tangerang Selatan dan Jakarta. Lihat halaman servis AC utama untuk area lain.",
          },
        ]}
      />
  );
}
