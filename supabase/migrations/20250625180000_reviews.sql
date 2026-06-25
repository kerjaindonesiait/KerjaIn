-- Reviews & technician rating aggregates

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_reviewee_id_created_at ON reviews(reviewee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_job_id ON reviews(job_id);

ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS rating numeric(3, 2) DEFAULT 0;
ALTER TABLE technician_profiles ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
