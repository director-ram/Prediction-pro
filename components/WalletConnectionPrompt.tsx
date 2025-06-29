import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import MobileWalletButton from './MobileWalletButton';
import { Wallet, AlertTriangle, X } from 'lucide-react';

interface WalletConnectionPromptProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export default function WalletConnectionPrompt({ 
  isOpen, 
  onClose, 
  title, 
  description 
}: WalletConnectionPromptProps) {
  const { connected, publicKey } = useWallet();
  const { user, connectWallet } = useSupabaseAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleWalletConnect = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!user) {
      setError('Please sign in to your account first');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const result = await connectWallet(publicKey.toString());
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-sm mx-2 max-h-[90vh] overflow-y-auto">
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-lg font-bold text-white truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-white/10 rounded"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Warning Icon - Smaller */}
          <div className="flex justify-center">
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <AlertTriangle className="text-yellow-400" size={24} />
            </div>
          </div>

          {/* Description - Compact */}
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-3">{description}</p>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Wallet className="text-blue-400 mt-0.5 flex-shrink-0" size={16} />
                <div className="text-left">
                  <h4 className="text-blue-400 font-medium mb-1 text-sm">Why do I need a wallet?</h4>
                  <p className="text-blue-300 text-xs">
                    To stake SOL tokens and receive rewards, you need a crypto wallet. 
                    Your predictions and winnings are stored on the Solana blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Connection Status */}
          {user?.wallet_address ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-green-400">
                <Wallet size={14} />
                <span className="text-sm font-medium">Wallet Connected</span>
              </div>
              <p className="text-green-300 text-xs mt-1 font-mono break-all">
                {user.wallet_address.substring(0, 8)}...{user.wallet_address.substring(-8)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Wallet Connection Button */}
              <div className="text-center">
                <MobileWalletButton className="!w-full !bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !rounded-lg !font-medium !px-4 !py-2.5 !text-white !border-0 !text-sm" />
              </div>

              {/* Connect Button (after wallet is connected) */}
              {connected && publicKey && (
                <button
                  onClick={handleWalletConnect}
                  disabled={connecting}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:cursor-not-allowed text-sm"
                >
                  {connecting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    'Link Wallet to Account'
                  )}
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Skip Option - More prominent */}
          <div className="text-center pt-2 border-t border-white/10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors underline"
            >
              I'll connect my wallet later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}