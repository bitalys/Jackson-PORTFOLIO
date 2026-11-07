import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Play, Image as ImageIcon, ExternalLink, 
  Trophy, Edit2, Star, ChevronRight, Share2, Check
} from 'lucide-react';
import { Category, PortfolioItem } from '../types/portfolio';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ImageLightbox } from '../components/ImageLightbox';
import { StageArrows } from '../components/StageArrows';
import { navigateTo } from '../utils/router';

interface ItemThirdPageProps {
  itemId: string;
  items: PortfolioItem[];
  categories: Category[];
  isAdmin: boolean;
  onEditItem: (item: PortfolioItem) => void;
  onOpenModal: (item: PortfolioItem) => void;
}

export const ItemThirdPage: React.FC<ItemThirdPageProps> = ({
  itemId,
  items,
  categories,
  isAdmin,
  onEditItem,
  onOpenModal
}) => {
  // Find item
  const item = items.find((i) => i.id === itemId);

  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'gallery'>(() => {
    if (!item || item.mediaType === 'image' || !item.youtubeVideoId) {
      return 'gallery';
    }
    return 'video';
  });
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync active media tab when item changes: photo gallery is default for image-focused items
  React.useEffect(() => {
    if (item) {
      if (item.mediaType === 'image' || !item.youtubeVideoId) {
        setActiveMediaTab('gallery');
      } else {
        setActiveMediaTab('video');
      }
      setSelectedPhotoIndex(0);
    }
  }, [item]);

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white font-['Outfit']">
          Item not found
        </h2>
        <p className="text-sm text-neutral-400">
          The item you requested has been removed or does not exist.
        </p>
        <button
          onClick={() => navigateTo({ page: 'home' })}
          className="cursor-pointer px-5 py-2.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-400"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Resolve category and submenu
  const category = categories.find((c) => c.id === item.categoryId);
  const submenu = category?.submenus.find((s) => s.id === item.submenuId);
  const categoryLabel = category?.label || item.categoryId.toUpperCase();
  const submenuLabel = submenu?.name || item.submenuId;

  // Image list - strictly deduplicated so cover image is never duplicated
  const allImages = Array.from(
    new Set([item.coverImage, ...(item.galleryImages || [])].filter(Boolean))
  );

  // Related items in the same sub-page / category
  const relatedItems = items
    .filter((i) => i.categoryId === item.categoryId && i.id !== item.id)
    .slice(0, 3);

  // Breadcrumbs items
  const breadcrumbItems = [
    {
      label: categoryLabel,
      route: { page: 'category' as const, categoryId: item.categoryId }
    },
    {
      label: submenuLabel,
      route: { page: 'category' as const, categoryId: item.categoryId, submenuId: item.submenuId }
    },
    {
      label: item.title,
      active: true
    }
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              navigateTo({
                page: 'category',
                categoryId: item.categoryId,
                submenuId: item.submenuId
              })
            }
            className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {submenuLabel}</span>
          </button>

          <button
            onClick={handleShare}
            className="cursor-pointer p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {isAdmin && (
            <button
              onClick={() => onEditItem(item)}
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span>자료 수정</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Third-Page Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="font-bold text-amber-400 uppercase tracking-widest">
            {categoryLabel} · {submenuLabel}
          </span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="flex items-center gap-1 font-mono text-neutral-300">
            <Calendar className="w-3.5 h-3.5" />
            {item.date}
          </span>
          {item.featured && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="text-amber-300 flex items-center gap-1 font-semibold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Featured Showcase
              </span>
            </>
          )}
        </div>

        <h1 className="font-['Outfit'] text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {item.title}
        </h1>

        {item.subtitle && (
          <p className="text-lg sm:text-xl font-medium text-amber-400">
            {item.subtitle}
          </p>
        )}
      </div>

      {/* 3. Highlights Bar */}
      {item.highlights && item.highlights.length > 0 && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {item.highlights.map((h) => (
            <div key={h.id} className="space-y-1">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                {h.label}
              </span>
              <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                {h.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Full Media Viewport (YouTube Video or High-Res Gallery) */}
      <div className="space-y-4">
        {item.youtubeVideoId && allImages.length > 0 && (
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeMediaTab === 'video'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white bg-neutral-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Official Video</span>
            </button>
            <button
              onClick={() => setActiveMediaTab('gallery')}
              className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeMediaTab === 'gallery'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'text-neutral-400 hover:text-white bg-neutral-900'
              }`}
            >
              Photo Gallery ({allImages.length})
            </button>
          </div>
        )}

        {/* Video Player Embed */}
        {item.youtubeVideoId && activeMediaTab === 'video' ? (
          <div className="space-y-2">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl">
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
              <span>Video not playing due to browser or third-party restrictions?</span>
              <a
                href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Watch on YouTube</span>
              </a>
            </div>
          </div>
        ) : allImages.length > 0 ? (
          /* High-res Image Showcase */
          <div className="space-y-4">
            <div
              className="relative max-h-[640px] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center cursor-pointer group"
              onClick={() => setLightboxIndex(Math.min(selectedPhotoIndex, allImages.length - 1))}
            >
              <img
                src={allImages[selectedPhotoIndex] || allImages[0]}
                alt={`${item.title} preview`}
                className="max-h-[640px] w-auto max-w-full object-contain mx-auto group-hover:scale-[1.01] transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('hero_golf')) {
                    target.src = '/images/hero_golf.jpg';
                  }
                }}
              />
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-neutral-950/80 border border-neutral-700 text-xs text-neutral-200">
                Click to enlarge
              </div>
              <StageArrows
                count={allImages.length}
                index={Math.min(selectedPhotoIndex, allImages.length - 1)}
                onChange={setSelectedPhotoIndex}
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto py-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    title={`Photo ${idx + 1}`}
                    aria-label={`Show photo ${idx + 1}`}
                    aria-current={selectedPhotoIndex === idx}
                    className={`cursor-pointer relative w-24 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedPhotoIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* 5. Detailed Story & Narrative Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Overview & Full Story
            </h3>
            <div className="text-base sm:text-lg text-neutral-200 leading-relaxed whitespace-pre-line space-y-4">
              {item.details || item.summary}
            </div>
          </div>

          {/* External Verification Links */}
          <div className="pt-6 border-t border-neutral-800 flex flex-wrap gap-4">
            {item.externalLink && (
              <a
                href={item.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
              >
                <span>{item.externalLinkLabel || 'Official Leaderboard & Website'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {item.youtubeUrl && (
              <a
                href={item.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 hover:text-white font-semibold text-xs transition-colors"
              >
                <Play className="w-4 h-4 text-red-500 fill-current" />
                <span>Watch Original on YouTube</span>
              </a>
            )}
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Details
          </h4>

          <div className="space-y-3 text-xs divide-y divide-neutral-800">
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-400">Category</span>
              <span className="font-semibold text-white">{categoryLabel}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-400">Section</span>
              <span className="font-semibold text-amber-400">{submenuLabel}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-400">Date</span>
              <span className="font-mono text-white">{item.date}</span>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-neutral-400">Media</span>
              <span className="text-neutral-200">{item.mediaType === 'both' ? 'Video & Photos' : item.mediaType === 'youtube' ? 'Video' : 'Photos'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Related Works in this Sub-page */}
      {relatedItems.length > 0 && (
        <section className="pt-10 border-t border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Outfit'] text-2xl font-bold text-white">
              More from {categoryLabel}
            </h3>
            <button
              onClick={() =>
                navigateTo({
                  page: 'category',
                  categoryId: item.categoryId
                })
              }
              className="cursor-pointer text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View All in Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedItems.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigateTo({ page: 'item', itemId: rel.id })}
                className="group cursor-pointer rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all p-4 space-y-3"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-neutral-950 relative">
                  {rel.coverImage ? (
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Trophy className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 block">{rel.date}</span>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-neutral-400 line-clamp-2">{rel.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <ImageLightbox
        images={allImages}
        index={lightboxIndex}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          setSelectedPhotoIndex(i);
        }}
        onClose={() => setLightboxIndex(null)}
        title={item.title}
      />
    </div>
  );
};
