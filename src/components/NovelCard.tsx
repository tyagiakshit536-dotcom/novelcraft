import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Heart, Crown, Rocket } from 'lucide-react';
import type { Novel } from '../types';
import { useStore } from '../store';

export function NovelCard({ novel, size = 'normal' }: { novel: Novel; size?: 'normal' | 'large' }) {
  const navigate = useNavigate();
  const { getNovelLikeCount, upcomingNovelIds } = useStore();
  const w = size === 'large' ? 'min-w-[190px]' : 'min-w-[150px] sm:min-w-[170px]';
  const likes = getNovelLikeCount(novel.id);
  const isUpcoming = upcomingNovelIds.includes(novel.id);
  const isPremium = novel.ratingAvg >= 4.5 && novel.totalReads > 5000;

  return (
    <button
      onClick={() => navigate(`/novel/${novel.id}`)}
      className={`${w} shrink-0 group text-left cursor-pointer`}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-bg-tertiary relative glass-card-hover transition-transform duration-300 hover:scale-105">
        {novel.coverImageUrl ? (
          <img src={novel.coverImageUrl} alt={novel.title} className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" loading="lazy" />
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
        <div className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-lg ${
          novel.mode === 'primitive'
            ? 'bg-[#FF8A6B]/90 text-[#1A0E0E]'
            : 'bg-[#E2B04A]/90 text-[#1A0E0E]'
        }`}>
          {novel.mode === 'primitive' ? 'Primitive' : 'Modern'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 rounded-xl">
          <p className="text-white text-xs font-bold line-clamp-2 mb-1">{novel.title}</p>
          <p className="text-gray-400 text-[10px] mb-1">{novel.authorName}</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5 text-[10px] text-green-400"><Star size={10} className="fill-green-400" /> {novel.ratingAvg}</span>
            <span className="text-[10px] text-gray-400">{(novel.totalReads / 1000).toFixed(1)}k</span>
            <span className="text-[10px] text-[#FF8A6B] inline-flex items-center gap-0.5"><Heart size={10} className="fill-[#FF8A6B]" /> {likes}</span>
          </div>
        </div>
      </div>
      <p className="font-medium text-sm text-text-primary line-clamp-1 leading-snug mt-2 mb-0.5">{novel.title}</p>
      <p className="text-text-secondary text-xs truncate">{novel.authorName}</p>
    </button>
  );
}

export function NovelShelf({ title, novels, icon }: { title: string; novels: Novel[]; icon?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  if (novels.length === 0) return null;
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 600, behavior: 'smooth' });
  return (
    <section className="mb-8 group/row relative">
      <h2 className="text-lg font-semibold px-4 lg:px-12 mb-3 flex items-center gap-2 text-white">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      <div className="relative">
        <button onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-4 lg:px-12 pb-2" style={{ scrollbarWidth: 'none' }}>
          {novels.map(novel => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
        <button onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-bg-primary to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center justify-center">
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </section>
  );
}
