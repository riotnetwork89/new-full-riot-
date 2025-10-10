import '../styles/globals.css'
import Navigation from '../components/Navigation'
import Head from 'next/head'
import { useEffect } from 'react';
import { initializeNotifications, requestNotificationPermission } from '../utils/notifications';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GA_ID) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', process.env.NEXT_PUBLIC_GA_ID);
    }

    const setupNotifications = async () => {
      const swSupported = await initializeNotifications();
      if (swSupported && localStorage.getItem('mockUser')) {
        await requestNotificationPermission();
      }
    };

    setupNotifications();

    const handleRouteChange = (url) => {
      if (typeof gtag !== 'undefined') {
        gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
          page_path: url,
        });
      }
    };

    if (typeof window !== 'undefined') {
      const { Router } = require('next/router');
      Router.events.on('routeChangeComplete', handleRouteChange);
      return () => {
        Router.events.off('routeChangeComplete', handleRouteChange);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Riot Network PPV</title>
        <meta name="description" content="Riot Network Pay-Per-View Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff0000" />
        <script src="https://cdn.jsdelivr.net/npm/@mux/mux-player" defer />
      </Head>
      <Navigation />
      <main style={{ paddingTop: '80px' }}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
