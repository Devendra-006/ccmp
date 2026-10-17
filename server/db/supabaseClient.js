import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Admin client for backend operations (bypasses RLS, creates users, manages storage)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client for anonymous/user requests
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseAdmin;
