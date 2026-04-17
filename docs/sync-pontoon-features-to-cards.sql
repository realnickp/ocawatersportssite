-- Sync site_content rows for pontoons.feature1–6 to exactly match the
-- current hardcoded text on pontoon-boats.html. Run ONCE in Supabase
-- SQL Editor after pushing the data-cms wiring, so the live cards render
-- the same text they did before.
--
-- Safe to run multiple times (upsert).

INSERT INTO site_content (id, content) VALUES
  ('pontoons.feature5.title', 'Wild Horse Spotting'),
  ('pontoons.feature5.text',  'Anchor near Assateague and watch the famous horses roam the beach. They''ve been free since the 1600s.'),

  ('pontoons.feature1.title', 'Beach on Assateague'),
  ('pontoons.feature1.text',  'Pull your boat right up to the sand on the bay side of Assateague Island. No other OC rental lets you do this.'),

  ('pontoons.feature2.title', 'Fish & Crab the Bay'),
  ('pontoons.feature2.text',  'Add on our fishing or crabbing package. Some of the best crabbing on the Eastern Shore.'),

  ('pontoons.feature3.title', 'Food & Drinks Welcome'),
  ('pontoons.feature3.text',  'Bring your own cooler, snacks, and beverages. The driver stays sober — everyone else enjoys the ride.'),

  ('pontoons.feature4.title', 'VIP Bay Access'),
  ('pontoons.feature4.text',  'Dock at Seacrets, Fish Tales, or Fager''s Island from the water. Skip the parking and pull right up.'),

  ('pontoons.feature6.title', 'Tubing'),
  ('pontoons.feature6.text',  'Add a tube to your rental and let the kids (or the kids-at-heart) get pulled across the bay. Pure summer fun behind the boat.')
ON CONFLICT (id) DO UPDATE SET
  content    = EXCLUDED.content,
  updated_at = now();
