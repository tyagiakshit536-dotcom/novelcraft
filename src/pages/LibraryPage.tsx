import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3X3, List, BookOpen, Eye, Star, MoreVertical, Trash2, Edit3, Share, Archive } from 'lucide-react';
import { useStore } from '../store';
import type { Novel } from '../types';

type Filter = 'all' | 'published' | 'draft' | 'archived';
type View = 'grid' | 'list';

export default function LibraryPage() {
  const { userNovels, createNovel, deleteNovel, unpublishNovel, updateNovel, upcomingNovelIds } = useStore();
  const navigate = useNavigate();
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useState<View>('grid');
  const [contextMenu, setContextMenu] = useState<string | null>(null);
  const [showNewNovelModal, setShowNewNovelModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu]);

  const filtered = userNovels.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'published') return n.status === 'published';
    if (filter === 'draft') return n.status === 'draft';
    if (filter === 'archived') return n.status === 'archived';
    return true;
  });

  const handleCreateNovel = () => {
    if (!newTitle.trim()) return;
    const novel = createNovel(newTitle.trim(), '', []);
    setShowNewNovelModal(false);
    setNewTitle('');
    navigate('/editor', { state: { novelId: novel.id } });
  };

  const handleContextAction = (novel: Novel, action: string) => {
    setContextMenu(null);
    switch (action) {
      case 'edit':
        navigate('/editor', { state: { novelId: novel.id } });
        break;
      case 'unpublish':
        unpublishNovel(novel.id);
        break;
      case 'archive':
        updateNovel(novel.id, { status: 'archived' });
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this novel? This cannot be undone.')) {
          deleteNovel(novel.id);
        }
        break;
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-5 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowNewNovelModal(true)}
          className="px-5 py-2.5 btn btn-primary rounded-full font-semibold text-sm inline-flex items-center gap-2"
        >
          <Plus size={18} /> New Novel
        </button>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === f.key ? 'bg-accent text-white' : 'bg-bg-secondary text-text-secondary hover:text-text-primary border border-divider'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-bg-secondary rounded-xl p-1">
          <button
            onClick={() => setView('grid')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${view === 'grid' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setView('list')}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${view === 'list' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-text-secondary" />
          </div>
          <p className="text-text-secondary mb-4">No novels yet. Start creating!</p>
          <button
            onClick={() => setShowNewNovelModal(true)}
            className="px-6 py-3 btn btn-primary rounded-full font-semibold inline-flex items-center gap-2"
          >
            <Plus size={18} /> Create Your First Novel
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map(novel => (
            <div key={novel.id} className="group relative">
              <button
                onClick={() => navigate(`/novel/${novel.id}`)}
                onDoubleClick={() => navigate('/editor', { state: { novelId: novel.id } })}
                className="w-full text-left"
              >
                <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-bg-tertiary relative mb-2.5 glass-card-hover">
                  {novel.coverImageUrl ? (
                    <img src={novel.coverImageUrl} alt={novel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/30 to-coral/20 flex items-center justify-center p-3">
                      <span className="font-display text-center text-text-primary/60">{novel.title}</span>
                    </div>
                  )}
                  {/* Status Badge */}
                  <span className={`absolute top-2 right-2 text-xs px-2.5 py-1 rounded-full font-medium ${
                    upcomingNovelIds.includes(novel.id)
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : novel.status === 'published'
                        ? 'bg-success/20 text-success'
                        : novel.status === 'draft'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-text-secondary/20 text-text-secondary'
                  }`}>
                    {upcomingNovelIds.includes(novel.id) ? 'Upcoming' : (novel.status.charAt(0).toUpperCase() + novel.status.slice(1))}
                  </span>
                </div>
                <p className="font-medium text-sm text-text-primary line-clamp-2 mb-1">{novel.title}</p>
                <p className="text-text-secondary text-xs">
                  {novel.volumes.length} vol · {novel.volumes.reduce((s, v) => s + v.chapters.length, 0)} ch · {novel.totalWords.toLocaleString()} words
                </p>
                {novel.status === 'published' && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><Eye size={12} /> {novel.totalReads}</span>
                    <span className="flex items-center gap-1"><Star size={12} className="text-gold" /> {novel.ratingAvg}</span>
                  </div>
                )}
              </button>
              {/* Context Menu Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setContextMenu(contextMenu === novel.id ? null : novel.id); }}
                className={`absolute top-2 left-2 z-20 w-8 h-8 rounded-lg bg-black/40 backdrop-blur flex items-center justify-center text-white transition-all cursor-pointer ${contextMenu === novel.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <MoreVertical size={16} />
              </button>
              {/* Context Dropdown */}
              {contextMenu === novel.id && (
                <div ref={contextMenuRef} className="absolute top-12 left-2 z-50 glass-card p-1.5 min-w-[160px] animate-scale-in shadow-xl shadow-black/50" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleContextAction(novel, 'edit')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => handleContextAction(novel, 'unpublish')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
                    <Share size={14} /> {novel.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleContextAction(novel, 'archive')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors">
                    <Archive size={14} /> Archive
                  </button>
                  <hr className="border-divider my-1" />
                  <button onClick={() => handleContextAction(novel, 'delete')} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(novel => (
            <button
              key={novel.id}
              onClick={() => navigate(`/novel/${novel.id}`)}
              onDoubleClick={() => navigate('/editor', { state: { novelId: novel.id } })}
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
                <p className="text-text-secondary text-sm">{novel.volumes.length} vol · {novel.volumes.reduce((s, v) => s + v.chapters.length, 0)} ch · {novel.totalWords.toLocaleString()} words</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    upcomingNovelIds.includes(novel.id)
                      ? 'bg-gold/20 text-gold border border-gold/40'
                      : novel.status === 'published'
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning'
                  }`}>
                    {upcomingNovelIds.includes(novel.id) ? 'upcoming' : novel.status}
                  </span>
                  {novel.status === 'published' && (
                    <>
                      <span className="text-xs text-text-secondary flex items-center gap-1"><Eye size={12} /> {novel.totalReads}</span>
                      <span className="text-xs text-text-secondary flex items-center gap-1"><Star size={12} className="text-gold" /> {novel.ratingAvg}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Novel Modal */}
      {showNewNovelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNewNovelModal(false)}>
          <div className="glass-card p-5 sm:p-8 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold mb-6">Create New Novel</h2>
            <input
              type="text"
              placeholder="Enter your novel title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNovel()}
              autoFocus
              className="w-full px-4 py-3 bg-bg-primary rounded-xl border border-divider focus:border-accent focus:outline-none text-text-primary placeholder:text-text-secondary/50 text-lg mb-6"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewNovelModal(false)} className="px-5 py-2.5 text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
              <button onClick={handleCreateNovel} className="px-6 py-2.5 btn btn-primary rounded-xl font-semibold">
                Create Novel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
