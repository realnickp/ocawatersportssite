-- ================================================
-- OCA Watersports CMS - Supabase Setup
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kokusecmajupumitprue/sql
-- ================================================

-- 1. Editable text content
CREATE TABLE site_content (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_content"
  ON site_content FOR SELECT USING (true);

-- 2. Coupons
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('jet-ski', 'boat', 'special')),
  type_label TEXT NOT NULL,
  code TEXT,
  offer TEXT NOT NULL,
  detail TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active coupons"
  ON coupons FOR SELECT USING (active = true);

-- 3. Admin settings (password)
CREATE TABLE admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read admin_settings"
  ON admin_settings FOR SELECT USING (true);

INSERT INTO admin_settings (key, value)
VALUES ('admin_password', 'OCJetskis26!');

-- 4. RPC functions for authenticated writes

CREATE OR REPLACE FUNCTION update_content(
  p_password TEXT,
  p_id TEXT,
  p_content TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  stored_pw TEXT;
BEGIN
  SELECT value INTO stored_pw FROM admin_settings WHERE key = 'admin_password';
  IF stored_pw IS DISTINCT FROM p_password THEN
    RETURN false;
  END IF;
  INSERT INTO site_content (id, content, updated_at)
  VALUES (p_id, p_content, now())
  ON CONFLICT (id) DO UPDATE SET content = p_content, updated_at = now();
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upsert_coupon(
  p_password TEXT,
  p_id UUID,
  p_category TEXT,
  p_type_label TEXT,
  p_code TEXT,
  p_offer TEXT,
  p_detail TEXT,
  p_active BOOLEAN
) RETURNS UUID AS $$
DECLARE
  stored_pw TEXT;
  result_id UUID;
BEGIN
  SELECT value INTO stored_pw FROM admin_settings WHERE key = 'admin_password';
  IF stored_pw IS DISTINCT FROM p_password THEN
    RETURN NULL;
  END IF;
  IF p_id IS NULL THEN
    INSERT INTO coupons (category, type_label, code, offer, detail, active)
    VALUES (p_category, p_type_label, p_code, p_offer, p_detail, p_active)
    RETURNING id INTO result_id;
  ELSE
    UPDATE coupons SET
      category = p_category,
      type_label = p_type_label,
      code = p_code,
      offer = p_offer,
      detail = p_detail,
      active = p_active
    WHERE id = p_id;
    result_id := p_id;
  END IF;
  RETURN result_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_coupon(
  p_password TEXT,
  p_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  stored_pw TEXT;
BEGIN
  SELECT value INTO stored_pw FROM admin_settings WHERE key = 'admin_password';
  IF stored_pw IS DISTINCT FROM p_password THEN
    RETURN false;
  END IF;
  DELETE FROM coupons WHERE id = p_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Seed existing coupons

INSERT INTO coupons (category, type_label, code, offer, detail) VALUES
('jet-ski', 'Starts June 16th · 1st Ride of the Day', 'EARLYBIRD', 'Buy 1 Jet Ski, get the 2nd Jet Ski HALF OFF!', 'The best deal in OC. Book the first ride of the day — glassy water, no boat traffic, dolphins are more active. Buy one ski at full price, get the second 50% off. Use the code online or mention it when you call.'),
('jet-ski', 'Any Ride · Any Time', 'JETSKI15', '$15 OFF Any Ride, Any Time', 'No restrictions. Apply at checkout when booking online, or mention the code when you call. One code per booking.'),
('jet-ski', 'Before Noon Only', 'JETSKI20', '$20 OFF Any Ride Before Noon!', 'Morning rides are the best rides. Less traffic, better light, and $20 more in your pocket. Book a ride starting before 12:00 PM and apply this code at checkout.'),
('jet-ski', 'Starts June 16th · Last Ride of the Day', 'SUNSETRIDE', 'Buy 1 Jet Ski, get the 2nd Jet Ski HALF OFF!', 'Ocean City''s Famous Sunset Ride. Golden hour on the bay, the horses are usually out, the light is unreal. Buy one ski at full price, get the second 50% off. Best ride AND best deal in OC.'),
('boat', 'Early Bird Boat Special · Book by 9am', 'EARLYBIRDBOAT', 'Book by 9am, Get 1 Hour FREE!', 'Book a 3-hour rental and only pay for 2 hours. Limited specials per day available. Max 4-hour boat for this deal — extra hours can be paid for separately. Call in advance to book. If the 9am slots are sold out, earlier slots may be open and the same deal applies.'),
('special', 'OC Local Discount', NULL, 'Live Nearby? You Qualify for Local Pricing.', 'Do you live in Wicomico, Worcester, Somerset, Dorchester, or Sussex County? You qualify for our local discount. Applies any day pre-season (before Memorial Day Weekend & after Labor Day Weekend) and Mon–Wed during season. Call for best price — discount depends on day and time.');
