import { createClient } from "@supabase/supabase-js";

// ODDEX VIBE — Supabase connection
// Publishable key is safe to expose in client code (protected by Row Level Security policies)
const SUPABASE_URL = "https://khikflaqrdaxzwyajfhd.supabase.co";
const SUPABASE_KEY = "sb_publishable_m0cfPMsaBpmx85x78SqmZw_G0UvTbsO";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
