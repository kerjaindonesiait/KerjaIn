export const LAYANAN = [
  { id: "darurat", label: "Pipa Bocor Darurat", emoji: "🚨", desc: "Pipa pecah, banjir, bocor parah" },
  { id: "deteksi", label: "Deteksi Kebocoran", emoji: "💧", desc: "Cari & perbaiki kebocoran tersembunyi" },
  { id: "mampet", label: "Saluran Mampet", emoji: "🔩", desc: "Saluran buntu, mampet, kotor" },
  { id: "water", label: "Pemanas Air", emoji: "🔥", desc: "Pasang, perbaiki & ganti water heater" },
  { id: "pipa", label: "Ganti Pipa", emoji: "🪛", desc: "Pipa lama atau pecah diganti tuntas" },
  { id: "bathroom", label: "Pasang Kamar Mandi", emoji: "🛁", desc: "Kran, WC, shower & wastafel" },
  { id: "maintenance", label: "Perawatan Umum", emoji: "🔧", desc: "Perawatan & perbaikan rumah lengkap" },
  { id: "handyman", label: "Tukang Serba Bisa", emoji: "🪚", desc: "Pekerjaan kecil, pasang & perbaiki" },
  { id: "pintu", label: "Perbaikan Pintu", emoji: "🚪", desc: "Pintu macet, kunci rusak, engsel" },
  { id: "talang", label: "Bersih Talang", emoji: "🏠", desc: "Talang mampet dibersihkan tuntas" },
  { id: "keramik", label: "Perbaikan Keramik", emoji: "🧱", desc: "Keramik retak ditambal atau diganti" },
  { id: "atap", label: "Perawatan Atap", emoji: "⛏️", desc: "Perawatan atap kecil & inspeksi" },
] as const;

export const AREA_JAKARTA = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara",
  "Depok", "Tangerang", "Tangerang Selatan", "Bekasi", "Bogor",
];

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
