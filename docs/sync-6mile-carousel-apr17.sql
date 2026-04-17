-- 6 Mile Ride page refresh:
--   • Replaces "The Place You'll Be Riding To" section with a two-line
--     photo carousel.
--   • Seeds the new carousel heading rows and cleans up the orphaned
--     Assateague/fact rows.
--
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

-- Seed the new carousel heading rows
INSERT INTO site_content (id, content) VALUES
  ('6mile.strip.eyebrow', 'The 6 Mile Experience'),
  ('6mile.strip.title',   'Moments From the Ride')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();

-- Remove the now-orphaned "Place You'll Be Riding To" rows
DELETE FROM site_content
WHERE id IN (
  '6mile.assateague.eyebrow',
  '6mile.assateague.title',
  '6mile.assateague.sub',
  '6mile.fact1.num',
  '6mile.fact1.title',
  '6mile.fact1.text',
  '6mile.fact2.title',
  '6mile.fact2.text',
  '6mile.fact3.title',
  '6mile.fact3.text',
  '6mile.fact4.title',
  '6mile.fact4.text',
  '6mile.fact5.title',
  '6mile.fact5.text',
  '6mile.fact6.title',
  '6mile.fact6.text'
);
