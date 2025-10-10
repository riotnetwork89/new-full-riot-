import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const checkUser = () => {
      if (typeof window !== 'undefined') {
        const mockUser = localStorage.getItem('mockUser')
        if (mockUser) {
          setUser(JSON.parse(mockUser))
        }
      }
    }
    checkUser()
  }, [])

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockUser')
      setUser(null)
      router.push('/login')
    }
  }

  const navLinkStyle = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'inline-block',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    border: '1px solid transparent',
    transition: 'all 0.15s ease'
  }

  const activeStyle = {
    ...navLinkStyle,
    background: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 0.3)'
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(139,0,0,0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,0,0,0.2)',
      padding: '0.5rem 0'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        <Link href="/" style={{
          ...navLinkStyle,
          ...(router.pathname === '/' ? activeStyle : {}),
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#ff0000',
          textShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
        }}>
          RIOT NETWORK
        </Link>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/vault" style={{
            ...navLinkStyle,
            ...(router.pathname === '/vault' ? activeStyle : {})
          }}>
            VOD
          </Link>
          <Link href="/checkout" style={{
            ...navLinkStyle,
            ...(router.pathname === '/checkout' || router.pathname === '/stream' ? activeStyle : {})
          }}>
            STREAM
          </Link>
          <Link href="/merch" style={{
            ...navLinkStyle,
            ...(router.pathname === '/merch' ? activeStyle : {})
          }}>
            MERCH
          </Link>
          <Link href="/schedule" style={{
            ...navLinkStyle,
            ...(router.pathname === '/schedule' ? activeStyle : {})
          }}>
            SCHEDULE
          </Link>
          <Link href="/tickets" style={{
            ...navLinkStyle,
            ...(router.pathname === '/tickets' ? activeStyle : {})
          }}>
            TICKETS
          </Link>
          
          {isClient && user ? (
            <>
              <Link href="/subscription" style={{
                ...navLinkStyle,
                ...(router.pathname === '/subscription' ? activeStyle : {})
              }}>
                SUBSCRIPTION
              </Link>
              <Link href="/profile" style={{
                ...navLinkStyle,
                ...(router.pathname === '/profile' ? activeStyle : {})
              }}>
                PROFILE
              </Link>
              <Link href="/admin" style={{
                ...navLinkStyle,
                ...(router.pathname.startsWith('/admin') ? activeStyle : {})
              }}>
                ADMIN
              </Link>
              <span style={{ color: 'white', fontSize: '0.8rem', margin: '0 0.5rem' }}>
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  ...navLinkStyle,
                  background: 'rgba(255, 0, 0, 0.8)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                LOGOUT
              </button>
            </>
          ) : isClient ? (
            <Link href="/login" style={{
              ...navLinkStyle,
              ...(router.pathname === '/login' ? activeStyle : {})
            }}>
              LOGIN
            </Link>
          ) : (
            <div style={{ ...navLinkStyle, opacity: 0 }}>
              LOADING
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
