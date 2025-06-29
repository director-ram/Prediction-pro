import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export default function MobileWalletButton({ className }: { className?: string }) {
  const { connected, connecting, wallet, connect, select, wallets } = useWallet();
  const [isMobile, setIsMobile] = useState(false);
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };

    // Check if Phantom is installed
    const checkPhantom = () => {
      const isInstalled = !!(window.phantom?.solana?.isPhantom || window.solana?.isPhantom);
      setIsPhantomInstalled(isInstalled);
    };

    checkMobile();
    checkPhantom();
    
    // Recheck Phantom after a delay (in case it loads later)
    const timer = setTimeout(checkPhantom, 1000);
    
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  // Auto-connect when returning from Phantom app
  useEffect(() => {
    if (isMobile && isPhantomInstalled && !connected && !connecting) {
      const handleVisibilityChange = async () => {
        if (!document.hidden && window.phantom?.solana?.isPhantom) {
          try {
            // Select Phantom wallet first
            const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
            if (phantomWallet && !wallet) {
              select(phantomWallet.adapter.name);
            }
            
            // Small delay to ensure wallet is selected
            setTimeout(async () => {
              if (!connected && !connecting) {
                try {
                  await connect();
                } catch (error) {
                  console.log('Auto-connect failed:', error);
                }
              }
            }, 500);
          } catch (error) {
            console.log('Auto-connect error:', error);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [isMobile, isPhantomInstalled, connected, connecting, connect, select, wallet, wallets]);

  const handleMobileConnect = async () => {
    if (isMobile && !connected && !connecting) {
      try {
        // Check if Phantom is installed
        if (isPhantomInstalled || window.phantom?.solana?.isPhantom) {
          // Phantom is installed, try to connect
          try {
            // Select Phantom wallet first
            const phantomWallet = wallets.find(w => w.adapter.name === 'Phantom');
            if (phantomWallet) {
              select(phantomWallet.adapter.name);
              
              // Small delay to ensure wallet is selected
              setTimeout(async () => {
                try {
                  await connect();
                } catch (connectError) {
                  console.error('Connection failed:', connectError);
                  // If connection fails, try deep linking
                  handleDeepLink();
                }
              }, 300);
            }
          } catch (error) {
            console.error('Wallet selection failed:', error);
            handleDeepLink();
          }
          return;
        }

        // Phantom not detected, use deep linking
        handleDeepLink();

      } catch (error) {
        console.error('Mobile wallet connection error:', error);
        handleDeepLink();
      }
    }
  };

  const handleDeepLink = () => {
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /android/i.test(userAgent);

    if (isIOS) {
      // For iOS, try Phantom deep link with dapp parameter
      const phantomDeepLink = `phantom://browse/${encodeURIComponent(currentUrl)}?ref=predictpro`;
      
      // Try to open Phantom app
      window.location.href = phantomDeepLink;
      
      // Fallback to App Store if app doesn't open
      setTimeout(() => {
        if (!connected) {
          window.open('https://apps.apple.com/app/phantom-solana-wallet/id1598432977', '_blank');
        }
      }, 2500);
      
    } else if (isAndroid) {
      // For Android, try intent with proper parameters
      const intentUrl = `intent://browse/${encodeURIComponent(currentUrl)}?ref=predictpro#Intent;scheme=phantom;package=app.phantom;end`;
      
      try {
        window.location.href = intentUrl;
      } catch {
        // If intent fails, redirect to Play Store
        window.open('https://play.google.com/store/apps/details?id=app.phantom', '_blank');
      }
      
      // Fallback to Play Store if app doesn't open
      setTimeout(() => {
        if (!connected) {
          window.open('https://play.google.com/store/apps/details?id=app.phantom', '_blank');
        }
      }, 2500);
      
    } else {
      // For other mobile browsers, redirect to download page
      window.open('https://phantom.app/download', '_blank');
    }
  };

  // Show different button states
  if (isMobile && !connected) {
    return (
      <button
        onClick={handleMobileConnect}
        disabled={connecting}
        className={className || "!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !rounded-lg !font-semibold !px-6 !py-3 !text-white !border-0"}
      >
        {connecting ? (
          <span className="flex items-center">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
            Connecting...
          </span>
        ) : isPhantomInstalled ? (
          'Connect Phantom Wallet'
        ) : (
          'Get Phantom Wallet'
        )}
      </button>
    );
  }

  return <WalletMultiButton className={className} />;
}