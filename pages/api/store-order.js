import { supabase } from '../../utils/supabase';
import { dbPool, monitor } from '../../utils/performance';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, product, type } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await dbPool.acquire();
    
    monitor.startTimer('store-order');
    
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('email', email)
      .eq('product', product || 'ppv_ticket')
      .single();
    
    if (existingOrder) {
      dbPool.release();
      monitor.endTimer('store-order');
      return res.status(409).json({ error: 'Order already exists' });
    }
    
    const { error } = await supabase.from('orders').insert([{ 
      email, 
      product: product || 'ppv_ticket', 
      type: type || 'ticket',
      timestamp: new Date().toISOString()
    }]);
    
    dbPool.release();
    monitor.endTimer('store-order');
    
    if (error) {
      console.error('Order insertion error:', error);
      return res.status(500).json({ error: 'Failed to create order' });
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    dbPool.release();
    monitor.endTimer('store-order');
    console.error('Store order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
