import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const {
        title,
        venue,
        startDateTime,
        endDateTime,
        description,
        imageUrl,
        saleStart,
        saleEnd,
        ticketTiers
      } = req.body;

      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          title,
          slug,
          venue,
          start_datetime: startDateTime,
          end_datetime: endDateTime,
          description,
          image_url: imageUrl,
          sale_start: saleStart,
          sale_end: saleEnd,
          is_active: true
        })
        .select()
        .single();

      if (eventError) {
        console.error('Event creation error:', eventError);
        return res.status(400).json({ error: eventError.message });
      }

      const tierInserts = ticketTiers.map(tier => ({
        event_id: event.id,
        name: tier.name,
        price_cents: Math.round(tier.price * 100), // Convert dollars to cents
        quantity_total: tier.quantity,
        quantity_sold: 0,
        limits_per_order: tier.limits || 10
      }));

      const { error: tiersError } = await supabase
        .from('ticket_tiers')
        .insert(tierInserts);

      if (tiersError) {
        console.error('Ticket tiers creation error:', tiersError);
        return res.status(400).json({ error: tiersError.message });
      }

      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_email: 'kevinparxmusic@gmail.com',
          action: 'CREATE_EVENT',
          resource_type: 'event',
          resource_id: event.id.toString(),
          details: { title, venue, ticketTiers: ticketTiers.length }
        });

      res.status(201).json({ success: true, event });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
