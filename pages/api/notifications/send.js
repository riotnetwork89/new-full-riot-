import webpush from 'web-push';
import { supabase } from '../../../utils/supabase';

webpush.setVapidDetails(
  'mailto:support@riotnetwork.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, body, userEmails, eventType } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body required' });
    }

    let query = supabase.from('push_subscriptions').select('*');
    
    if (userEmails && userEmails.length > 0) {
      query = query.in('user_email', userEmails);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: '/riot-icon.png',
      badge: '/riot-badge.png',
      data: {
        eventType,
        url: eventType === 'stream' ? '/stream' : eventType === 'tickets' ? '/tickets' : '/'
      }
    });

    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        }, notificationPayload);
        return { success: true, email: subscription.user_email };
      } catch (error) {
        console.error(`Failed to send notification to ${subscription.user_email}:`, error);
        return { success: false, email: subscription.user_email, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    await supabase
      .from('notification_logs')
      .insert({
        title,
        body,
        event_type: eventType,
        recipients_count: subscriptions.length,
        successful_count: successful,
        failed_count: failed,
        created_at: new Date().toISOString()
      });

    res.status(200).json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
}
