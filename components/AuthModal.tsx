import { useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import MobileWalletButton from './MobileWalletButton';
import { X, Mail, Chrome, Wallet, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: () => void;
}

export default function AuthModal({ isOpen, onClose, onWalletConnect }: AuthModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error } = useSupabaseAuth();
  const { connected, publicKey } = useWallet();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);
  const [showWalletSection, setShowWalletSection] = useState(false);

  if (!isOpen) return null;

  const getErrorMessage = (errorMessage: string) => {
    if (errorMessage.toLowerCase().includes('invalid login credentials') || 
        errorMessage.toLowerCase().includes('invalid credentials')) {
      return 'invalid_credentials';
    }
    
    if (errorMessage.toLowerCase().includes('email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    
    if (errorMessage.toLowerCase().includes('user not found')) {
      return 'user_not_found';
    }
    
    if (errorMessage.toLowerCase().includes('email already registered') || 
        errorMessage.toLowerCase().includes('user already registered')) {
      return 'An account with this email already exists. Please sign in instead or use a different email address.';
    }
    
    if (errorMessage.toLowerCase().includes('password')) {
      return 'Password must be at least 6 characters long and contain a mix of letters and numbers.';
    }
    
    if (errorMessage.toLowerCase().includes('email')) {
      return 'Please enter a valid email address.';
    }
    
    // Return the original error message if no specific case matches
    return errorMessage;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setLocalLoading(true);
    setShowCreateAccountPrompt(false);

    try {
      // Basic validation
      if (!email.trim()) {
        setLocalError('Please enter your email address');
        setLocalLoading(false);
        return;
      }

      if (!password.trim()) {
        setLocalError('Please enter your password');
        setLocalLoading(false);
        return;
      }

      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long');
        setLocalLoading(false);
        return;
      }

      let result;
      if (mode === 'signup') {
        if (!username.trim()) {
          setLocalError('Username is required');
          setLocalLoading(false);
          return;
        }
        
        if (username.length < 3) {
          setLocalError('Username must be at least 3 characters long');
          setLocalLoading(false);
          return;
        }
        
        result = await signUpWithEmail(email, password, username);
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.success) {
        onClose();
        resetForm();
      } else {
        const errorType = getErrorMessage(result.error || 'Authentication failed');
        
        if (errorType === 'invalid_credentials' || errorType === 'user_not_found') {
          // Show create account prompt instead of error
          setShowCreateAccountPrompt(true);
          setLocalError('');
        } else {
          setLocalError(errorType);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setLocalError('An unexpected error occurred. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setShowCreateAccountPrompt(false);
    setMode('signup');
    setUsername(email.split('@')[0]); // Pre-fill username with email prefix
    setLocalError('');
  };

  const handleGoogleAuth = async () => {
    setLocalError('');
    setLocalLoading(true);
    setShowCreateAccountPrompt(false);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onClose();
        resetForm();
      } else {
        const errorType = getErrorMessage(result.error || 'Google authentication failed');
        setLocalError(errorType);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      setLocalError('An unexpected error occurred with Google authentication. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleWalletConnect = () => {
    setShowWalletSection(true);
    setLocalError('');
    setShowCreateAccountPrompt(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setLocalError('');
    setShowPassword(false);
    setShowCreateAccountPrompt(false);
    setShowWalletSection(false);
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setLocalError('');
    setShowCreateAccountPrompt(false);
    setShowWalletSection(false);
    if (newMode === 'signup' && email && !username) {
      setUsername(email.split('@')[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">
            {showWalletSection ? 'Connect Wallet' : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {showWalletSection ? (
            /* Wallet Connection Section */
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wallet className="text-purple-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Connect Your Crypto Wallet</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Connect your Phantom wallet to start making predictions and earning SOL rewards.
                </p>
              </div>

              {/* Wallet Connection Status */}
              {connected && publicKey ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-400 mb-2">
                    <Wallet size={16} />
                    <span className="font-medium">Wallet Connected!</span>
                  </div>
                  <p className="text-green-300 text-sm font-mono break-all">
                    {publicKey.toString().substring(0, 8)}...{publicKey.toString().substring(-8)}
                  </p>
                  <p className="text-green-300 text-xs mt-2">
                    You can now close this dialog and start using PredictPro with your connected wallet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-medium mb-2">What you'll need:</h4>
                    <ul className="text-blue-300 text-sm space-y-1">
                      <li>• Phantom wallet browser extension or mobile app</li>
                      <li>• Some SOL tokens to stake on predictions</li>
                      <li>• A few minutes to set up your wallet</li>
                    </ul>
                  </div>

                  {/* Mobile-optimized Wallet Connection Button */}
                  <div className="text-center">
                    <MobileWalletButton className="!w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !rounded-lg !font-semibold !px-6 !py-3 !text-white !border-0" />
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <p className="text-yellow-300 text-xs">
                      <strong>New to crypto wallets?</strong> Don't worry! You can also sign up with email or Google and connect a wallet later when you're ready to start earning SOL.
                    </p>
                  </div>
                </div>
              )}

              {/* Back to other options */}
              <div className="text-center pt-4 border-t border-white/20">
                <button
                  onClick={() => setShowWalletSection(false)}
                  className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                >
                  ← Back to other sign-in options
                </button>
              </div>
            </div>
          ) : (
            /* Regular Auth Section */
            <>
              {/* Create Account Prompt */}
              {showCreateAccountPrompt && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-blue-400 mt-0.5" size={20} />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-2">Account Not Found</h4>
                      <p className="text-blue-300 text-sm mb-3">
                        We couldn't find an account with this email address. Would you like to create a new account?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateAccount}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition-colors"
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => setShowCreateAccountPrompt(false)}
                          className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Auth Provider Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleAuth}
                  disabled={localLoading || loading}
                  className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Chrome size={20} />
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={handleWalletConnect}
                  disabled={localLoading || loading}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet size={20} />
                  <span>Connect Crypto Wallet</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">or</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="Choose a username (min 3 characters)"
                      required
                      minLength={3}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="Enter your password (min 6 characters)"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {localError && (
                  <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                    {localError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={localLoading || loading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {localLoading || loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Please wait...</span>
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Mode Switch */}
              {!showCreateAccountPrompt && (
                <div className="text-center">
                  <button
                    onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
                  >
                    {mode === 'signin' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}