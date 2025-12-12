import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qdtprcbrwuarnlbnypuz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkdHByY2Jyd3Vhcm5sYm55cHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzU5ODQsImV4cCI6MjA4MTExMTk4NH0._dvXJKR3tu6BWGB9wV8TY4XHd_n-e0lSEP4i8Lv8VFM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
