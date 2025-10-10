import { supabase } from '../../../../../utils/supabase';
import { sendTicketEmail } from '../../../../../utils/emailService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const { data: order, error: orderError } = await supabase
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
        tickets (*)
      `)
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Order is not paid' });
    }

    const emailSent = await sendTicketEmail({
      userEmail: order.user_email,
      order,
      tickets: order.tickets
    });

    if (emailSent) {
      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_email: 'kevinparxmusic@gmail.com',
          action: 'TICKETS_RESENT',
          resource_type: 'order',
          resource_id: order.id.toString(),
          details: { user_email: order.user_email }
        });

      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Resend tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
