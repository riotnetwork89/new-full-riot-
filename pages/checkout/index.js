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
        setTimeout(() => {
          if (router.isReady) {
            router.push('/login');
          }
        }, 100);
        return;
      }
      setUser(user);

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true })
        .limit(1);
      
      const event = events?.[0];
      
      setActiveEvent(event);
      setLoading(false);
    };
    checkUser();
  }, []);

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
        setTimeout(() => {
          if (router.isReady) {
            router.push('/stream');
          }
        }, 100);
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
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      <Toaster position="top-center" />
      
      <main className="max-w-3xl mx-auto px-8 py-32">
        <div className="bg-black border border-gray-800 p-16">
          <div className="text-center mb-16">
            <div className="riot-underline inline-block">
              <h1 className="text-5xl font-black text-white uppercase tracking-tight">
                Purchase Access
              </h1>
            </div>
          </div>
          
          {activeEvent ? (
            <div className="space-y-12">
              <div className="text-center space-y-8">
                <h2 className="text-3xl font-black text-white uppercase tracking-wide">{activeEvent.title}</h2>
                <div className="space-y-4">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Event Date</p>
                  <p className="text-white text-xl font-medium">
                    {new Date(activeEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="space-y-4">
                  <p className="text-white text-5xl font-black">${activeEvent.ppv_price}.00</p>
                  <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Per Event Access</p>
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
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
            </div>
          ) : (
            <div className="text-center space-y-8">
              <p className="text-white text-xl font-bold uppercase tracking-wide">No active events available</p>
              <button
                onClick={() => {
                  setTimeout(() => {
                    if (router.isReady) {
                      router.push('/');
                    }
                  }, 100);
                }}
                className="bg-riot-red text-white px-12 py-4 font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
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
