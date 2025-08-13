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
      
      const [ordersResult, uploadsResult, logsResult, chatResult, responsesResult] = await Promise.all([
        supabase.from('orders').select('*').order('timestamp', { ascending: false }),
        supabase.from('fan_uploads').select('*').order('timestamp', { ascending: false }),
        supabase.from('stream_logs').select('*').order('timestamp', { ascending: false }),
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('trivia_responses').select('*').order('created_at', { ascending: false })
      ]);

      setOrders(ordersResult.data || []);
      setUploads(uploadsResult.data || []);
      setLogs(logsResult.data || []);
      setMessages(chatResult.data || []);
      setResponses(responsesResult.data || []);
    };
    fetchData();
  }, [router]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Admin Dashboard</h1>
      <section>
        <h2>Orders</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Email</th>
              <th>Product</th>
              <th>Type</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.email}</td>
                <td>{o.product}</td>
                <td>{o.type}</td>
                <td>{o.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Fan Uploads</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>File ID</th>
              <th>Submitted By</th>
              <th>Caption</th>
              <th>Approved</th>
              <th>Video URL</th>
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.id || u.file_id}>
                <td>{u.file_id}</td>
                <td>{u.submitted_by}</td>
                <td>{u.caption}</td>
                <td>{u.approved ? 'Yes' : 'No'}</td>
                <td>{u.video_url}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Stream Logs</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Status</th>
              <th>Checked At</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.status}</td>
                <td>{l.checked_at || l.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Chat Messages</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>User</th>
              <th>Message</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id}>
                <td>{m.user_email}</td>
                <td>{m.message}</td>
                <td>{m.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Trivia Responses</h2>
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>User</th>
              <th>Question ID</th>
              <th>Selected Option</th>
              <th>Correct</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {responses.map((r) => (
              <tr key={r.id}>
                <td>{r.user_email}</td>
                <td>{r.question_id}</td>
                <td>{r.selected_opt ?? r.selected_option}</td>
                <td>{r.correct ? 'Yes' : 'No'}</td>
                <td>{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
