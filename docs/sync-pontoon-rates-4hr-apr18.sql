-- Add 4-Hour pricing tier + home-page pontoon rates callout/add-ons rows.
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

INSERT INTO site_content (id, content) VALUES
  -- new 4-hour tier on /pontoon-boats (stored under price7 so 4/5/6 slots stay)
  ('pontoons.price7.duration', '4 Hours'),
  ('pontoons.price7.price',    '$489'),
  ('pontoons.price7.sub',      '+ tax'),

  -- home page pontoon rates + add-ons text
  ('index.pontoon.addons.eyebrow', 'Pontoon Add-Ons'),
  ('index.pontoon.addons.title',   'Add-Ons'),
  ('index.pontoon.rates.text',     'Boat Rentals starting at $199.')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
