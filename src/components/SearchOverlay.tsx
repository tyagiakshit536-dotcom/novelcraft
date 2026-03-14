import { useMemo, useRef, useEffect, useState } from 'react';
import { Search, X, Sparkles, BookOpen, Crown, Users, ArrowLeft, Rocket } from 'lucide-react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

type Filter = 'all' | 'novels' | 'authors' | 'premium';

const browseTiles = [
  { title: 'Fantasy', color: 'from-[#C73636] to-[#E24A4A]' },
  { title: 'Sci-Fi', color: 'from-[#B33939] to-[#F06B6B]' },
  { title: 'Otherworldly', color: 'from-[#452A2A] to-[#C73636]' },
  { title: 'Technology', color: 'from-[#E24A4A] to-[#FF8A6B]' },
  { title: 'Premium Picks', color: 'from-[#E2B04A] to-[#F4CF7A]' },
  { title: 'Romance', color: 'from-[#D34A5A] to-[#FF8A6B]' },
  { title: 'Thriller', color: 'from-[#5A2A2A] to-[#B33939]' },
  { title: 'Adventure', color: 'from-[#A74343] to-[#E2B04A]' },
];

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, novels, upcomingNovelIds } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  const query = searchQuery.toLowerCase().trim();
  const premiumNovels = useMemo(() => novels.filter(n => n.ratingAvg >= 4.5 && n.totalReads > 5000), [novels]);

  const filteredNovels = useMemo(() => {
    const source = filter === 'premium' ? premiumNovels : novels;
    if (!query) return source.slice(0, 12);
    return source.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.authorName.toLowerCase().includes(query) ||
      n.genreTags.some(g => g.toLowerCase().includes(query))
    ).slice(0, 16);
  }, [filter, novels, premiumNovels, query]);

  const authors = useMemo(() => {
    const map = new Map<string, { name: string; novels: number }>();
    novels.forEach((n) => {
      const prev = map.get(n.authorName);
      map.set(n.authorName, { name: n.authorName, novels: (prev?.novels || 0) + 1 });
    });
    const arr = [...map.values()];
    if (!query) return arr.slice(0, 12);
    return arr.filter(a => a.name.toLowerCase().includes(query)).slice(0, 16);
  }, [novels, query]);

  const close = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setFilter('all');
  };

  const showAuthors = filter === 'authors';
  const showNovels = filter === 'all' || filter === 'novels' || filter === 'premium';

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
      <div className="w-full px-4 md:px-8 lg:px-12 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={close}
              className="w-12 h-12 rounded-xl hover:bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to read?"
                className="w-full pl-12 pr-4 py-3.5 bg-bg-secondary rounded-2xl border border-divider focus:border-accent focus:outline-none text-text-primary placeholder:text-text-secondary/50 text-lg"
              />
            </div>
            <button
              onClick={close}
              className="w-12 h-12 rounded-xl hover:bg-bg-secondary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors shrink-0"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'all' as const, label: 'All', icon: Sparkles },
              { key: 'novels' as const, label: 'Novels', icon: BookOpen },
              { key: 'authors' as const, label: 'Authors', icon: Users },
              { key: 'premium' as const, label: 'Premium Novels', icon: Crown },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm transition-all ${
                  filter === item.key ? 'bg-accent text-white border-accent' : 'bg-bg-secondary border-divider text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </div>

          {!query && filter === 'all' && (
            <section className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-text-secondary mb-3">Browse All</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {browseTiles.map(tile => (
                  <button
                    key={tile.title}
                    onClick={() => setSearchQuery(tile.title.replace(' Picks', ''))}
                    className={`h-24 rounded-2xl bg-gradient-to-br ${tile.color} p-4 text-left text-white font-semibold hover:scale-[1.02] transition-transform`}
                  >
                    {tile.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          {showNovels && (
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{filter === 'premium' ? 'Premium Novels' : 'Novels'}</h3>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredNovels.map((novel) => (
                  <button
                    key={novel.id}
                    onClick={() => {
                      close();
                      navigate(`/novel/${novel.id}`);
                    }}
                    className="glass-card p-3 rounded-2xl text-left hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex gap-3">
                      <div className="w-14 h-20 rounded-xl bg-bg-tertiary overflow-hidden shrink-0 relative">
                        {novel.coverImageUrl && (
                          <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                        {upcomingNovelIds.includes(novel.id) && (
                          <div className="absolute top-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#F4CF7A]/95 text-[#1A0E0E] px-1.5 py-0.5 text-[9px] font-bold leading-none">
                            <Rocket size={9} /> Upcoming
                          </div>
                        )}
                        {novel.ratingAvg >= 4.5 && novel.totalReads > 5000 && !upcomingNovelIds.includes(novel.id) && (
                          <div className="absolute top-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#E2B04A]/95 text-[#1A0E0E] px-1.5 py-0.5 text-[9px] font-bold leading-none">
                            <Crown size={9} /> Premium
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold line-clamp-1">{novel.title}</p>
                        <p className="text-sm text-text-secondary truncate">{novel.authorName}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {novel.genreTags.slice(0, 2).map(g => (
                            <span key={g} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">{g}</span>
                          ))}
                        </div>
                        <p className="text-xs text-gold mt-2">★ {novel.ratingAvg}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {filteredNovels.length === 0 && (
                  <div className="col-span-full text-sm text-text-secondary py-8 text-center">No novels found.</div>
                )}
              </div>
            </section>
          )}

          {showAuthors && (
            <section>
              <h3 className="text-lg font-semibold mb-3">Authors</h3>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {authors.map((a, idx) => (
                  <button key={a.name + idx} className="glass-card p-4 rounded-2xl text-left hover:scale-[1.01] transition-transform">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-coral flex items-center justify-center text-white font-semibold">
                        {a.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{a.name}</p>
                        <p className="text-sm text-text-secondary">{a.novels} novel{a.novels > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {authors.length === 0 && (
                  <div className="col-span-full text-sm text-text-secondary py-8 text-center">No authors found.</div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
