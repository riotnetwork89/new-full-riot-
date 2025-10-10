import { supabase } from '../../../utils/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: tiers, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) {
        throw error;
      }

      const tiersWithFeatures = tiers.map(tier => ({
        ...tier,
        price_dollars: tier.price_cents / 100,
        features: JSON.parse(tier.features_json || '[]')
      }));

      res.status(200).json({ tiers: tiersWithFeatures });
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
