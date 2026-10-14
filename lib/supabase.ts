import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

// Expo Web also performs server-side rendering/bundling.
// We must NOT create a Supabase client there because Realtime
// requires browser WebSocket APIs.
const isBrowser = typeof window !== 'undefined';
const canCreateClient =
  isSupabaseConfigured &&
  (Platform.OS !== 'web' || isBrowser);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase is not configured yet. Check your .env file.'
  );
}

export const supabase = canCreateClient
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        ...(Platform.OS === 'web'
          ? {}
          : {
              storage: AsyncStorage,
            }),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;