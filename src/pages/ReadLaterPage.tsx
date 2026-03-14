import { useNavigate } from 'react-router-dom';
import { Clock3, BookOpen, Play } from 'lucide-react';
import { useStore } from '../store';

export default function ReadLaterPage() {
  const { readLaterNovelIds, novels, userNovels } = useStore();
  const navigate = useNavigate();

  const all = [...novels, ...userNovels];
  const readLaterNovels = readLaterNovelIds
    .map((id) => all.find((n) => n.id === id))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 py-8 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-bg-secondary via-bg-tertiary to-bg-primary p-6 md:p-8 mb-6">
        <div className="absolute -top-20 -right-12 w-64 h-64 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.22em] text-accent/80 mb-3">Personal Shelf</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-2">Read Later</h1>
          <p className="text-text-secondary max-w-3xl">Your saved novels to read when you have time.</p>
        </div>
      </section>

      {readLaterNovels.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-bg-primary border border-divider flex items-center justify-center mx-auto mb-4">
            <Clock3 size={34} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No novels saved yet</h2>
          <p className="text-text-secondary mb-6">Use the Read Later button on any novel to save it here.</p>
          <button onClick={() => navigate('/home')} className="px-6 py-3 btn btn-primary rounded-full font-semibold">
            Discover Novels
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {readLaterNovels.map((novel) => (
            <button
              key={novel.id}
              onClick={() => navigate(`/novel/${novel.id}`)}
              className="group text-left glass-card rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform"
            >
              <div className="h-52 bg-bg-primary relative overflow-hidden">
                {novel.coverImageUrl ? (
                  <img src={novel.coverImageUrl} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/25 to-bg-tertiary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-black/50 text-white/90">
                  <Clock3 size={12} /> Saved
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold line-clamp-1 mb-1">{novel.title}</h3>
                <p className="text-xs text-text-secondary mb-3">by {novel.authorName}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary inline-flex items-center gap-1">
                    <BookOpen size={12} /> {novel.volumes.reduce((s, v) => s + v.chapters.length, 0)} chapters
                  </span>
                  <span className="text-xs text-accent inline-flex items-center gap-1 font-semibold">
                    <Play size={12} /> Open
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
