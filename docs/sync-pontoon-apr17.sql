-- One-shot sync for the April 17 pontoon-page refresh.
-- Run ONCE in Supabase SQL Editor before (or right after) the push.
-- Safe to run multiple times.
--
-- Does two things:
--   1) Renames occasion3 from "Birthday on the Bay" to "Best Activity for Kids in OC"
--      so the live card matches the new HTML / image.
--   2) Removes the now-deleted Bluetooth Speaker add-on rows (addon1.*).

-- Rename occasion3
INSERT INTO site_content (id, content) VALUES
  ('pontoons.occasion3.text', 'Best Activity for Kids in OC')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();

-- Remove the Bluetooth Speaker add-on rows (no longer in HTML)
DELETE FROM site_content
WHERE id IN (
  'pontoons.addon1.title',
  'pontoons.addon1.desc',
  'pontoons.addon1.price'
);
