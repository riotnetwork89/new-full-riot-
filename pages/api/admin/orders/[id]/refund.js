import { supabase } from '../../../../../utils/supabase';
import { client } from '../../../../../utils/paypal';
const paypal = require('@paypal/checkout-server-sdk');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { refund_amount_cents, reason } = req.body;

  try {
    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Order is not eligible for refund' });
    }

    const refundAmount = refund_amount_cents || order.total_cents;

    const refundRequest = new paypal.payments.RefundsPostRequest(order.paypal_order_id);
    refundRequest.requestBody({
      amount: {
        value: (refundAmount / 100).toFixed(2),
        currency_code: order.currency || 'USD'
      },
      note_to_payer: reason || 'Refund processed by admin'
    });

    const refundResponse = await client().execute(refundRequest);

    if (refundResponse.result.status === 'COMPLETED') {
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert({
          order_id: order.id,
          refund_amount_cents: refundAmount,
          paypal_refund_id: refundResponse.result.id,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (refundError) {
        console.error('Refund record creation error:', refundError);
        return res.status(500).json({ error: 'Failed to record refund' });
      }

      const newStatus = refundAmount >= order.total_cents ? 'refunded' : 'paid';
      
      await supabase
        .from('ticket_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (newStatus === 'refunded') {
        await supabase
          .from('tickets')
          .update({ status: 'cancelled' })
          .in('order_item_id', 
            await supabase
              .from('order_items')
              .select('id')
              .eq('order_id', order.id)
              .then(({ data }) => data.map(item => item.id))
          );
      }

      await supabase
        .from('admin_audit_logs')
        .insert({
          admin_email: 'kevinparxmusic@gmail.com',
          action: 'REFUND_PROCESSED',
          resource_type: 'order',
          resource_id: order.id.toString(),
          details: { 
            refund_amount_cents: refundAmount,
            paypal_refund_id: refundResponse.result.id,
            reason 
          }
        });

      res.status(200).json({ 
        success: true, 
        refund,
        paypal_refund_id: refundResponse.result.id 
      });
    } else {
      res.status(400).json({ error: 'Refund failed', details: refundResponse.result });
    }
  } catch (error) {
    console.error('Refund processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
