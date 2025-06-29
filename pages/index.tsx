import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AuthModal from '../components/AuthModal';
import WalletConnectionPrompt from '../components/WalletConnectionPrompt';
import PredictionForm from '../components/PredictionForm';
import PredictionsList from '../components/PredictionsList';
import UserStats from '../components/UserStats';
import UserBalance from '../components/UserBalance';
import ProfilePage from '../components/ProfilePage';
import Leaderboard from '../components/Leaderboard';
import { TrendingUp, Users, Target, User, Trophy, Wallet, Shield, LogOut } from 'lucide-react';
import Link from 'next/link';

type TabId = 'all' | 'my' | 'create' | 'balance' | 'profile' | 'leaderboard';

export default function Home() {
  const { user, loading, signOut } = useSupabaseAuth();
  const { isAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [walletPromptConfig, setWalletPromptConfig] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const requireWallet = (action: string) => {
    if (!user?.wallet_address) {
      setWalletPromptConfig({
        title: 'Wallet Required',
        description: `To ${action}, you need to connect a crypto wallet to your account. This allows you to stake SOL tokens and receive rewards.`
      });
      setShowWalletPrompt(true);
      return false;
    }
    return true;
  };

  const handleTabChange = (tabId: TabId) => {
    if (tabId === 'balance' && !requireWallet('manage your balance and transactions')) {
      return;
    }
    if (tabId === 'create' && !requireWallet('create predictions and stake SOL')) {
      return;
    }
    setActiveTab(tabId);
  };

  // Show loading state until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-xl">Loading your account...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="mobile-container container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <header className="text-center mb-8 md:mb-12">
            <div className="flex justify-center items-center mb-4">
              <TrendingUp className="text-purple-400 mr-2 md:mr-3" size={36} />
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                PredictPro
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-4">
              Make price predictions, stake SOL, and compete with other traders
            </p>
            
            {/* Authentication Options */}
            <div className="flex flex-col items-center space-y-4 mb-8">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                Get Started
              </button>
              
              <div className="text-gray-400 text-sm">
                Sign up with email, Google, or connect your crypto wallet
              </div>
            </div>

            {/* Mobile Instructions */}
            <div className="mt-6 max-w-md mx-auto px-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mobile-card">
                <h3 className="text-blue-400 font-semibold mb-2 text-sm md:text-base">New to Crypto?</h3>
                <p className="text-blue-300 text-xs md:text-sm mb-3">
                  No problem! You can sign up with email or Google and explore predictions. 
                  Connect a wallet later when you're ready to stake SOL and earn rewards.
                </p>
                <p className="text-blue-200 text-xs italic">
                  Wallet connection is only required for staking and earning SOL rewards.
                </p>
              </div>
            </div>
          </header>

          {/* Features */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mobile-grid">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center mobile-card">
                <Target className="text-blue-400 mx-auto mb-3 md:mb-4" size={36} />
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Make Predictions</h3>
                <p className="text-gray-300 text-sm md:text-base">Predict cryptocurrency prices and stake SOL on your predictions</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center mobile-card">
                <TrendingUp className="text-green-400 mx-auto mb-3 md:mb-4" size={36} />
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Oracle Resolution</h3>
                <p className="text-gray-300 text-sm md:text-base">Predictions are automatically resolved using real-time price oracles</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20 text-center mobile-card">
                <Users className="text-purple-400 mx-auto mb-3 md:mb-4" size={36} />
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">Compete & Win</h3>
                <p className="text-gray-300 text-sm md:text-base">Earn 2x your stake for correct predictions and climb the leaderboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onWalletConnect={() => {}}
        />
      </div>
    );
  }

  const tabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ size?: number | string }> }> = [
    { id: 'all', label: 'All Predictions', icon: Users },
    { id: 'my', label: 'My Predictions', icon: Target },
    { id: 'create', label: 'Create Prediction', icon: TrendingUp },
    { id: 'balance', label: 'Balance', icon: Wallet },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="mobile-container container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 mobile-header">
          <div className="flex items-center mb-4 md:mb-0 mobile-header-title">
            <TrendingUp className="text-purple-400 mr-2 md:mr-3" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold text-white">PredictPro</h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 mobile-header-actions">
            {/* Only show admin link if user is admin */}
            {isAdmin && (
              <Link href="/admin" className="flex items-center space-x-1 md:space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm touch-button">
                <Shield size={14} />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Link>
            )}
            
            {/* User Info */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 hidden lg:block text-sm">
                Welcome, {user.username}
              </span>
              
              {/* Wallet Status */}
              {user.wallet_address ? (
                <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                  <Wallet size={12} />
                  <span className="hidden sm:inline">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                  <Wallet size={12} />
                  <span className="hidden sm:inline">No Wallet</span>
                </div>
              )}
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors text-xs"
                title="Sign Out"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* User Stats */}
        {activeTab !== 'profile' && activeTab !== 'balance' && (
          <div className="mb-4 md:mb-8 mobile-landscape-stats">
            <UserStats />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-4 mb-4 md:mb-8 mobile-tabs">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center space-x-1 md:space-x-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors mobile-tab touch-button ${
                activeTab === id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs md:text-sm">{label}</span>
              {(id === 'balance' || id === 'create') && !user.wallet_address && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4 md:space-y-8">
          {activeTab === 'all' && <PredictionsList showUserOnly={false} />}
          {activeTab === 'my' && <PredictionsList showUserOnly={true} />}
          {activeTab === 'create' && (
            <PredictionForm onSuccess={() => setActiveTab('my')} />
          )}
          {activeTab === 'balance' && <UserBalance />}
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'profile' && <ProfilePage />}
        </div>
      </div>

      {/* Wallet Connection Prompt */}
      <WalletConnectionPrompt
        isOpen={showWalletPrompt}
        onClose={() => setShowWalletPrompt(false)}
        title={walletPromptConfig.title}
        description={walletPromptConfig.description}
      />
    </div>
  );
}