// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as naclPkg from 'tweetnacl';
import bs58Pkg from 'bs58';
import * as jwtPkg from 'jsonwebtoken';

const nacl = (naclPkg as any).default || naclPkg;
const bs58 = (bs58Pkg as any).default || bs58Pkg;
const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { publicKey, signature, message } = req.body;

    if (!publicKey || !signature || !message) {
      return res.status(400).json({ error: 'Missing publicKey, signature, or message' });
    }

    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse timestamp from message to prevent replay attacks
    const timestampMatch = message.match(/Timestamp:\s*(\d+)/);
    if (!timestampMatch) {
      return res.status(401).json({ error: 'Invalid message format (missing timestamp)' });
    }
    
    const signedTimestamp = parseInt(timestampMatch[1], 10);
    const now = Date.now();
    const FIVE_MINUTES = 5 * 60 * 1000;
    
    if (now - signedTimestamp > FIVE_MINUTES || signedTimestamp - now > 60000) {
      return res.status(401).json({ error: 'Signature expired (replay attack prevention)' });
    }

    // Signature is valid and recent. Issue JWT token.
    const token = jwt.sign({ walletAddress: publicKey, wallet: publicKey }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}




