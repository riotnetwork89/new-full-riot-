import '../styles/globals.css'
import Navigation from '../components/Navigation'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navigation />
      <main style={{ paddingTop: '80px' }}>
        <Component {...pageProps} />
      </main>
    </>
  )
}
