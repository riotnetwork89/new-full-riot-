const { client } = require('../../../utils/paypal');
const { supabase } = require('../../../utils/supabase');
const paypal = require('@paypal/checkout-server-sdk');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cartItems, userEmail } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid cart items' });
    }

    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of cartItems) {
      const { data: tier, error } = await supabase
        .from('ticket_tiers')
        .select('*, events(*)')
        .eq('id', item.tierId)
        .single();

      if (error || !tier) {
        return res.status(400).json({ error: `Invalid ticket tier: ${item.tierId}` });
      }

      const availableQuantity = tier.quantity_total - tier.quantity_sold;
      if (item.quantity > availableQuantity) {
        return res.status(400).json({ 
          error: `Not enough tickets available. Only ${availableQuantity} left for ${tier.name}` 
        });
      }

      if (item.quantity > tier.limits_per_order) {
        return res.status(400).json({ 
          error: `Maximum ${tier.limits_per_order} tickets per order for ${tier.name}` 
        });
      }

      const now = new Date();
      const saleStart = new Date(tier.events.sale_start);
      const saleEnd = new Date(tier.events.sale_end);

      if (now < saleStart || now > saleEnd) {
        return res.status(400).json({ error: 'Tickets are not currently on sale' });
      }

      const itemTotal = tier.price_cents * item.quantity;
      totalAmount += itemTotal;

      verifiedItems.push({
        tierId: tier.id,
        tierName: tier.name,
        quantity: item.quantity,
        unitPrice: tier.price_cents,
        total: itemTotal,
        eventTitle: tier.events.title
      });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: (totalAmount / 100).toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: (totalAmount / 100).toFixed(2)
            }
          }
        },
        items: verifiedItems.map(item => ({
          name: `${item.eventTitle} - ${item.tierName}`,
          unit_amount: {
            currency_code: 'USD',
            value: (item.unitPrice / 100).toFixed(2)
          },
          quantity: item.quantity.toString()
        }))
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/tickets/cancel`
      }
    });

    const order = await client().execute(request);

    const { data: dbOrder, error: orderError } = await supabase
      .from('ticket_orders')
      .insert({
        user_email: userEmail,
        status: 'pending',
        total_cents: totalAmount,
        paypal_order_id: order.result.id
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Database error: ${orderError.message}`);
    }

    for (const item of verifiedItems) {
      await supabase
        .from('order_items')
        .insert({
          order_id: dbOrder.id,
          ticket_tier_id: item.tierId,
          qty: item.quantity,
          unit_price_cents: item.unitPrice
        });
    }

    res.status(200).json({
      orderID: order.result.id,
      dbOrderId: dbOrder.id
    });

  } catch (error) {
    console.error('PayPal order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
