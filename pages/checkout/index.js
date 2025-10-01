import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';

export default function Checkout() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/store-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, product: 'ppv_ticket', type: 'ticket' }),
      });
      const result = await res.json();
      if (res.ok) {
        router.push('/stream');
      } else {
        setMessage(result.error?.message || 'Error processing order');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <h1>Checkout</h1>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>Purchase your ticket to watch the event.</p>
        <button onClick={handleCheckout} style={{ fontSize: '1.2rem', padding: '16px 32px' }}>Buy Ticket</button>
        {message && <p style={{ color: '#ff6b6b', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
}
