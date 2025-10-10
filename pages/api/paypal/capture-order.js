const { client } = require('../../../utils/paypal');
const { supabase } = require('../../../utils/supabase');
const { generateTicketPDF } = require('../../../utils/pdfGenerator');
const { sendTicketEmail, sendOrderConfirmation } = require('../../../utils/emailService');
const paypal = require('@paypal/checkout-server-sdk');
const { v4: uuidv4 } = require('uuid');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'Order ID required' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    const capture = await client().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const { data: order, error: orderError } = await supabase
      .from('ticket_orders')
      .select('*, order_items(*, ticket_tiers(*, events(*)))')
      .eq('paypal_order_id', orderID)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const capturedAmount = Math.round(parseFloat(capture.result.purchase_units[0].payments.captures[0].amount.value) * 100);
    if (capturedAmount !== order.total_cents) {
      return res.status(400).json({ error: 'Payment amount mismatch' });
    }

    const { error: updateError } = await supabase.rpc('process_ticket_order', {
      p_order_id: order.id,
      p_order_items: order.order_items
    });

    if (updateError) {
      throw new Error(`Failed to process order: ${updateError.message}`);
    }

    await supabase
      .from('ticket_orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    const tickets = [];
    for (const orderItem of order.order_items) {
      for (let i = 0; i < orderItem.qty; i++) {
        const ticketCode = `RIOT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const qrcodeData = `${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/verify/${ticketCode}`;
        
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            order_item_id: orderItem.id,
            ticket_code: ticketCode,
            qrcode_data: qrcodeData
          })
          .select()
          .single();

        if (ticketError) {
          throw new Error(`Failed to create ticket: ${ticketError.message}`);
        }

        const ticketData = {
          ticketUuid: ticket.ticket_uuid,
          ticketCode: ticketCode,
          qrcode_data: qrcodeData,
          eventTitle: orderItem.ticket_tiers.events.title,
          venue: orderItem.ticket_tiers.events.venue,
          startDateTime: orderItem.ticket_tiers.events.start_datetime,
          tierName: orderItem.ticket_tiers.name,
          price: orderItem.unit_price_cents,
          orderUuid: order.order_uuid
        };

        const pdfUrl = await generateTicketPDF(ticketData);

        await supabase
          .from('tickets')
          .update({ pdf_url: pdfUrl })
          .eq('id', ticket.id);

        tickets.push({
          ...ticket,
          pdfUrl,
          ticketCode,
          tierName: orderItem.ticket_tiers.name
        });
      }
    }

    await sendOrderConfirmation({
      userEmail: order.user_email,
      orderUuid: order.order_uuid,
      eventTitle: order.order_items[0].ticket_tiers.events.title,
      totalAmount: order.total_cents
    });

    await sendTicketEmail({
      userEmail: order.user_email,
      orderUuid: order.order_uuid,
      tickets,
      eventTitle: order.order_items[0].ticket_tiers.events.title,
      totalAmount: order.total_cents
    });

    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_email: 'system',
        action: 'ticket_purchase_completed',
        resource_type: 'order',
        resource_id: order.id.toString(),
        details: {
          paypal_order_id: orderID,
          tickets_generated: tickets.length,
          total_amount: order.total_cents
        }
      });

    res.status(200).json({
      success: true,
      orderUuid: order.order_uuid,
      tickets: tickets.map(t => ({
        ticketCode: t.ticketCode,
        pdfUrl: t.pdfUrl
      }))
    });

  } catch (error) {
    console.error('PayPal capture error:', error);
    res.status(500).json({ error: 'Failed to capture payment' });
  }
}
