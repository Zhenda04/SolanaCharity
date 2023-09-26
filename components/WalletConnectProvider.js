/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

export const WalletConnectProvider = ({ children }) => {
    const network = WalletAdapterNetwork.Devnet;

const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Devnet) {
        return "https://fragrant-wider-dawn.solana-devnet.discover.quiknode.pro/e28bd823c1b8e232f77b0d36425d13b00e22c4f9/";
    }

    return clusterApiUrl(network);
}, [network]);

const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

return (
    <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>{children}</WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
);
};
