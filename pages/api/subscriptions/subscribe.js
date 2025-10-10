import { client } from '../../../utils/paypal';
import { supabase } from '../../../utils/supabase';
import paypal from '@paypal/checkout-server-sdk';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tierId, userEmail } = req.body;

    if (!tierId || !userEmail) {
      return res.status(400).json({ error: 'Tier ID and user email required' });
    }

    const { data: tier, error: tierError } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('is_active', true)
      .single();

    if (tierError || !tier) {
      return res.status(404).json({ error: 'Subscription tier not found' });
    }

    const subscriptionUuid = uuidv4();

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: subscriptionUuid,
        amount: {
          currency_code: 'USD',
          value: (tier.price_cents / 100).toFixed(2)
        },
        description: `${tier.name} Subscription - Riot Network`
      }],
      application_context: {
        brand_name: 'Riot Network',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscription/cancel`
      }
    });

    const order = await client().execute(request);

    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        subscription_uuid: subscriptionUuid,
        user_email: userEmail,
        tier_id: tierId,
        status: 'pending',
        paypal_order_id: order.result.id,
        total_cents: tier.price_cents,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) {
      throw subError;
    }

    res.status(200).json({
      orderID: order.result.id,
      subscriptionId: subscription.id
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
}
