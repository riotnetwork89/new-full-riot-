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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1>Checkout</h1>
      <p>Purchase your ticket to watch the event.</p>
      <button onClick={handleCheckout}>Buy Ticket</button>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}
