import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function useAdminAuth() {
  const { publicKey, connected } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Your admin wallet address - only this wallet can access admin features
  const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || 'F5RDJpjjc7W7FvWJqgaQX2KgznJK3NyyYNt8reBg7og4';

  useEffect(() => {
    checkAdminAccess();
  }, [publicKey, connected]);

  const checkAdminAccess = () => {
    setLoading(true);
    
    if (!connected || !publicKey) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Check if the connected wallet matches the admin wallet address
    const walletAddress = publicKey.toString();
    const hasAdminAccess = walletAddress === ADMIN_WALLET_ADDRESS;
    
    setIsAdmin(hasAdminAccess);
    setLoading(false);

    if (hasAdminAccess) {
      console.log('✅ Admin access granted for wallet:', walletAddress);
    } else {
      console.log('❌ Admin access denied for wallet:', walletAddress);
      console.log('Expected admin wallet:', ADMIN_WALLET_ADDRESS);
    }
  };

  return {
    isAdmin,
    loading,
    adminWalletAddress: ADMIN_WALLET_ADDRESS,
    connectedWalletAddress: publicKey?.toString(),
  };
}