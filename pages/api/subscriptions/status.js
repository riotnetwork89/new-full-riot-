import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_tiers (
          name,
          features_json,
          duration_days
        )
      `)
      .eq('user_email', userEmail)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!subscription) {
      return res.status(200).json({
        hasActiveSubscription: false,
        tier: null
      });
    }

    const features = JSON.parse(subscription.subscription_tiers.features_json || '[]');

    res.status(200).json({
      hasActiveSubscription: true,
      tier: {
        name: subscription.subscription_tiers.name,
        features,
        endDate: subscription.end_date,
        daysRemaining: Math.ceil((new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
}
