import './polyfills';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { SolanaWalletProvider } from './context/SolanaWalletProvider';
import App from './App.tsx';
import './index.css';
import { initTelegramViewport } from './utils/telegramViewport';

// Initialize responsive Telegram & mobile viewport height synchronization
initTelegramViewport();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletProvider>
      <App />
    </SolanaWalletProvider>
  </StrictMode>,
);
