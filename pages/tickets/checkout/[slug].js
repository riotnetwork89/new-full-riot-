import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [event, setEvent] = useState(null);
  const [ticketTiers, setTicketTiers] = useState([]);
  const [cart, setCart] = useState({});
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchEventData();
    }
  }, [slug]);

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_tiers (*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (eventError || !eventData) {
        setError('Event not found');
        return;
      }

      const now = new Date();
      const saleStart = new Date(eventData.sale_start);
      const saleEnd = new Date(eventData.sale_end);

      if (now < saleStart || now > saleEnd) {
        setError('Ticket sales are not currently active');
        return;
      }

      setEvent(eventData);
      setTicketTiers(eventData.ticket_tiers || []);
    } catch (err) {
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (tierId, quantity) => {
    setCart(prev => ({
      ...prev,
      [tierId]: Math.max(0, quantity)
    }));
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [tierId, quantity]) => {
      const tier = ticketTiers.find(t => t.id === parseInt(tierId));
      return total + (tier ? tier.price_cents * quantity : 0);
    }, 0);
  };

  const getCartItems = () => {
    return Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([tierId, quantity]) => {
        const tier = ticketTiers.find(t => t.id === parseInt(tierId));
        return { tier, quantity };
      });
  };

  const handleCheckout = async () => {
    if (!userEmail) {
      setError('Email is required');
      return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems.map(({ tier, quantity }) => ({
            tierId: tier.id,
            quantity
          })),
          userEmail
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#ff0000' }}>Error</div>
        <div>{error}</div>
        <button 
          onClick={() => router.push('/tickets')}
          style={{
            background: 'rgba(255, 0, 0, 0.2)',
            border: '1px solid #ff0000',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => router.push('/tickets')}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Events
        </button>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ff0000, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {event?.title}
          </h1>
          
          <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
            <div><strong>Venue:</strong> {event?.venue}</div>
            <div><strong>Date:</strong> {new Date(event?.start_datetime).toLocaleDateString()}</div>
            <div><strong>Time:</strong> {new Date(event?.start_datetime).toLocaleTimeString()}</div>
          </div>

          {event?.description && (
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{event.description}</p>
          )}
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>Select Tickets</h2>
          
          {ticketTiers.map(tier => {
            const available = tier.quantity_total - tier.quantity_sold;
            const cartQuantity = cart[tier.id] || 0;
            
            return (
              <div key={tier.id} style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ff0000' }}>{tier.name}</h3>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      ${(tier.price_cents / 100).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                      {available} available • Max {tier.limits_per_order} per order
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateCart(tier.id, cartQuantity - 1)}
                      disabled={cartQuantity === 0}
                      style={{
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid #ff0000',
                        color: 'white',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '4px',
                        cursor: cartQuantity === 0 ? 'not-allowed' : 'pointer',
                        opacity: cartQuantity === 0 ? 0.5 : 1
                      }}
                    >
                      -
                    </button>
                    
                    <span style={{ 
                      minWidth: '2rem', 
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      {cartQuantity}
                    </span>
                    
                    <button
                      onClick={() => updateCart(tier.id, cartQuantity + 1)}
                      disabled={cartQuantity >= Math.min(available, tier.limits_per_order)}
                      style={{
                        background: 'rgba(255, 0, 0, 0.2)',
                        border: '1px solid #ff0000',
                        color: 'white',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '4px',
                        cursor: cartQuantity >= Math.min(available, tier.limits_per_order) ? 'not-allowed' : 'pointer',
                        opacity: cartQuantity >= Math.min(available, tier.limits_per_order) ? 0.5 : 1
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {cartQuantity > 0 && (
                  <div style={{ 
                    textAlign: 'right',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#ff0000'
                  }}>
                    Subtotal: ${((tier.price_cents * cartQuantity) / 100).toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {getCartItems().length > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <h2 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>Checkout</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'white'
                }}
                placeholder="your@email.com"
              />
            </div>

            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#ff0000' }}>Order Summary</h3>
              {getCartItems().map(({ tier, quantity }) => (
                <div key={tier.id} style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span>{tier.name} × {quantity}</span>
                  <span>${((tier.price_cents * quantity) / 100).toFixed(2)}</span>
                </div>
              ))}
              <hr style={{ border: '1px solid rgba(255, 255, 255, 0.2)', margin: '1rem 0' }} />
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#ff0000'
              }}>
                <span>Total</span>
                <span>${(getCartTotal() / 100).toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#ef4444'
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={processing || !userEmail}
              style={{
                width: '100%',
                padding: '1rem',
                background: processing ? 'rgba(255, 0, 0, 0.5)' : 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: processing || !userEmail ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: processing || !userEmail ? 0.7 : 1
              }}
            >
              {processing ? 'Processing...' : 'Pay with PayPal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
