import { Trophy, Star, Eye, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export default function LeaderboardPage() {
  const { novels } = useStore();
  const navigate = useNavigate();

  const topByReads = [...novels].sort((a, b) => b.totalReads - a.totalReads).slice(0, 10);
  const topByRating = [...novels].sort((a, b) => b.ratingAvg - a.ratingAvg).slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen p-4 sm:p-5 md:p-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
        <Trophy className="text-gold" size={28} /> Leaderboard
      </h1>
      <p className="text-text-secondary mb-8">Top novels and authors this month</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Most Read */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-coral" /> Most Read
          </h2>
          <div className="space-y-2">
            {topByReads.map((novel, i) => (
              <button
                key={novel.id}
                onClick={() => navigate(`/novel/${novel.id}`)}
                className="w-full flex items-center gap-3 p-3 glass-card glass-card-hover text-left"
              >
                <span className="w-8 text-center text-lg shrink-0">
                  {medals[i] || <span className="text-text-secondary text-sm font-bold">{i + 1}</span>}
                </span>
                <div className="w-10 h-14 rounded-lg bg-bg-tertiary overflow-hidden shrink-0">
                  {novel.coverImageUrl ? (
                    <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-coral/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{novel.title}</p>
                  <p className="text-text-secondary text-xs truncate">{novel.authorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold flex items-center gap-1"><Eye size={14} /> {(novel.totalReads / 1000).toFixed(1)}k</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star size={20} className="text-gold" /> Top Rated
          </h2>
          <div className="space-y-2">
            {topByRating.map((novel, i) => (
              <button
                key={novel.id}
                onClick={() => navigate(`/novel/${novel.id}`)}
                className="w-full flex items-center gap-3 p-3 glass-card glass-card-hover text-left"
              >
                <span className="w-8 text-center text-lg shrink-0">
                  {medals[i] || <span className="text-text-secondary text-sm font-bold">{i + 1}</span>}
                </span>
                <div className="w-10 h-14 rounded-lg bg-bg-tertiary overflow-hidden shrink-0">
                  {novel.coverImageUrl ? (
                    <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-coral/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{novel.title}</p>
                  <p className="text-text-secondary text-xs truncate">{novel.authorName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gold text-sm font-semibold flex items-center gap-1"><Star size={14} className="fill-gold" /> {novel.ratingAvg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
