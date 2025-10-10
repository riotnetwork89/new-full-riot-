import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

function NotificationManager() {
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    eventType: 'general'
  });
  const [sending, setSending] = useState(false);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Notification sent to ${result.sent} users successfully!`);
        setNotificationData({ title: '', body: '', eventType: 'general' });
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Send notification error:', error);
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '2rem',
      backdropFilter: 'blur(10px)'
    }}>
      <h2 style={{ color: '#ff0000', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Send Push Notification</h2>
      
      <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', color: '#ff0000', fontWeight: '600', marginBottom: '0.5rem' }}>Title</label>
          <input
            type="text"
            value={notificationData.title}
            onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px'
            }}
            placeholder="Notification title"
            required
          />
        </div>
        
        <div>
          <label style={{ display: 'block', color: '#ff0000', fontWeight: '600', marginBottom: '0.5rem' }}>Message</label>
          <textarea
            value={notificationData.body}
            onChange={(e) => setNotificationData({...notificationData, body: e.target.value})}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              height: '100px',
              resize: 'vertical'
            }}
            placeholder="Notification message"
            required
          />
        </div>
        
        <div>
          <label style={{ display: 'block', color: '#ff0000', fontWeight: '600', marginBottom: '0.5rem' }}>Type</label>
          <select
            value={notificationData.eventType}
            onChange={(e) => setNotificationData({...notificationData, eventType: e.target.value})}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px'
            }}
          >
            <option value="general">General</option>
            <option value="stream">Live Stream</option>
            <option value="tickets">Ticket Sales</option>
            <option value="vod">New VOD Content</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={sending}
          style={{
            width: '100%',
            background: sending ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, #ff0000, #cc0000)',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: sending ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s ease'
          }}
        >
          {sending ? 'Sending...' : 'Send Notification'}
        </button>
      </form>
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      const mockUser = localStorage.getItem('mockUser');
      const user = mockUser ? JSON.parse(mockUser) : null;
      
      if (!user || !user.authenticated) {
        router.push('/login');
        return;
      }
      
      if (user.email !== 'kevinparxmusic@gmail.com' && user.email !== 'test@riot.com') {
        router.push('/');
        return;
      }
      
      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .order('timestamp', { ascending: false });
        
        const { data: uploadsData } = await supabase
          .from('fan_uploads')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data: logsData } = await supabase
          .from('stream_logs')
          .select('*')
          .order('timestamp', { ascending: false });
        
        const { data: chatData } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: false });
        
        const { data: responsesData } = await supabase
          .from('trivia_responses')
          .select('*')
          .order('created_at', { ascending: false });

        setOrders(ordersData || []);
        setUploads(uploadsData || []);
        setLogs(logsData || []);
        setMessages(chatData || []);
        setResponses(responsesData || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setOrders([]);
        setUploads([]);
        setLogs([]);
        setMessages([]);
        setResponses([]);
      }
    };
    fetchData();
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          RIOT ADMIN DASHBOARD
        </h1>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              background: activeTab === 'overview' ? 'linear-gradient(45deg, #ff0000, #cc0000)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              background: activeTab === 'tickets' ? 'linear-gradient(45deg, #ff0000, #cc0000)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
          >
            TICKETMASTER
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              background: activeTab === 'analytics' ? 'linear-gradient(45deg, #ff0000, #cc0000)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
          >
            ANALYTICS
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              background: activeTab === 'notifications' ? 'linear-gradient(45deg, #ff0000, #cc0000)' : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              cursor: 'pointer'
            }}
          >
            NOTIFICATIONS
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: '#ff0000', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Platform Overview</h2>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <h3 style={{ color: '#ff0000', marginBottom: '1rem', fontSize: '1.3rem' }}>Orders</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ff0000' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Email</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Product</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 0, 0, 0.2)' }}>
                        <td style={{ padding: '1rem', color: 'white' }}>{o.email}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{o.product}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{o.type}</td>
                        <td style={{ padding: '1rem', color: 'white' }}>{o.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: '#ff0000', marginBottom: '1rem', fontSize: '2rem' }}>Ticketmaster Admin</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>Manage events, tickets, and orders</p>
            <button
              onClick={() => router.push('/admin/tickets')}
              style={{
                background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease'
              }}
            >
              Open Ticketmaster Dashboard
            </button>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ color: '#ff0000', marginBottom: '1rem', fontSize: '2rem' }}>Analytics Dashboard</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>View detailed analytics and reporting</p>
            <button
              onClick={() => router.push('/admin/analytics')}
              style={{
                background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                transition: 'all 0.2s ease'
              }}
            >
              Open Analytics Dashboard
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <NotificationManager />
        )}
      </div>

    </div>
  );
}
