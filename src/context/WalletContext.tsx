import React, { createContext, useContext, useState, useCallback } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  solBalance: number;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('void_covenant_wallet');
  });
  const [solBalance, setSolBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Try Phantom wallet
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        const response = await provider.connect();
        const address = response.publicKey.toString();
        setWalletAddress(address);
        localStorage.setItem('void_covenant_wallet', address);
        // Mock balance for demo
        setSolBalance(12.5);
      } else {
        // No wallet extension — generate mock address for demo
        const mockAddr = Array.from({ length: 44 }, () => 
          'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
            Math.floor(Math.random() * 58)
          ]
        ).join('');
        setWalletAddress(mockAddr);
        localStorage.setItem('void_covenant_wallet', mockAddr);
        setSolBalance(12.5);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      // Fallback to mock
      const mockAddr = Array.from({ length: 44 }, () => 
        'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789'[
          Math.floor(Math.random() * 58)
        ]
      ).join('');
      setWalletAddress(mockAddr);
      localStorage.setItem('void_covenant_wallet', mockAddr);
      setSolBalance(12.5);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    try {
      const provider = (window as any).solana;
      if (provider?.isPhantom) {
        provider.disconnect();
      }
    } catch (e) { /* ignore */ }
    setWalletAddress(null);
    setSolBalance(0);
    localStorage.removeItem('void_covenant_wallet');
  }, []);

  return (
    <WalletContext.Provider value={{
      walletAddress,
      isConnected: !!walletAddress,
      solBalance,
      isConnecting,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
