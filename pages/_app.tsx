import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

fontawesomeConfig.autoAddCss = false

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Bazel Central Registry</title>
        <meta name="description" content="Browse Bazel modules and versions" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
