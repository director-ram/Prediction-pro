import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Add debugging information
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  // Add retry configuration
  db: {
    schema: 'public',
  },
  // Add timeout configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Add error handling for Supabase client
supabase.auth.onAuthStateChange((event, _session) => {
  if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
  if (event === 'SIGNED_IN') {
    console.log('User signed in');
  }
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed');
  }
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          username: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          username: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          username?: string;
          created_at?: string | null;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          asset: string;
          target_price: number;
          expiry_time: string;
          stake_amount: number;
          status: 'pending' | 'resolved';
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          asset: string;
          target_price: number;
          expiry_time: string;
          stake_amount: number;
          status?: 'pending' | 'resolved';
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          asset?: string;
          target_price?: number;
          expiry_time?: string;
          stake_amount?: number;
          status?: 'pending' | 'resolved';
          created_at?: string | null;
        };
      };
      results: {
        Row: {
          id: string;
          prediction_id: string;
          actual_price: number;
          is_correct: boolean;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          prediction_id: string;
          actual_price: number;
          is_correct: boolean;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          prediction_id?: string;
          actual_price?: number;
          is_correct?: boolean;
          resolved_at?: string | null;
        };
      };
    };
  };
};