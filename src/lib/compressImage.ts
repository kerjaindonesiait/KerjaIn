const MAX_WIDTH = 1600;
const TARGET_BYTES = 1.2 * 1024 * 1024;

/** Binary cap before base64 (~4 MB JSON), under Vercel's ~4.5 MB body limit. */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;

const ALLOWED_PHOTO_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const ALLOWED_PHOTO_EXT = /\.(jpe?g|png|webp|heic)$/i;

export function validatePhotoFile(file: File): string | null {
  const mime = (file.type || "").toLowerCase().split(";")[0].trim();
  const name = file.name.toLowerCase();

  if (mime.startsWith("video/") || /\.(mp4|mov|webm|avi|mkv|m4v)$/i.test(name)) {
    return "Hanya foto yang didukung. File video tidak bisa diunggah.";
  }
  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return "Hanya foto yang didukung. File PDF tidak bisa diunggah.";
  }
  if (mime === "image/gif" || name.endsWith(".gif")) {
    return "Format GIF tidak didukung. Gunakan JPEG atau PNG.";
  }

  const mimeOk = Boolean(mime && ALLOWED_PHOTO_MIME.has(mime));
  const extOk = ALLOWED_PHOTO_EXT.test(name);

  if (!mimeOk && !extOk) {
    return "Format foto harus JPEG, PNG, WebP, atau HEIC.";
  }

  return null;
}

export async function compressImageForUpload(
  file: File,
): Promise<{ blob: Blob; contentType: string }> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return { blob: file, contentType: file.type || "image/jpeg" };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return { blob: file, contentType: file.type || "image/jpeg" };
  }

  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { blob: file, contentType: file.type || "image/jpeg" };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const contentType = "image/jpeg";
  let quality = 0.85;
  let blob = await canvasToBlob(canvas, contentType, quality);

  while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, contentType, quality);
  }

  if (!blob) {
    return { blob: file, contentType: file.type || "image/jpeg" };
  }

  return { blob, contentType };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(blob);
  });
}
