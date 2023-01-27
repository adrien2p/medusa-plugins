import { Analytics } from '@vercel/analytics/react';
import '../styles.css'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}