const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('Setting up missing database tables...');

  const merchandiseSQL = `
    CREATE TABLE IF NOT EXISTS merchandise (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      price numeric NOT NULL,
      stock integer DEFAULT 0,
      is_active boolean DEFAULT true,
      image_url text,
      created_at timestamptz DEFAULT now()
    );
  `;

  const ordersSQL = `
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
  `;

  const streamLogsSQL = `
    CREATE TABLE IF NOT EXISTS stream_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      status text CHECK (status IN ('LIVE','DISCONNECTED')) NOT NULL,
      bitrate integer,
      notes text,
      created_at timestamptz DEFAULT now()
    );
  `;

  const enableRLSSQL = `
    ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;
    ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE stream_logs ENABLE ROW LEVEL SECURITY;
  `;

  const policiesSQL = `
    -- Merchandise policies
    CREATE POLICY IF NOT EXISTS "merchandise_read_all" ON merchandise FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "merchandise_insert_admin" ON merchandise FOR INSERT USING (true);
    CREATE POLICY IF NOT EXISTS "merchandise_update_admin" ON merchandise FOR UPDATE USING (true);
    CREATE POLICY IF NOT EXISTS "merchandise_delete_admin" ON merchandise FOR DELETE USING (true);

    -- Orders policies
    CREATE POLICY IF NOT EXISTS "orders_read_own" ON orders FOR SELECT 
      USING (auth.uid() = user_id OR EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));
    CREATE POLICY IF NOT EXISTS "orders_insert_authed" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "orders_update_admin" ON orders FOR UPDATE USING (EXISTS(SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role='admin'));

    -- Stream logs policies
    CREATE POLICY IF NOT EXISTS "stream_logs_read_all" ON stream_logs FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "stream_logs_insert_admin" ON stream_logs FOR INSERT USING (true);
    CREATE POLICY IF NOT EXISTS "stream_logs_update_admin" ON stream_logs FOR UPDATE USING (true);
  `;

  try {
    console.log('Creating merchandise table...');
    const { error: merchError } = await supabase.rpc('exec_sql', { sql: merchandiseSQL });
    if (merchError) console.error('Merchandise table error:', merchError);

    console.log('Creating orders table...');
    const { error: ordersError } = await supabase.rpc('exec_sql', { sql: ordersSQL });
    if (ordersError) console.error('Orders table error:', ordersError);

    console.log('Creating stream_logs table...');
    const { error: streamError } = await supabase.rpc('exec_sql', { sql: streamLogsSQL });
    if (streamError) console.error('Stream logs table error:', streamError);

    console.log('Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: enableRLSSQL });
    if (rlsError) console.error('RLS error:', rlsError);

    console.log('Creating policies...');
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    if (policiesError) console.error('Policies error:', policiesError);

    console.log('Inserting sample merchandise...');
    const { error: insertError } = await supabase
      .from('merchandise')
      .insert([
        { name: 'Riot Tee (Black/Red)', price: 35, stock: 50, is_active: true },
        { name: 'Riot Dad Hat', price: 28, stock: 30, is_active: true },
        { name: 'Riot Hoodie', price: 60, stock: 25, is_active: true },
        { name: 'Riot Poster', price: 15, stock: 100, is_active: true },
        { name: 'Riot Stickers', price: 5, stock: 200, is_active: true },
        { name: 'Riot Keychain', price: 10, stock: 150, is_active: true }
      ]);

    if (insertError) {
      console.error('Sample data insert error:', insertError);
    } else {
      console.log('Sample merchandise data inserted successfully!');
    }

    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error);
  }
}

setupDatabase();
