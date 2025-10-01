import { supabase } from '../../utils/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: streamLogs } = await supabase
      .from('stream_logs')
      .select('user_email')
      .eq('action', 'stream_access')
      .gte('timestamp', fiveMinutesAgo);

    const currentViewers = streamLogs ? new Set(streamLogs.map(log => log.user_email)).size : 0;

    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('product', 'ppv_ticket');

    const totalTicketsSold = orders ? orders.length : 0;

    const { data: chatMessages } = await supabase
      .from('chat_messages')
      .select('id')
      .gte('created_at', fiveMinutesAgo);

    const recentChatActivity = chatMessages ? chatMessages.length : 0;

    res.status(200).json({
      currentViewers,
      totalTicketsSold,
      recentChatActivity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}
