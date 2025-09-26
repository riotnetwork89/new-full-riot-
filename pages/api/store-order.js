import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  const { email, product, type } = req.body;
  const { error } = await supabase.from('orders').insert([{ 
    email, 
    product: product || 'ppv_ticket', 
    type: type || 'ticket',
    timestamp: new Date().toISOString()
  }]);
  if (error) return res.status(500).json({ error });
  res.status(200).json({ success: true });
}
