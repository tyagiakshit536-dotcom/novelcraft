import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, Clock, Eye, Bookmark, Share2, ChevronDown, ChevronRight, MessageCircle, Heart, Clock3, PlusCircle } from 'lucide-react';
import { useStore } from '../store';
import { useState } from 'react';
import { GENRE_COLORS } from '../types';

export default function NovelDetailPage() {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const {
    novels,
    userNovels,
    readingProgress,
    readingList,
    addToReadingList,
    removeFromReadingList,
    reviews,
    addReview,
    currentUser,
    toggleLikeNovel,
    likedNovelIds,
    getNovelLikeCount,
    toggleReadLater,
    readLaterNovelIds,
    playlists,
    addNovelToPlaylist,
  } = useStore();
  const [expandedVolumes, setExpandedVolumes] = useState<Set<string>>(new Set());
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);

  const novel = [...novels, ...userNovels].find(n => n.id === novelId);
  if (!novel) return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-text-secondary">Novel not found</p>
    </div>
  );

  const progress = readingProgress.find(p => p.novelId === novelId);
  const isInReadingList = readingList.some(r => r.novelId === novelId);
  const isReadLater = readLaterNovelIds.includes(novel.id);
  const isLiked = likedNovelIds.includes(novel.id);
  const likeCount = getNovelLikeCount(novel.id);
  const novelReviews = reviews.filter(r => r.novelId === novelId);
  const totalChapters = novel.volumes.reduce((sum, v) => sum + v.chapters.length, 0);
  const estimatedReadTime = Math.ceil(novel.totalWords / 250);

  const toggleVolume = (volId: string) => {
    setExpandedVolumes(prev => {
      const n = new Set(prev);
      if (n.has(volId)) n.delete(volId); else n.add(volId);
      return n;
    });
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    addReview(novel.id, reviewRating, reviewText.trim());
    setReviewText('');
    setShowReviewForm(false);
  };

  const handleStartReading = () => {
    const firstChapter = novel.volumes[0]?.chapters[0];
    if (firstChapter) {
      navigate(`/read/${novel.id}/${firstChapter.id}`);
    }
  };

  const handleContinueReading = () => {
    if (progress) {
      navigate(`/read/${novel.id}/${progress.chapterId}`);
    } else {
      handleStartReading();
    }
  };

  return (
    <div className="min-h-screen pb-12 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative h-[60vh] min-h-[400px]">
        {novel.coverImageUrl ? (
          <img src={novel.coverImageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/30 via-bg-secondary to-bg-primary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Novel Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex gap-2 mb-3 flex-wrap">
            {novel.genreTags.map(g => (
              <span
                key={g}
                className="text-xs px-3 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: (GENRE_COLORS[g] || '#e50914') + '40' }}
              >
                {g}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-2">{novel.title}</h1>
          <p className="text-white/70 mb-4">by {novel.authorName}</p>

          {/* Stats Row */}
          <div className="flex items-center gap-6 text-sm text-white/70 mb-5">
            <span className="flex items-center gap-1">
              <Star size={14} className="fill-gold text-gold" />
              <strong className="text-white">{novel.ratingAvg}</strong> ({novel.ratingCount})
            </span>
            <span className="flex items-center gap-1"><Eye size={14} /> {(novel.totalReads / 1000).toFixed(1)}k reads</span>
            <span className="flex items-center gap-1"><BookOpen size={14} /> {totalChapters} chapters</span>
            <span className="flex items-center gap-1"><Clock size={14} /> ~{estimatedReadTime} min</span>
            <span className="flex items-center gap-1"><Heart size={14} className={isLiked ? 'fill-[#FF8A6B] text-[#FF8A6B]' : ''} /> {likeCount}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {progress ? (
              <button onClick={handleContinueReading} className="px-8 py-3 btn btn-primary rounded-full font-semibold">
                Continue Reading
              </button>
            ) : (
              <button onClick={handleStartReading} className="px-8 py-3 btn btn-primary rounded-full font-semibold">
                Start Reading
              </button>
            )}
            <button
              onClick={() => isInReadingList ? removeFromReadingList(novel.id) : addToReadingList(novel.id, 'To Read')}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                isInReadingList ? 'bg-accent/20 border-accent text-accent' : 'border-white/20 text-white/70 hover:border-white'
              }`}
            >
              <Bookmark size={20} className={isInReadingList ? 'fill-accent' : ''} />
            </button>
            <button
              onClick={() => toggleReadLater(novel.id)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                isReadLater ? 'bg-accent/20 border-accent text-accent' : 'border-white/20 text-white/70 hover:border-white'
              }`}
              title="Read Later"
            >
              <Clock3 size={19} className={isReadLater ? 'fill-accent' : ''} />
            </button>
            <button
              onClick={() => toggleLikeNovel(novel.id)}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                isLiked ? 'bg-[#FF8A6B]/20 border-[#FF8A6B] text-[#FF8A6B]' : 'border-white/20 text-white/70 hover:border-white'
              }`}
              title="Like Novel"
            >
              <Heart size={20} className={isLiked ? 'fill-[#FF8A6B]' : ''} />
            </button>
            <button
              onClick={() => setShowPlaylistPicker(v => !v)}
              className="w-12 h-12 rounded-full border border-white/20 text-white/70 hover:border-white flex items-center justify-center transition-colors"
              title="Add to Playlist"
            >
              <PlusCircle size={20} />
            </button>
            <button className="w-12 h-12 rounded-full border border-white/20 text-white/70 hover:border-white flex items-center justify-center transition-colors">
              <Share2 size={20} />
            </button>
          </div>

          {showPlaylistPicker && (
            <div className="mt-3 w-full max-w-sm bg-black/55 backdrop-blur rounded-2xl border border-white/15 p-3">
              <p className="text-xs uppercase tracking-[0.15em] text-white/60 mb-2">Add to Playlist</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {playlists.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => addNovelToPlaylist(pl.id, novel.id)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-sm"
                  >
                    {pl.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Synopsis */}
      <div className="px-6 py-6">
        <h3 className="font-semibold text-lg mb-3">Synopsis</h3>
        <p className="text-text-secondary leading-relaxed">{novel.synopsis}</p>
      </div>

      {/* Chapter Index */}
      <div className="px-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">Table of Contents</h3>
        <div className="space-y-2">
          {novel.volumes.map(volume => (
            <div key={volume.id} className="glass-card overflow-hidden">
              <button
                onClick={() => toggleVolume(volume.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-tertiary/50 transition-colors"
              >
                {expandedVolumes.has(volume.id) ? <ChevronDown size={18} className="text-accent" /> : <ChevronRight size={18} className="text-text-secondary" />}
                <span className="font-display font-semibold text-accent">{volume.title}</span>
                <span className="text-text-secondary text-xs ml-auto">{volume.chapters.length} chapters</span>
              </button>
              {expandedVolumes.has(volume.id) && (
                <div className="border-t border-divider">
                  {volume.chapters.map(chapter => (
                    <button
                      key={chapter.id}
                      onClick={() => navigate(`/read/${novel.id}/${chapter.id}`)}
                      className="w-full flex items-center justify-between px-6 py-3 text-left hover:bg-bg-tertiary/30 transition-colors border-b border-divider/50 last:border-none"
                    >
                      <span className="text-sm text-text-primary">{chapter.title}</span>
                      <span className="text-xs text-text-secondary">{chapter.wordCount.toLocaleString()} words</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle size={20} /> Reviews ({novelReviews.length})
          </h3>
          {currentUser && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-accent text-sm font-medium hover:underline"
            >
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="glass-card p-5 mb-4 animate-scale-in">
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setReviewRating(s)}>
                  <Star size={24} className={s <= reviewRating ? 'fill-gold text-gold' : 'text-divider'} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this novel..."
              maxLength={800}
              className="w-full h-24 bg-bg-primary rounded-xl p-3 text-text-primary placeholder:text-text-secondary/50 border border-divider focus:border-accent focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-text-secondary text-xs">{reviewText.length}/800</span>
              <button onClick={handleSubmitReview} className="px-5 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-all">
                Submit Review
              </button>
            </div>
          </div>
        )}

        {novelReviews.length === 0 ? (
          <p className="text-text-secondary text-sm text-center py-6">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-3">
            {novelReviews.map(review => (
              <div key={review.id} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.userName}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} size={12} className={s <= review.rating ? 'fill-gold text-gold' : 'text-divider'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">{review.reviewText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
