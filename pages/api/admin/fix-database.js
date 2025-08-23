import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const fixes = [];

    try {
      const { error: addColumnError } = await supabase.rpc('exec', { 
        sql: 'ALTER TABLE merchandise ADD COLUMN IF NOT EXISTS description text;' 
      });
      if (addColumnError) {
        console.error('Error adding description column:', addColumnError);
        fixes.push({ fix: 'Add description column', status: 'failed', error: addColumnError.message });
      } else {
        fixes.push({ fix: 'Add description column', status: 'success' });
      }
    } catch (error) {
      fixes.push({ fix: 'Add description column', status: 'failed', error: error.message });
    }

    try {
      const createVodTableSQL = `
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
      `;

      const { error: createTableError } = await supabase.rpc('exec', { sql: createVodTableSQL });
      if (createTableError) {
        console.error('Error creating vod_edits table:', createTableError);
        fixes.push({ fix: 'Create vod_edits table', status: 'failed', error: createTableError.message });
      } else {
        fixes.push({ fix: 'Create vod_edits table', status: 'success' });
      }
    } catch (error) {
      fixes.push({ fix: 'Create vod_edits table', status: 'failed', error: error.message });
    }

    try {
      const rlsSQL = `
        ALTER TABLE vod_edits ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "vod_edits_read_all" ON vod_edits FOR SELECT USING (true);
        CREATE POLICY IF NOT EXISTS "vod_edits_insert_authed" ON vod_edits FOR INSERT TO authenticated WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "vod_edits_update_admin" ON vod_edits FOR UPDATE USING (true);
        CREATE POLICY IF NOT EXISTS "vod_edits_delete_admin" ON vod_edits FOR DELETE USING (true);
      `;

      const { error: rlsError } = await supabase.rpc('exec', { sql: rlsSQL });
      if (rlsError) {
        console.error('Error setting up RLS policies:', rlsError);
        fixes.push({ fix: 'Setup vod_edits RLS policies', status: 'failed', error: rlsError.message });
      } else {
        fixes.push({ fix: 'Setup vod_edits RLS policies', status: 'success' });
      }
    } catch (error) {
      fixes.push({ fix: 'Setup vod_edits RLS policies', status: 'failed', error: error.message });
    }

    try {
      const { data: existingMerch, error: checkError } = await supabase
        .from('merchandise')
        .select('id')
        .limit(1);

      if (!checkError && (!existingMerch || existingMerch.length === 0)) {
        const sampleMerch = [
          { name: 'Riot Tee (Black/Red)', description: 'Premium black and red Riot Network t-shirt with official logo', price: 35, stock: 50, is_active: true },
          { name: 'Riot Dad Hat', description: 'Classic dad hat with embroidered Riot Network logo', price: 28, stock: 30, is_active: true },
          { name: 'Riot Hoodie', description: 'Comfortable hoodie with large Riot Network branding', price: 60, stock: 25, is_active: true },
          { name: 'Riot Sticker Pack', description: 'Set of 5 premium vinyl stickers', price: 12, stock: 100, is_active: true }
        ];

        const { error: insertError } = await supabase
          .from('merchandise')
          .insert(sampleMerch);

        if (insertError) {
          fixes.push({ fix: 'Insert sample merchandise', status: 'failed', error: insertError.message });
        } else {
          fixes.push({ fix: 'Insert sample merchandise', status: 'success' });
        }
      } else {
        fixes.push({ fix: 'Insert sample merchandise', status: 'skipped', reason: 'Data already exists' });
      }
    } catch (error) {
      fixes.push({ fix: 'Insert sample merchandise', status: 'failed', error: error.message });
    }

    return res.status(200).json({ 
      message: 'Database fixes completed',
      fixes: fixes,
      summary: {
        total: fixes.length,
        successful: fixes.filter(f => f.status === 'success').length,
        failed: fixes.filter(f => f.status === 'failed').length,
        skipped: fixes.filter(f => f.status === 'skipped').length
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
