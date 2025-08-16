import { supabase } from '../../../utils/supabase';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_BASE_URL = process.env.RIOT_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

async function capturePayPalOrder(orderID, accessToken) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  });

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderID, email, event_id, amount } = req.body;

  if (!orderID || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const captureData = await capturePayPalOrder(orderID, accessToken);

    if (captureData.status === 'COMPLETED') {
      const { error } = await supabase
        .from('orders')
        .insert({
          email,
          event_id,
          provider: 'paypal',
          provider_order_id: orderID,
          amount: parseFloat(amount),
          status: 'COMPLETED'
        });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Failed to save order' });
      }

      return res.status(200).json({ success: true, captureData });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('PayPal capture error:', error);
    return res.status(500).json({ error: 'Payment processing failed' });
  }
}
