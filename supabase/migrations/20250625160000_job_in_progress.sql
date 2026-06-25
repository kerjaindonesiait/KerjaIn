-- Job in progress: messaging, progress photos, scheduling, escrow release

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS technician_marked_complete_at timestamptz;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS completed_at timestamptz;

CREATE TABLE IF NOT EXISTS job_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_messages_job_id_created_at ON job_messages(job_id, created_at);

CREATE TABLE IF NOT EXISTS job_progress_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_progress_photos_job_id ON job_progress_photos(job_id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS escrow_release_at timestamptz;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS released_at timestamptz;
