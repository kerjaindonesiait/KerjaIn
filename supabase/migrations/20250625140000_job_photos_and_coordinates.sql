-- Job map coordinates (geocoded from address / area)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS longitude double precision;

-- Public bucket for job listing photos (max 5 MB per file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;
