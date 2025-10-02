import '../styles/globals.css'
import Navigation from '../components/Navigation'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Riot Network PPV</title>
        <meta name="description" content="Riot Network Pay-Per-View Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script src="https://cdn.jsdelivr.net/npm/@mux/mux-player" defer />
      </Head>
      <Navigation />
      <main style={{ paddingTop: '80px' }}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
