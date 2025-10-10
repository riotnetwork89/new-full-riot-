export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email required' });
    }

    const mockSubscription = localStorage?.getItem('mockSubscription');
    
    if (!mockSubscription) {
      return res.status(200).json({
        hasActiveSubscription: false,
        tier: null
      });
    }

    const subscriptionData = JSON.parse(mockSubscription);
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
