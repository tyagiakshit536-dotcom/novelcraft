import { useNavigate } from 'react-router-dom';
import { Bookmark, BookOpen } from 'lucide-react';
import { useStore } from '../store';

export default function ReadingListPage() {
  const { readingList, novels, userNovels, removeFromReadingList, readingProgress } = useStore();
  const navigate = useNavigate();

  const allNovels = [...novels, ...userNovels];
  const listItems = readingList.map(item => {
    const novel = allNovels.find(n => n.id === item.novelId);
    const progress = readingProgress.find(p => p.novelId === item.novelId);
    return { ...item, novel, progress };
  }).filter(i => i.novel);

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-6">Reading List</h1>

      {listItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
            <Bookmark size={32} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary text-center mb-2">Your reading list is empty</p>
          <p className="text-text-secondary/60 text-sm text-center mb-6">Save novels from Discovery to read later</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 btn btn-primary rounded-full font-semibold"
          >
            Discover Novels
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {listItems.map(item => {
            const novel = item.novel!;
            const allChapters = novel.volumes.flatMap(v => v.chapters);
            const readChapterIndex = item.progress ? allChapters.findIndex(c => c.id === item.progress!.chapterId) + 1 : 0;

            return (
              <button
                key={item.id}
                onClick={() => navigate(`/novel/${novel.id}`)}
                className="w-full flex items-center gap-4 p-4 glass-card glass-card-hover text-left"
              >
                <div className="w-16 h-24 rounded-xl overflow-hidden bg-bg-tertiary shrink-0">
                  {novel.coverImageUrl ? (
                    <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-coral/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{novel.title}</p>
                  <p className="text-text-secondary text-sm">{novel.authorName}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
                      {item.shelfName}
                    </span>
                    {readChapterIndex > 0 && (
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <BookOpen size={12} /> Ch. {readChapterIndex} of {allChapters.length}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromReadingList(novel.id); }}
                  className="w-10 h-10 rounded-xl hover:bg-error/10 flex items-center justify-center text-text-secondary hover:text-error transition-colors shrink-0"
                  title="Remove from list"
                >
                  <Bookmark size={18} className="fill-accent text-accent" />
                </button>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
