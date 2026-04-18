-- Replace the 4.4 Average Rating stat with "#1 Largest Riding Area in OC"
-- on the About page stats bar.
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

-- Seed the new key
INSERT INTO site_content (id, content) VALUES
  ('about.stats.area.num',   '#1'),
  ('about.stats.area.label', 'Largest Riding Area in OC')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();

-- Remove the old (now-orphan) rating rows
DELETE FROM site_content
WHERE id IN ('about.stats.rating.num', 'about.stats.rating.label');
