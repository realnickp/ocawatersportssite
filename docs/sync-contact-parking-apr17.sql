-- Update contact.parking.r2 and r3 rows to match the new HTML.
-- (CMS is overriding the HTML with the old DB values — "Street parking"
--  and "Paid lots" — which is why the update isn't visible on the live site.)
--
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

INSERT INTO site_content (id, content) VALUES
  ('contact.parking.r2', '<strong>Arrive 45 minutes early</strong> so paperwork, orientation, and the dock briefing don''t cut into your ride time.'),
  ('contact.parking.r3', '<strong>Next to The Angler</strong> restaurant — use it as your landmark if GPS gets weird. Our dock is steps from the lot.')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
