import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      if (user.email !== 'kevinparxmusic@gmail.com') {
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
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      <div className="card">
        <h2>Orders</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff6b6b' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Product</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.2)' }}>
                  <td style={{ padding: '1rem' }}>{o.email}</td>
                  <td style={{ padding: '1rem' }}>{o.product}</td>
                  <td style={{ padding: '1rem' }}>{o.type}</td>
                  <td style={{ padding: '1rem' }}>{o.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Fan Uploads</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff6b6b' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>File ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Submitted By</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Caption</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Approved</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Video URL</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((u) => (
                <tr key={u.id || u.file_id} style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.2)' }}>
                  <td style={{ padding: '1rem' }}>{u.file_id}</td>
                  <td style={{ padding: '1rem' }}>{u.submitted_by}</td>
                  <td style={{ padding: '1rem' }}>{u.caption}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: u.approved ? '#4ade80' : '#ff6b6b' }}>
                      {u.approved ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{u.video_url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Stream Logs</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff6b6b' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Checked At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.2)' }}>
                  <td style={{ padding: '1rem' }}>{l.status}</td>
                  <td style={{ padding: '1rem' }}>{l.checked_at || l.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Chat Messages</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff6b6b' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Message</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.2)' }}>
                  <td style={{ padding: '1rem' }}>{m.user_email}</td>
                  <td style={{ padding: '1rem' }}>{m.message}</td>
                  <td style={{ padding: '1rem' }}>{m.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Trivia Responses</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ff6b6b' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>User</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Question ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Selected Option</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Correct</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#ff6b6b' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 107, 107, 0.2)' }}>
                  <td style={{ padding: '1rem' }}>{r.user_email}</td>
                  <td style={{ padding: '1rem' }}>{r.question_id}</td>
                  <td style={{ padding: '1rem' }}>{r.selected_opt ?? r.selected_option}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: r.correct ? '#4ade80' : '#ff6b6b' }}>
                      {r.correct ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
