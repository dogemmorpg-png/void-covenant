// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const walletAddress = decoded.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  const { amountSovereigns, targetAddress } = req.body;
  const numAmount = parseInt(amountSovereigns, 10);

  if (isNaN(numAmount) || numAmount < 100) {
    return res.status(400).json({ error: 'Minimum withdrawal is 100 Blood Sovereigns ($1.00 USDT).' });
  }

  if (!targetAddress || typeof targetAddress !== 'string' || targetAddress.trim().length < 24) {
    return res.status(400).json({ error: 'Invalid destination wallet address.' });
  }

  try {
    const supabase = getSupabase();

    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (fetchError || !profileRows || profileRows.length === 0) {
      return res.status(404).json({ error: 'Player profile not found in database.' });
    }

    const profileRow = profileRows[0];
    const profile = profileRow.data;
    const oldUpdatedAt = profileRow.updated_at;

    const currentSovereigns = profile.bloodSovereigns || 0;
    if (currentSovereigns < numAmount) {
      return res.status(400).json({ error: `Insufficient balance! You have ${currentSovereigns} SOV, requested ${numAmount} SOV.` });
    }

    const newRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: walletAddress,
      username: profile.username || 'Voidwalker',
      walletAddress: targetAddress.trim(),
      amountSovereigns: numAmount,
      amountUsdt: Number((numAmount * 0.01).toFixed(2)),
      status: 'pending',
      createdAt: Date.now()
    };

    profile.bloodSovereigns = currentSovereigns - numAmount;
    profile.withdrawalRequests = [newRequest, ...(profile.withdrawalRequests || [])];

    const newUpdatedAt = new Date().toISOString();
    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: newUpdatedAt })
      .eq('wallet_address', walletAddress);

    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }

    const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');
    if (updateError || !updateResult || updateResult.length === 0) {
      return res.status(409).json({ error: 'Conflict: Profile state changed. Please try again.' });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully requested withdrawal of ${numAmount} SOV ($${(numAmount * 0.01).toFixed(2)} USDT)!`,
      profile,
      request: newRequest
    });

  } catch (error: any) {
    console.error('Withdrawal API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}