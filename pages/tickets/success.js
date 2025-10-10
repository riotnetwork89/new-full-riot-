import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function TicketSuccessPage() {
  const [orderDetails, setOrderDetails] = useState(null);
  const router = useRouter();
  const { token, PayerID } = router.query;

  useEffect(() => {
    if (token && PayerID) {
      capturePayment();
    }
  }, [token, PayerID]);

  const capturePayment = async () => {
    try {
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: token
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOrderDetails(data);
      } else {
        throw new Error(data.error || 'Payment capture failed');
      }
    } catch (error) {
      console.error('Payment capture error:', error);
      alert(`Payment processing failed: ${error.message}`);
      router.push('/tickets');
    }
  };

  if (!orderDetails) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Processing your payment...</h2>
          <p>Please wait while we generate your tickets.</p>
        </div>
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
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '16px',
          padding: '3rem',
          marginBottom: '2rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #22c55e, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            PAYMENT SUCCESSFUL!
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Your tickets have been purchased and will be emailed to you shortly.
          </p>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h2 style={{ color: '#22c55e', marginBottom: '1rem' }}>Order Details</h2>
            <p><strong>Order ID:</strong> {orderDetails.orderUuid}</p>
            <p><strong>Tickets Generated:</strong> {orderDetails.tickets.length}</p>
            
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>Your Tickets:</h3>
              {orderDetails.tickets.map((ticket, index) => (
                <div key={index} style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '1rem',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Ticket #{ticket.ticketCode}</span>
                  <a 
                    href={ticket.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid #ff0000',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>What's Next?</h3>
            <ul style={{ 
              textAlign: 'left',
              margin: 0,
              paddingLeft: '1.5rem',
              lineHeight: '1.6'
            }}>
              <li>Check your email for ticket confirmation and PDF attachments</li>
              <li>Download and save your PDF tickets to your device</li>
              <li>Present the QR code on your ticket at the venue entrance</li>
              <li>Each ticket is valid for one-time entry only</li>
            </ul>
          </div>
          
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => router.push('/tickets')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              Browse More Events
            </button>
            
            <button
              onClick={() => router.push('/')}
              style={{
                background: 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
