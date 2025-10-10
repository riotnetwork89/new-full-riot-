import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookEvent = req.body;
    
    if (webhookEvent.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paypalOrderId = webhookEvent.resource.supplementary_data.related_ids.order_id;
      
      const { data: order, error } = await supabase
        .from('ticket_orders')
        .select('*')
        .eq('paypal_order_id', paypalOrderId)
        .single();

      if (error || !order) {
        console.error('Order not found for PayPal webhook:', paypalOrderId);
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'paid') {
        await supabase
          .from('ticket_orders')
          .update({ 
            status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        await supabase
          .from('admin_audit_logs')
          .insert({
            admin_email: 'system',
            action: 'WEBHOOK_PAYMENT_CONFIRMED',
            resource_type: 'order',
            resource_id: order.id.toString(),
            details: { paypal_order_id: paypalOrderId, webhook_event: webhookEvent.event_type }
          });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
