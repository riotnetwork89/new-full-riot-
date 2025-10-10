import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_tiers (
            id,
            name,
            price_cents,
            quantity_total,
            quantity_sold,
            limits_per_order
          )
        `)
        .eq('is_active', true)
        .gte('sale_end', new Date().toISOString())
        .order('start_datetime', { ascending: true });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }

      const eventsWithAvailability = events.map(event => ({
        ...event,
        ticket_tiers: event.ticket_tiers.map(tier => ({
          ...tier,
          available: tier.quantity_total - tier.quantity_sold,
          price_dollars: tier.price_cents / 100
        }))
      }));

      res.status(200).json({ events: eventsWithAvailability });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
