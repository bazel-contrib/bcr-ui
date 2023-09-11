import { config as fontawesomeConfig } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import "prism-themes/themes/prism-darcula.css";
import '../styles/globals.css'
import type { AppProps } from 'next/app'

fontawesomeConfig.autoAddCss = false

function BazelCentralRegistry({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default BazelCentralRegistry;
