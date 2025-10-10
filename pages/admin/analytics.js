import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import Navigation from '../../components/Navigation';

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
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail || userEmail !== 'kevinparxmusic@gmail.com') {
      router.push('/login');
      return;
    }

    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '24h':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const { data: orders, error: ordersError } = await supabase
        .from('ticket_orders')
        .select('total_cents, created_at, status')
        .eq('status', 'paid')
        .gte('created_at', startDate.toISOString());

      if (ordersError) throw ordersError;

      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('total_cents, created_at, status')
        .eq('status', 'active')
        .gte('created_at', startDate.toISOString());

      if (subsError) throw subsError;

      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          id,
          title,
          ticket_tiers (
            quantity_sold
          )
        `);

      if (eventsError) throw eventsError;

      const { data: chatMessages, error: chatError } = await supabase
        .from('chat_messages')
        .select('user_email, created_at')
        .gte('created_at', startDate.toISOString());

      if (chatError) throw chatError;

      const totalRevenue = [...orders, ...subscriptions].reduce((sum, item) => sum + item.total_cents, 0);
      const monthlyRevenue = orders
        .filter(order => new Date(order.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .reduce((sum, order) => sum + order.total_cents, 0);

      const popularEvents = events
        .map(event => ({
          ...event,
          totalSold: event.ticket_tiers.reduce((sum, tier) => sum + tier.quantity_sold, 0)
        }))
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      const uniqueUsers = new Set(chatMessages.map(msg => msg.user_email)).size;

      setAnalytics({
        totalUsers: uniqueUsers,
        activeSubscriptions: subscriptions.length,
        totalRevenue: totalRevenue / 100,
        monthlyRevenue: monthlyRevenue / 100,
        popularEvents,
        userEngagement: {
          totalMessages: chatMessages.length,
          activeUsers: uniqueUsers,
          avgMessagesPerUser: uniqueUsers > 0 ? chatMessages.length / uniqueUsers : 0
        },
        recentActivity: [...orders, ...subscriptions]
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10)
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-900/20 to-black">
      <Navigation />
      
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
            <p className="text-3xl font-bold text-white">${analytics.totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-6">
            <h3 className="text-red-500 font-semibold mb-2">MONTHLY REVENUE</h3>
            <p className="text-3xl font-bold text-white">${analytics.monthlyRevenue.toFixed(2)}</p>
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
                  {analytics.userEngagement.avgMessagesPerUser.toFixed(1)}
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
