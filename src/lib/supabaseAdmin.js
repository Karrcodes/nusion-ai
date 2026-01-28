// Admin Supabase Client with Service Role
// This client bypasses RLS for admin operations like impersonation
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl as clientUrl } from './supabaseClient';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || clientUrl;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Only create admin client if service role key is available
export const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null;

// Helper to check if admin client is available
export const hasAdminAccess = () => !!supabaseAdmin;
