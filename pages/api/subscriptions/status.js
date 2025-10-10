export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    const mockSubscriptions = {
      'test@riot.com': {
        tierName: 'VIP',
        features: ['Early ticket access', 'Exclusive content', 'VIP chat badge', 'Priority support'],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      },
      'kevinparxmusic@gmail.com': {
        tierName: 'Premium',
        features: ['HD streaming', 'Chat access', 'VOD library'],
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days from now
      }
    };

    const subscriptionData = mockSubscriptions[userEmail];
    
    if (!subscriptionData) {
      return res.status(200).json({
        hasActiveSubscription: false,
        tier: null
      });
    }

    const endDate = new Date(subscriptionData.endDate);
    const now = new Date();
    
    if (endDate < now) {
      return res.status(200).json({
        hasActiveSubscription: false,
        tier: null
      });
    }

    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      hasActiveSubscription: true,
      tier: {
        name: subscriptionData.tierName,
        features: subscriptionData.features,
        endDate: subscriptionData.endDate,
        daysRemaining
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Failed to check subscription status' });
  }
}
