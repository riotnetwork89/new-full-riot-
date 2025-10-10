import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subscription, userEmail } = req.body;

    if (!subscription || !userEmail) {
      return res.status(400).json({ error: 'Subscription and user email required' });
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_email: userEmail,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_email'
      });

    if (error) {
      throw error;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}
