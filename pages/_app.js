import '@/styles/globals.css'
import React from 'react';
import { WalletConnectProvider } from '@/components/WalletConnectProvider';
import '@solana/wallet-adapter-react-ui/styles.css'

export default function App({ Component, pageProps }) {
  return <WalletConnectProvider>
    <Component {...pageProps} />
  </WalletConnectProvider>
}
