import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { DEFAULT_RPC_URL } from '../data/solanaConfig';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

export const SolanaWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;

    const endpoint = useMemo(() => {
        return (import.meta as any).env?.VITE_SOLANA_RPC_URL || DEFAULT_RPC_URL;
    }, []);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
