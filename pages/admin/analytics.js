import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    popularEvents: [],
    userEngagement: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const router = useRouter();

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    const user = mockUser ? JSON.parse(mockUser) : null;
    
    if (!user || !user.authenticated) {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const mockAnalytics = {
        totalUsers: 150,
        activeSubscriptions: 45,
        totalRevenue: 2500.00,
        monthlyRevenue: 1200.00,
        popularEvents: [
          { id: 1, title: 'Riot Network Live Stream #1', totalSold: 85 },
          { id: 2, title: 'Hip Hop Cypher Night', totalSold: 67 },
          { id: 3, title: 'Underground Battles', totalSold: 52 },
          { id: 4, title: 'Freestyle Friday', totalSold: 41 },
          { id: 5, title: 'Beat Making Workshop', totalSold: 33 }
        ],
        userEngagement: {
          totalMessages: 1250,
          activeUsers: 89,
          avgMessagesPerUser: 14.0
        },
        recentActivity: [
          { total_cents: 2500, status: 'paid', created_at: new Date().toISOString(), paypal_order_id: 'ORDER123' },
          { total_cents: 999, status: 'active', created_at: new Date().toISOString() },
          { total_cents: 1999, status: 'paid', created_at: new Date().toISOString(), paypal_order_id: 'ORDER124' }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-red-500">RIOT</span> ANALYTICS
          </h1>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-black/50 border border-red-500/30 text-white px-4 py-2 rounded-lg"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h3 className="text-red-500 font-semibold mb-2">TOTAL REVENUE</h3>
            <p className="text-3xl font-bold text-white">${(analytics.totalRevenue || 0).toFixed(2)}</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h3 className="text-red-500 font-semibold mb-2">MONTHLY REVENUE</h3>
            <p className="text-3xl font-bold text-white">${(analytics.monthlyRevenue || 0).toFixed(2)}</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h3 className="text-red-500 font-semibold mb-2">ACTIVE USERS</h3>
            <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h3 className="text-red-500 font-semibold mb-2">SUBSCRIPTIONS</h3>
            <p className="text-3xl font-bold text-white">{analytics.activeSubscriptions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Events */}
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Popular Events</h2>
            <div className="space-y-3">
              {analytics.popularEvents.map((event, index) => (
                <div key={event.id} className="flex justify-between items-center">
                  <span className="text-gray-300">{event.title}</span>
                  <span className="text-red-500 font-semibold">{event.totalSold} sold</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">User Engagement</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Messages</span>
                <span className="text-white font-semibold">{analytics.userEngagement.totalMessages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Active Users</span>
                <span className="text-white font-semibold">{analytics.userEngagement.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Avg Messages/User</span>
                <span className="text-white font-semibold">
                  {(analytics.userEngagement.avgMessagesPerUser || 0).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-red-500/30">
                  <th className="text-red-500 font-semibold py-2">Type</th>
                  <th className="text-red-500 font-semibold py-2">Amount</th>
                  <th className="text-red-500 font-semibold py-2">Status</th>
                  <th className="text-red-500 font-semibold py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentActivity.map((activity, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="text-gray-300 py-2">
                      {activity.paypal_order_id ? 'Ticket Sale' : 'Subscription'}
                    </td>
                    <td className="text-white py-2">${(activity.total_cents / 100).toFixed(2)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        activity.status === 'paid' || activity.status === 'active'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-yellow-900/20 text-yellow-400'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="text-gray-300 py-2">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
