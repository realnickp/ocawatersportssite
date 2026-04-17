-- Fix: the parking landmark is "Harborside", not "The Angler"
-- (The Angler is the business partner, a separate thing.)
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

INSERT INTO site_content (id, content) VALUES
  ('contact.parking.r3', '<strong>Next to Harborside</strong> restaurant — use it as your landmark if GPS gets weird. Our dock is steps from the lot.')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
