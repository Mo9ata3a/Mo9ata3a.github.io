// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpgpjnsmplqeatpmtqna.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ3BqbnNtcGxxZWF0cG10cW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDI2NDUsImV4cCI6MjA2MTU3ODY0NX0.GxwlbicmO4ir0RIIqS2DZ1-pS7HY3c4WD_mEnZGMrTs'; // public anon key

export const supabase = createClient(supabaseUrl, supabaseKey);
