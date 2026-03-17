import { describe, expect, it } from 'vitest';
import { chapterBelongsToNovel, isDatabaseNovelId } from './storeGuards';
import type { Novel } from '../types';

function makeNovel(): Novel {
  return {
    id: 'db-novel-id',
    authorId: 'author-1',
    authorName: 'Author',
    mode: 'modern',
    title: 'Test',
    synopsis: '',
    coverImageUrl: '',
    genreTags: [],
    language: 'English',
    ageRating: 'all',
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totalReads: 0,
    totalWords: 0,
    ratingAvg: 0,
    ratingCount: 0,
    isUnlisted: false,
    volumes: [
      {
        id: 'vol-1',
        novelId: 'db-novel-id',
        title: 'Volume I',
        bannerImageUrl: '',
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        chapters: [
          {
            id: 'chapter-1',
            volumeId: 'vol-1',
            novelId: 'db-novel-id',
            title: 'Chapter 1',
            content: '',
            bannerImageUrl: '',
            orderIndex: 0,
            wordCount: 0,
            status: 'draft',
            publishedAt: '',
            readCount: 0,
          },
        ],
      },
    ],
  };
}

describe('isDatabaseNovelId', () => {
  it('rejects temp ids', () => {
    expect(isDatabaseNovelId('temp-123')).toBe(false);
  });

  it('rejects sample discovery ids', () => {
    expect(isDatabaseNovelId('novel-3')).toBe(false);
  });

  it('accepts normal database ids', () => {
    expect(isDatabaseNovelId('0037af29-5178-4317-8862-f68d5e745507')).toBe(true);
  });
});

describe('chapterBelongsToNovel', () => {
  it('returns true for chapter in novel', () => {
    const novel = makeNovel();
    expect(chapterBelongsToNovel(novel, 'chapter-1')).toBe(true);
  });

  it('returns false when chapter is not in novel', () => {
    const novel = makeNovel();
    expect(chapterBelongsToNovel(novel, 'missing-chapter')).toBe(false);
  });

  it('returns false for missing novel', () => {
    expect(chapterBelongsToNovel(undefined, 'chapter-1')).toBe(false);
  });
});
