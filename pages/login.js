import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (email && password) {
        localStorage.setItem('mockUser', JSON.stringify({ 
          email, 
          authenticated: true,
          id: Date.now().toString()
        }));
        setMessage('Login successful!');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setMessage('Please enter email and password');
      }
    } catch (error) {
      setMessage('Authentication failed');
    }
    
    setLoading(false);
  };

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
        background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.1), rgba(255, 255, 255, 0.05))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '3rem',
        maxWidth: '400px',
        width: '100%',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          background: 'linear-gradient(45deg, #ff0000, #ffffff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem',
          fontWeight: '900',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          RIOT {isSignUp ? 'SIGN UP' : 'LOGIN'}
        </h1>
        
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
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
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (isSignUp ? 'SIGNING UP...' : 'LOGGING IN...') : (isSignUp ? 'SIGN UP' : 'LOGIN')}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff0000',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign up'}
          </button>
        </div>
        
        {message && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem',
            background: message.includes('successful') || message.includes('confirmation') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.includes('successful') || message.includes('confirmation') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
