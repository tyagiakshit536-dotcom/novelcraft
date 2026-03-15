import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { ResizableImage } from '../lib/resizableImage';
import {
  PanelLeft, ImagePlus, FilePlus, FolderPlus,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Quote, Minus,
  ListOrdered, List as ListIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Search, BarChart3, Maximize2, Eye,
  Save, Rocket, ChevronRight, ChevronDown,
  FileText, Plus, Trash2,
  PanelRight, BookOpen, Globe, Users, ArrowLeft, Check,
  Music, Languages, Sparkles,
} from 'lucide-react';
import { useStore } from '../store';
import type { Novel, Volume } from '../types';
import { GENRES, NOVEL_NICHES } from '../types';
import { useBackgroundMusic } from '../lib/useBackgroundMusic';
import { readImageFileAsDataUrl } from '../lib/imageFiles';
import AIAssistant from '../components/AIAssistant';
import DrawingToolbar from '../components/DrawingToolbar';
import TranslatePanel from '../components/TranslatePanel';
import ImageCreator from '../components/ImageCreator';

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useStore();
  const locationNovelId = (location.state as { novelId?: string })?.novelId;

  const [focusMode, setFocusMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ id: string; type: 'volume' | 'chapter'; x: number; y: number } | null>(null);
  const [rightTab, setRightTab] = useState<'characters' | 'world' | 'notes' | 'images'>('characters');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [coverUploadError, setCoverUploadError] = useState('');
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const music = useBackgroundMusic();

  // Resolve which novel to edit. If a temporary route ID was replaced in store,
  // fall back to the store's active novel ID.
  const locationNovelExists = !!locationNovelId && store.userNovels.some(n => n.id === locationNovelId);
  const activeNovelId = locationNovelExists ? locationNovelId : store.activeNovelId;
  const novel = store.userNovels.find(n => n.id === activeNovelId);

  // If no novel and navigated here, create one
  useEffect(() => {
    if (!novel && !activeNovelId) {
      // Will be handled by the "no novel" state below
    }
  }, [novel, activeNovelId]);

  // Find active chapter
  const activeChapter = novel
    ? novel.volumes.flatMap(v => v.chapters).find(c => c.id === store.activeChapterId)
    : null;

  // Set initial active chapter
  useEffect(() => {
    if (novel && !activeChapter) {
      const firstChapter = novel.volumes[0]?.chapters[0];
      if (firstChapter) {
        store.setActiveChapter(novel.id, firstChapter.id);
      }
    }
  }, [novel?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Begin writing your story...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ResizableImage.configure({ inline: false }),
      Highlight.configure({ multicolor: true }),
      CharacterCount,
      TextStyle,
      Color,
      FontFamily,
    ],
    content: activeChapter?.content || '',
    editorProps: {
      attributes: { class: 'tiptap' },
    },
    onUpdate: ({ editor: ed }) => {
      if (!novel || !activeChapter) return;
      const html = ed.getHTML();
      const words = ed.storage.characterCount?.words() || 0;
      const volume = novel.volumes.find(v => v.id === activeChapter.volumeId);
      if (volume) {
        store.updateChapter(novel.id, volume.id, activeChapter.id, { content: html, wordCount: words });
      }
    },
  });

  // Load chapter content when switching
  useEffect(() => {
    if (editor && activeChapter) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeChapter.content) {
        editor.commands.setContent(activeChapter.content || '');
      }
    }
  }, [activeChapter?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save indicator
  const showSaved = useCallback(() => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      showSaved();
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [showSaved]);

  // Ctrl+S manual save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        showSaved();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSaved]);

  // No novel state
  if (!novel) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center">
          <BookOpen size={32} className="text-text-secondary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Novel Selected</h2>
          <p className="text-text-secondary mb-6">Create a new novel or select one from your library</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-4 sm:px-0">
          <button onClick={() => navigate('/library')} className="px-5 py-2.5 border border-divider text-text-primary rounded-xl hover:bg-bg-secondary transition-colors">
            Go to Library
          </button>
          <button
            onClick={() => {
              const n = store.createNovel('Untitled Novel', '', []);
              navigate('/editor', { state: { novelId: n.id }, replace: true });
            }}
            className="px-5 py-2.5 btn btn-primary rounded-xl font-semibold"
          >
            Create New Novel
          </button>
        </div>
      </div>
    );
  }

  const wordCount = editor?.storage.characterCount?.words() || 0;
  const charCount = editor?.storage.characterCount?.characters() || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 250));
  const editorFonts = [
    'Aptos',
    'Calibri',
    'Calibri Light',
    'Cambria',
    'Candara',
    'Constantia',
    'Corbel',
    'Segoe UI',
    'Bahnschrift',
    'JetBrains Mono',
    'Inter',
    'Arial',
    'Arial Narrow',
    'Arial Black',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Helvetica',
    'Gill Sans MT',
    'Century Gothic',
    'Franklin Gothic Medium',
    'Lucida Sans Unicode',
    'Noto Sans',
    'Source Sans 3',
    'Open Sans',
    'Roboto',
    'Times New Roman',
    'Georgia',
    'Palatino Linotype',
    'Book Antiqua',
    'Bookman Old Style',
    'Garamond',
    'Baskerville',
    'Didot',
    'Bodoni MT',
    'Perpetua',
    'Rockwell',
    'Cambria Math',
    'Lora',
    'Merriweather',
    'Playfair Display',
    'Source Serif 4',
    'Crimson Text',
    'Noto Serif',
    'Courier New',
    'Consolas',
    'Lucida Console',
    'Cascadia Mono',
    'Fira Code',
    'Monaco',
    'Impact',
    'Sitka Text',
    'Sitka Heading',
  ] as const;
  const activeFontFamily = (editor?.getAttributes('textStyle').fontFamily as string | undefined) || '__default__';
  const imageAttrs = editor?.getAttributes('image') as { align?: 'left' | 'center' | 'right'; xOffset?: number } | undefined;
  const setImageOrTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    if (editor.isActive('image')) {
      const imageAlign = align === 'justify' ? 'center' : align;
      editor.chain().focus().updateAttributes('image', { align: imageAlign, xOffset: 0 }).run();
      return;
    }
    editor.chain().focus().setTextAlign(align).run();
  };

  // Toolbar commands
  const toolbarGroups = [
    {
      label: 'Format',
      items: [
        { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
        { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
        { icon: UnderlineIcon, action: () => editor?.chain().focus().toggleUnderline().run(), active: editor?.isActive('underline') },
        { icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive('strike') },
      ],
    },
    {
      label: 'Headings',
      items: [
        { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive('heading', { level: 1 }) },
        { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
        { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
      ],
    },
    {
      label: 'Blocks',
      items: [
        { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive('blockquote') },
        { icon: Minus, action: () => editor?.chain().focus().setHorizontalRule().run(), active: false },
        { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive('orderedList') },
        { icon: ListIcon, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive('bulletList') },
      ],
    },
    {
      label: 'Align',
      items: [
        {
          icon: AlignLeft,
          action: () => setImageOrTextAlign('left'),
          active: editor?.isActive('image') ? imageAttrs?.align === 'left' && Number(imageAttrs?.xOffset || 0) === 0 : editor?.isActive({ textAlign: 'left' }),
        },
        {
          icon: AlignCenter,
          action: () => setImageOrTextAlign('center'),
          active: editor?.isActive('image') ? imageAttrs?.align === 'center' && Number(imageAttrs?.xOffset || 0) === 0 : editor?.isActive({ textAlign: 'center' }),
        },
        {
          icon: AlignRight,
          action: () => setImageOrTextAlign('right'),
          active: editor?.isActive('image') ? imageAttrs?.align === 'right' && Number(imageAttrs?.xOffset || 0) === 0 : editor?.isActive({ textAlign: 'right' }),
        },
        {
          icon: AlignJustify,
          action: () => setImageOrTextAlign('justify'),
          active: editor?.isActive('image') ? imageAttrs?.align === 'center' && Number(imageAttrs?.xOffset || 0) === 0 : editor?.isActive({ textAlign: 'justify' }),
        },
      ],
    },
  ];

  const handleAddImage = () => {
    setImageUrl('');
    setImageUploadError('');
    setShowImageModal(true);
  };

  const handlePickImageFile = async (file: File | null) => {
    if (!file) return;
    setImageUploadError('');
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setImageUrl(dataUrl);
    } catch (err: unknown) {
      setImageUploadError(err instanceof Error ? err.message : 'Could not load image file.');
    }
  };

  const handleInsertImage = () => {
    if (imageUrl.trim()) {
      editor?.chain().focus().setImage({ src: imageUrl.trim(), width: 360 }).updateAttributes('image', { align: 'left', xOffset: 0 }).run();
    }
    setShowImageModal(false);
    setImageUrl('');
    setImageUploadError('');
  };

  const handlePickCoverFile = async (file: File | null) => {
    if (!file) return;
    setCoverUploadError('');
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setCoverUrl(dataUrl);
    } catch (err: unknown) {
      setCoverUploadError(err instanceof Error ? err.message : 'Could not load image file.');
    }
  };

  const handleSetCover = () => {
    if (coverUrl.trim()) {
      store.updateNovel(novel.id, { coverImageUrl: coverUrl.trim() });
    }
    setShowCoverModal(false);
    setCoverUrl('');
    setCoverUploadError('');
  };

  const handleFinishEditing = (id: string, type: 'volume' | 'chapter') => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      return;
    }
    if (type === 'chapter') {
      const volume = novel.volumes.find(v => v.chapters.some(c => c.id === id));
      if (volume) store.updateChapter(novel.id, volume.id, id, { title: editingTitle.trim() });
    } else {
      store.updateVolume(novel.id, id, { title: editingTitle.trim() });
    }
    setEditingId(null);
  };

  const handleAddChapter = (volumeId: string) => {
    const chapterNum = novel.volumes.find(v => v.id === volumeId)?.chapters.length || 0;
    const ch = store.addChapter(novel.id, volumeId, `Chapter ${chapterNum + 1}: Untitled`);
    store.setActiveChapter(novel.id, ch.id);
  };

  const handleAddVolume = () => {
    const volNum = novel.volumes.length + 1;
    store.addVolume(novel.id, `Volume ${toRoman(volNum)}`);
  };

  const handleContextMenuAction = (action: string) => {
    if (!contextMenu) return;
    const { id, type } = contextMenu;
    setContextMenu(null);

    if (type === 'chapter') {
      const volume = novel.volumes.find(v => v.chapters.some(c => c.id === id));
      if (!volume) return;
      if (action === 'delete') {
        store.deleteChapter(novel.id, volume.id, id);
      } else if (action === 'rename') {
        const ch = volume.chapters.find(c => c.id === id);
        setEditingId(id);
        setEditingTitle(ch?.title || '');
      }
    } else if (type === 'volume') {
      if (action === 'delete') {
        store.deleteVolume(novel.id, id);
      } else if (action === 'rename') {
        const vol = novel.volumes.find(v => v.id === id);
        setEditingId(id);
        setEditingTitle(vol?.title || '');
      } else if (action === 'add-chapter') {
        handleAddChapter(id);
      }
    }
  };

  return (
    <div className={`h-screen flex flex-col bg-bg-primary overflow-hidden ${focusMode ? 'focus-mode' : ''}`}>
      {/* Top Toolbar */}
      {!focusMode && (
        <div className="h-12 bg-bg-secondary/50 border-b border-divider flex items-center px-2 gap-1 shrink-0 overflow-x-auto">
          {/* Back */}
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft size={18} />
          </button>

          <div className="w-px h-6 bg-divider mx-1" />

          {/* Toggle Panels */}
          <button onClick={() => store.setEditorSidebarOpen(!store.editorSidebarOpen)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${store.editorSidebarOpen ? 'bg-accent/15 text-accent' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}>
            <PanelLeft size={18} />
          </button>
          <button onClick={handleAddImage} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Add Image">
            <ImagePlus size={18} />
          </button>
          <button onClick={() => { const vol = novel.volumes[novel.volumes.length - 1]; if (vol) handleAddChapter(vol.id); }} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="New Chapter">
            <FilePlus size={18} />
          </button>
          <button onClick={handleAddVolume} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="New Volume">
            <FolderPlus size={18} />
          </button>

          <div className="w-px h-6 bg-divider mx-1" />

          {/* Format Groups */}
          {toolbarGroups.map((group) => (
            <div key={group.label} className="flex items-center">
              {group.items.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${item.active ? 'bg-accent/15 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'}`}
                >
                  <item.icon size={16} />
                </button>
              ))}
              <div className="w-px h-6 bg-divider mx-1" />
            </div>
          ))}

          <select
            value={activeFontFamily}
            onChange={e => {
              const nextFont = e.target.value;
              if (nextFont === '__default__') {
                editor?.chain().focus().unsetFontFamily().run();
                return;
              }
              editor?.chain().focus().setFontFamily(nextFont).run();
              store.setEditorFont(nextFont);
            }}
            className="h-8 min-w-[150px] bg-bg-primary border border-divider rounded-md px-2 text-xs text-text-primary focus:outline-none focus:border-accent"
            title="Editor Font"
          >
            <option value="__default__">Default</option>
            {editorFonts.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          <div className="w-px h-6 bg-divider mx-1" />

          {/* View & Tools */}
          <button className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Find">
            <Search size={18} />
          </button>

          {/* Drawing Tools */}
          <div className="w-px h-6 bg-divider mx-1" />
          <DrawingToolbar onColorSelect={(color, tool) => {
            if (!editor) return;
            if (tool === 'highlighter') {
              editor.chain().focus().toggleHighlight({ color }).run();
            } else {
              // pencil and sketch both set text color
              editor.chain().focus().setColor(color).run();
            }
          }} />
          <div className="w-px h-6 bg-divider mx-1" />

          <div className="flex items-center gap-1 px-2 text-xs text-text-secondary">
            <BarChart3 size={14} />
            <span>{wordCount.toLocaleString()} words</span>
            <span className="text-text-secondary/50">·</span>
            <span>~{readTime} min</span>
          </div>

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

          {/* AI Assistant Button */}
          <button
            onClick={() => setShowAI(true)}
            className="ai-btn-shiny w-9 h-9 rounded-lg flex items-center justify-center"
            title="AI Assistant"
          >
            <Sparkles size={18} className="text-white" />
          </button>

          <button onClick={() => setFocusMode(true)} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Focus Mode">
            <Maximize2 size={18} />
          </button>
          <button onClick={() => setPreviewMode(!previewMode)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${previewMode ? 'bg-accent/15 text-accent' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}`} title="Preview">
            <Eye size={18} />
          </button>
          <button onClick={() => store.setEditorRightPanelOpen(!store.editorRightPanelOpen)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${store.editorRightPanelOpen ? 'bg-accent/15 text-accent' : 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary'}`}>
            <PanelRight size={18} />
          </button>

          <div className="flex-1" />

          {/* Save + Publish */}
          <div className="flex items-center gap-2">
            {savedIndicator && (
              <span className="text-success text-xs flex items-center gap-1 animate-fade-in"><Check size={14} /> Saved</span>
            )}
            <button onClick={() => showSaved()} className="w-9 h-9 rounded-lg hover:bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors" title="Save">
              <Save size={18} />
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              className="px-4 py-1.5 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-all inline-flex items-center gap-1.5"
            >
              <Rocket size={14} /> Publish
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {!focusMode && (store.editorSidebarOpen || store.editorRightPanelOpen) && (
          <button
            onClick={() => { store.setEditorSidebarOpen(false); store.setEditorRightPanelOpen(false); }}
            className="md:hidden fixed inset-0 bg-black/45 z-10"
            aria-label="Close panels"
          />
        )}

        {/* Left Panel — File Tree */}
        {store.editorSidebarOpen && !focusMode && (
          <div className="absolute md:relative inset-y-0 left-0 z-20 w-[82vw] max-w-60 bg-bg-secondary/95 md:bg-bg-secondary/30 border-r border-divider flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 border-b border-divider">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Novel Structure</h3>
            </div>

            {/* Novel Title */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-accent">
                <BookOpen size={16} />
                <span className="truncate">{novel.title}</span>
              </div>
            </div>

            {/* Volumes & Chapters */}
            <div className="flex-1 px-2 pb-4">
              {novel.volumes.map(volume => (
                <VolumeTreeNode
                  key={volume.id}
                  volume={volume}
                  activeChapterId={store.activeChapterId}
                  onSelectChapter={(chId) => store.setActiveChapter(novel.id, chId)}
                  onAddChapter={() => handleAddChapter(volume.id)}
                  onContextMenu={(id, type, x, y) => setContextMenu({ id, type, x, y })}
                  editingId={editingId}
                  editingTitle={editingTitle}
                  setEditingTitle={setEditingTitle}
                  onFinishEditing={handleFinishEditing}
                  onCancelEditing={() => setEditingId(null)}
                />
              ))}

              <button
                onClick={handleAddVolume}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 text-text-secondary hover:text-accent text-sm rounded-lg hover:bg-bg-tertiary/50 transition-colors"
              >
                <Plus size={14} /> Add Volume
              </button>
            </div>

            {/* Cover Image */}
            <div className="px-3 pb-3 border-t border-divider pt-3">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Cover Image</h4>
              {novel.coverImageUrl ? (
                <div className="relative group">
                  <img src={novel.coverImageUrl} alt="Cover" className="w-full h-32 object-cover rounded-xl" />
                  <button
                    onClick={() => { setCoverUrl(novel.coverImageUrl); setCoverUploadError(''); setShowCoverModal(true); }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white text-xs font-medium"
                  >
                    Change Cover
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setCoverUrl(''); setCoverUploadError(''); setShowCoverModal(true); }}
                  className="w-full h-24 border-2 border-dashed border-divider rounded-xl flex flex-col items-center justify-center gap-1 text-text-secondary hover:border-accent hover:text-accent transition-colors"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs">Set Cover</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Center — Writing Canvas */}
        <div className="flex-1 overflow-y-auto relative" onClick={() => { setContextMenu(null); if (focusMode) setFocusMode(false); }}>
          <div className={`w-full px-4 sm:px-6 md:px-8 py-8 md:py-12 min-h-full ${previewMode ? 'font-reader' : ''}`} style={{ fontSize: `${store.editorFontSize}px` }}>
            {activeChapter && (
              <h1 className="font-display text-2xl font-bold text-accent mb-8 border-b border-divider/50 pb-4">
                {activeChapter.title}
              </h1>
            )}
            <EditorContent editor={editor} className="w-full" />
          </div>
        </div>

        {/* Right Panel — Character Bible / World Notes */}
        {store.editorRightPanelOpen && !focusMode && (
          <div className="absolute md:relative inset-y-0 right-0 z-20 w-[84vw] max-w-64 bg-bg-secondary/95 md:bg-bg-secondary/30 border-l border-divider flex flex-col shrink-0">
            <div className="flex border-b border-divider">
              {(['characters', 'world', 'notes', 'images'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRightTab(tab)}
                  className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
                    rightTab === tab ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-text-primary'
                  } ${tab === 'images' ? 'image-creator-tab' : ''}`}
                >
                  {tab === 'characters' ? <Users size={14} className="mx-auto" /> : tab === 'world' ? <Globe size={14} className="mx-auto" /> : tab === 'images' ? <ImagePlus size={14} className="mx-auto" /> : <FileText size={14} className="mx-auto" />}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {rightTab === 'characters' && (
                <CharacterPanel novelId={novel.id} />
              )}
              {rightTab === 'world' && (
                <WorldPanel novelId={novel.id} />
              )}
              {rightTab === 'notes' && (
                <div className="text-text-secondary text-sm text-center py-8">
                  <p className="mb-4">Write private notes that only you can see.</p>
                  <p className="text-xs text-text-secondary/60">Coming in the next update!</p>
                </div>
              )}
              {rightTab === 'images' && (
                <ImageCreator
                  novelId={novel.id}
                  onInsertImage={(url) => {
                    editor?.chain().focus().setImage({ src: url }).run();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!focusMode && (
        <div className="hidden sm:flex h-7 bg-bg-secondary/50 border-t border-divider items-center px-4 text-xs text-text-secondary gap-4 shrink-0">
          <span>{novel.title}</span>
          <span className="text-text-secondary/40">|</span>
          <span>{activeChapter?.title || 'No chapter'}</span>
          <div className="flex-1" />
          <span>{wordCount.toLocaleString()} words</span>
          <span>{charCount.toLocaleString()} chars</span>
          <span>~{readTime} min read</span>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 glass-card p-1.5 min-w-[140px] animate-scale-in"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button onClick={() => handleContextMenuAction('rename')} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary rounded-lg transition-colors">Rename</button>
          {contextMenu.type === 'volume' && (
            <button onClick={() => handleContextMenuAction('add-chapter')} className="w-full text-left px-3 py-2 text-sm hover:bg-bg-tertiary rounded-lg transition-colors">Add Chapter</button>
          )}
          <button onClick={() => handleContextMenuAction('delete')} className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors">Delete</button>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal novel={novel} onClose={() => setShowPublishModal(false)} />
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowImageModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold mb-4">Insert Image</h3>
            <input
              ref={imageFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                handlePickImageFile(e.target.files?.[0] || null);
                e.currentTarget.value = '';
              }}
            />
            <button
              onClick={() => imageFileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-bg-primary rounded-xl border border-divider hover:border-accent transition-colors text-left text-text-secondary mb-4"
            >
              Choose image from device
            </button>
            {imageUploadError && <p className="text-sm text-error mb-3">{imageUploadError}</p>}
            {imageUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-bg-primary border border-divider">
                <img src={imageUrl} alt="Preview" className="w-full max-h-48 object-contain" />
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowImageModal(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm">Cancel</button>
              <button onClick={handleInsertImage} className="px-5 py-2 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition-all">Insert</button>
            </div>
          </div>
        </div>
      )}

      {/* Cover Image Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowCoverModal(false)}>
          <div className="glass-card p-6 w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold mb-4">Set Cover Image</h3>
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                handlePickCoverFile(e.target.files?.[0] || null);
                e.currentTarget.value = '';
              }}
            />
            <button
              onClick={() => coverFileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-bg-primary rounded-xl border border-divider hover:border-accent transition-colors text-left text-text-secondary mb-4"
            >
              Choose cover image from device
            </button>
            {coverUploadError && <p className="text-sm text-error mb-3">{coverUploadError}</p>}
            {coverUrl && (
              <div className="mb-4 rounded-xl overflow-hidden bg-bg-primary border border-divider flex justify-center">
                <img src={coverUrl} alt="Cover Preview" className="max-h-56 object-contain" />
              </div>
            )}
            <div className="flex justify-end gap-3">
              {novel.coverImageUrl && (
                <button
                  onClick={() => { store.updateNovel(novel.id, { coverImageUrl: '' }); setShowCoverModal(false); }}
                  className="px-4 py-2 text-error hover:bg-error/10 rounded-xl transition-colors text-sm mr-auto"
                >
                  Remove Cover
                </button>
              )}
              <button onClick={() => setShowCoverModal(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors text-sm">Cancel</button>
              <button onClick={handleSetCover} className="px-5 py-2 bg-accent text-white rounded-xl font-semibold text-sm hover:bg-accent-hover transition-all">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Translate Panel */}
      <TranslatePanel isOpen={showTranslate} onClose={() => setShowTranslate(false)} content={editor?.getHTML() || ''} />
    </div>
  );
}

// ─── Volume Tree Node ───
function VolumeTreeNode({ volume, activeChapterId, onSelectChapter, onAddChapter, onContextMenu, editingId, editingTitle, setEditingTitle, onFinishEditing, onCancelEditing }: {
  volume: Volume;
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onAddChapter: () => void;
  onContextMenu: (id: string, type: 'volume' | 'chapter', x: number, y: number) => void;
  editingId: string | null;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onFinishEditing: (id: string, type: 'volume' | 'chapter') => void;
  onCancelEditing: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-1">
      {editingId === volume.id ? (
        <div className="flex items-center gap-1.5 px-2 py-1">
          <input
            type="text"
            value={editingTitle}
            onChange={e => setEditingTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') onFinishEditing(volume.id, 'volume');
              if (e.key === 'Escape') onCancelEditing();
            }}
            onBlur={() => onFinishEditing(volume.id, 'volume')}
            className="flex-1 px-2 py-1 text-sm bg-bg-primary rounded-lg border border-accent focus:outline-none text-accent font-medium"
            autoFocus
          />
        </div>
      ) : (
        <button
          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-accent/80 hover:text-accent rounded-lg hover:bg-bg-tertiary/30 transition-colors group"
          onClick={() => setExpanded(!expanded)}
          onContextMenu={(e) => { e.preventDefault(); onContextMenu(volume.id, 'volume', e.clientX, e.clientY); }}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="truncate font-medium">{volume.title}</span>
          <span className="text-text-secondary/50 text-xs ml-auto opacity-0 group-hover:opacity-100">{volume.chapters.length}</span>
        </button>
      )}

      {expanded && (
        <div className="ml-3 border-l border-divider/30 pl-1">
          {volume.chapters.map(chapter => (
            editingId === chapter.id ? (
              <div key={chapter.id} className="flex items-center gap-2 px-2 py-1">
                <FileText size={13} className="text-accent shrink-0" />
                <input
                  type="text"
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') onFinishEditing(chapter.id, 'chapter');
                    if (e.key === 'Escape') onCancelEditing();
                  }}
                  onBlur={() => onFinishEditing(chapter.id, 'chapter')}
                  className="flex-1 px-2 py-1 text-sm bg-bg-primary rounded-lg border border-accent focus:outline-none text-text-primary"
                  autoFocus
                />
              </div>
            ) : (
              <button
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                onContextMenu={(e) => { e.preventDefault(); onContextMenu(chapter.id, 'chapter', e.clientX, e.clientY); }}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                  activeChapterId === chapter.id
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/30'
                }`}
              >
                <FileText size={13} />
                <span className="truncate">{chapter.title}</span>
              </button>
            )
          ))}
          <button
            onClick={onAddChapter}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-text-secondary/60 hover:text-accent rounded-lg hover:bg-bg-tertiary/30 transition-colors"
          >
            <Plus size={12} /> Add Chapter
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Character Panel ───
function CharacterPanel({ novelId }: { novelId: string }) {
  const { characters, addCharacter, deleteCharacter } = useStore();
  const novelChars = characters.filter(c => c.novelId === novelId);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addCharacter({ novelId, name: name.trim(), role: role.trim(), physicalDescription: '', personality: '', arcSummary: '', imageUrl: '' });
    setName('');
    setRole('');
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-text-secondary uppercase">Characters</h4>
        <button onClick={() => setShowForm(true)} className="text-accent hover:text-accent-hover">
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <div className="mb-3 p-3 rounded-xl bg-bg-primary border border-divider animate-scale-in">
          <input
            type="text"
            placeholder="Character name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-divider focus:border-accent focus:outline-none mb-2"
          />
          <input
            type="text"
            placeholder="Role (protagonist, villain...)"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-divider focus:border-accent focus:outline-none mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-text-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}

      {novelChars.length === 0 && !showForm && (
        <p className="text-text-secondary/50 text-xs text-center py-4">No characters yet</p>
      )}

      {novelChars.map(char => (
        <div key={char.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bg-tertiary/30 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
            {char.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{char.name}</p>
            <p className="text-xs text-text-secondary truncate">{char.role}</p>
          </div>
          <button onClick={() => deleteCharacter(char.id)} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── World Panel ───
function WorldPanel({ novelId }: { novelId: string }) {
  const { worldEntries, addWorldEntry, deleteWorldEntry } = useStore();
  const entries = worldEntries.filter(e => e.novelId === novelId);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'location' | 'magic-system' | 'faction' | 'timeline' | 'other'>('location');

  const handleAdd = () => {
    if (!name.trim()) return;
    addWorldEntry({ novelId, name: name.trim(), category, description: '', imageUrl: '' });
    setName('');
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-text-secondary uppercase">World Bible</h4>
        <button onClick={() => setShowForm(true)} className="text-accent hover:text-accent-hover">
          <Plus size={16} />
        </button>
      </div>

      {showForm && (
        <div className="mb-3 p-3 rounded-xl bg-bg-primary border border-divider animate-scale-in">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 border border-divider focus:border-accent focus:outline-none mb-2"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value as typeof category)}
            className="w-full px-3 py-2 bg-bg-secondary rounded-lg text-sm text-text-primary border border-divider focus:border-accent focus:outline-none mb-2"
          >
            <option value="location">Location</option>
            <option value="magic-system">Magic System</option>
            <option value="faction">Faction</option>
            <option value="timeline">Timeline</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium">Add</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-text-secondary text-xs">Cancel</button>
          </div>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <p className="text-text-secondary/50 text-xs text-center py-4">No world entries yet</p>
      )}

      {entries.map(entry => (
        <div key={entry.id} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-bg-tertiary/30 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
            {entry.category === 'location' ? '🗺️' : entry.category === 'magic-system' ? '✨' : entry.category === 'faction' ? '⚔️' : '📅'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{entry.name}</p>
            <p className="text-xs text-text-secondary truncate capitalize">{entry.category.replace('-', ' ')}</p>
          </div>
          <button onClick={() => deleteWorldEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-error transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Publish Modal ───
function PublishModal({ novel, onClose }: { novel: Novel; onClose: () => void }) {
  const { publishNovel } = useStore();
  const [authorName, setAuthorName] = useState(novel.authorName || '');
  const [synopsis, setSynopsis] = useState(novel.synopsis);
  const [genres, setGenres] = useState<string[]>(novel.genreTags);
  const [niche, setNiche] = useState<string>(novel.genreTags.find(g => NOVEL_NICHES.includes(g as (typeof NOVEL_NICHES)[number])) || NOVEL_NICHES[0]);
  const [ageRating, setAgeRating] = useState<'all' | 'teen' | 'mature'>(novel.ageRating);
  const [publishMode, setPublishMode] = useState<'public' | 'unlisted' | 'upcoming'>(novel.isUnlisted ? 'unlisted' : 'public');
  const [step, setStep] = useState(1);

  const toggleGenre = (g: string) => {
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev);
  };

  const handlePublish = () => {
    const trimmedAuthorName = authorName.trim();
    if (!trimmedAuthorName) return;
    const mergedGenres = Array.from(new Set([niche, ...genres]));
    publishNovel(novel.id, trimmedAuthorName, synopsis, mergedGenres, ageRating, publishMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="glass-card p-8 max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-bold mb-6">
          {step === 1 ? 'Publish Your Novel' : step === 2 ? 'Visibility' : 'Preview'}
        </h2>

        {step === 1 && (
          <>
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-1 block">Title</label>
              <p className="text-lg font-semibold">{novel.title}</p>
            </div>
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-1 block">Author Name</label>
              <input
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                maxLength={80}
                className="w-full bg-bg-primary rounded-xl p-3 text-text-primary border border-divider focus:border-accent focus:outline-none"
                placeholder="Enter the author name"
                required
              />
              {!authorName.trim() && <span className="text-error text-xs">Author name is required to publish.</span>}
            </div>
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-1 block">Synopsis</label>
              <textarea
                value={synopsis}
                onChange={e => setSynopsis(e.target.value)}
                maxLength={500}
                className="w-full h-28 bg-bg-primary rounded-xl p-3 text-text-primary border border-divider focus:border-accent focus:outline-none resize-none"
                placeholder="Write a compelling synopsis..."
              />
              <span className="text-text-secondary text-xs">{synopsis.length}/500</span>
            </div>
            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block">Primary Niche</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {NOVEL_NICHES.map(n => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      niche === n ? 'bg-accent text-white' : 'bg-bg-primary text-text-secondary border border-divider hover:border-accent'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block">Genres (max 5)</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      genres.includes(g) ? 'bg-accent text-white' : 'bg-bg-primary text-text-secondary border border-divider hover:border-accent'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="text-sm text-text-secondary mb-2 block">Age Rating</label>
              <div className="flex gap-3">
                {(['all', 'teen', 'mature'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setAgeRating(r)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      ageRating === r ? 'bg-accent text-white' : 'bg-bg-primary text-text-secondary border border-divider'
                    }`}
                  >
                    {r === 'all' ? 'All Ages' : r === 'teen' ? 'Teen' : 'Mature'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 text-text-secondary hover:text-text-primary transition-colors">Cancel</button>
              <button
                onClick={() => setStep(2)}
                disabled={!authorName.trim()}
                className="px-6 py-2 btn btn-primary rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-4 mb-8">
              <button
                onClick={() => setPublishMode('public')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${publishMode === 'public' ? 'border-accent bg-accent/10' : 'border-divider hover:border-accent/50'}`}
              >
                <p className="font-semibold mb-1">Publish Publicly</p>
                <p className="text-sm text-text-secondary">Visible in Discovery feed, searchable by everyone</p>
              </button>
              <button
                onClick={() => setPublishMode('upcoming')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${publishMode === 'upcoming' ? 'border-accent bg-accent/10' : 'border-divider hover:border-accent/50'}`}
              >
                <p className="font-semibold mb-1">Upload As Upcoming</p>
                <p className="text-sm text-text-secondary">Show in the Upcoming Novels lane before full public release</p>
              </button>
              <button
                onClick={() => setPublishMode('unlisted')}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${publishMode === 'unlisted' ? 'border-accent bg-accent/10' : 'border-divider hover:border-accent/50'}`}
              >
                <p className="font-semibold mb-1">Publish Unlisted</p>
                <p className="text-sm text-text-secondary">Only people with the link can read it</p>
              </button>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-2 text-text-secondary hover:text-text-primary transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2 btn btn-primary rounded-xl font-semibold">Next</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="glass-card p-4 mb-6">
              <div className="flex gap-4">
                <div className="w-20 h-28 rounded-xl bg-gradient-to-br from-accent/30 to-coral/20 shrink-0" />
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">{novel.title}</h3>
                  <p className="text-text-secondary text-sm mb-2">{authorName.trim() || novel.authorName}</p>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">Niche: {niche}</span>
                    {genres.map(g => <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">{g}</span>)}
                  </div>
                </div>
              </div>
              {synopsis && <p className="text-text-secondary text-sm mt-3 line-clamp-3">{synopsis}</p>}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="px-5 py-2 text-text-secondary hover:text-text-primary transition-colors">Back</button>
              <button onClick={handlePublish} className="px-8 py-2.5 btn btn-primary rounded-xl font-semibold inline-flex items-center gap-2">
                <Rocket size={16} /> Publish Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function toRoman(num: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}
