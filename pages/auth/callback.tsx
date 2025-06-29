import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        console.log('Auth callback session:', { data, error });
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          router.push('/?error=auth_failed');
          return;
        }

        if (data.session) {
          console.log('✅ Auth callback successful, redirecting to home');
          router.push('/');
        } else {
          console.log('⚠️ No session found in callback');
          router.push('/?error=no_session');
        }
      } catch (error) {
        console.error('💥 Unexpected error in auth callback:', error);
        router.push('/?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Completing Sign In</h2>
        <p className="text-gray-300">Please wait while we finish setting up your account...</p>
      </div>
    </div>
  );
}