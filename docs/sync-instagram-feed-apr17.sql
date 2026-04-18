-- Home page "The Experience" photo gallery replaced with Elfsight Instagram feed.
-- Update the heading + subheading rows so cms.js doesn't revert them.
-- Run ONCE in Supabase SQL Editor. Safe to re-run.

INSERT INTO site_content (id, content) VALUES
  ('index.gallery.title', 'Follow Us on Instagram!'),
  ('index.gallery.sub',   'See what''s happening on the water today.')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
