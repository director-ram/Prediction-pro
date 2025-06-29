import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useWallet } from '@solana/wallet-adapter-react';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  wallet_address?: string;
  created_at: string;
  auth_provider: 'email' | 'google' | 'wallet';
}

export function useSupabaseAuth() {
  const { connected, publicKey } = useWallet();
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

  // Handle wallet connection for wallet-only authentication
  useEffect(() => {
    if (connected && publicKey && !session && !user) {
      handleWalletOnlyAuth();
    }
  }, [connected, publicKey, session, user]);

  const handleWalletOnlyAuth = async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      
      // Check if a user exists with this wallet address
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (fetchError) {
        console.error('Error checking existing wallet user:', fetchError);
        setError('Failed to verify wallet');
        setLoading(false);
        return;
      }

      if (existingUser) {
        // User exists with this wallet, sign them in
        setUser({
          id: existingUser.id,
          email: existingUser.email || `${walletAddress.substring(0, 8)}@wallet.local`,
          username: existingUser.username,
          wallet_address: existingUser.wallet_address,
          created_at: existingUser.created_at,
          auth_provider: 'wallet'
        });
      } else {
        // Create a new wallet-only user
        const username = `wallet_${walletAddress.substring(0, 8)}`;
        const email = `${walletAddress.substring(0, 8)}@wallet.local`;

        // Create user with wallet authentication
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            username,
            wallet_address: walletAddress,
            email
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating wallet user:', createError);
          setError('Failed to create wallet account');
          setLoading(false);
          return;
        }

        setUser({
          id: newUser.id,
          email: email,
          username: newUser.username,
          wallet_address: newUser.wallet_address,
          created_at: newUser.created_at,
          auth_provider: 'wallet'
        });
      }
    } catch (error) {
      console.error('Error in wallet-only auth:', error);
      setError('Failed to authenticate with wallet');
    } finally {
      setLoading(false);
    }
  };

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
          wallet_address: null,
          email: supabaseUser.email
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
      // Get the current URL for redirect
      const currentUrl = window.location.origin;
      
      console.log('Attempting Google OAuth with redirect to:', currentUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: currentUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        
        // Provide more specific error messages based on error type
        let errorMessage = error.message;
        
        if (error.message.includes('OAuth')) {
          errorMessage = 'Google authentication is not properly configured. Please check the setup in Supabase dashboard.';
        } else if (error.message.includes('redirect')) {
          errorMessage = 'Authentication redirect failed. Please check your redirect URLs in Google Console.';
        } else if (error.message.includes('popup')) {
          errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site and try again.';
        } else if (error.message.includes('provider')) {
          errorMessage = 'Google sign-in is currently unavailable. Please check your Google OAuth configuration.';
        } else if (error.message.includes('refused to connect')) {
          errorMessage = 'Connection refused. Please check your Google OAuth client ID and redirect URLs.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return { success: false, error: errorMessage };
      }

      console.log('Google OAuth initiated successfully:', data);
      
      // Note: The actual sign-in completion will be handled by the auth state change listener
      // We don't set loading to false here because the redirect will happen
      return { success: true };
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
      const errorMessage = 'Google sign-in is currently unavailable. Please check your configuration and try again.';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    // Clear local state first
    setUser(null);
    setSession(null);
    
    // Sign out from Supabase if there's a session
    if (session) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
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

      setUser({ ...user, wallet_address: data.wallet_address, auth_provider: 'wallet' });
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