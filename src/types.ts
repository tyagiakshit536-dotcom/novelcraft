export type ProfileMode = 'reader' | 'author' | 'reader-author';
export type SiteLanguage = 'en' | 'hi' | 'es';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  genrePrefs: string[];
  joinedAt: string;
  followerCount: number;
  followingCount: number;
}

export interface VisualDNA {
  seed: number;
  physicalDescription: string;
}

export interface NovelCharacterImage {
  id: string;
  novelId: string;
  characterId: string;
  characterName: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}

export interface Novel {
  id: string;
  authorId: string;
  authorName: string;
  mode: 'modern' | 'primitive';
  title: string;
  synopsis: string;
  coverImageUrl: string;
  genreTags: string[];
  language: string;
  ageRating: 'all' | 'teen' | 'mature';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  totalReads: number;
  totalWords: number;
  ratingAvg: number;
  ratingCount: number;
  isUnlisted: boolean;
  visualDNA?: VisualDNA;
  volumes: Volume[];
}

export interface Volume {
  id: string;
  novelId: string;
  title: string;
  bannerImageUrl: string;
  orderIndex: number;
  createdAt: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  volumeId: string;
  novelId: string;
  title: string;
  content: string;
  bannerImageUrl: string;
  orderIndex: number;
  wordCount: number;
  status: 'draft' | 'published';
  publishedAt: string;
  readCount: number;
}

export interface ReadingProgress {
  id: string;
  userId: string;
  novelId: string;
  chapterId: string;
  scrollPosition: number;
  lastReadAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  novelId: string;
  rating: number;
  reviewText: string;
  createdAt: string;
  helpfulCount: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  chapterId: string;
  content: string;
  createdAt: string;
  parentCommentId: string | null;
  isPinned: boolean;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface ReadingListItem {
  id: string;
  userId: string;
  novelId: string;
  shelfName: string;
  addedAt: string;
  progressStatus: 'to-read' | 'reading' | 'finished' | 'on-hold';
}

export interface Highlight {
  id: string;
  userId: string;
  chapterId: string;
  selectedText: string;
  color: string;
  note: string;
  createdAt: string;
}

export interface CharacterEntry {
  id: string;
  novelId: string;
  name: string;
  role: string;
  physicalDescription: string;
  personality: string;
  arcSummary: string;
  imageUrl: string;
}

export interface WorldEntry {
  id: string;
  novelId: string;
  name: string;
  category: 'location' | 'magic-system' | 'faction' | 'timeline' | 'other';
  description: string;
  imageUrl: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new-chapter' | 'rating' | 'review' | 'comment' | 'reply' | 'follower' | 'milestone';
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface NovelPlaylist {
  id: string;
  name: string;
  description: string;
  color: string;
  coverNovelId: string | null;
  novelIds: string[];
  createdAt: string;
}

export const GENRES = [
  'Fantasy', 'Sci-Fi', 'Romance', 'Horror', 'Mystery',
  'Thriller', 'Literary Fiction', 'Historical', 'Adventure',
  'Comedy', 'Drama', 'Young Adult', 'Dystopian', 'Urban Fantasy',
  'Dark Fantasy', 'Space Opera', 'Cyberpunk', 'Steampunk',
] as const;

export const NOVEL_NICHES = [
  'Fantasy',
  'Otherworldly',
  'Sci-Fi',
  'Technology',
  'Romance',
  'Mystery',
  'Thriller',
  'Horror',
  'Adventure',
  'Historical',
] as const;

export const GENRE_COLORS: Record<string, string> = {
  'Fantasy': '#e50914',
  'Sci-Fi': '#00D4FF',
  'Romance': '#FF6584',
  'Horror': '#FF4F6A',
  'Mystery': '#9B59B6',
  'Thriller': '#E74C3C',
  'Literary Fiction': '#E2B04A',
  'Historical': '#D4A574',
  'Adventure': '#4CDE8F',
  'Comedy': '#FFC14E',
  'Drama': '#FF8A65',
  'Young Adult': '#FF9FF3',
  'Dystopian': '#636E72',
  'Urban Fantasy': '#A29BFE',
  'Dark Fantasy': '#2D1B69',
  'Space Opera': '#0ABDE3',
  'Cyberpunk': '#E056CD',
  'Steampunk': '#C49B66',
};
