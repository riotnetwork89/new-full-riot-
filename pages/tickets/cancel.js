import { useRouter } from 'next/router';

export default function TicketCancelPage() {
  const router = useRouter();

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '3rem'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '900',
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ef4444, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}>
            PAYMENT CANCELLED
          </h1>
          
          <p style={{ 
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Your payment was cancelled. No charges were made to your account.
          </p>
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <p style={{ margin: 0, lineHeight: '1.6' }}>
              If you experienced any issues during checkout, please try again or contact our support team for assistance.
            </p>
          </div>
          
          <div style={{ 
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => router.back()}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
            
            <button
              onClick={() => router.push('/tickets')}
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
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
