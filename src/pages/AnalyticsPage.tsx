import { BarChart3, Eye, BookOpen, Star, TrendingUp } from 'lucide-react';
import { useStore } from '../store';

export default function AnalyticsPage() {
  const { userNovels } = useStore();

  const totalWords = userNovels.reduce((s, n) => s + n.totalWords, 0);
  const totalReads = userNovels.reduce((s, n) => s + n.totalReads, 0);
  const totalChapters = userNovels.reduce((s, n) => s + n.volumes.reduce((vs, v) => vs + v.chapters.length, 0), 0);
  const avgRating = userNovels.length > 0
    ? (userNovels.reduce((s, n) => s + n.ratingAvg, 0) / userNovels.filter(n => n.ratingAvg > 0).length || 0).toFixed(1)
    : '0.0';

  const stats = [
    { icon: BookOpen, label: 'Total Novels', value: userNovels.length, color: 'text-accent' },
    { icon: BarChart3, label: 'Total Words', value: totalWords.toLocaleString(), color: 'text-gold' },
    { icon: Eye, label: 'Total Reads', value: totalReads.toLocaleString(), color: 'text-coral' },
    { icon: Star, label: 'Avg Rating', value: avgRating, color: 'text-gold' },
    { icon: TrendingUp, label: 'Chapters', value: totalChapters, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
        <BarChart3 className="text-accent" size={28} /> Your Analytics
      </h1>
      <p className="text-text-secondary mb-8">Track your writing journey and audience growth</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card p-5 text-center">
            <stat.icon size={24} className={`mx-auto mb-3 ${stat.color}`} />
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-text-secondary text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Novels Breakdown */}
      <h2 className="text-lg font-semibold mb-4">Novel Performance</h2>
      {userNovels.length === 0 ? (
        <p className="text-text-secondary text-center py-12">Publish novels to see analytics</p>
      ) : (
        <div className="space-y-3">
          {userNovels.map(novel => (
            <div key={novel.id} className="glass-card p-4 flex items-center gap-4">
              <div className="w-12 h-16 rounded-lg bg-bg-tertiary overflow-hidden shrink-0">
                {novel.coverImageUrl ? (
                  <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/30 to-coral/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{novel.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${novel.status === 'published' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {novel.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Eye size={14} /> {novel.totalReads.toLocaleString()}</span>
                <span className="flex items-center gap-1 text-gold"><Star size={14} className="fill-gold" /> {novel.ratingAvg}</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {novel.totalWords.toLocaleString()} words</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
