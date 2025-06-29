import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Target, TrendingUp, Medal, Crown, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  total_predictions: number;
  correct_predictions: number;
  win_rate: number;
  total_staked: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get users with their prediction statistics
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          predictions!inner (
            id,
            stake_amount,
            results (
              is_correct
            )
          )
        `);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setError('Failed to load leaderboard');
        return;
      }

      // Process the data to calculate statistics
      const processedUsers = data
        .map(user => {
          const predictions = user.predictions || [];
          const totalPredictions = predictions.length;
          const resolvedPredictions = predictions.filter(p => p.results && p.results.length > 0);
          const correctPredictions = resolvedPredictions.filter(p => p.results[0]?.is_correct).length;
          const winRate = resolvedPredictions.length > 0 ? (correctPredictions / resolvedPredictions.length) * 100 : 0;
          const totalStaked = predictions.reduce((sum, p) => sum + parseFloat(p.stake_amount.toString()), 0);

          return {
            id: user.id,
            username: user.username,
            total_predictions: totalPredictions,
            correct_predictions: correctPredictions,
            win_rate: winRate,
            total_staked: totalStaked,
            rank: 0, // Will be set after sorting
          };
        })
        // Filter users who have made at least 3 predictions to qualify for leaderboard
        .filter(user => user.total_predictions >= 3)
        // Sort by win rate (descending), then by total predictions (descending) as tiebreaker
        .sort((a, b) => {
          if (b.win_rate !== a.win_rate) {
            return b.win_rate - a.win_rate;
          }
          return b.total_predictions - a.total_predictions;
        })
        // Add rank
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }))
        // Take top 10
        .slice(0, 10);

      setLeaderboard(processedUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-300" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-300/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30';
      default:
        return 'bg-white/10 border-white/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Trophy className="mr-2" size={24} />
          Leaderboard
        </h3>
        <div className="text-center text-gray-400 py-8">
          Loading leaderboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <Trophy className="mr-2" size={24} />
          Leaderboard
        </h3>
        <div className="text-center text-red-400 py-8">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
        <Trophy className="mr-2" size={24} />
        Leaderboard - Top Predictors
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <Trophy className="mx-auto mb-4 text-gray-500" size={48} />
          <p>No qualified users yet.</p>
          <p className="text-sm mt-2">Make at least 3 predictions to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((user) => (
            <div
              key={user.id}
              className={`${getRankBgColor(user.rank)} backdrop-blur-md rounded-lg p-4 border transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getRankIcon(user.rank)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{user.username}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span className="flex items-center">
                        <Target size={14} className="mr-1" />
                        {user.total_predictions} predictions
                      </span>
                      <span className="flex items-center">
                        <TrendingUp size={14} className="mr-1" />
                        {user.correct_predictions} correct
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {user.win_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Win Rate
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.total_staked.toFixed(3)} SOL staked
                  </div>
                </div>
              </div>

              {/* Progress bar for win rate */}
              <div className="mt-3">
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(user.win_rate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="text-purple-400 hover:text-purple-300 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        * Minimum 3 predictions required to qualify for leaderboard
      </div>
    </div>
  );
}