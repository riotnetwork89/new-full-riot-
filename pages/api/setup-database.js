import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Setting up missing database tables...');

    const { error: merchError } = await supabase
      .from('merchandise')
      .select('id')
      .limit(1);

    if (merchError && merchError.code === 'PGRST116') {
      console.log('Creating merchandise table...');
    }

    const { data: merchData, error: merchInsertError } = await supabase
      .from('merchandise')
      .insert([
        { name: 'Riot Tee (Black/Red)', price: 35, stock: 50, is_active: true },
        { name: 'Riot Dad Hat', price: 28, stock: 30, is_active: true },
        { name: 'Riot Hoodie', price: 60, stock: 25, is_active: true },
        { name: 'Riot Poster', price: 15, stock: 100, is_active: true },
        { name: 'Riot Stickers', price: 5, stock: 200, is_active: true },
        { name: 'Riot Keychain', price: 10, stock: 150, is_active: true }
      ])
      .select();

    const { error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    const { error: streamError } = await supabase
      .from('stream_logs')
      .select('id')
      .limit(1);

    const results = {
      merchandise: {
        exists: !merchInsertError || merchInsertError.code !== 'PGRST116',
        error: merchInsertError?.message,
        data: merchData
      },
      orders: {
        exists: !ordersError || ordersError.code !== 'PGRST116',
        error: ordersError?.message
      },
      stream_logs: {
        exists: !streamError || streamError.code !== 'PGRST116',
        error: streamError?.message
      }
    };

    return res.status(200).json({
      message: 'Database setup check completed',
      results,
      sql_needed: `
-- Run this SQL in your Supabase dashboard SQL Editor:

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

-- Enable RLS
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "merchandise_read_all" ON merchandise FOR SELECT USING (true);
CREATE POLICY "merchandise_insert_admin" ON merchandise FOR INSERT USING (true);
CREATE POLICY "merchandise_update_admin" ON merchandise FOR UPDATE USING (true);
CREATE POLICY "merchandise_delete_admin" ON merchandise FOR DELETE USING (true);

CREATE POLICY "orders_read_own" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));
CREATE POLICY "orders_insert_authed" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));

CREATE POLICY "stream_logs_read_all" ON stream_logs FOR SELECT USING (true);
CREATE POLICY "stream_logs_insert_admin" ON stream_logs FOR INSERT USING (true);
CREATE POLICY "stream_logs_update_admin" ON stream_logs FOR UPDATE USING (true);

-- Insert sample merchandise data
INSERT INTO merchandise (name, price, stock, is_active) VALUES
('Riot Tee (Black/Red)', 35, 50, true),
('Riot Dad Hat', 28, 30, true),
('Riot Hoodie', 60, 25, true),
('Riot Poster', 15, 100, true),
('Riot Stickers', 5, 200, true),
('Riot Keychain', 10, 150, true);
      `
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      error: error.message,
      message: 'Database setup failed - tables may need to be created manually in Supabase dashboard'
    });
  }
}
