import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Admin() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: ordersData } = await supabase.from('orders').select('*').order('timestamp', { ascending: false });
      const { data: uploadsData } = await supabase.from('fan_uploads').select('*').order('timestamp', { ascending: false });
      const { data: logsData } = await supabase.from('stream_logs').select('*').order('timestamp', { ascending: false });
      setOrders(ordersData || []);
      setUploads(uploadsData || []);
      setLogs(logsData || []);
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
    </div>
  );
}
