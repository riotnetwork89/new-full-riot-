import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import Nav from '../../components/Nav';
import toast, { Toaster } from 'react-hot-toast';

export default function Checkout() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .single();
      
      setActiveEvent(event);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: activeEvent?.ppv_price?.toString() || '25.00'
        }
      }]
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const response = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          email: user.email,
          event_id: activeEvent?.id,
          amount: activeEvent?.ppv_price || 25
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Payment successful! Redirecting to stream...');
        setTimeout(() => router.push('/stream'), 2000);
      } else {
        toast.error(result.error || 'Payment failed');
      }
    } catch (error) {
      toast.error('Payment processing error');
    }
  };

  const onError = (err) => {
    toast.error('Payment error occurred');
    console.error('PayPal error:', err);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-riot-black">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-riot-gray rounded-lg p-8">
          <h1 className="text-4xl font-bold text-riot-red mb-6 text-center">
            Checkout
          </h1>
          
          {activeEvent ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">{activeEvent.title}</h2>
              <p className="text-gray-300 mb-2">
                Event Date: {new Date(activeEvent.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-3xl font-bold text-riot-red mb-6">
                ${activeEvent.ppv_price}
              </p>
              
              <PayPalScriptProvider options={{
                "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: "USD"
              }}>
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  style={{
                    layout: 'vertical',
                    color: 'red',
                    shape: 'rect',
                    label: 'paypal'
                  }}
                />
              </PayPalScriptProvider>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-white text-xl mb-4">No active events available</p>
              <button
                onClick={() => router.push('/')}
                className="bg-riot-red text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
