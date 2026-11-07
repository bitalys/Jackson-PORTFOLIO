import React, { useState, useEffect } from 'react';
import { X, Play, ExternalLink, Calendar, ChevronLeft, ChevronRight, Edit2, Star } from 'lucide-react';
import { PortfolioItem, Category } from '../types/portfolio';
import { ImageLightbox } from './ImageLightbox';

interface ItemDetailModalProps {
  item: PortfolioItem | null;
  items: PortfolioItem[];
  categories: Category[];
  onClose: () => void;
  onNavigateItem: (item: PortfolioItem) => void;
  isAdmin: boolean;
  onEditItem?: (item: PortfolioItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  items,
  categories,
  onClose,
  onNavigateItem,
  isAdmin,
  onEditItem
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'gallery'>(() => {
    if (!item || item.mediaType === 'image' || !item.youtubeVideoId) {
      return 'gallery';
    }
    return 'video';
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Close the photo viewer when switching to another item
  useEffect(() => {
    setLightboxIndex(null);
  }, [item?.id]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, items]);

  // Sync media tab when item changes: default to gallery when mediaType is 'image'
  useEffect(() => {
    if (item) {
      if (item.mediaType === 'image' || !item.youtubeVideoId) {
        setActiveMediaTab('gallery');
      } else {
        setActiveMediaTab('video');
      }
      setSelectedImageIndex(0);
    }
  }, [item]);

  if (!item) return null;

  // Resolve Category & Submenu names
  const category = categories.find((c) => c.id === item.categoryId);
  const submenu = category?.submenus.find((s) => s.id === item.submenuId);
  const categoryLabel = category?.label || item.categoryId.toUpperCase();
  const submenuLabel = submenu?.name || item.submenuId;

  // Image list - strictly deduplicated so cover image is never duplicated
  const allImages = Array.from(
    new Set([item.coverImage, ...(item.galleryImages || [])].filter(Boolean))
  );

  // Prev / Next index
  const currentIndex = items.findIndex((i) => i.id === item.id);
  const handlePrev = () => {
    if (currentIndex > 0) {
      onNavigateItem(items[currentIndex - 1]);
    } else {
      onNavigateItem(items[items.length - 1]);
    }
  };
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      onNavigateItem(items[currentIndex + 1]);
    } else {
      onNavigateItem(items[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Top Header / Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          {/* Breadcrumb / Metadata */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 truncate pr-4">
            <span className="font-semibold text-amber-400 uppercase tracking-wider">{categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-300 font-medium">{submenuLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-neutral-400">{item.date}</span>
            {item.featured && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-300 flex items-center gap-1 font-semibold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  Featured
                </span>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && onEditItem && (
              <button
                onClick={() => {
                  onClose();
                  onEditItem(item);
                }}
                className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-md border border-neutral-700 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>자료 수정</span>
              </button>
            )}

            {/* Prev / Next buttons */}
            <div className="flex items-center border border-neutral-800 rounded-md bg-neutral-900">
              <button
                onClick={handlePrev}
                className="cursor-pointer p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-l transition-colors"
                title="Previous (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="cursor-pointer p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-r transition-colors"
                title="Next (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Media Viewport */}
          <div className="space-y-3">
            {/* If both video and images exist, show switcher tabs */}
            {item.youtubeVideoId && allImages.length > 0 && (
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <button
                  onClick={() => setActiveMediaTab('video')}
                  className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeMediaTab === 'video'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white bg-neutral-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </button>
                <button
                  onClick={() => setActiveMediaTab('gallery')}
                  className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeMediaTab === 'gallery'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'text-neutral-400 hover:text-white bg-neutral-800'
                  }`}
                >
                  Photo Gallery ({allImages.length})
                </button>
              </div>
            )}

            {/* Video View */}
            {item.youtubeVideoId && activeMediaTab === 'video' && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-800 shadow-xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${item.youtubeVideoId}?rel=0&enablejsapi=1`}
                    title={item.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                  <span>Video not playing due to browser settings?</span>
                  <a
                    href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Open on YouTube</span>
                  </a>
                </div>
              </div>
            )}

            {/* Image Gallery View */}
            {(activeMediaTab === 'gallery' || !item.youtubeVideoId) && allImages.length > 0 && (
              <div className="space-y-3">
                <div
                  className="relative max-h-[500px] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center cursor-zoom-in group"
                  onClick={() => setLightboxIndex(Math.min(selectedImageIndex, allImages.length - 1))}
                  title="Click to enlarge"
                >
                  <span className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-md bg-neutral-950/80 border border-neutral-700 text-[11px] text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to enlarge
                  </span>
                  <img
                    src={allImages[selectedImageIndex] || allImages[0]}
                    alt={`${item.title} media ${selectedImageIndex + 1}`}
                    className="max-h-[500px] w-auto max-w-full object-contain mx-auto"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('hero_golf')) {
                        target.src = '/images/hero_golf.jpg';
                      }
                    }}
                  />
                </div>

                {/* Gallery thumbnail strip if multiple images */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setLightboxIndex(idx);
                        }}
                        title="Click to enlarge"
                        className={`cursor-pointer relative w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-amber-400 scale-105'
                            : 'border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt="thumbnail"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              {item.title}
            </h2>
            {item.subtitle && (
              <p className="text-sm sm:text-base font-medium text-amber-400">
                {item.subtitle}
              </p>
            )}
          </div>

          {/* Highlights Grid */}
          {item.highlights && item.highlights.length > 0 && (
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {item.highlights.map((h) => (
                <div key={h.id}>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider block">
                    {h.label}
                  </span>
                  <span className="text-lg font-bold text-white font-mono tabular-nums">
                    {h.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Details / Narrative Story */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Overview & Details
            </h4>
            <div className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line">
              {item.details || item.summary}
            </div>
          </div>

          {/* External Links & YouTube Direct Links */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {item.externalLink && (
                <a
                  href={item.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold transition-colors border border-neutral-700"
                >
                  <span>{item.externalLinkLabel || 'Official Results & Website'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {item.youtubeUrl && (
                <a
                  href={item.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs font-semibold transition-colors border border-red-500/40"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open on YouTube</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>Record Date: {item.date}</span>
            </div>
          </div>
        </div>
      </div>
      <ImageLightbox
        images={allImages}
        index={lightboxIndex}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          setSelectedImageIndex(i);
        }}
        onClose={() => setLightboxIndex(null)}
        title={item.title}
      />
    </div>
  );
};
