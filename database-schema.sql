
CREATE TABLE IF NOT EXISTS merchandise (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  event_id uuid REFERENCES events(id),
  provider text DEFAULT 'paypal',
  provider_order_id text,
  amount numeric NOT NULL,
  status text CHECK (status IN ('CREATED','APPROVED','COMPLETED','CANCELED')) DEFAULT 'CREATED',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stream_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text CHECK (status IN ('LIVE','DISCONNECTED')) NOT NULL,
  bitrate integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchandise_read_all" ON merchandise FOR SELECT USING (true);
CREATE POLICY "merchandise_insert_admin" ON merchandise FOR INSERT WITH CHECK (true);
CREATE POLICY "merchandise_update_admin" ON merchandise FOR UPDATE USING (true);
CREATE POLICY "merchandise_delete_admin" ON merchandise FOR DELETE USING (true);

CREATE POLICY "orders_read_own" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));
CREATE POLICY "orders_insert_authed" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));

CREATE POLICY "stream_logs_read_all" ON stream_logs FOR SELECT USING (true);
CREATE POLICY "stream_logs_insert_admin" ON stream_logs FOR INSERT USING (true);
CREATE POLICY "stream_logs_update_admin" ON stream_logs FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS vod_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_timestamp timestamptz,
  caption text NOT NULL,
  is_live_edit boolean DEFAULT false,
  approved boolean DEFAULT false,
  published_at timestamptz,
  notification_sent boolean DEFAULT false,
  submitted_by uuid REFERENCES auth.users(id),
  video_url text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vod_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vod_edits_read_all" ON vod_edits FOR SELECT USING (true);
CREATE POLICY "vod_edits_insert_authed" ON vod_edits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "vod_edits_update_admin" ON vod_edits FOR UPDATE USING (true);
CREATE POLICY "vod_edits_delete_admin" ON vod_edits FOR DELETE USING (true);

INSERT INTO merchandise (name, price, stock, is_active) VALUES
('Riot Tee (Black/Red)', 35, 50, true),
('Riot Dad Hat', 28, 30, true),
('Riot Hoodie', 60, 25, true),
('Riot Poster', 15, 100, true),
('Riot Stickers', 5, 200, true),
('Riot Keychain', 10, 150, true);
