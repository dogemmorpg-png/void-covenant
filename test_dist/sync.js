import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { calculateEnergy } from "../src/utils/energyHelper.js";
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-change-in-prod";
function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase URL or Service Role Key is missing in environment variables.");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }
  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const walletAddress = decoded.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: "Token missing wallet address" });
  }
  const { safeProfileData } = req.body;
  if (!safeProfileData) {
    return res.status(400).json({ error: "Missing profile data" });
  }
  try {
    const supabase = getSupabase();
    const { data: profileRow, error: fetchError } = await supabase.from("profiles").select("data").eq("wallet_address", walletAddress).single();
    if (fetchError || !profileRow) {
      return res.status(404).json({ error: "Profile not found" });
    }
    let currentProfile = profileRow.data;
    currentProfile = calculateEnergy(currentProfile);
    if (safeProfileData.deck) currentProfile.deck = safeProfileData.deck;
    if (safeProfileData.equipped) currentProfile.equipped = safeProfileData.equipped;
    if (safeProfileData.soundOn !== void 0) currentProfile.soundOn = safeProfileData.soundOn;
    if (safeProfileData.isRegistered !== void 0) currentProfile.isRegistered = safeProfileData.isRegistered;
    if (safeProfileData.username) currentProfile.username = safeProfileData.username;
    if (safeProfileData.avatarUrl) currentProfile.avatarUrl = safeProfileData.avatarUrl;
    const { error: updateError } = await supabase.from("profiles").update({ data: currentProfile, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("wallet_address", walletAddress);
    if (updateError) {
      console.error("Sync API save error:", updateError);
      return res.status(500).json({ error: "Failed to sync profile." });
    }
    return res.status(200).json({ success: true, profile: currentProfile });
  } catch (error) {
    console.error("Sync API error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
export {
  handler as default
};
