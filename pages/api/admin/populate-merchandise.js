import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {

    const { data: existingMerch, error: checkError } = await supabase
      .from('merchandise')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing merchandise:', checkError);
      return res.status(500).json({ error: 'Database error checking existing data' });
    }

    if (existingMerch && existingMerch.length > 0) {
      return res.status(200).json({ 
        message: 'Merchandise already exists', 
        count: existingMerch.length 
      });
    }

    const merchandiseData = [
      { name: 'Riot Tee (Black/Red)', price: 35, stock: 50, is_active: true },
      { name: 'Riot Dad Hat', price: 28, stock: 30, is_active: true },
      { name: 'Riot Hoodie', price: 60, stock: 25, is_active: true },
      { name: 'Riot Sticker Pack', price: 12, stock: 100, is_active: true },
      { name: 'Riot Poster', price: 15, stock: 75, is_active: true },
      { name: 'Riot Keychain', price: 10, stock: 150, is_active: true }
    ];

    const { data: insertedData, error: insertError } = await supabase
      .from('merchandise')
      .insert(merchandiseData)
      .select();

    if (insertError) {
      console.error('Error inserting merchandise:', insertError);
      return res.status(500).json({ 
        error: 'Failed to insert merchandise', 
        details: insertError.message 
      });
    }

    return res.status(200).json({ 
      message: 'Merchandise populated successfully', 
      count: insertedData.length,
      data: insertedData
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
