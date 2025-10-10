import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function TicketScannerPage() {
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
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

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketCode.trim()) return;

    setLoading(true);
    setScanResult(null);

    try {
      const verifyResponse = await fetch(`/api/tickets/verify/${ticketCode.trim()}`);
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Ticket verification failed');
      }

      if (!verifyData.valid) {
        setScanResult({
          success: false,
          message: `Ticket is ${verifyData.ticket.status}`,
          ticket: verifyData.ticket
        });
        return;
      }

      const scanResponse = await fetch(`/api/tickets/verify/${ticketCode.trim()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: user.email
        })
      });

      const scanData = await scanResponse.json();

      if (!scanResponse.ok) {
        throw new Error(scanData.error || 'Ticket scanning failed');
      }

      setScanResult({
        success: true,
        message: 'Ticket successfully scanned!',
        ticket: scanData.ticket
      });

      setTicketCode('');

    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        message: error.message,
        ticket: null
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setScanResult(null);
    setTicketCode('');
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #330000 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ 
        maxWidth: '600px', 
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
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          TICKET SCANNER
        </h1>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <form onSubmit={handleScan}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                fontSize: '1.1rem'
              }}>
                Ticket Code or QR Data
              </label>
              <input
                type="text"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter ticket code or scan QR code"
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem'
                }}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !ticketCode.trim()}
              style={{
                width: '100%',
                padding: '1rem',
                background: (loading || !ticketCode.trim()) 
                  ? 'rgba(255, 0, 0, 0.5)' 
                  : 'linear-gradient(45deg, #ff0000, #cc0000)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: (loading || !ticketCode.trim()) ? 'not-allowed' : 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              {loading ? 'Scanning...' : 'Scan Ticket'}
            </button>
          </form>
        </div>

        {scanResult && (
          <div style={{ 
            background: scanResult.success 
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
            border: `1px solid ${scanResult.success ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <h2 style={{ 
                color: scanResult.success ? '#22c55e' : '#ef4444',
                margin: 0,
                fontSize: '1.5rem'
              }}>
                {scanResult.success ? '✅ SUCCESS' : '❌ FAILED'}
              </h2>
              <button
                onClick={clearResult}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Clear
              </button>
            </div>
            
            <p style={{ 
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}>
              {scanResult.message}
            </p>
            
            {scanResult.ticket && (
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <h3 style={{ 
                  color: '#ff0000',
                  marginBottom: '1rem',
                  fontSize: '1.2rem'
                }}>
                  Ticket Details
                </h3>
                
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <p><strong>Code:</strong> {scanResult.ticket.code}</p>
                  <p><strong>Event:</strong> {scanResult.ticket.eventTitle}</p>
                  <p><strong>Venue:</strong> {scanResult.ticket.venue}</p>
                  <p><strong>Date:</strong> {new Date(scanResult.ticket.startDateTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(scanResult.ticket.startDateTime).toLocaleTimeString()}</p>
                  <p><strong>Tier:</strong> {scanResult.ticket.tierName}</p>
                  <p><strong>Holder:</strong> {scanResult.ticket.holderEmail}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: scanResult.ticket.status === 'valid' ? '#22c55e' : 
                             scanResult.ticket.status === 'used' ? '#ffa500' : '#ef4444',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      marginLeft: '0.5rem'
                    }}>
                      {scanResult.ticket.status}
                    </span>
                  </p>
                  {scanResult.ticket.usedAt && (
                    <p><strong>Used At:</strong> {new Date(scanResult.ticket.usedAt).toLocaleString()}</p>
                  )}
                  {scanResult.ticket.scannedAt && (
                    <p><strong>Scanned At:</strong> {new Date(scanResult.ticket.scannedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ff0000', marginBottom: '1rem' }}>Instructions</h3>
          <ul style={{ 
            textAlign: 'left',
            margin: 0,
            paddingLeft: '1.5rem',
            lineHeight: '1.6'
          }}>
            <li>Enter the ticket code manually or scan the QR code</li>
            <li>Valid tickets will be marked as "used" after scanning</li>
            <li>Already used tickets will show their usage timestamp</li>
            <li>Invalid or cancelled tickets will be rejected</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
