import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../utils/supabase';
import SocialShare from '../../components/SocialShare';

export default function EventTicketsPage() {
  const [event, setEvent] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    const mockUser = localStorage.getItem('mockUser');
    const userData = mockUser ? JSON.parse(mockUser) : null;
    
    if (!userData || !userData.authenticated) {
      router.push('/login');
      return;
    }
    
    setUser(userData);
    
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ticket_tiers(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/tickets');
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
    if (!event) return 0;
    
    return Object.entries(cart).reduce((total, [tierId, quantity]) => {
      const tier = event.ticket_tiers.find(t => t.id === parseInt(tierId));
      return total + (tier ? tier.price_cents * quantity : 0);
    }, 0);
  };

  const getCartItems = () => {
    if (!event) return [];
    
    return Object.entries(cart)
      .filter(([tierId, quantity]) => quantity > 0)
      .map(([tierId, quantity]) => {
        const tier = event.ticket_tiers.find(t => t.id === parseInt(tierId));
        return {
          tierId: parseInt(tierId),
          tierName: tier.name,
          quantity,
          unitPrice: tier.price_cents,
          total: tier.price_cents * quantity
        };
      });
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
      alert('Please select tickets to purchase');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartItems.map(item => ({
            tierId: item.tierId,
            quantity: item.quantity
          })),
          userEmail: user.email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${data.orderID}`;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
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
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#ff0000', fontSize: '2rem', marginBottom: '1rem' }}>Loading event...</h2>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '3px solid rgba(255,0,0,0.3)',
            borderTop: '3px solid #ff0000',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#ff0000', fontSize: '2rem', marginBottom: '1rem' }}>Event not found</h2>
          <button 
            onClick={() => router.push('/tickets')}
            style={{
              background: 'linear-gradient(45deg, #ff0000, #cc0000)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '50px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const isOnSale = new Date() >= new Date(event.sale_start) && new Date() <= new Date(event.sale_end);
  const cartTotal = getCartTotal();
  const cartItems = getCartItems();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto'
      }}>
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
          {event.image_url && (
            <img 
              src={event.image_url} 
              alt={event.title}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}
            />
          )}
          
          <h1 style={{ 
            color: '#ff0000',
            fontSize: '2.5rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem'
          }}>
            {event.title}
          </h1>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <p><strong>📍 Venue:</strong> {event.venue}</p>
              <p><strong>📅 Date:</strong> {new Date(event.start_datetime).toLocaleDateString()}</p>
              <p><strong>🕒 Time:</strong> {new Date(event.start_datetime).toLocaleTimeString()}</p>
            </div>
            <div>
              <p><strong>Sale Period:</strong></p>
              <p>{new Date(event.sale_start).toLocaleDateString()} - {new Date(event.sale_end).toLocaleDateString()}</p>
              <p style={{ 
                color: isOnSale ? '#4ade80' : '#ffa500',
                fontWeight: '600'
              }}>
                {isOnSale ? '🟢 ON SALE' : '🟡 NOT AVAILABLE'}
              </p>
            </div>
          </div>
          
          {event.description && (
            <p style={{ 
              fontSize: '1.1rem', 
              lineHeight: '1.6',
              opacity: 0.9,
              marginBottom: '2rem'
            }}>
              {event.description}
            </p>
          )}
        </div>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}>
          {/* Ticket Tiers */}
          <div>
            <h2 style={{ 
              color: '#ff0000',
              marginBottom: '1.5rem',
              fontSize: '1.8rem'
            }}>
              Select Tickets
            </h2>
            
            {event.ticket_tiers.map(tier => {
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
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{ 
                        color: '#ff0000',
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.3rem'
                      }}>
                        {tier.name}
                      </h3>
                      <p style={{ 
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        margin: '0 0 0.5rem 0'
                      }}>
                        ${(tier.price_cents / 100).toFixed(2)}
                      </p>
                      <p style={{ 
                        fontSize: '0.9rem',
                        opacity: 0.7,
                        margin: 0
                      }}>
                        {available} available • Max {tier.limits_per_order} per order
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <button
                        onClick={() => updateCart(tier.id, cartQuantity - 1)}
                        disabled={!isOnSale || cartQuantity === 0}
                        style={{
                          background: 'rgba(255, 0, 0, 0.2)',
                          border: '1px solid #ff0000',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        -
                      </button>
                      
                      <span style={{ 
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        minWidth: '30px',
                        textAlign: 'center'
                      }}>
                        {cartQuantity}
                      </span>
                      
                      <button
                        onClick={() => updateCart(tier.id, cartQuantity + 1)}
                        disabled={!isOnSale || cartQuantity >= Math.min(available, tier.limits_per_order)}
                        style={{
                          background: 'rgba(255, 0, 0, 0.2)',
                          border: '1px solid #ff0000',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {cartQuantity > 0 && (
                    <div style={{ 
                      background: 'rgba(255, 0, 0, 0.1)',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      Subtotal: ${((tier.price_cents * cartQuantity) / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            height: 'fit-content',
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{ 
              color: '#ff0000',
              marginBottom: '1.5rem',
              fontSize: '1.5rem'
            }}>
              Order Summary
            </h3>
            
            {cartItems.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No tickets selected</p>
            ) : (
              <>
                {cartItems.map(item => (
                  <div key={item.tierId} style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                        {item.tierName}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>
                        {item.quantity} × ${(item.unitPrice / 100).toFixed(2)}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: '600' }}>
                      ${(item.total / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div style={{ 
                  borderTop: '2px solid #ff0000',
                  paddingTop: '1rem',
                  marginTop: '1rem'
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>
                    <span>Total:</span>
                    <span>${(cartTotal / 100).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            
            <button
              onClick={handleCheckout}
              disabled={!isOnSale || cartItems.length === 0 || processing}
              style={{
                width: '100%',
                padding: '1rem',
                background: (!isOnSale || cartItems.length === 0 || processing) 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: (!isOnSale || cartItems.length === 0 || processing) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginTop: '1.5rem',
                opacity: (!isOnSale || cartItems.length === 0 || processing) ? 0.5 : 1
              }}
            >
              {processing ? 'Processing...' : 'Checkout with PayPal'}
            </button>
            
            {!isOnSale && (
              <p style={{ 
                fontSize: '0.9rem',
                color: '#ffa500',
                textAlign: 'center',
                marginTop: '1rem'
              }}>
                Tickets are not currently on sale
              </p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <SocialShare 
            title={`${event.title} - Riot Network Live Event`}
            description={event.description}
            hashtags="RiotNetwork,HipHop,LiveEvents,Tickets"
          />
        </div>
      </div>
    </div>
  );
}
