-- Customer phone on users (technician phone stays on technician_profiles)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;

-- One phone per customer account
CREATE UNIQUE INDEX IF NOT EXISTS users_customer_phone_unique
  ON users (phone)
  WHERE role = 'user' AND phone IS NOT NULL AND phone <> '';

-- One phone per technician profile
CREATE UNIQUE INDEX IF NOT EXISTS technician_profiles_phone_unique
  ON technician_profiles (phone)
  WHERE phone IS NOT NULL AND phone <> '';
