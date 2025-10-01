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
      const mockUser = localStorage.getItem('mockUser');
      if (!mockUser) {
        router.push('/login');
        return;
      }
      
      const mockOrders = [
        { id: 1, email: 'user1@test.com', product: 'ppv_ticket', type: 'ticket', timestamp: new Date().toISOString() },
        { id: 2, email: 'user2@test.com', product: 'ppv_ticket', type: 'ticket', timestamp: new Date().toISOString() }
      ];
      
      const mockUploads = [
        { id: 1, submitted_by: 'fan@test.com', caption: 'Amazing show!', approved: true, video_url: 'demo.mp4' }
      ];
      
      const mockLogs = [
        { id: 1, status: 'live', checked_at: new Date().toISOString() }
      ];
      
      const mockMessages = [
        { id: 1, user_email: 'viewer@test.com', message: 'Great stream!', created_at: new Date().toISOString() }
      ];
      
      const mockResponses = [
        { id: 1, question_id: 1, user_email: 'player@test.com', selected_option: 'c', correct: true }
      ];
      
      setOrders(mockOrders);
      setUploads(mockUploads);
      setLogs(mockLogs);
      setMessages(mockMessages);
      setResponses(mockResponses);
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
