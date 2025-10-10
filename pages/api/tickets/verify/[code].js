const { supabase } = require('../../../../utils/supabase');

export default async function handler(req, res) {
  const { code } = req.query;

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        order_items(
          *,
          ticket_tiers(
            *,
            events(*)
          ),
          ticket_orders(*)
        )
      `)
      .eq('ticket_code', code)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        valid: ticket.status === 'valid',
        ticket: {
          code: ticket.ticket_code,
          status: ticket.status,
          eventTitle: ticket.order_items.ticket_tiers.events.title,
          venue: ticket.order_items.ticket_tiers.events.venue,
          startDateTime: ticket.order_items.ticket_tiers.events.start_datetime,
          tierName: ticket.order_items.ticket_tiers.name,
          holderEmail: ticket.order_items.ticket_orders.user_email,
          usedAt: ticket.used_at
        }
      });
    }

    if (req.method === 'POST') {
      if (ticket.status !== 'valid') {
        return res.status(400).json({ 
          error: `Ticket already ${ticket.status}`,
          ticket: {
            code: ticket.ticket_code,
            status: ticket.status,
            usedAt: ticket.used_at
          }
        });
      }

      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'used',
          used_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (updateError) {
        throw new Error(`Failed to update ticket: ${updateError.message}`);
      }

      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_email: req.body.adminEmail || 'scanner',
          action: 'ticket_scanned',
          resource_type: 'ticket',
          resource_id: ticket.id.toString(),
          details: {
            ticket_code: code,
            event_title: ticket.order_items.ticket_tiers.events.title,
            scanned_at: new Date().toISOString()
          }
        });

      return res.status(200).json({
        success: true,
        message: 'Ticket successfully scanned',
        ticket: {
          code: ticket.ticket_code,
          eventTitle: ticket.order_items.ticket_tiers.events.title,
          tierName: ticket.order_items.ticket_tiers.name,
          holderEmail: ticket.order_items.ticket_orders.user_email,
          scannedAt: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Ticket verification error:', error);
    res.status(500).json({ error: 'Failed to verify ticket' });
  }
}
