export const KEAHLIAN = [
  { id: "darurat", label: "Pipa Bocor Darurat", emoji: "🚨" },
  { id: "deteksi", label: "Deteksi Kebocoran", emoji: "💧" },
  { id: "mampet", label: "Saluran Mampet", emoji: "🔩" },
  { id: "water", label: "Pemanas Air", emoji: "🔥" },
  { id: "pipa", label: "Ganti Pipa", emoji: "🪛" },
  { id: "bathroom", label: "Pasang Kamar Mandi", emoji: "🛁" },
  { id: "maintenance", label: "Perawatan Umum", emoji: "🔧" },
  { id: "handyman", label: "Tukang Serba Bisa", emoji: "🪚" },
  { id: "pintu", label: "Perbaikan Pintu", emoji: "🚪" },
  { id: "talang", label: "Bersih Talang", emoji: "🏠" },
  { id: "keramik", label: "Perbaikan Keramik", emoji: "🧱" },
  { id: "atap", label: "Perawatan Atap", emoji: "⛏️" },
] as const;

export function keahlianLabel(id: string): string {
  return KEAHLIAN.find((k) => k.id === id)?.label ?? id;
}
