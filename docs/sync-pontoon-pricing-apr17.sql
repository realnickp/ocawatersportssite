-- Add 6-hour / 8-hour / Custom Times pricing tiers.
-- Run ONCE in Supabase SQL Editor before (or right after) the push.
-- Safe to re-run.
--
-- Repurposes price4 (was "Additional Hours $100") into the new 6-hour
-- tier, and adds price5 (8 Hours) + price6 (Custom Times).

INSERT INTO site_content (id, content) VALUES
  ('pontoons.price4.duration', '6 Hours'),
  ('pontoons.price4.price',    '$659'),
  ('pontoons.price4.sub',      '+ tax'),

  ('pontoons.price5.duration', '8 Hours'),
  ('pontoons.price5.price',    '$879'),
  ('pontoons.price5.sub',      '+ tax'),

  ('pontoons.price6.duration', 'Custom Times'),
  ('pontoons.price6.price',    'Call Us'),
  ('pontoons.price6.sub',      'Tailored trips — phone to arrange')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
