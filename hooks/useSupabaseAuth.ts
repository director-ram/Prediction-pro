import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  wallet_address?: string;
  created_at: string;
  auth_provider: 'email' | 'google' | 'wallet';
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Use maybeSingle() instead of single() to handle cases where no user is found
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
        setLoading(false);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: supabaseUser.email || '',
          username: data.username,
          wallet_address: data.wallet_address,
          created_at: data.created_at,
          auth_provider: data.wallet_address ? 'wallet' : (supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email')
        });
      } else {
        // Create user profile if it doesn't exist
        await createUserProfile(supabaseUser);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // First check if user already exists to prevent duplicate key violations
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing user:', checkError);
        setError('Failed to verify user profile');
        return;
      }

      if (existingUser) {
        // User already exists, use existing data
        setUser({
          id: existingUser.id,
          email: supabaseUser.email || '',
          username: existingUser.username,
          wallet_address: existingUser.wallet_address,
          created_at: existingUser.created_at,
          auth_provider: existingUser.wallet_address ? 'wallet' : (supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email')
        });
        return;
      }

      // Create new user profile
      const username = supabaseUser.user_metadata?.full_name || 
                      supabaseUser.user_metadata?.name ||
                      supabaseUser.email?.split('@')[0] || 
                      `user_${Date.now()}`;

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          username,
          wallet_address: null
        })
        .select()
        .single();

      if (error) {
        // If we still get a duplicate key error, try to fetch the existing user
        if (error.code === '23505') {
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .maybeSingle();

          if (retryError) {
            console.error('Error fetching user after duplicate key error:', retryError);
            setError('Failed to create user profile');
            return;
          }

          if (retryData) {
            setUser({
              id: retryData.id,
              email: supabaseUser.email || '',
              username: retryData.username,
              wallet_address: retryData.wallet_address,
              created_at: retryData.created_at,
              auth_provider: retryData.wallet_address ? 'wallet' : (supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email')
            });
            return;
          }
        }

        console.error('Error creating user profile:', error);
        setError('Failed to create user profile');
        return;
      }

      setUser({
        id: data.id,
        email: supabaseUser.email || '',
        username: data.username,
        wallet_address: data.wallet_address,
        created_at: data.created_at,
        auth_provider: supabaseUser.app_metadata?.provider === 'google' ? 'google' : 'email'
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      setError('Failed to create user profile');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if we're in a development environment
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        
        if (error.message.includes('OAuth')) {
          errorMessage = 'Google authentication is not properly configured. Please contact support or try signing in with email instead.';
        } else if (error.message.includes('redirect')) {
          errorMessage = 'Authentication redirect failed. Please try again or use email sign-in.';
        } else if (error.message.includes('popup')) {
          errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      // Note: The actual sign-in completion will be handled by the auth state change listener
      // We don't set loading to false here because the redirect will happen
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      const errorMessage = 'An unexpected error occurred during Google sign-in. Please try again or use email sign-in.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ username: newUsername })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setUser({ ...user, username: data.username });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update username' };
    }
  };

  const connectWallet = async (walletAddress: string) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      // First check if this wallet address is already connected to another user
      const { data: existingWallet, error: checkError } = await supabase
        .from('users')
        .select('id, username')
        .eq('wallet_address', walletAddress)
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing wallet:', checkError);
        return { success: false, error: 'Failed to verify wallet address' };
      }

      if (existingWallet) {
        return { 
          success: false, 
          error: 'This wallet address is already connected to another account. Please use a different wallet or disconnect it from the other account first.' 
        };
      }

      const { data, error } = await supabase
        .from('users')
        .update({ wallet_address: walletAddress })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // Handle the specific duplicate key constraint violation
        if (error.code === '23505' && error.message.includes('users_wallet_address_key')) {
          return { 
            success: false, 
            error: 'This wallet address is already connected to another account. Please use a different wallet or disconnect it from the other account first.' 
          };
        }
        
        console.error('Error connecting wallet:', error);
        return { success: false, error: error.message };
      }

      setUser({ ...user, wallet_address: data.wallet_address });
      return { success: true };
    } catch (error) {
      console.error('Error in connectWallet:', error);
      return { success: false, error: 'Failed to connect wallet' };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    updateUsername,
    connectWallet
  };
}