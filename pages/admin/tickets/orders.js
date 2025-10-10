import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail !== 'kevinparxmusic@gmail.com') {
      router.push('/login');
      return;
    }
    fetchOrders();
  }, [search, statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !refundAmount) return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refund_amount_cents: parseFloat(refundAmount) * 100,
          reason: refundReason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowRefundModal(false);
        setSelectedOrder(null);
        setRefundAmount('');
        setRefundReason('');
        fetchOrders();
        alert('Refund processed successfully');
      } else {
        alert(`Refund failed: ${data.error}`);
      }
    } catch (error) {
      alert(`Refund failed: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const resendTickets = async (orderId) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/resend`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Tickets resent successfully');
      } else {
        const data = await response.json();
        alert(`Failed to resend tickets: ${data.error}`);
      }
    } catch (error) {
      alert(`Failed to resend tickets: ${error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (cents) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'refunded': return '#ef4444';
      case 'cancelled': return '#6b7280';
      default: return '#ffffff';
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
        <div>Loading orders...</div>
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          ORDER MANAGEMENT
        </h1>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Search by email or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'white'
              }}
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                color: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Order ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Event</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#ff0000' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {order.order_uuid?.substring(0, 8)}...
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{order.user_email}</td>
                    <td style={{ padding: '1rem' }}>
                      {order.order_items?.[0]?.ticket_tier?.event?.title || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      {formatPrice(order.total_cents)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        color: getStatusColor(order.status),
                        textTransform: 'uppercase',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => resendTickets(order.id)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid #3b82f6',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Resend
                        </button>
                        
                        {order.status === 'paid' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setRefundAmount((order.total_cents / 100).toFixed(2));
                              setShowRefundModal(true);
                            }}
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
                            Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {orders.length === 0 && (
              <div style={{ 
                textAlign: 'center',
                padding: '3rem',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>

      {showRefundModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ color: '#ff0000', marginBottom: '1.5rem' }}>Process Refund</h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Refund Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Reason (Optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  resize: 'vertical'
                }}
                placeholder="Reason for refund..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handleRefund}
                disabled={processing || !refundAmount}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: processing ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(45deg, #ef4444, #dc2626)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: processing || !refundAmount ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {processing ? 'Processing...' : 'Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
