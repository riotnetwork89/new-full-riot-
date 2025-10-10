import React from 'react'
import '../styles/globals.css'
import Navigation from '../components/Navigation'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect, useState } from 'react'
import { initializeNotifications, requestNotificationPermission } from '../utils/notifications'

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const setupNotifications = async () => {
      if (typeof window !== 'undefined') {
        try {
          const swSupported = await initializeNotifications()
          if (swSupported && localStorage.getItem('mockUser')) {
            await requestNotificationPermission()
          }
        } catch (error) {
          console.warn('Notification setup failed:', error)
        }
      }
    }

    setupNotifications()
  }, [])

  return (
    <>
      <Head>
        <title>Riot Network PPV</title>
        <meta name="description" content="Riot Network Pay-Per-View Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="theme-color" content="#ff0000" />
      </Head>
      
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
      
      <Script
        src="https://cdn.jsdelivr.net/npm/@mux/mux-player"
        strategy="beforeInteractive"
      />
      
      {isClient && <Navigation />}
      <main style={{ paddingTop: '80px' }} suppressHydrationWarning={true}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
