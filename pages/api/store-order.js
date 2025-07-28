import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  const { email } = req.body;
  const { error } = await supabase.from('orders').insert([{ email }]);
  if (error) return res.status(500).json({ error });
  res.status(200).json({ success: true });
}
