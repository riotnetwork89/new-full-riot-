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

    const createTableSQL = `
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

    const enableRLSSQL = `ALTER TABLE vod_edits ENABLE ROW LEVEL SECURITY;`;

    const policiesSQL = `
      CREATE POLICY IF NOT EXISTS "vod_edits_read_all" ON vod_edits FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "vod_edits_insert_authed" ON vod_edits FOR INSERT TO authenticated WITH CHECK (true);
      CREATE POLICY IF NOT EXISTS "vod_edits_update_admin" ON vod_edits FOR UPDATE USING (true);
      CREATE POLICY IF NOT EXISTS "vod_edits_delete_admin" ON vod_edits FOR DELETE USING (true);
    `;

    console.log('Creating vod_edits table...');
    const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL });
    if (createError) {
      console.error('Error creating table:', createError);
    }

    console.log('Enabling RLS...');
    const { error: rlsError } = await supabase.rpc('exec', { sql: enableRLSSQL });
    if (rlsError) {
      console.error('Error enabling RLS:', rlsError);
    }

    console.log('Creating policies...');
    const { error: policiesError } = await supabase.rpc('exec', { sql: policiesSQL });
    if (policiesError) {
      console.error('Error creating policies:', policiesError);
    }

    const { data: testQuery, error: testError } = await supabase
      .from('vod_edits')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('Table verification failed:', testError);
      return res.status(500).json({ 
        error: 'Table creation failed', 
        details: testError.message 
      });
    }

    return res.status(200).json({ 
      message: 'vod_edits table created successfully',
      tableExists: true
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
