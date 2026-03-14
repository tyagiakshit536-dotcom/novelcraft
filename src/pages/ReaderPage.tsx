import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Settings, X, Minus, Plus,
  PanelLeft, BookOpen, FileText, Music, Languages, Sparkles, BarChart3,
} from 'lucide-react';
import { useStore } from '../store';
import { useBackgroundMusic } from '../lib/useBackgroundMusic';
import AIAssistant from '../components/AIAssistant';
import DrawingToolbar from '../components/DrawingToolbar';
import TranslatePanel from '../components/TranslatePanel';

const bgOptions = [
  { key: 'dark', label: 'Dark', class: 'reader-bg-dark', color: '#1A0E0E' },
  { key: 'light', label: 'Light', class: 'reader-bg-light', color: '#FAFAF8' },
  { key: 'sepia', label: 'Sepia', class: 'reader-bg-sepia', color: '#F4ECD8' },
  { key: 'green', label: 'Green', class: 'reader-bg-green', color: '#2A1616' },
  { key: 'navy', label: 'Navy', class: 'reader-bg-navy', color: '#301616' },
];

/* ─── Volume Tree (collapsible sidebar) ─── */
function VolumeNode({ volume, activeChapterId, onSelectChapter }: {
  volume: { id: string; title: string; chapters: { id: string; title: string; wordCount: number }[] };
  activeChapterId: string | undefined;
  onSelectChapter: (chId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="mb-1">
      <button
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-accent/80 hover:text-accent rounded-lg hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="truncate font-medium">{volume.title}</span>
      </button>
      {expanded && (
        <div className="ml-3 border-l border-white/10 pl-1">
          {volume.chapters.map(chapter => (
            <button
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                activeChapterId === chapter.id
                  ? 'bg-accent/15 text-accent'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText size={13} />
              <span className="truncate">{chapter.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReaderPage() {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [showAI, setShowAI] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [progress, setProgress] = useState(0);
  const music = useBackgroundMusic();

  const novel = [...store.novels, ...store.userNovels].find(n => n.id === novelId);
  const allChapters = novel ? novel.volumes.flatMap(v => v.chapters) : [];
  const currentChapter = allChapters.find(c => c.id === chapterId);
  const currentIndex = allChapters.findIndex(c => c.id === chapterId);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  const readTime = currentChapter ? Math.max(1, Math.ceil(currentChapter.wordCount / 250)) : 0;
  const bgOption = bgOptions.find(b => b.key === store.readerBackground) || bgOptions[0];

  useEffect(() => {
    if (novelId && chapterId) {
      store.updateReadingProgress(novelId, chapterId, 0);
    }
  }, [novelId, chapterId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const scrolled = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setProgress(Math.min(1, Math.max(0, scrolled)));
    };
    const el = contentRef.current;
    el?.addEventListener('scroll', handleScroll);
    return () => el?.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && nextChapter) navigate(`/read/${novelId}/${nextChapter.id}`);
      else if (e.key === 'ArrowLeft' && prevChapter) navigate(`/read/${novelId}/${prevChapter.id}`);
      else if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextChapter, prevChapter, navigate, novelId]);

  if (!novel || !currentChapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary">Chapter not found</p>
      </div>
    );
  }

  const handleSelectChapter = (chId: string) => {
    navigate(`/read/${novelId}/${chId}`);
  };

  return (
    <div className={`h-screen flex flex-col bg-bg-primary overflow-hidden`}>
      {/* ─── Progress Bar ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-black/20">
        <div className="h-full bg-accent transition-all duration-100" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* ─── Top Toolbar (Editor-style) ─── */}
      <div className="h-12 bg-bg-secondary/50 border-b border-divider flex items-center px-2 gap-1 shrink-0 overflow-x-auto">
        <button onClick={() => navigate(`/novel/${novelId}`)} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-px h-6 bg-divider mx-1" />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${sidebarOpen ? 'bg-accent/15 text-accent' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}>
          <PanelLeft size={18} />
        </button>
        <div className="w-px h-6 bg-divider mx-1" />

        {/* Drawing Tools */}
        <DrawingToolbar />
        <div className="w-px h-6 bg-divider mx-1" />

        {/* Reader Stats */}
        <div className="flex items-center gap-1 px-2 text-xs text-text-secondary">
          <BarChart3 size={14} />
          <span>{currentChapter.wordCount.toLocaleString()} words</span>
          <span className="text-text-secondary/50">·</span>
          <span>~{readTime} min</span>
        </div>

        <div className="flex-1" />

        {/* Translation Button */}
        <button
          onClick={() => setShowTranslate(true)}
          className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Translate"
        >
          <Languages size={18} />
        </button>

        {/* Music Button */}
        <button
          onClick={music.toggle}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${music.isPlaying ? 'text-spotify music-active' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
          title={music.isPlaying ? 'Stop Music' : 'Play Music'}
        >
          <Music size={18} />
        </button>

        {/* AI Button */}
        <button
          onClick={() => setShowAI(true)}
          className="ai-btn-shiny w-9 h-9 rounded-lg flex items-center justify-center"
          title="AI Assistant"
        >
          <Sparkles size={18} className="text-white" />
        </button>

        {/* Settings */}
        <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* ─── Main Layout ─── */}
      <div className="flex-1 flex overflow-hidden relative">
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/45 z-10"
            aria-label="Close contents"
          />
        )}

        {/* Left Sidebar — Collapsible Volume/Chapter tree */}
        {sidebarOpen && (
          <div className="absolute lg:relative inset-y-0 left-0 z-20 w-[82vw] max-w-60 bg-bg-secondary/95 lg:bg-bg-secondary/30 border-r border-divider flex flex-col shrink-0 overflow-y-auto reader-sidebar">
            <div className="p-3 border-b border-divider">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Contents</h3>
            </div>
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-accent">
                <BookOpen size={16} />
                <span className="truncate">{novel.title}</span>
              </div>
            </div>
            <div className="flex-1 px-2 pb-4">
              {novel.volumes.map(volume => (
                <VolumeNode
                  key={volume.id}
                  volume={volume}
                  activeChapterId={chapterId}
                  onSelectChapter={handleSelectChapter}
                />
              ))}
            </div>
          </div>
        )}

        {/* Center — Reading Canvas */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-y-auto ${bgOption.class} transition-colors duration-300`}
        >
          <div className="max-w-[720px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12" style={{ fontFamily: store.readerFont + ', serif', fontSize: store.readerFontSize + 'px' }}>
            {/* Chapter Banner */}
            {currentChapter.bannerImageUrl && (
              <img src={currentChapter.bannerImageUrl} alt="" className="w-full rounded-2xl mb-8" />
            )}

            {/* Chapter Header */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] opacity-40 mb-3">{novel.volumes.find(v => v.chapters.some(c => c.id === chapterId))?.title}</p>
              <h1 className="font-display text-2xl font-bold mb-3 text-accent border-b border-divider/50 pb-4">
                {currentChapter.title}
              </h1>
              <p className="text-sm opacity-50 mt-3">~{readTime} min read · {currentChapter.wordCount.toLocaleString()} words</p>
            </div>

            {/* Chapter Content (non-editable) */}
            <div
              className="leading-[1.9] reader-content prose prose-invert max-w-none"
              style={{ lineHeight: '1.9' }}
              dangerouslySetInnerHTML={{ __html: currentChapter.content || '<p style="opacity:0.5;text-align:center;">This chapter is empty.</p>' }}
            />

            {/* End of Chapter */}
            <div className="mt-16 mb-8 text-center opacity-30">
              <span className="text-lg tracking-[1em]">◆ ◆ ◆</span>
            </div>

            {/* Chapter Navigation */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8 mb-16">
              {prevChapter ? (
                <button
                  onClick={() => navigate(`/read/${novelId}/${prevChapter.id}`)}
                  className="flex-1 p-4 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors text-left"
                >
                  <p className="text-xs opacity-40 mb-1 flex items-center gap-1"><ChevronLeft size={12} /> Previous</p>
                  <p className="text-sm font-medium truncate">{prevChapter.title}</p>
                </button>
              ) : <div className="flex-1" />}

              {nextChapter ? (
                <button
                  onClick={() => navigate(`/read/${novelId}/${nextChapter.id}`)}
                  className="flex-1 p-4 rounded-2xl border border-white/10 hover:border-accent/30 transition-colors text-right"
                >
                  <p className="text-xs opacity-40 mb-1 flex items-center justify-end gap-1">Next <ChevronRight size={12} /></p>
                  <p className="text-sm font-medium truncate">{nextChapter.title}</p>
                </button>
              ) : <div className="flex-1" />}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Status Bar ─── */}
      <div className="hidden sm:flex h-7 bg-bg-secondary/50 border-t border-divider items-center px-4 text-xs text-text-secondary gap-4 shrink-0">
        <span>{novel.title}</span>
        <span className="text-text-secondary/40">|</span>
        <span>{currentChapter.title}</span>
        <div className="flex-1" />
        <span>Ch. {currentIndex + 1} of {allChapters.length}</span>
        <span>{currentChapter.wordCount.toLocaleString()} words</span>
        <span>~{readTime} min read</span>
      </div>

      {/* ─── AI Assistant ─── */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* ─── Translate Panel ─── */}
      <TranslatePanel isOpen={showTranslate} onClose={() => setShowTranslate(false)} content={currentChapter?.content || ''} />

      {/* ─── Settings Panel ─── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-lg glass-card rounded-t-3xl p-6 pb-10 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Reader Settings</h3>
              <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary">
                <X size={18} />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="text-sm text-text-secondary mb-3 block">Font Size</label>
              <div className="flex items-center gap-4">
                <button onClick={() => store.setReaderFontSize(Math.max(14, store.readerFontSize - 1))} className="w-10 h-10 rounded-xl bg-bg-primary border border-divider flex items-center justify-center">
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-semibold">{store.readerFontSize}px</span>
                </div>
                <button onClick={() => store.setReaderFontSize(Math.min(26, store.readerFontSize + 1))} className="w-10 h-10 rounded-xl bg-bg-primary border border-divider flex items-center justify-center">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="text-sm text-text-secondary mb-3 block">Font</label>
              <div className="flex gap-2">
                {['Lora', 'Merriweather', 'Inter', 'Georgia'].map(f => (
                  <button
                    key={f}
                    onClick={() => store.setReaderFont(f)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      store.readerFont === f ? 'bg-accent text-white' : 'bg-bg-primary border border-divider text-text-secondary hover:border-accent'
                    }`}
                    style={{ fontFamily: f }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="text-sm text-text-secondary mb-3 block">Background</label>
              <div className="flex gap-3">
                {bgOptions.map(bg => (
                  <button
                    key={bg.key}
                    onClick={() => store.setReaderBackground(bg.key)}
                    className={`w-12 h-12 rounded-xl border-2 transition-all ${
                      store.readerBackground === bg.key ? 'border-accent scale-110' : 'border-transparent hover:border-divider'
                    }`}
                    style={{ backgroundColor: bg.color }}
                    title={bg.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
