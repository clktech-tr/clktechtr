import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials:', { 
    supabaseUrl: supabaseUrl ? 'Defined' : 'Undefined', 
    supabaseKey: supabaseKey ? 'Defined' : 'Undefined',
    NODE_ENV: process.env.NODE_ENV
  });
}

console.log('Initializing Supabase client with:', {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'Undefined',
  supabaseKey: supabaseKey ? 'Defined (hidden for security)' : 'Undefined',
  NODE_ENV: process.env.NODE_ENV
});

export const supabase = createClient(
  supabaseUrl || 'https://YOUR_PROJECT.supabase.co',
  supabaseKey || 'YOUR_SERVICE_ROLE_KEY'
);