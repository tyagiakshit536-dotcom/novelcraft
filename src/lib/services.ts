import { supabase } from './supabase';
import type {
  User, Novel, Volume, Chapter, ReadingProgress,
  Review, Comment, ReadingListItem, CharacterEntry, WorldEntry, Notification,
} from '../types';

// ─── Mappers: DB (snake_case) <-> App (camelCase) ───

function mapProfileToUser(p: Record<string, unknown>): User {
  return {
    id: p.id as string,
    email: p.email as string,
    username: p.username as string,
    displayName: p.display_name as string,
    avatarUrl: p.avatar_url as string,
    bio: p.bio as string,
    genrePrefs: (p.genre_prefs as string[]) || [],
    joinedAt: p.joined_at as string,
    followerCount: p.follower_count as number,
    followingCount: p.following_count as number,
  };
}

function mapChapterFromDb(c: Record<string, unknown>): Chapter {
  return {
    id: c.id as string,
    volumeId: c.volume_id as string,
    novelId: c.novel_id as string,
    title: c.title as string,
    content: c.content as string,
    bannerImageUrl: c.banner_image_url as string,
    orderIndex: c.order_index as number,
    wordCount: c.word_count as number,
    status: c.status as 'draft' | 'published',
    publishedAt: (c.published_at as string) || '',
    readCount: c.read_count as number,
  };
}

function mapVolumeFromDb(v: Record<string, unknown>, chapters: Chapter[]): Volume {
  return {
    id: v.id as string,
    novelId: v.novel_id as string,
    title: v.title as string,
    bannerImageUrl: v.banner_image_url as string,
    orderIndex: v.order_index as number,
    createdAt: v.created_at as string,
    chapters,
  };
}

function mapNovelFromDb(n: Record<string, unknown>, volumes: Volume[]): Novel {
  return {
    id: n.id as string,
    authorId: n.author_id as string,
    authorName: n.author_name as string,
    title: n.title as string,
    synopsis: n.synopsis as string,
    coverImageUrl: n.cover_image_url as string,
    genreTags: (n.genre_tags as string[]) || [],
    language: n.language as string,
    ageRating: n.age_rating as 'all' | 'teen' | 'mature',
    status: n.status as 'draft' | 'published' | 'archived',
    createdAt: n.created_at as string,
    updatedAt: n.updated_at as string,
    totalReads: n.total_reads as number,
    totalWords: n.total_words as number,
    ratingAvg: Number(n.rating_avg) || 0,
    ratingCount: n.rating_count as number,
    isUnlisted: n.is_unlisted as boolean,
    volumes,
  };
}

function mapReviewFromDb(r: Record<string, unknown>): Review {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    userName: r.user_name as string,
    userAvatar: r.user_avatar as string,
    novelId: r.novel_id as string,
    rating: r.rating as number,
    reviewText: r.review_text as string,
    createdAt: r.created_at as string,
    helpfulCount: r.helpful_count as number,
  };
}

function mapCommentFromDb(c: Record<string, unknown>): Comment {
  return {
    id: c.id as string,
    userId: c.user_id as string,
    userName: c.user_name as string,
    userAvatar: c.user_avatar as string,
    chapterId: c.chapter_id as string,
    content: c.content as string,
    createdAt: c.created_at as string,
    parentCommentId: (c.parent_comment_id as string) || null,
    isPinned: c.is_pinned as boolean,
  };
}

function mapReadingProgressFromDb(rp: Record<string, unknown>): ReadingProgress {
  return {
    id: rp.id as string,
    userId: rp.user_id as string,
    novelId: rp.novel_id as string,
    chapterId: rp.chapter_id as string,
    scrollPosition: Number(rp.scroll_position) || 0,
    lastReadAt: rp.last_read_at as string,
  };
}

function mapReadingListFromDb(rl: Record<string, unknown>): ReadingListItem {
  return {
    id: rl.id as string,
    userId: rl.user_id as string,
    novelId: rl.novel_id as string,
    shelfName: rl.shelf_name as string,
    addedAt: rl.added_at as string,
    progressStatus: rl.progress_status as 'to-read' | 'reading' | 'finished' | 'on-hold',
  };
}

function mapCharacterFromDb(c: Record<string, unknown>): CharacterEntry {
  return {
    id: c.id as string,
    novelId: c.novel_id as string,
    name: c.name as string,
    role: c.role as string,
    physicalDescription: c.physical_description as string,
    personality: c.personality as string,
    arcSummary: c.arc_summary as string,
    imageUrl: c.image_url as string,
  };
}

function mapWorldEntryFromDb(w: Record<string, unknown>): WorldEntry {
  return {
    id: w.id as string,
    novelId: w.novel_id as string,
    name: w.name as string,
    category: w.category as WorldEntry['category'],
    description: w.description as string,
    imageUrl: w.image_url as string,
  };
}

function mapNotificationFromDb(n: Record<string, unknown>): Notification {
  return {
    id: n.id as string,
    userId: n.user_id as string,
    type: n.type as Notification['type'],
    message: n.message as string,
    link: n.link as string,
    isRead: n.is_read as boolean,
    createdAt: n.created_at as string,
  };
}

// ─── Helper to assemble a novel with its volumes & chapters ───

async function assembleNovel(novelRow: Record<string, unknown>): Promise<Novel> {
  const novelId = novelRow.id as string;

  const { data: volRows } = await supabase
    .from('volumes')
    .select('*')
    .eq('novel_id', novelId)
    .order('order_index');

  const volumes: Volume[] = [];
  for (const vr of volRows || []) {
    const { data: chRows } = await supabase
      .from('chapters')
      .select('*')
      .eq('volume_id', vr.id)
      .order('order_index');

    const chapters = (chRows || []).map(mapChapterFromDb);
    volumes.push(mapVolumeFromDb(vr, chapters));
  }

  return mapNovelFromDb(novelRow, volumes);
}

async function assembleNovels(novelRows: Record<string, unknown>[]): Promise<Novel[]> {
  if (!novelRows.length) return [];

  const novelIds = novelRows.map(n => n.id as string);

  // Chunk novelIds to avoid URL length limits
  const allVols: Record<string, unknown>[] = [];
  const chunkSize = 20;
  for (let i = 0; i < novelIds.length; i += chunkSize) {
    const chunk = novelIds.slice(i, i + chunkSize);
    const { data } = await supabase
      .from('volumes')
      .select('*')
      .in('novel_id', chunk)
      .order('order_index');
    if (data) allVols.push(...data);
  }

  const volIds = allVols.map(v => v.id as string);

  // Chunk volIds and fetch chapters in a way that respects the 1000 item limit
  const allChaps: Record<string, unknown>[] = [];
  const volChunkSize = 20;
  for (let i = 0; i < volIds.length; i += volChunkSize) {
    const chunk = volIds.slice(i, i + volChunkSize);
    
    // To handle huge volumes (like Shakespeare) loop with range
    let from = 0;
    while (true) {
        const { data } = await supabase
            .from('chapters')
            .select('*')
            .in('volume_id', chunk)
            .order('order_index')
            .range(from, from + 999);
            
        if (!data || data.length === 0) break;
        allChaps.push(...data);
        if (data.length < 1000) break;
        from += 1000;
    }
  }

  const chapsByVolume = new Map<string, Chapter[]>();
  for (const c of allChaps) {
    const vid = c.volume_id as string;
    if (!chapsByVolume.has(vid)) chapsByVolume.set(vid, []);
    chapsByVolume.get(vid)!.push(mapChapterFromDb(c));
  }

  const volsByNovel = new Map<string, Volume[]>();
  for (const v of allVols || []) {
    const nid = v.novel_id as string;
    if (!volsByNovel.has(nid)) volsByNovel.set(nid, []);
    volsByNovel.get(nid)!.push(mapVolumeFromDb(v, chapsByVolume.get(v.id as string) || []));
  }

  return novelRows.map(nr => mapNovelFromDb(nr, volsByNovel.get(nr.id as string) || []));
}

// ─── Auth Service ───

export const authService = {
  async signUp(email: string, password: string, username: string, displayName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, display_name: displayName },
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ─── Profile Service ───

export const profileService = {
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return mapProfileToUser(data);
  },

  async getSettings(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('theme, editor_font, editor_font_size, reader_background, reader_font, reader_font_size, has_completed_onboarding')
      .eq('id', userId)
      .single();
    if (!data) return null;
    return {
      theme: data.theme as 'dark' | 'light',
      editorFont: data.editor_font as string,
      editorFontSize: data.editor_font_size as number,
      readerBackground: data.reader_background as string,
      readerFont: data.reader_font as string,
      readerFontSize: data.reader_font_size as number,
      hasCompletedOnboarding: data.has_completed_onboarding as boolean,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.genrePrefs !== undefined) dbUpdates.genre_prefs = updates.genrePrefs;
    if (updates.username !== undefined) dbUpdates.username = updates.username;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) throw error;
  },

  async updateSettings(userId: string, settings: Record<string, unknown>) {
    const dbUpdates: Record<string, unknown> = {};
    if (settings.theme !== undefined) dbUpdates.theme = settings.theme;
    if (settings.editorFont !== undefined) dbUpdates.editor_font = settings.editorFont;
    if (settings.editorFontSize !== undefined) dbUpdates.editor_font_size = settings.editorFontSize;
    if (settings.readerBackground !== undefined) dbUpdates.reader_background = settings.readerBackground;
    if (settings.readerFont !== undefined) dbUpdates.reader_font = settings.readerFont;
    if (settings.readerFontSize !== undefined) dbUpdates.reader_font_size = settings.readerFontSize;
    if (settings.hasCompletedOnboarding !== undefined) dbUpdates.has_completed_onboarding = settings.hasCompletedOnboarding;

    const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', userId);
    if (error) throw error;
  },
};

// ─── Novel Service ───

export const novelService = {
  /** Fetch all published (non-unlisted) novels for the discovery feed */
  async getPublishedNovels(): Promise<Novel[]> {
    const { data } = await supabase
      .from('novels')
      .select('*')
      .eq('status', 'published')
      .eq('is_unlisted', false)
      .order('updated_at', { ascending: false });
    return assembleNovels(data || []);
  },

  /** Fetch all novels belonging to the current user */
  async getUserNovels(userId: string): Promise<Novel[]> {
    const { data } = await supabase
      .from('novels')
      .select('*')
      .eq('author_id', userId)
      .order('updated_at', { ascending: false });
    return assembleNovels(data || []);
  },

  /** Fetch a single novel by ID with full volumes/chapters */
  async getNovel(novelId: string): Promise<Novel | null> {
    const { data } = await supabase.from('novels').select('*').eq('id', novelId).single();
    if (!data) return null;
    return assembleNovel(data);
  },

  async createNovel(userId: string, authorName: string, title: string, synopsis: string, genreTags: string[]): Promise<Novel> {
    const { data: novelRow, error: nErr } = await supabase
      .from('novels')
      .insert({ author_id: userId, author_name: authorName, title, synopsis, genre_tags: genreTags })
      .select()
      .single();
    if (nErr || !novelRow) throw nErr || new Error('Failed to create novel');

    const { data: volRow, error: vErr } = await supabase
      .from('volumes')
      .insert({ novel_id: novelRow.id, title: 'Volume I', order_index: 0 })
      .select()
      .single();
    if (vErr || !volRow) throw vErr || new Error('Failed to create volume');

    const { data: chRow, error: cErr } = await supabase
      .from('chapters')
      .insert({ volume_id: volRow.id, novel_id: novelRow.id, title: 'Chapter 1: Untitled', order_index: 0 })
      .select()
      .single();
    if (cErr || !chRow) throw cErr || new Error('Failed to create chapter');

    const chapter = mapChapterFromDb(chRow);
    const volume = mapVolumeFromDb(volRow, [chapter]);
    return mapNovelFromDb(novelRow, [volume]);
  },

  async updateNovel(novelId: string, updates: Partial<Novel>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.synopsis !== undefined) dbUpdates.synopsis = updates.synopsis;
    if (updates.coverImageUrl !== undefined) dbUpdates.cover_image_url = updates.coverImageUrl;
    if (updates.genreTags !== undefined) dbUpdates.genre_tags = updates.genreTags;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.ageRating !== undefined) dbUpdates.age_rating = updates.ageRating;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.isUnlisted !== undefined) dbUpdates.is_unlisted = updates.isUnlisted;
    if (updates.totalWords !== undefined) dbUpdates.total_words = updates.totalWords;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('novels').update(dbUpdates).eq('id', novelId);
    if (error) throw error;
  },

  async deleteNovel(novelId: string) {
    const { error } = await supabase.from('novels').delete().eq('id', novelId);
    if (error) throw error;
  },

  async publishNovel(novelId: string, authorName: string, synopsis: string, genreTags: string[], ageRating: string, isUnlisted: boolean) {
    const { error } = await supabase.from('novels').update({
      author_name: authorName,
      synopsis, genre_tags: genreTags, age_rating: ageRating,
      is_unlisted: isUnlisted, status: 'published', updated_at: new Date().toISOString(),
    }).eq('id', novelId);
    if (error) throw error;
  },

  async unpublishNovel(novelId: string) {
    const { error } = await supabase.from('novels').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', novelId);
    if (error) throw error;
  },
};

// ─── Volume Service ───

export const volumeService = {
  async addVolume(novelId: string, title: string, orderIndex: number): Promise<Volume> {
    const { data, error } = await supabase
      .from('volumes')
      .insert({ novel_id: novelId, title, order_index: orderIndex })
      .select()
      .single();
    if (error || !data) throw error || new Error('Failed to add volume');
    return mapVolumeFromDb(data, []);
  },

  async updateVolume(volumeId: string, updates: Partial<Volume>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.bannerImageUrl !== undefined) dbUpdates.banner_image_url = updates.bannerImageUrl;
    if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;

    const { error } = await supabase.from('volumes').update(dbUpdates).eq('id', volumeId);
    if (error) throw error;
  },

  async deleteVolume(volumeId: string) {
    const { error } = await supabase.from('volumes').delete().eq('id', volumeId);
    if (error) throw error;
  },
};

// ─── Chapter Service ───

export const chapterService = {
  async addChapter(novelId: string, volumeId: string, title: string, orderIndex: number): Promise<Chapter> {
    const { data, error } = await supabase
      .from('chapters')
      .insert({ novel_id: novelId, volume_id: volumeId, title, order_index: orderIndex })
      .select()
      .single();
    if (error || !data) throw error || new Error('Failed to add chapter');
    return mapChapterFromDb(data);
  },

  async updateChapter(chapterId: string, updates: Partial<Chapter>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.wordCount !== undefined) dbUpdates.word_count = updates.wordCount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt || null;
    if (updates.bannerImageUrl !== undefined) dbUpdates.banner_image_url = updates.bannerImageUrl;
    if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;

    const { error } = await supabase.from('chapters').update(dbUpdates).eq('id', chapterId);
    if (error) throw error;
  },

  async deleteChapter(chapterId: string) {
    const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
    if (error) throw error;
  },
};

// ─── Reading Progress Service ───

export const readingProgressService = {
  async getAll(userId: string): Promise<ReadingProgress[]> {
    const { data } = await supabase.from('reading_progress').select('*').eq('user_id', userId);
    return (data || []).map(mapReadingProgressFromDb);
  },

  async upsert(userId: string, novelId: string, chapterId: string, scrollPosition: number) {
    const { error } = await supabase.from('reading_progress').upsert(
      { user_id: userId, novel_id: novelId, chapter_id: chapterId, scroll_position: scrollPosition, last_read_at: new Date().toISOString() },
      { onConflict: 'user_id,novel_id' }
    );
    if (error) throw error;
  },
};

// ─── Reading List Service ───

export const readingListService = {
  async getAll(userId: string): Promise<ReadingListItem[]> {
    const { data } = await supabase.from('reading_list').select('*').eq('user_id', userId);
    return (data || []).map(mapReadingListFromDb);
  },

  async add(userId: string, novelId: string, shelfName: string) {
    const { error } = await supabase.from('reading_list').insert({
      user_id: userId, novel_id: novelId, shelf_name: shelfName, progress_status: 'to-read',
    });
    if (error) throw error;
  },

  async remove(userId: string, novelId: string) {
    const { error } = await supabase.from('reading_list').delete().eq('user_id', userId).eq('novel_id', novelId);
    if (error) throw error;
  },
};

// ─── Review Service ───

export const reviewService = {
  async getByNovel(novelId: string): Promise<Review[]> {
    const { data } = await supabase.from('reviews').select('*').eq('novel_id', novelId).order('created_at', { ascending: false });
    return (data || []).map(mapReviewFromDb);
  },

  async getAll(): Promise<Review[]> {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    return (data || []).map(mapReviewFromDb);
  },

  async add(userId: string, userName: string, userAvatar: string, novelId: string, rating: number, reviewText: string) {
    const { error } = await supabase.from('reviews').insert({
      user_id: userId, user_name: userName, user_avatar: userAvatar,
      novel_id: novelId, rating, review_text: reviewText,
    });
    if (error) throw error;
  },
};

// ─── Comment Service ───

export const commentService = {
  async getByChapter(chapterId: string): Promise<Comment[]> {
    const { data } = await supabase.from('comments').select('*').eq('chapter_id', chapterId).order('created_at', { ascending: false });
    return (data || []).map(mapCommentFromDb);
  },

  async getAll(): Promise<Comment[]> {
    const { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false });
    return (data || []).map(mapCommentFromDb);
  },

  async add(userId: string, userName: string, userAvatar: string, chapterId: string, content: string, parentId: string | null) {
    const { error } = await supabase.from('comments').insert({
      user_id: userId, user_name: userName, user_avatar: userAvatar,
      chapter_id: chapterId, content, parent_comment_id: parentId,
    });
    if (error) throw error;
  },
};

// ─── Character Service ───

export const characterService = {
  async getByNovel(novelId: string): Promise<CharacterEntry[]> {
    const { data } = await supabase.from('characters').select('*').eq('novel_id', novelId);
    return (data || []).map(mapCharacterFromDb);
  },

  async getByUser(userId: string): Promise<CharacterEntry[]> {
    const { data } = await supabase
      .from('characters')
      .select('*, novels!inner(author_id)')
      .eq('novels.author_id', userId);
    return (data || []).map(mapCharacterFromDb);
  },

  async add(entry: Omit<CharacterEntry, 'id'>): Promise<CharacterEntry> {
    const { data, error } = await supabase.from('characters').insert({
      novel_id: entry.novelId, name: entry.name, role: entry.role,
      physical_description: entry.physicalDescription, personality: entry.personality,
      arc_summary: entry.arcSummary, image_url: entry.imageUrl,
    }).select().single();
    if (error || !data) throw error || new Error('Failed to add character');
    return mapCharacterFromDb(data);
  },

  async update(id: string, updates: Partial<CharacterEntry>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.physicalDescription !== undefined) dbUpdates.physical_description = updates.physicalDescription;
    if (updates.personality !== undefined) dbUpdates.personality = updates.personality;
    if (updates.arcSummary !== undefined) dbUpdates.arc_summary = updates.arcSummary;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { error } = await supabase.from('characters').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── World Entry Service ───

export const worldEntryService = {
  async getByNovel(novelId: string): Promise<WorldEntry[]> {
    const { data } = await supabase.from('world_entries').select('*').eq('novel_id', novelId);
    return (data || []).map(mapWorldEntryFromDb);
  },

  async getByUser(userId: string): Promise<WorldEntry[]> {
    const { data } = await supabase
      .from('world_entries')
      .select('*, novels!inner(author_id)')
      .eq('novels.author_id', userId);
    return (data || []).map(mapWorldEntryFromDb);
  },

  async add(entry: Omit<WorldEntry, 'id'>): Promise<WorldEntry> {
    const { data, error } = await supabase.from('world_entries').insert({
      novel_id: entry.novelId, name: entry.name, category: entry.category,
      description: entry.description, image_url: entry.imageUrl,
    }).select().single();
    if (error || !data) throw error || new Error('Failed to add world entry');
    return mapWorldEntryFromDb(data);
  },

  async update(id: string, updates: Partial<WorldEntry>) {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;

    const { error } = await supabase.from('world_entries').update(dbUpdates).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('world_entries').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Notification Service ───

export const notificationService = {
  async getAll(userId: string): Promise<Notification[]> {
    const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return (data || []).map(mapNotificationFromDb);
  },

  async markRead(notificationId: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    if (error) throw error;
  },
};
