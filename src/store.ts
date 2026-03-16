import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Novel, Volume, Chapter, ReadingProgress, Review, Comment, ReadingListItem, Notification, CharacterEntry, WorldEntry, VisualDNA, NovelCharacterImage, SiteLanguage, ProfileMode, NovelPlaylist } from './types';
import { supabase } from './lib/supabase';
import {
  authService, profileService, novelService, volumeService, chapterService,
  readingProgressService, readingListService, reviewService, commentService,
  characterService, worldEntryService, notificationService,
} from './lib/services';

// ─── Sample Data Generator (fallback for discovery when DB has no published novels) ───
function generateSampleNovels(): Novel[] {
  const covers = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1529158062015-cad636e205a0?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=400&h=600&fit=crop',
  ];
  const titles = [
    'The Last Starweaver', 'Crimson Tides', 'Shadow of the Void', 'Echoes of Eternity',
    'The Clockwork Queen', 'Whispers in the Dark', 'A Throne of Embers', 'The Memory Keeper',
    'Beneath Iron Skies', 'The Silent Archive', 'Dusk and Daybreak', 'The Fracture Worlds',
    'Children of the Storm', 'The Gilded Cage', 'Ashes of Tomorrow', 'Nightfall Protocol',
    'The Sapphire Throne', 'Winds of Reckoning', 'The Iron Pact', 'Daughters of Starlight',
    'The Crimson Codex', 'Realm of Shattered Glass', 'The Voidwalker Chronicles', 'Empire of Dust',
    'Beneath the Silver Moon', 'The Phoenix Requiem', 'Tales of the Forgotten Sea', 'The Obsidian Gate',
    'Song of the Ancients', 'The Harbinger War', 'Midnight Sovereign', 'The Glass Labyrinth',
    'Bloodline of Kings', 'The Emerald Conspiracy', 'Dawn of the Unchained', 'The Whispering Peaks',
    'Curse of the Hollow Crown', 'Starborn Legacy', 'The Dragonstone Saga', 'A Dance of Ruins',
    'The Silver Alchemist', 'Forged in Flame', 'The Wanderer\'s Promise', 'Shadows of Meridian',
    'The Last Enchantress', 'Skyward Bound', 'The Raven\'s Throne', 'Echoes from the Abyss',
    'Crown of Thorns', 'The Moonlit Prisoner', 'Requiem for a Kingdom', 'The Frost Witch',
    'Tides of War', 'The Celestial Engine', 'A Kingdom of Lies', 'The Shattered Compass',
    'Oracle of the Damned', 'The Iron Rose', 'Legacy of Ember', 'The Starless Night',
    'Keeper of Secrets', 'The Burning Library', 'Rise of the Undying', 'The Phantom Court',
  ];
  const authors = [
    'Aria Nightshade', 'Marcus Blackwood', 'Elara Moonwhisper', 'Thane Grimshire', 'Luna Starfall', 'Dorian Ashfell',
    'Kira Thornwood', 'Jasper Ironvale', 'Celeste Ravensong', 'Orion Darkholme', 'Seraphina Wolfe', 'Alaric Stormwind',
    'Vivienne Lacroix', 'Remy Duval', 'Helena Ashworth', 'Caspian Hale',
  ];
  const genres = [
    ['Fantasy', 'Adventure'], ['Sci-Fi', 'Thriller'], ['Dark Fantasy', 'Horror'], ['Romance', 'Drama'],
    ['Cyberpunk', 'Sci-Fi'], ['Mystery', 'Thriller'], ['Epic Fantasy', 'War'], ['Steampunk', 'Adventure'],
    ['Paranormal', 'Romance'], ['Dystopian', 'Sci-Fi'], ['Historical', 'Drama'], ['Urban Fantasy', 'Action'],
    ['Space Opera', 'Sci-Fi'], ['Gothic', 'Horror'], ['Sword & Sorcery', 'Fantasy'], ['Psychological', 'Thriller'],
  ];
  const synopses = [
    'In a world where stars hold ancient magic, one weaver must unravel the threads of destiny before darkness consumes everything.',
    'The crimson seas hide a secret older than civilization itself. When the tides turn red, heroes must rise.',
    'Between light and shadow, an ancient void stirs. Only those who dare to look into nothing will find everything.',
    'Eternity whispers across time, carrying messages from those who came before. Can the echoes be trusted?',
    'A fallen kingdom awaits its savior. But the price of redemption may be too steep for any mortal to pay.',
    'In the labyrinth of forgotten memories, a girl discovers the key to rewriting reality itself.',
    'War machines and dragon fire paint the skies crimson. Only an unlikely alliance can turn the tide of battle.',
    'The last library in existence holds every secret ever written—including the one that could end the world.',
    'A thief, a princess, and a rogue mage walk into an empire on the brink of collapse. What could go wrong?',
    'When the gods fall silent, mortals must rise. An epic journey across shattered realms begins.',
    'She was born to rule. He was forged to destroy. Together, they might just save what\'s left of the world.',
    'Deep beneath the ocean, an ancient city stirs from its slumber, bringing with it horrors beyond imagination.',
  ];

  return titles.map((title, i) => ({
    id: `novel-${i + 1}`,
    authorId: `user-${(i % authors.length) + 1}`,
    authorName: authors[i % authors.length],
    mode: 'modern' as const,
    title,
    synopsis: synopses[i % synopses.length],
    coverImageUrl: covers[i % covers.length],
    genreTags: genres[i % genres.length],
    language: 'English',
    ageRating: 'all' as const,
    status: 'published' as const,
    createdAt: new Date(2025, i % 12, 1).toISOString(),
    updatedAt: new Date(2026, 1, 15 + i).toISOString(),
    totalReads: Math.floor(Math.random() * 50000) + 1000,
    totalWords: Math.floor(Math.random() * 200000) + 20000,
    ratingAvg: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
    ratingCount: Math.floor(Math.random() * 500) + 10,
    isUnlisted: false,
    volumes: [{
      id: `vol-${i + 1}-1`,
      novelId: `novel-${i + 1}`,
      title: 'Volume I: The Beginning',
      bannerImageUrl: '',
      orderIndex: 0,
      createdAt: new Date(2025, i % 12, 1).toISOString(),
      chapters: Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, ci) => ({
        id: `ch-${i + 1}-${ci + 1}`,
        volumeId: `vol-${i + 1}-1`,
        novelId: `novel-${i + 1}`,
        title: `Chapter ${ci + 1}: ${['The Awakening', 'Shadows Fall', 'The Journey', 'Dark Horizons', 'Rising Storm', 'The Revelation', 'Final Stand'][ci] || `Part ${ci + 1}`}`,
        content: '<p>The story continues in this chapter with breathtaking prose that draws the reader deeper into the world...</p><p>Every word carefully crafted to build the narrative tapestry that defines this tale.</p>',
        bannerImageUrl: '',
        orderIndex: ci,
        wordCount: Math.floor(Math.random() * 8000) + 2000,
        status: 'published' as const,
        publishedAt: new Date(2025, i % 12, 1 + ci).toISOString(),
        readCount: Math.floor(Math.random() * 10000) + 100,
      })),
    }],
  }));
}

const sampleNovels = generateSampleNovels();

// Debounce map for chapter content saves
const chapterSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

// Helper: generate a temporary UUID for optimistic updates
function tempId(): string {
  return 'temp-' + crypto.randomUUID();
}

// ─── Store Types ───
interface AppState {
  // Auth
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: User | null;
  authLoading: boolean;

  // Novels
  novels: Novel[];          // all published novels (discovery)
  userNovels: Novel[];      // current user's novels (library)

  // Editor state
  activeNovelId: string | null;
  activeChapterId: string | null;
  editorSidebarOpen: boolean;
  editorRightPanelOpen: boolean;

  // Reading
  readingProgress: ReadingProgress[];
  readingList: ReadingListItem[];

  // Social
  reviews: Review[];
  comments: Comment[];
  notifications: Notification[];
  playlists: NovelPlaylist[];
  upcomingNovelIds: string[];
  readLaterNovelIds: string[];
  likedNovelIds: string[];
  novelLikes: Record<string, number>;

  // Character/World Bible
  characters: CharacterEntry[];
  worldEntries: WorldEntry[];

  // Character images
  characterImages: NovelCharacterImage[];

  // UI state
  sidebarOpen: boolean;
  theme: 'dark' | 'light';
  appLanguage: SiteLanguage;
  profileMode: ProfileMode;
  searchQuery: string;
  searchOpen: boolean;
  hasSeenTutorial: boolean;
  notificationPrefs: {
    newChapter: boolean;
    ratingsReviews: boolean;
    chapterComments: boolean;
    commentReplies: boolean;
    newFollowers: boolean;
    milestones: boolean;
  };

  // Settings
  editorFont: string;
  editorFontSize: number;
  readerBackground: string;
  readerFont: string;
  readerFontSize: number;

  // Actions
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserData: (userId: string) => Promise<void>;
  completeOnboarding: () => void;
  updateUser: (updates: Partial<User>) => void;

  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setAppLanguage: (language: SiteLanguage) => void;
  setProfileMode: (mode: ProfileMode) => void;
  setSearchQuery: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  completeTutorial: () => void;
  restartTutorial: () => void;
  setNotificationPref: (key: keyof AppState['notificationPrefs'], enabled: boolean) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;

  createNovel: (title: string, synopsis: string, genreTags: string[], mode?: 'modern' | 'primitive') => Promise<Novel>;
  updateNovel: (novelId: string, updates: Partial<Novel>) => void;
  deleteNovel: (novelId: string) => void;
  publishNovel: (novelId: string, authorName: string, synopsis: string, genreTags: string[], ageRating: 'all' | 'teen' | 'mature', mode: 'public' | 'unlisted' | 'upcoming') => void;
  unpublishNovel: (novelId: string) => void;

  addVolume: (novelId: string, title: string) => Volume;
  updateVolume: (novelId: string, volumeId: string, updates: Partial<Volume>) => void;
  deleteVolume: (novelId: string, volumeId: string) => void;

  addChapter: (novelId: string, volumeId: string, title: string) => Chapter;
  updateChapter: (novelId: string, volumeId: string, chapterId: string, updates: Partial<Chapter>) => void;
  deleteChapter: (novelId: string, volumeId: string, chapterId: string) => void;
  setActiveChapter: (novelId: string | null, chapterId: string | null) => void;
  setEditorSidebarOpen: (open: boolean) => void;
  setEditorRightPanelOpen: (open: boolean) => void;

  addCharacter: (entry: Omit<CharacterEntry, 'id'>) => void;
  updateCharacter: (id: string, updates: Partial<CharacterEntry>) => void;
  deleteCharacter: (id: string) => void;

  addWorldEntry: (entry: Omit<WorldEntry, 'id'>) => void;
  updateWorldEntry: (id: string, updates: Partial<WorldEntry>) => void;
  deleteWorldEntry: (id: string) => void;

  setVisualDNA: (novelId: string, dna: VisualDNA) => void;
  addCharacterImage: (img: Omit<NovelCharacterImage, 'id'>) => void;
  deleteCharacterImage: (id: string) => void;

  updateReadingProgress: (novelId: string, chapterId: string, scrollPosition: number) => void;
  addToReadingList: (novelId: string, shelfName: string) => void;
  removeFromReadingList: (novelId: string) => void;

  addReview: (novelId: string, rating: number, text: string) => void;
  addComment: (chapterId: string, content: string, parentId: string | null) => void;

  // Social interactions
  toggleLikeNovel: (novelId: string) => void;
  getNovelLikeCount: (novelId: string) => number;

  // Read later
  toggleReadLater: (novelId: string) => void;

  // Playlists
  createPlaylist: (name: string, description: string, color: string) => void;
  addNovelToPlaylist: (playlistId: string, novelId: string) => void;
  removeNovelFromPlaylist: (playlistId: string, novelId: string) => void;

  setEditorFont: (f: string) => void;
  setEditorFontSize: (s: number) => void;
  setReaderBackground: (b: string) => void;
  setReaderFont: (f: string) => void;
  setReaderFontSize: (s: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasCompletedOnboarding: false,
      currentUser: null,
      authLoading: true,
      novels: sampleNovels,
      userNovels: [],
      activeNovelId: null,
      activeChapterId: null,
      editorSidebarOpen: true,
      editorRightPanelOpen: false,
      readingProgress: [],
      readingList: [],
      reviews: [],
      comments: [],
      notifications: [],
      playlists: [
        {
          id: 'pl-1',
          name: 'Late Night Reads',
          description: 'Dark and immersive stories for night readers',
          color: '#E24A4A',
          coverNovelId: sampleNovels[0]?.id || null,
          novelIds: sampleNovels.slice(0, 8).map(n => n.id),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pl-2',
          name: 'Epic Fantasy Mix',
          description: 'Fantasy and otherworldly picks',
          color: '#E2B04A',
          coverNovelId: sampleNovels[1]?.id || null,
          novelIds: sampleNovels.filter(n => n.genreTags.some(g => g.toLowerCase().includes('fantasy'))).slice(0, 8).map(n => n.id),
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pl-3',
          name: 'Future & Tech',
          description: 'Sci-fi, cyberpunk, and technology-driven narratives',
          color: '#F06B6B',
          coverNovelId: sampleNovels[2]?.id || null,
          novelIds: sampleNovels.filter(n => n.genreTags.some(g => ['sci-fi', 'cyberpunk', 'space opera', 'technology'].includes(g.toLowerCase()))).slice(0, 8).map(n => n.id),
          createdAt: new Date().toISOString(),
        },
      ],
      upcomingNovelIds: [],
      readLaterNovelIds: [],
      likedNovelIds: [],
      novelLikes: {},
      characters: [],
      characterImages: [],
      worldEntries: [],
      sidebarOpen: false,
      theme: 'dark',
      appLanguage: 'en',
      profileMode: 'reader-author',
      searchQuery: '',
      searchOpen: false,
      hasSeenTutorial: false,
      notificationPrefs: {
        newChapter: true,
        ratingsReviews: true,
        chapterComments: true,
        commentReplies: true,
        newFollowers: true,
        milestones: true,
      },
      editorFont: 'JetBrains Mono',
      editorFontSize: 16,
      readerBackground: 'dark',
      readerFont: 'Lora',
      readerFontSize: 18,

      // ─── Auth ───

      initAuth: async () => {
        const authFailSafe = setTimeout(() => {
          if (get().authLoading) {
            set({ authLoading: false });
          }
        }, 8000);
        try {
          const session = await authService.getSession();
          if (session?.user) {
            const profile = await profileService.getProfile(session.user.id);
            const settings = await profileService.getSettings(session.user.id);
            if (profile) {
              set({
                isAuthenticated: true,
                currentUser: profile,
                authLoading: false,
                hasCompletedOnboarding: settings?.hasCompletedOnboarding ?? false,
                theme: settings?.theme ?? 'dark',
                editorFont: settings?.editorFont ?? 'JetBrains Mono',
                editorFontSize: settings?.editorFontSize ?? 16,
                readerBackground: settings?.readerBackground ?? 'dark',
                readerFont: settings?.readerFont ?? 'Lora',
                readerFontSize: settings?.readerFontSize ?? 18,
              });
              get().loadUserData(session.user.id).catch(console.error);
              return;
            }
          }
        } catch (e) {
          console.error('Init auth error:', e);
        } finally {
          clearTimeout(authFailSafe);
        }
        set({ authLoading: false, isAuthenticated: false, currentUser: null });
      },

      loadUserData: async (userId: string) => {
        try {
          const [userNovels, publishedNovels, readingProgress, readingList, reviews, comments, characters, worldEntries, notifications] = await Promise.all([
            novelService.getUserNovels(userId),
            novelService.getPublishedNovels(),
            readingProgressService.getAll(userId),
            readingListService.getAll(userId),
            reviewService.getAll(),
            commentService.getAll(),
            characterService.getByUser(userId),
            worldEntryService.getByUser(userId),
            notificationService.getAll(userId),
          ]);

          // Merge published novels with samples for a richer discovery feed
          const dbNovelIds = new Set(publishedNovels.map(n => n.id));
          const filteredSamples = sampleNovels.filter(s => !dbNovelIds.has(s.id));
          const discoveryNovels = [...publishedNovels, ...filteredSamples];

          // Merge server novels with local state to prevent stale loads from wiping
          // out newly created or recently edited drafts.
          set((s) => {
            const serverIds = new Set(userNovels.map(n => n.id));
            const localById = new Map(s.userNovels.map(n => [n.id, n]));

            const mergedFromServer = userNovels.map((serverNovel) => {
              const localNovel = localById.get(serverNovel.id);
              if (!localNovel) return serverNovel;
              const localUpdatedAt = Date.parse(localNovel.updatedAt || '');
              const serverUpdatedAt = Date.parse(serverNovel.updatedAt || '');
              return Number.isFinite(localUpdatedAt) && Number.isFinite(serverUpdatedAt) && localUpdatedAt > serverUpdatedAt
                ? localNovel
                : serverNovel;
            });

            const localOnlyNovels = s.userNovels.filter(n => !serverIds.has(n.id) && n.authorId === userId);
            const mergedUserNovels = [...mergedFromServer, ...localOnlyNovels];

            return {
              userNovels: mergedUserNovels,
              novels: discoveryNovels,
              readingProgress,
              readingList,
              reviews,
              comments,
              characters,
              worldEntries,
              notifications,
            };
          });
        } catch (e) {
          console.error('Failed to load user data:', e);
        }
      },

      login: async (email: string, password: string) => {
        const { session } = await authService.signIn(email, password);
        if (!session?.user) throw new Error('Login failed');
        const profile = await profileService.getProfile(session.user.id);
        const settings = await profileService.getSettings(session.user.id);
        if (!profile) throw new Error('Profile not found');
        set({
          isAuthenticated: true,
          currentUser: profile,
          hasCompletedOnboarding: settings?.hasCompletedOnboarding ?? false,
          theme: settings?.theme ?? 'dark',
          editorFont: settings?.editorFont ?? 'JetBrains Mono',
          editorFontSize: settings?.editorFontSize ?? 16,
          readerBackground: settings?.readerBackground ?? 'dark',
          readerFont: settings?.readerFont ?? 'Lora',
          readerFontSize: settings?.readerFontSize ?? 18,
        });
        get().loadUserData(session.user.id);
      },

      signup: async (email: string, password: string, username: string, displayName: string) => {
        const { session } = await authService.signUp(email, password, username, displayName);
        if (!session?.user) {
          throw new Error('CONFIRM_EMAIL');
        }
        // Wait briefly for the DB trigger to create the profile
        let profile = await profileService.getProfile(session.user.id);
        if (!profile) {
          await new Promise(r => setTimeout(r, 1500));
          profile = await profileService.getProfile(session.user.id);
        }
        if (!profile) throw new Error('Profile creation failed. Please try logging in.');
        set({ isAuthenticated: true, currentUser: profile });
        get().loadUserData(session.user.id);
      },

      logout: async () => {
        try { await authService.signOut(); } catch { /* ignore signout errors */ }
        set({
          isAuthenticated: false, currentUser: null, userNovels: [],
          hasCompletedOnboarding: false, readingProgress: [], readingList: [],
          reviews: [], comments: [], characters: [], worldEntries: [],
          notifications: [], novels: sampleNovels, upcomingNovelIds: [],
        });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
        const userId = get().currentUser?.id;
        if (userId) {
          profileService.updateSettings(userId, { hasCompletedOnboarding: true }).catch(console.error);
        }
      },

      updateUser: (updates) => {
        set(s => ({ currentUser: s.currentUser ? { ...s.currentUser, ...updates } : null }));
        const userId = get().currentUser?.id;
        if (userId) {
          profileService.updateProfile(userId, updates).catch(console.error);
        }
      },

      // ─── UI State ───

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        set({ theme });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { theme }).catch(console.error);
      },
      setAppLanguage: (language) => {
        set({ appLanguage: language });
      },
      setProfileMode: (mode) => {
        set({ profileMode: mode });
      },
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      completeTutorial: () => set({ hasSeenTutorial: true }),
      restartTutorial: () => set({ hasSeenTutorial: false }),
      setNotificationPref: (key, enabled) => {
        set(s => ({ notificationPrefs: { ...s.notificationPrefs, [key]: enabled } }));
      },
      markNotificationRead: (notificationId) => {
        set(s => ({ notifications: s.notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n) }));
        if (!notificationId.startsWith('temp-')) {
          notificationService.markRead(notificationId).catch(console.error);
        }
      },
      markAllNotificationsRead: () => {
        const unreadIds = get().notifications.filter(n => !n.isRead).map(n => n.id);
        set(s => ({ notifications: s.notifications.map(n => ({ ...n, isRead: true })) }));
        unreadIds.forEach(id => {
          if (!id.startsWith('temp-')) {
            notificationService.markRead(id).catch(console.error);
          }
        });
      },

      // ─── Novel CRUD ───

      createNovel: async (title, synopsis, genreTags, mode = 'modern') => {
        const user = get().currentUser;
        if (!user?.id) {
          throw new Error('You must be logged in to create a novel.');
        }

        const novel = await novelService.createNovel(user.id, user.displayName, title, synopsis, genreTags, mode);
        const firstChapterId = novel.volumes[0]?.chapters[0]?.id ?? null;

        set(s => ({
          userNovels: [novel, ...s.userNovels.filter(n => n.id !== novel.id)],
          activeNovelId: novel.id,
          activeChapterId: firstChapterId,
        }));

        return novel;
      },

      updateNovel: (novelId, updates) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id === novelId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
        }));
        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
          novelService.updateNovel(novelId, updates).catch(console.error);
        }
      },

      deleteNovel: (novelId) => {
        set(s => ({
          userNovels: s.userNovels.filter(n => n.id !== novelId),
          novels: s.novels.filter(n => n.id !== novelId),
          activeNovelId: s.activeNovelId === novelId ? null : s.activeNovelId,
        }));
        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
          novelService.deleteNovel(novelId).catch(console.error);
        }
      },

      publishNovel: (novelId, authorName, synopsis, genreTags, ageRating, mode) => {
        const isUnlisted = mode === 'unlisted';
        const isUpcoming = mode === 'upcoming';
        set(s => {
          const novel = s.userNovels.find(n => n.id === novelId);
          if (!novel) return s;
          const updated = {
            ...novel,
            authorName,
            synopsis,
            genreTags,
            ageRating,
            isUnlisted,
            status: 'published' as const,
            updatedAt: new Date().toISOString(),
          };
          const nextUpcomingIds = isUpcoming
            ? (s.upcomingNovelIds.includes(novelId) ? s.upcomingNovelIds : [...s.upcomingNovelIds, novelId])
            : s.upcomingNovelIds.filter(id => id !== novelId);
          return {
            userNovels: s.userNovels.map(n => n.id === novelId ? updated : n),
            novels: isUnlisted ? s.novels : [...s.novels.filter(n => n.id !== novelId), updated],
            upcomingNovelIds: nextUpcomingIds,
          };
        });
        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
          novelService.publishNovel(novelId, authorName, synopsis, genreTags, ageRating, isUnlisted)
            .then(() => {
              const userId = get().currentUser?.id;
              if (!userId) return;
              get().loadUserData(userId).catch(console.error);
            })
            .catch(console.error);
        }
      },

      unpublishNovel: (novelId) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id === novelId ? { ...n, status: 'draft' as const } : n),
          novels: s.novels.filter(n => n.id !== novelId),
          upcomingNovelIds: s.upcomingNovelIds.filter(id => id !== novelId),
        }));
        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
          novelService.unpublishNovel(novelId)
            .then(() => {
              const userId = get().currentUser?.id;
              if (!userId) return;
              get().loadUserData(userId).catch(console.error);
            })
            .catch(console.error);
        }
      },

      // ─── Volume CRUD ───

      addVolume: (novelId, title) => {
        const id = tempId();
        const vol: Volume = { id, novelId, title, bannerImageUrl: '', orderIndex: 0, createdAt: new Date().toISOString(), chapters: [] };
        set(s => ({
          userNovels: s.userNovels.map(n => {
            if (n.id !== novelId) return n;
            const newVol = { ...vol, orderIndex: n.volumes.length };
            return { ...n, volumes: [...n.volumes, newVol] };
          }),
        }));

        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
          const orderIndex = get().userNovels.find(n => n.id === novelId)?.volumes.length ?? 0;
          volumeService.addVolume(novelId, title, orderIndex).then(realVol => {
            set(s => ({
              userNovels: s.userNovels.map(n => n.id !== novelId ? n : {
                ...n, volumes: n.volumes.map(v => v.id === id ? { ...realVol, chapters: v.chapters } : v),
              }),
            }));
          }).catch(console.error);
        }
        return vol;
      },

      updateVolume: (novelId, volumeId, updates) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id !== novelId ? n : {
            ...n, volumes: n.volumes.map(v => v.id === volumeId ? { ...v, ...updates } : v),
          }),
        }));
        if (!volumeId.startsWith('temp-')) {
          volumeService.updateVolume(volumeId, updates).catch(console.error);
        }
      },

      deleteVolume: (novelId, volumeId) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id !== novelId ? n : {
            ...n, volumes: n.volumes.filter(v => v.id !== volumeId),
          }),
        }));
        if (!volumeId.startsWith('temp-')) {
          volumeService.deleteVolume(volumeId).catch(console.error);
        }
      },

      // ─── Chapter CRUD ───

      addChapter: (novelId, volumeId, title) => {
        const id = tempId();
        const ch: Chapter = { id, volumeId, novelId, title, content: '', bannerImageUrl: '', orderIndex: 0, wordCount: 0, status: 'draft', publishedAt: '', readCount: 0 };
        set(s => ({
          userNovels: s.userNovels.map(n => {
            if (n.id !== novelId) return n;
            return {
              ...n, volumes: n.volumes.map(v => {
                if (v.id !== volumeId) return v;
                const newCh = { ...ch, orderIndex: v.chapters.length };
                return { ...v, chapters: [...v.chapters, newCh] };
              }),
            };
          }),
          activeChapterId: id,
        }));

        if (!novelId.startsWith('temp-') && !novelId.startsWith('novel-') && !volumeId.startsWith('temp-')) {
          const orderIndex = get().userNovels.find(n => n.id === novelId)?.volumes.find(v => v.id === volumeId)?.chapters.length ?? 0;
          chapterService.addChapter(novelId, volumeId, title, orderIndex).then(realCh => {
            set(s => ({
              userNovels: s.userNovels.map(n => n.id !== novelId ? n : {
                ...n, volumes: n.volumes.map(v => v.id !== volumeId ? v : {
                  ...v, chapters: v.chapters.map(c => c.id === id ? realCh : c),
                }),
              }),
              activeChapterId: s.activeChapterId === id ? realCh.id : s.activeChapterId,
            }));
          }).catch(console.error);
        }
        return ch;
      },

      updateChapter: (novelId, volumeId, chapterId, updates) => {
        set(s => ({
          userNovels: s.userNovels.map(n => {
            if (n.id !== novelId) return n;
            let totalWords = 0;
            const volumes = n.volumes.map(v => {
              if (v.id !== volumeId) {
                v.chapters.forEach(c => { totalWords += c.wordCount; });
                return v;
              }
              const chapters = v.chapters.map(c => {
                if (c.id !== chapterId) { totalWords += c.wordCount; return c; }
                const updated = { ...c, ...updates };
                totalWords += updated.wordCount;
                return updated;
              });
              return { ...v, chapters };
            });
            return { ...n, volumes, totalWords, updatedAt: new Date().toISOString() };
          }),
        }));

        // Debounce content saves to avoid flooding Supabase on every keystroke
        if (!chapterId.startsWith('temp-')) {
          if (updates.content !== undefined) {
            const existing = chapterSaveTimers.get(chapterId);
            if (existing) clearTimeout(existing);
            chapterSaveTimers.set(chapterId, setTimeout(() => {
              chapterSaveTimers.delete(chapterId);
              chapterService.updateChapter(chapterId, updates).catch(console.error);
              const novel = get().userNovels.find(n => n.id === novelId);
              if (novel && !novelId.startsWith('temp-') && !novelId.startsWith('novel-')) {
                novelService.updateNovel(novelId, { totalWords: novel.totalWords }).catch(console.error);
              }
            }, 2000));
          } else {
            chapterService.updateChapter(chapterId, updates).catch(console.error);
          }
        }
      },

      deleteChapter: (novelId, volumeId, chapterId) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id !== novelId ? n : {
            ...n, volumes: n.volumes.map(v => v.id !== volumeId ? v : {
              ...v, chapters: v.chapters.filter(c => c.id !== chapterId),
            }),
          }),
          activeChapterId: s.activeChapterId === chapterId ? null : s.activeChapterId,
        }));
        if (!chapterId.startsWith('temp-')) {
          chapterService.deleteChapter(chapterId).catch(console.error);
        }
      },

      setActiveChapter: (novelId, chapterId) => set({ activeNovelId: novelId, activeChapterId: chapterId }),
      setEditorSidebarOpen: (open) => set({ editorSidebarOpen: open }),
      setEditorRightPanelOpen: (open) => set({ editorRightPanelOpen: open }),

      // ─── Character Bible ───

      addCharacter: (entry) => {
        const id = tempId();
        set(s => ({ characters: [...s.characters, { ...entry, id }] }));
        characterService.add(entry).then(realChar => {
          set(s => ({ characters: s.characters.map(c => c.id === id ? realChar : c) }));
        }).catch(console.error);
      },

      updateCharacter: (id, updates) => {
        set(s => ({ characters: s.characters.map(c => c.id === id ? { ...c, ...updates } : c) }));
        if (!id.startsWith('temp-')) {
          characterService.update(id, updates).catch(console.error);
        }
      },

      deleteCharacter: (id) => {
        set(s => ({ characters: s.characters.filter(c => c.id !== id) }));
        if (!id.startsWith('temp-')) {
          characterService.delete(id).catch(console.error);
        }
      },

      // ─── World Bible ───

      addWorldEntry: (entry) => {
        const id = tempId();
        set(s => ({ worldEntries: [...s.worldEntries, { ...entry, id }] }));
        worldEntryService.add(entry).then(realEntry => {
          set(s => ({ worldEntries: s.worldEntries.map(e => e.id === id ? realEntry : e) }));
        }).catch(console.error);
      },

      updateWorldEntry: (id, updates) => {
        set(s => ({ worldEntries: s.worldEntries.map(e => e.id === id ? { ...e, ...updates } : e) }));
        if (!id.startsWith('temp-')) {
          worldEntryService.update(id, updates).catch(console.error);
        }
      },

      deleteWorldEntry: (id) => {
        set(s => ({ worldEntries: s.worldEntries.filter(e => e.id !== id) }));
        if (!id.startsWith('temp-')) {
          worldEntryService.delete(id).catch(console.error);
        }
      },

      // ─── Visual DNA & Character Images ───

      setVisualDNA: (novelId, dna) => {
        set(s => ({
          userNovels: s.userNovels.map(n => n.id === novelId ? { ...n, visualDNA: dna } : n),
        }));
      },

      addCharacterImage: (img) => {
        const id = tempId();
        set(s => ({ characterImages: [...s.characterImages, { ...img, id }] }));
      },

      deleteCharacterImage: (id) => {
        set(s => ({ characterImages: s.characterImages.filter(i => i.id !== id) }));
      },

      // ─── Reading & Social ───

      updateReadingProgress: (novelId, chapterId, scrollPosition) => {
        set(s => {
          const userId = s.currentUser?.id || '';
          const existing = s.readingProgress.find(p => p.userId === userId && p.novelId === novelId);
          if (existing) {
            return { readingProgress: s.readingProgress.map(p => p.id === existing.id ? { ...p, chapterId, scrollPosition, lastReadAt: new Date().toISOString() } : p) };
          }
          return { readingProgress: [...s.readingProgress, { id: tempId(), userId, novelId, chapterId, scrollPosition, lastReadAt: new Date().toISOString() }] };
        });
        const userId = get().currentUser?.id;
        if (userId && !novelId.startsWith('novel-')) {
          readingProgressService.upsert(userId, novelId, chapterId, scrollPosition).catch(console.error);
        }
      },

      addToReadingList: (novelId, shelfName) => {
        const s = get();
        if (s.readingList.find(r => r.novelId === novelId)) return;
        const userId = s.currentUser?.id || '';
        set({ readingList: [...s.readingList, { id: tempId(), userId, novelId, shelfName, addedAt: new Date().toISOString(), progressStatus: 'to-read' }] });
        if (userId && !novelId.startsWith('novel-')) {
          readingListService.add(userId, novelId, shelfName).catch(console.error);
        }
      },

      removeFromReadingList: (novelId) => {
        set(s => ({ readingList: s.readingList.filter(r => r.novelId !== novelId) }));
        const userId = get().currentUser?.id;
        if (userId && !novelId.startsWith('novel-')) {
          readingListService.remove(userId, novelId).catch(console.error);
        }
      },

      addReview: (novelId, rating, text) => {
        const user = get().currentUser;
        if (!user) return;
        const id = tempId();
        set(s => ({
          reviews: [...s.reviews, { id, userId: user.id, userName: user.displayName, userAvatar: user.avatarUrl, novelId, rating, reviewText: text, createdAt: new Date().toISOString(), helpfulCount: 0 }],
        }));
        if (!novelId.startsWith('novel-')) {
          reviewService.add(user.id, user.displayName, user.avatarUrl, novelId, rating, text).catch(console.error);
        }
      },

      addComment: (chapterId, content, parentId) => {
        const user = get().currentUser;
        if (!user) return;
        const id = tempId();
        set(s => ({
          comments: [...s.comments, { id, userId: user.id, userName: user.displayName, userAvatar: user.avatarUrl, chapterId, content, createdAt: new Date().toISOString(), parentCommentId: parentId, isPinned: false }],
        }));
        if (!chapterId.startsWith('ch-')) {
          commentService.add(user.id, user.displayName, user.avatarUrl, chapterId, content, parentId).catch(console.error);
        }
      },

      // ─── Social interactions ───

      toggleLikeNovel: (novelId) => {
        set(s => {
          const liked = s.likedNovelIds.includes(novelId);
          const base = s.novelLikes[novelId] ?? 0;
          const next = liked ? Math.max(0, base - 1) : base + 1;
          return {
            likedNovelIds: liked ? s.likedNovelIds.filter(id => id !== novelId) : [...s.likedNovelIds, novelId],
            novelLikes: { ...s.novelLikes, [novelId]: next },
          };
        });
      },

      getNovelLikeCount: (novelId) => {
        const s = get();
        const novel = [...s.novels, ...s.userNovels].find(n => n.id === novelId);
        const base = s.novelLikes[novelId];
        if (typeof base === 'number') return base;
        // Fallback seed count based on reads, giving a YouTube-like visible count.
        return Math.max(0, Math.floor((novel?.totalReads || 0) * 0.06));
      },

      // ─── Read later ───

      toggleReadLater: (novelId) => {
        set(s => {
          const exists = s.readLaterNovelIds.includes(novelId);
          return { readLaterNovelIds: exists ? s.readLaterNovelIds.filter(id => id !== novelId) : [...s.readLaterNovelIds, novelId] };
        });
      },

      // ─── Playlists ───

      createPlaylist: (name, description, color) => {
        const id = tempId();
        set(s => ({
          playlists: [{ id, name, description, color, coverNovelId: null, novelIds: [], createdAt: new Date().toISOString() }, ...s.playlists],
        }));
      },

      addNovelToPlaylist: (playlistId, novelId) => {
        set(s => ({
          playlists: s.playlists.map(p => {
            if (p.id !== playlistId) return p;
            if (p.novelIds.includes(novelId)) return p;
            return {
              ...p,
              coverNovelId: p.coverNovelId || novelId,
              novelIds: [novelId, ...p.novelIds],
            };
          }),
        }));
      },

      removeNovelFromPlaylist: (playlistId, novelId) => {
        set(s => ({
          playlists: s.playlists.map(p => {
            if (p.id !== playlistId) return p;
            const nextIds = p.novelIds.filter(id => id !== novelId);
            return {
              ...p,
              novelIds: nextIds,
              coverNovelId: p.coverNovelId === novelId ? (nextIds[0] || null) : p.coverNovelId,
            };
          }),
        }));
      },

      // ─── Settings ───

      setEditorFont: (f) => {
        set({ editorFont: f });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { editorFont: f }).catch(console.error);
      },
      setEditorFontSize: (s) => {
        set({ editorFontSize: s });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { editorFontSize: s }).catch(console.error);
      },
      setReaderBackground: (b) => {
        set({ readerBackground: b });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { readerBackground: b }).catch(console.error);
      },
      setReaderFont: (f) => {
        set({ readerFont: f });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { readerFont: f }).catch(console.error);
      },
      setReaderFontSize: (s) => {
        set({ readerFontSize: s });
        const userId = get().currentUser?.id;
        if (userId) profileService.updateSettings(userId, { readerFontSize: s }).catch(console.error);
      },
    }),
    {
      name: 'novelcraft-storage',
      version: 3,
      migrate: (_persisted: unknown, version: number) => {
        if (version === 0) {
          // Clear all old pre-Supabase localStorage data
          return {
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            currentUser: null,
            userNovels: [],
            readingProgress: [],
            readingList: [],
            reviews: [],
            comments: [],
            characters: [],
            worldEntries: [],
            theme: 'dark',
            appLanguage: 'en',
            profileMode: 'reader-author',
            hasSeenTutorial: false,
            notificationPrefs: {
              newChapter: true,
              ratingsReviews: true,
              chapterComments: true,
              commentReplies: true,
              newFollowers: true,
              milestones: true,
            },
            playlists: [],
            upcomingNovelIds: [],
            readLaterNovelIds: [],
            likedNovelIds: [],
            novelLikes: {},
            editorFont: 'JetBrains Mono',
            editorFontSize: 16,
            readerBackground: 'dark',
            readerFont: 'Lora',
            readerFontSize: 18,
          };
        }
        if (version === 1) {
          const persisted = (_persisted as Record<string, unknown>) || {};
          const userNovels = Array.isArray(persisted.userNovels) ? persisted.userNovels : [];
          return {
            ...persisted,
            userNovels: userNovels.map((novel) => ({ mode: 'modern', ...(novel as Record<string, unknown>) })),
          };
        }
        if (version === 2) {
          const persisted = (_persisted as Record<string, unknown>) || {};
          return {
            ...persisted,
            userNovels: [],
            reviews: [],
            comments: [],
            characters: [],
            worldEntries: [],
            characterImages: [],
          };
        }
        return _persisted as Record<string, unknown>;
      },
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        currentUser: state.currentUser,
        readingProgress: state.readingProgress,
        readingList: state.readingList,
        theme: state.theme,
        appLanguage: state.appLanguage,
        profileMode: state.profileMode,
        hasSeenTutorial: state.hasSeenTutorial,
        notificationPrefs: state.notificationPrefs,
        playlists: state.playlists,
        upcomingNovelIds: state.upcomingNovelIds,
        readLaterNovelIds: state.readLaterNovelIds,
        likedNovelIds: state.likedNovelIds,
        novelLikes: state.novelLikes,
        editorFont: state.editorFont,
        editorFontSize: state.editorFontSize,
        readerBackground: state.readerBackground,
        readerFont: state.readerFont,
        readerFontSize: state.readerFontSize,
      }),
    }
  )
);

// ─── Auth listener: auto-sync on session changes ───
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useStore.getState();
  if (event === 'SIGNED_IN' && session?.user && !store.isAuthenticated) {
    const profile = await profileService.getProfile(session.user.id);
    if (profile) {
      const settings = await profileService.getSettings(session.user.id);
      useStore.setState({
        isAuthenticated: true,
        currentUser: profile,
        authLoading: false,
        hasCompletedOnboarding: settings?.hasCompletedOnboarding ?? false,
        theme: settings?.theme ?? 'dark',
      });
      store.loadUserData(session.user.id);
    }
  } else if (event === 'SIGNED_OUT') {
    useStore.setState({
      isAuthenticated: false, currentUser: null, userNovels: [],
      hasCompletedOnboarding: false, readingProgress: [], readingList: [],
      reviews: [], comments: [], characters: [], worldEntries: [],
      notifications: [], novels: sampleNovels, upcomingNovelIds: [], authLoading: false,
    });
  }
});
