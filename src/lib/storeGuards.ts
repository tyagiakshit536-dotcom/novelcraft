import type { Novel } from '../types';

export function isDatabaseNovelId(novelId: string): boolean {
  return !novelId.startsWith('temp-') && !novelId.startsWith('novel-');
}

export function chapterBelongsToNovel(novel: Novel | undefined, chapterId: string): boolean {
  if (!novel) return false;
  return novel.volumes.some(v => v.chapters.some(c => c.id === chapterId));
}
