import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SubscriptionPage() {
  const [tiers, setTiers] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    if (!mockUser) {
      router.push('/login');
      return;
    }

    const userEmail = 'test@riot.com'; // Mock user email
    fetchTiers();
    fetchCurrentSubscription(userEmail);
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/subscriptions/tiers');
      const data = await response.json();
      setTiers(data.tiers || []);
    } catch (error) {
      console.error('Failed to fetch tiers:', error);
    }
  };

  const fetchCurrentSubscription = async (userEmail) => {
    try {
      const response = await fetch(`/api/subscriptions/status?userEmail=${encodeURIComponent(userEmail)}`);
      const data = await response.json();
      setCurrentSubscription(data.hasActiveSubscription ? data.tier : null);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId) => {
    const userEmail = 'test@riot.com'; // Mock user email
    
    try {
      const response = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tierId, userEmail }),
      });

      const data = await response.json();
      
      if (data.orderID) {
        window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderID}`;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="text-red-500">RIOT</span> SUBSCRIPTIONS
          </h1>
          <p className="text-gray-300 text-lg">
            Unlock exclusive content and VIP access to Riot Network events
          </p>
        </div>

        {currentSubscription && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Active Subscription</h2>
            <p className="text-white text-lg">{currentSubscription.name}</p>
            <p className="text-gray-300">
              {currentSubscription.daysRemaining} days remaining
            </p>
            <div className="mt-4">
              <h3 className="text-white font-semibold mb-2">Your Benefits:</h3>
              <ul className="text-gray-300 space-y-1">
                {currentSubscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`bg-black/20 backdrop-blur-sm border rounded-lg p-6 ${
                tier.name === 'VIP' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-red-500/30'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-red-500 mb-2">
                  ${tier.price_dollars}
                </div>
                <p className="text-gray-300">per {tier.duration_days} days</p>
              </div>

              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Features:</h4>
                <ul className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <span className="text-red-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={currentSubscription?.name === tier.name}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  currentSubscription?.name === tier.name
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : tier.name === 'VIP'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {currentSubscription?.name === tier.name ? 'Current Plan' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
