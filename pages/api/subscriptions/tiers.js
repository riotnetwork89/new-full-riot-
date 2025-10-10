export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const mockTiers = [
        {
          id: 1,
          name: 'Basic',
          price_cents: 999,
          price_dollars: 9.99,
          duration_days: 30,
          features: [
            'Access to live streams',
            'Standard chat participation',
            'Basic VOD library access',
            'Mobile app access'
          ],
          description: 'Essential access to Riot Network content',
          is_active: true
        },
        {
          id: 2,
          name: 'VIP',
          price_cents: 1999,
          price_dollars: 19.99,
          duration_days: 30,
          features: [
            'All Basic features',
            'Early ticket access (24h priority)',
            'VIP chat badge and priority',
            'Exclusive VIP-only streams',
            'Behind-the-scenes content',
            'Monthly VIP meetups'
          ],
          description: 'Premium experience with exclusive perks',
          is_active: true
        },
        {
          id: 3,
          name: 'Premium',
          price_cents: 4999,
          price_dollars: 49.99,
          duration_days: 30,
          features: [
            'All VIP features',
            'Backstage access content',
            'Artist meet & greet opportunities',
            'Exclusive merchandise discounts',
            'Priority customer support',
            'Custom profile badges',
            'Ad-free experience'
          ],
          description: 'Ultimate Riot Network experience',
          is_active: true
        }
      ];

      res.status(200).json({ tiers: mockTiers });
    } catch (error) {
      console.error('Get tiers error:', error);
      res.status(500).json({ error: 'Failed to fetch subscription tiers' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, price_cents, duration_days, features, description } = req.body;

      if (!name || !price_cents || !duration_days) {
        return res.status(400).json({ error: 'Name, price, and duration required' });
      }

      const { data, error } = await supabase
        .from('subscription_tiers')
        .insert({
          name,
          price_cents,
          duration_days,
          features_json: JSON.stringify(features || []),
          description,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({ tier: data });
    } catch (error) {
      console.error('Create tier error:', error);
      res.status(500).json({ error: 'Failed to create subscription tier' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
