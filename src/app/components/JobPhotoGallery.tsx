type JobPhotoGalleryProps = {
  photos: string[];
  className?: string;
  thumbClassName?: string;
};

export function JobPhotoGallery({
  photos,
  className = "",
  thumbClassName = "w-20 h-20 sm:w-24 sm:h-24",
}: JobPhotoGalleryProps) {
  const urls = photos.filter((p) => p.startsWith("http"));
  if (urls.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-bold text-[12px] text-[#7890AA] uppercase tracking-wider mb-3">Foto pekerjaan</p>
      <div className="flex gap-2 flex-wrap">
        {urls.map((url, i) => (
          <a
            key={`${url}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${thumbClassName} rounded-xl border border-[#D8E2F0] overflow-hidden shrink-0 block hover:ring-2 hover:ring-[#1D4196]/30 transition-shadow`}
          >
            <img src={url} alt={`Foto pekerjaan ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </a>
        ))}
      </div>
    </div>
  );
}
