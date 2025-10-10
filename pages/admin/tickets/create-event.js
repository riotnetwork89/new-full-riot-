import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../utils/supabase';

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    startDateTime: '2025-12-31T20:00',
    endDateTime: '2025-12-31T23:59',
    description: '',
    imageUrl: '',
    saleStart: '2025-11-01T10:00',
    saleEnd: '2025-12-30T23:59'
  });
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: 2500, quantity: 100, limits: 10 }
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const mockUser = localStorage.getItem('mockUser');
      const userData = mockUser ? JSON.parse(mockUser) : null;
      
      if (!userData || !userData.authenticated || userData.email !== 'kevinparxmusic@gmail.com') {
        router.push('/login');
        return;
      }
      
      setUser(userData);
    };
    
    checkAuth();
  }, []);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTierChange = (index, field, value) => {
    setTicketTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ));
  };

  const addTier = () => {
    setTicketTiers(prev => [...prev, {
      name: '',
      price: 0,
      quantity: 0,
      limits: 10
    }]);
  };

  const removeTier = (index) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('🔥 Form submission started');
    console.log('Form data:', formData);
    console.log('Ticket tiers:', ticketTiers);

    if (!formData.title || !formData.venue || !formData.startDateTime || !formData.endDateTime || !formData.saleStart || !formData.saleEnd) {
      console.log('❌ Missing required fields');
      alert('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (ticketTiers.length === 0) {
      console.log('❌ No ticket tiers');
      alert('Please add at least one ticket tier');
      setLoading(false);
      return;
    }

    for (const tier of ticketTiers) {
      if (!tier.name || !tier.price || !tier.quantity) {
        console.log('❌ Invalid ticket tier:', tier);
        alert('Please fill in all ticket tier fields');
        setLoading(false);
        return;
      }
    }

    try {
      console.log('✅ Validation passed, creating event...');
      const slug = generateSlug(formData.title);
      console.log('Generated slug:', slug);
      
      const startDateTime = new Date(formData.startDateTime).toISOString();
      const endDateTime = new Date(formData.endDateTime).toISOString();
      const saleStart = new Date(formData.saleStart).toISOString();
      const saleEnd = new Date(formData.saleEnd).toISOString();
      
      console.log('Converted dates:', { startDateTime, endDateTime, saleStart, saleEnd });

      const eventData = {
        title: formData.title,
        slug,
        venue: formData.venue,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        description: formData.description,
        image_url: formData.imageUrl,
        sale_start: saleStart,
        sale_end: saleEnd,
        is_active: true
      };

      console.log('Inserting event data:', eventData);
      
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (eventError) {
        console.error('❌ Event creation error:', eventError);
        throw eventError;
      }

      console.log('✅ Event created:', event);

      for (const tier of ticketTiers) {
        if (tier.name && tier.price > 0 && tier.quantity > 0) {
          const tierData = {
            event_id: event.id,
            name: tier.name,
            price_cents: Math.round(tier.price * 100),
            quantity_total: tier.quantity,
            quantity_sold: 0,
            limits_per_order: tier.limits
          };
          
          console.log('Inserting ticket tier:', tierData);
          
          const { error: tierError } = await supabase
            .from('ticket_tiers')
            .insert(tierData);

          if (tierError) {
            console.error('❌ Ticket tier error:', tierError);
            throw tierError;
          }
        }
      }

      console.log('✅ Ticket tiers created');

      const auditData = {
        admin_email: 'kevinparxmusic@gmail.com',
        action: 'event_created',
        resource_type: 'event',
        resource_id: event.id.toString(),
        details: {
          event_title: formData.title,
          ticket_tiers: ticketTiers.length
        }
      };

      console.log('Inserting audit log:', auditData);

      const { error: auditError } = await supabase
        .from('admin_audit_logs')
        .insert(auditData);

      if (auditError) {
        console.error('❌ Audit log error:', auditError);
      }

      console.log('✅ Event creation completed successfully');
      alert('Event created successfully!');
      router.push('/admin/tickets');
    } catch (error) {
      console.error('❌ Error creating event:', error);
      alert(`Failed to create event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto'
      }}>
        <button 
          onClick={() => router.push('/admin/tickets')}
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
          ← Back to Admin
        </button>

        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '900',
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          CREATE EVENT
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>Event Details</h2>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Venue *
                </label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={formData.startDateTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    colorScheme: 'dark'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDateTime"
                  value={formData.endDateTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Sale Start *
                </label>
                <input
                  type="datetime-local"
                  name="saleStart"
                  value={formData.saleStart}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    colorScheme: 'dark'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Sale End *
                </label>
                <input
                  type="datetime-local"
                  name="saleEnd"
                  value={formData.saleEnd}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'white'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ color: '#ff0000', margin: 0 }}>Ticket Tiers</h2>
              <button
                type="button"
                onClick={addTier}
                style={{
                  background: 'rgba(255, 0, 0, 0.2)',
                  border: '1px solid #ff0000',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Add Tier
              </button>
            </div>
            
            {ticketTiers.map((tier, index) => (
              <div key={index} style={{ 
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
                  <h3 style={{ color: '#ff0000', margin: 0 }}>Tier {index + 1}</h3>
                  {ticketTiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Tier Name *
                    </label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tier.price}
                      onChange={(e) => handleTierChange(index, 'price', parseFloat(e.target.value) || 0)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tier.quantity}
                      onChange={(e) => handleTierChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                      Max Per Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tier.limits}
                      onChange={(e) => handleTierChange(index, 'limits', parseInt(e.target.value) || 10)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? 'rgba(255, 0, 0, 0.5)' : 'linear-gradient(45deg, #ff0000, #cc0000)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {loading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
