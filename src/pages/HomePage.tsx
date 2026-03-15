import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Star, TrendingUp, BookOpen, Eye, Users, ChevronLeft, ChevronRight as ChevronR, Crown, Zap, Clock, Rocket, Globe, Cpu, Sparkles, Flame, Heart, Music2 } from 'lucide-react';
import { useStore } from '../store';
import type { Novel, NovelPlaylist } from '../types';

/* ─── Netflix-style Novel Row Card (Portrait 3:4) ─── */
function NfCard({ novel, badge }: { novel: Novel; badge?: 'trending' }) {
  const navigate = useNavigate();
  const { getNovelLikeCount, upcomingNovelIds } = useStore();
  const likes = getNovelLikeCount(novel.id);
  const isUpcoming = upcomingNovelIds.includes(novel.id);
  const isPremium = novel.ratingAvg >= 4.5 && novel.totalReads > 5000;
  return (
    <button
      onClick={() => navigate(`/novel/${novel.id}`)}
      className="w-[210px] sm:w-[300px] lg:w-[345px] min-w-[210px] sm:min-w-[300px] lg:min-w-[345px] shrink-0 group relative cursor-pointer"
    >
      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-bg-tertiary relative glass-card-hover transition-transform duration-300 hover:scale-105 border-[3px] border-white/30">
        {novel.coverImageUrl ? (
          <img src={novel.coverImageUrl} alt={novel.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 to-bg-tertiary flex items-center justify-center p-3">
            <span className="text-sm text-center text-text-primary/50 font-medium">{novel.title}</span>
          </div>
        )}
        {isPremium && !isUpcoming && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#E2B04A]/90 text-[#1A0E0E] px-2 py-1 text-[10px] font-bold shadow-lg">
            <Crown size={10} /> Premium
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-[#F4CF7A]/95 text-[#1A0E0E] px-2 py-1 text-[10px] font-bold shadow-lg">
            <Rocket size={10} /> Upcoming
          </div>
        )}
        {!isUpcoming && badge === 'trending' && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-[#E24A4A]/90 text-white px-2 py-1 text-[10px] font-bold shadow-lg">
            <Flame size={10} /> Trending
          </div>
        )}
        <div className={`absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-lg ${
          novel.mode === 'primitive'
            ? 'bg-[#FF8A6B]/90 text-[#1A0E0E]'
            : 'bg-[#E2B04A]/90 text-[#1A0E0E]'
        }`}>
          {novel.mode === 'primitive' ? 'Primitive' : 'Modern'}
        </div>
        {/* Netflix hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 rounded-2xl">
          <p className="text-white text-xs font-bold line-clamp-2 mb-1">{novel.title}</p>
          <p className="text-gray-400 text-[10px] mb-2">{novel.authorName}</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-[10px] text-gold"><Star size={10} className="fill-gold text-gold" /> {novel.ratingAvg}</span>
            <span className="text-[10px] text-gray-400">{(novel.totalReads / 1000).toFixed(1)}k reads</span>
            <span className="text-[10px] text-[#FF8A6B] inline-flex items-center gap-0.5"><Heart size={10} className="fill-[#FF8A6B]" /> {likes}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function PlaylistRow({ playlists, novels }: { playlists: NovelPlaylist[]; novels: Novel[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  if (playlists.length === 0) return null;
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 620, behavior: 'smooth' });

  return (
    <section className="mb-10 group/row relative">
      <h2 className="text-base sm:text-lg font-semibold px-4 lg:px-12 mb-4 flex items-center gap-2 text-white">
        <Music2 size={18} className="text-gold" /> Novel Playlists
      </h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 lg:px-12 pb-2" style={{ scrollbarWidth: 'none' }}>
          {playlists.map((pl) => {
            const cover = novels.find(n => n.id === pl.coverNovelId)?.coverImageUrl;
            return (
              <button
                key={pl.id}
                onClick={() => navigate('/home')}
                className="min-w-[220px] sm:min-w-[300px] rounded-2xl overflow-hidden glass-card text-left hover:scale-[1.01] transition-transform"
              >
                <div className="h-40 relative" style={{ background: `linear-gradient(135deg, ${pl.color}, rgba(26,14,14,0.9))` }}>
                  {cover && <img src={cover} alt="" className="w-full h-full object-cover opacity-55" loading="lazy" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <p className="absolute bottom-3 left-3 text-white text-lg font-bold line-clamp-1">{pl.name}</p>
                </div>
                <div className="p-3">
                  <p className="text-sm text-text-secondary line-clamp-2">{pl.description}</p>
                  <p className="text-xs text-accent mt-2">{pl.novelIds.length} novels</p>
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronR size={24} className="text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Scrollable Category Row ─── */
function CategoryRow({ title, novels, icon, badge }: { title: string; novels: Novel[]; icon?: React.ReactNode; badge?: 'trending' }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (novels.length === 0) return null;
  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };
  return (
    <section className="mb-10 group/row relative">
      <h2 className="text-base sm:text-lg font-semibold px-4 lg:px-12 mb-3 flex items-center gap-2 text-white">
        {icon} {title}
      </h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-2 sm:gap-3 overflow-x-auto px-4 lg:px-12 pb-2" style={{ scrollbarWidth: 'none' }}>
          {novels.map(novel => <NfCard key={novel.id} novel={novel} badge={badge} />)}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronR size={24} className="text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Top Authors Row (Spotify-style Circles) ─── */
function TopAuthorsRow({ novels }: { novels: Novel[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Extract unique authors with stats
  const authorMap = new Map<string, { name: string; totalReads: number; novelCount: number; avatarSeed: number }>();
  novels.forEach(n => {
    const existing = authorMap.get(n.authorName);
    if (existing) {
      existing.totalReads += n.totalReads;
      existing.novelCount += 1;
    } else {
      // Deterministic seed from author name for Unsplash avatar
      let hash = 0;
      for (let i = 0; i < n.authorName.length; i++) hash = ((hash << 5) - hash) + n.authorName.charCodeAt(i);
      authorMap.set(n.authorName, { name: n.authorName, totalReads: n.totalReads, novelCount: 1, avatarSeed: Math.abs(hash) });
    }
  });
  const authors = [...authorMap.values()].sort((a, b) => b.totalReads - a.totalReads).slice(0, 20);

  if (authors.length === 0) return null;

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' });

  return (
    <section className="mb-10 group/row relative">
      <h2 className="text-base sm:text-lg font-semibold px-4 lg:px-12 mb-4 flex items-center gap-2 text-white">
        <Users size={18} className="text-accent" /> Top Authors
      </h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto px-4 lg:px-12 pb-2" style={{ scrollbarWidth: 'none' }}>
          {authors.map((author, i) => (
            <button
              key={author.name}
              onClick={() => navigate('/home')}
              className="shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    borderColor: i === 0 ? '#E24A4A' : i < 3 ? '#E2B04A' : 'rgba(255,240,240,0.24)',
                    boxShadow: i === 0 ? '0 0 20px rgba(226,74,74,0.4)' : i < 3 ? '0 0 15px rgba(226,176,74,0.3)' : 'none',
                  }}
                >
                  <img
                    src={`https://i.pravatar.cc/200?img=${(author.avatarSeed % 70) + 1}`}
                    alt={author.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {i < 3 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: i === 0 ? '#E24A4A' : '#E2B04A',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {i + 1}
                  </div>
                )}
              </div>
              <div className="text-center max-w-[96px]">
                <p className="text-xs font-medium text-white truncate group-hover:text-accent transition-colors">{author.name}</p>
                <p className="text-[10px] text-gray-500">{author.novelCount} novel{author.novelCount > 1 ? 's' : ''}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronR size={24} className="text-white" />
        </button>
      </div>
    </section>
  );
}

/* ─── Mini Stat Card ─── */
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-4 flex items-center gap-3 min-w-[170px] sm:min-w-[200px]">
      <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: color + '20' }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-white text-lg font-bold">{value}</p>
        <p className="text-gray-400 text-xs">{label}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { novels, userNovels, readingProgress, currentUser, playlists, upcomingNovelIds } = useStore();
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);

  // Home discovery should include published user novels as well (loadUserData keeps them out of novels).
  const publishedUserNovels = userNovels.filter(n => n.status === 'published' && !n.isUnlisted);
  const homeNovelPool = [...novels, ...publishedUserNovels.filter(n => !novels.some(x => x.id === n.id))];

  const upcomingNovels = homeNovelPool.filter(n => upcomingNovelIds.includes(n.id));
  const visibleNovels = homeNovelPool.filter(n => !upcomingNovelIds.includes(n.id));

  const trending = [...visibleNovels].sort((a, b) => b.totalReads - a.totalReads);
  const topRated = [...visibleNovels].sort((a, b) => b.ratingAvg - a.ratingAvg);
  const newArrivals = [...visibleNovels].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const heroBanners = trending.slice(0, 5);

  const continueReading = readingProgress
    .map(p => visibleNovels.find(n => n.id === p.novelId))
    .filter((n): n is NonNullable<typeof n> => !!n);

  const userGenres = currentUser?.genrePrefs || [];
  const recommended = userGenres.length > 0
    ? visibleNovels.filter(n => n.genreTags.some(g => userGenres.includes(g)))
    : visibleNovels.slice(0, 8);

  // Extra category filters
  const premiumNovels = visibleNovels.filter(n => n.ratingAvg >= 4.5 && n.totalReads > 5000);
  const shortNovels = [...visibleNovels].filter(n => n.totalWords < 50000).sort((a, b) => b.ratingAvg - a.ratingAvg);
  const longNovels = [...visibleNovels].filter(n => n.totalWords > 100000).sort((a, b) => b.ratingAvg - a.ratingAvg);
  const sciFiNovels = visibleNovels.filter(n => n.genreTags.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('sci fi') || g.toLowerCase() === 'science fiction'));
  const fantasyNovels = visibleNovels.filter(n => n.genreTags.some(g => g.toLowerCase().includes('fantasy')));
  const otherworldlyNovels = visibleNovels.filter(n => n.genreTags.some(g => ['dystopian', 'space opera', 'otherworldly', 'paranormal', 'dark fantasy', 'urban fantasy'].includes(g.toLowerCase())));
  const techNovels = visibleNovels.filter(n => n.genreTags.some(g => ['cyberpunk', 'steampunk', 'technology', 'sci-fi'].includes(g.toLowerCase())));

  // Stats
  const totalReads = visibleNovels.reduce((s, n) => s + n.totalReads, 0);
  const totalNovels = visibleNovels.length;
  const avgRating = visibleNovels.length ? (visibleNovels.reduce((s, n) => s + n.ratingAvg, 0) / visibleNovels.length).toFixed(1) : '0';
  const totalWords = visibleNovels.reduce((s, n) => s + n.totalWords, 0);

  useEffect(() => {
    if (heroBanners.length === 0) return;
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % heroBanners.length), 6000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const heroNovel = heroBanners[heroIndex];

  return (
    <div className="min-h-[200vh] pb-20 animate-fade-in">
      {/* ─── Netflix Billboard Hero ─── */}
      {heroNovel && (
        <section className="relative h-[72vh] sm:h-[80vh] min-h-[420px] sm:min-h-[500px] max-h-[800px] mb-4">
          {heroBanners.map((novel, i) => (
            <div key={novel.id} className={`absolute inset-0 transition-all duration-1000 ${i === heroIndex ? 'opacity-100' : 'opacity-0'}`}>
              {novel.coverImageUrl ? (
                <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-bg-primary" />
              )}
            </div>
          ))}
          {/* Netflix gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0E0E] via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1A0E0E] to-transparent" />

          {/* Content */}
          <div className="absolute bottom-[13%] left-4 right-4 sm:right-auto lg:left-12 max-w-xl z-10">
            <div className="flex gap-2 mb-3">
              {heroNovel.genreTags.map(g => (
                <span key={g} className="text-[11px] px-2 py-0.5 rounded bg-white/10 text-white/80">{g}</span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: '"Bebas Neue", Inter, sans-serif', letterSpacing: '0.02em' }}>
              {heroNovel.title}
            </h1>
            <p className="text-gray-300 text-sm mb-1">by {heroNovel.authorName}</p>
            <p className="text-gray-400 text-sm mb-5 line-clamp-2">{heroNovel.synopsis}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  const ch = heroNovel.volumes[0]?.chapters[0];
                  if (ch) navigate(`/read/${heroNovel.id}/${ch.id}`);
                  else navigate(`/novel/${heroNovel.id}`);
                }}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white text-black font-bold text-sm rounded hover:bg-gray-200 transition-colors"
              >
                <Play size={18} fill="black" /> Read Now
              </button>
              <button
                onClick={() => navigate(`/novel/${heroNovel.id}`)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white/20 text-white font-semibold text-sm rounded hover:bg-white/30 transition-colors backdrop-blur"
              >
                <Info size={18} /> More Info
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Star size={14} className="text-gold fill-gold" /> {heroNovel.ratingAvg}</span>
              <span>{(heroNovel.totalReads / 1000).toFixed(1)}k reads</span>
              <span>{heroNovel.volumes.reduce((s, v) => s + v.chapters.length, 0)} chapters</span>
            </div>
          </div>

          {/* Billboard indicator dots */}
          <div className="absolute bottom-6 right-4 lg:right-12 flex items-center gap-1 z-10">
            {heroBanners.map((_, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} className={`h-0.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-6 bg-accent' : 'w-3 bg-white/30'}`} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Quick Stats Bar ─── */}
      <section className="px-4 lg:px-12 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <StatCard icon={<Eye size={18} />} label="Total Reads" value={totalReads > 1000 ? (totalReads / 1000).toFixed(0) + 'k' : String(totalReads)} color="#E24A4A" />
          <StatCard icon={<BookOpen size={18} />} label="Novels" value={String(totalNovels)} color="#F06B6B" />
          <StatCard icon={<Star size={18} />} label="Avg Rating" value={avgRating} color="#E2B04A" />
          <StatCard icon={<TrendingUp size={18} />} label="Total Words" value={totalWords > 1000000 ? (totalWords / 1000000).toFixed(1) + 'M' : (totalWords / 1000).toFixed(0) + 'k'} color="#C73636" />
          <StatCard icon={<Users size={18} />} label="Authors" value={String(new Set(visibleNovels.map(n => n.authorName)).size)} color="#FF8A6B" />
        </div>
      </section>

      {/* ─── Top Authors (Spotify-style Circles) ─── */}
      <TopAuthorsRow novels={visibleNovels} />

      {/* ─── Category Rows ─── */}
      <CategoryRow title="Trending Now" novels={trending.slice(0, 12)} icon={<TrendingUp size={18} className="text-accent" />} badge="trending" />
      <CategoryRow title="Upcoming Novels" novels={upcomingNovels.slice(0, 15)} icon={<Rocket size={18} className="text-gold" />} />
      <CategoryRow title="Trending Novels This Week" novels={trending.slice(0, 15)} icon={<Flame size={18} className="text-gold" />} badge="trending" />

      {/* ─── Spotify-style Playlists Row (single long lane) ─── */}
      <PlaylistRow playlists={playlists} novels={novels} />

      <CategoryRow title="Top Rated" novels={topRated.slice(0, 12)} icon={<Star size={18} className="text-gold" />} />
      <CategoryRow title="New Arrivals" novels={newArrivals.slice(0, 12)} icon={<BookOpen size={18} className="text-[#F06B6B]" />} />
      {continueReading.length > 0 && (
        <CategoryRow title="Continue Reading" novels={continueReading} icon={<Play size={18} className="text-white" />} />
      )}
      <CategoryRow title="Recommended For You" novels={recommended.slice(0, 12)} icon={<Star size={18} className="text-[#F06B6B]" />} />
      <CategoryRow title="Premium Novels" novels={premiumNovels.slice(0, 12)} icon={<Crown size={18} className="text-gold" />} />
      <CategoryRow title="Short Novels" novels={shortNovels.slice(0, 12)} icon={<Zap size={18} className="text-[#FF8A6B]" />} />
      <CategoryRow title="Long Novels" novels={longNovels.slice(0, 12)} icon={<Clock size={18} className="text-[#C73636]" />} />
      <CategoryRow title="Sci-Fi" novels={sciFiNovels.slice(0, 12)} icon={<Rocket size={18} className="text-[#F06B6B]" />} />
      <CategoryRow title="Fantasy" novels={fantasyNovels.slice(0, 12)} icon={<Sparkles size={18} className="text-gold" />} />
      <CategoryRow title="Otherworldly" novels={otherworldlyNovels.slice(0, 12)} icon={<Globe size={18} className="text-[#FF8A6B]" />} />
      <CategoryRow title="Technology" novels={techNovels.slice(0, 12)} icon={<Cpu size={18} className="text-[#E24A4A]" />} />

      {/* ─── Platform Insights Graph ─── */}
      <section className="px-4 lg:px-12 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" /> Platform Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Genre Distribution */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Genre Distribution</h3>
            <div className="space-y-2">
              {(() => {
                const genreCounts: Record<string, number> = {};
                visibleNovels.forEach(n => n.genreTags.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
                const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
                const max = sorted[0]?.[1] || 1;
                const colors = ['#E24A4A', '#F06B6B', '#E2B04A', '#FF8A6B', '#C73636', '#B33939'];
                return sorted.map(([genre, count], i) => (
                  <div key={genre} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-24 truncate">{genre}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(count / max) * 100}%`, background: colors[i % colors.length] }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
          {/* Reads Over Time (visual bar chart) */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Novels by Reads</h3>
            <div className="flex items-end gap-2 h-32">
              {trending.slice(0, 8).map((novel, i) => {
                const maxReads = trending[0]?.totalReads || 1;
                const height = (novel.totalReads / maxReads) * 100;
                return (
                  <div key={novel.id} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all duration-700 hover:opacity-80 cursor-pointer"
                      style={{
                        height: `${height}%`,
                        background: i === 0 ? '#E24A4A' : i < 3 ? '#E2B04A' : '#4A2A2A',
                        minHeight: '4px',
                      }}
                      title={`${novel.title}: ${novel.totalReads.toLocaleString()} reads`}
                    />
                    <span className="text-[8px] text-gray-500  truncate max-w-full">{novel.title.slice(0, 6)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-12 pb-4">
        <div className="relative overflow-hidden rounded-3xl border border-[#E2B04A]/30 bg-gradient-to-r from-[#2A1414] via-[#1F1212] to-[#2A1710] h-32">
          <div className="absolute inset-0 opacity-80" style={{ background: 'radial-gradient(120% 120% at 0% 100%, rgba(226,176,74,0.16) 0%, rgba(226,176,74,0) 60%)' }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,170 C140,95 260,215 410,155 C560,95 660,40 820,98 C960,150 1060,75 1200,115" fill="none" stroke="rgba(226,176,74,0.65)" strokeWidth="4" strokeLinecap="round" />
            <path d="M0,205 C180,120 310,238 470,170 C640,102 760,58 920,120 C1050,172 1110,136 1200,154" fill="none" stroke="rgba(244,207,122,0.45)" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </section>
    </div>
  );
}
