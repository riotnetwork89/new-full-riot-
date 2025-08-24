import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const fixes = [];

    try {
      const { error: checkError } = await supabase
        .from('merchandise')
        .select('description')
        .limit(1);
      
      if (checkError && checkError.message.includes('description')) {
        fixes.push({ fix: 'Add description column', status: 'needed', error: 'Column missing - requires manual SQL execution' });
      } else {
        fixes.push({ fix: 'Add description column', status: 'exists' });
      }
    } catch (error) {
      fixes.push({ fix: 'Add description column', status: 'failed', error: error.message });
    }

    try {
      const { error: checkVodError } = await supabase
        .from('vod_edits')
        .select('id')
        .limit(1);
      
      if (checkVodError && checkVodError.message.includes('does not exist')) {
        fixes.push({ fix: 'Create vod_edits table', status: 'needed', error: 'Table missing - requires manual SQL execution' });
      } else {
        fixes.push({ fix: 'Create vod_edits table', status: 'exists' });
      }
    } catch (error) {
      fixes.push({ fix: 'Create vod_edits table', status: 'failed', error: error.message });
    }

    try {
      fixes.push({ fix: 'Setup vod_edits RLS policies', status: 'skipped', reason: 'Requires manual SQL execution' });
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
          { name: 'Riot Tee (Black/Red)', price: 35, stock: 50, is_active: true },
          { name: 'Riot Dad Hat', price: 28, stock: 30, is_active: true },
          { name: 'Riot Hoodie', price: 60, stock: 25, is_active: true },
          { name: 'Riot Sticker Pack', price: 12, stock: 100, is_active: true }
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
