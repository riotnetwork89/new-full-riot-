import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { slug } = req.query;

    try {
      const { data: event, error } = await supabase
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
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const now = new Date();
      const saleStart = new Date(event.sale_start);
      const saleEnd = new Date(event.sale_end);

      if (now < saleStart) {
        return res.status(400).json({ error: 'Ticket sales have not started yet' });
      }

      if (now > saleEnd) {
        return res.status(400).json({ error: 'Ticket sales have ended' });
      }

      const eventWithAvailability = {
        ...event,
        ticket_tiers: event.ticket_tiers.map(tier => ({
          ...tier,
          available: tier.quantity_total - tier.quantity_sold,
          price_dollars: tier.price_cents / 100
        }))
      };

      res.status(200).json({ event: eventWithAvailability });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
