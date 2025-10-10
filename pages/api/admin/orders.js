import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { search, status, page = 1, limit = 50 } = req.query;
      
      let query = supabase
        .from('ticket_orders')
        .select(`
          *,
          order_items (
            *,
            ticket_tier:ticket_tiers (
              name,
              event:events (title, venue, start_datetime)
            )
          ),
          tickets (
            id,
            ticket_code,
            status,
            used_at
          )
        `)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`user_email.ilike.%${search}%,order_uuid.ilike.%${search}%`);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      query = query.range(offset, offset + parseInt(limit) - 1);

      const { data: orders, error } = await query;

      if (error) {
        console.error('Orders fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }

      res.status(200).json({ orders });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
