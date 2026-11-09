import React from 'react';
import { Trophy, Sparkles, ChevronRight, Play, Eye } from 'lucide-react';
import { Category, PortfolioItem, SiteProfile } from '../types/portfolio';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { navigateTo } from '../utils/router';

interface HomePageProps {
  profile: SiteProfile;
  categories: Category[];
  items: PortfolioItem[];
  onOpenModal: (item: PortfolioItem) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  categories,
  items,
  onOpenModal,
  isAdmin,
  onOpenAdmin
}) => {
  // Find featured video item for swing playback
  const featuredVideoItem =
    items.find((i) => i.featured && (i.mediaType === 'youtube' || i.mediaType === 'both')) ||
    items.find((i) => i.mediaType === 'youtube' || i.mediaType === 'both') ||
    items[0];

  // Featured items list (top 3)
  const featuredItems = items.filter((i) => i.featured).slice(0, 3);
  const displayItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 3);

  const handleScrollToFeatured = () => {
    const el = document.getElementById('featured');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Top Section: About Jackson Hong (Scholar-Athlete Bio, Portrait, CIF Swimming, 4 Pillars & Metrics) */}
      <AboutSection
        profile={profile}
        featuredVideoItem={featuredVideoItem}
        onOpenVideo={onOpenModal}
        onExploreClick={handleScrollToFeatured}
      />

      {/* 2. Middle Section: Featured Highlights (Featured Highlights Showcase) */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Works & Competition Records</span>
            </div>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Highlights
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Tournament footage and official results. Open a card to view the full details or a quick preview.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors"
              >
                <span>+ 자료 관리</span>
              </button>
            )}

            <button
              type="button"
              // Open the first featured item in the preview popup; its ‹ › arrows browse every item
              onClick={() => displayItems[0] && onOpenModal(displayItems[0])}
              disabled={displayItems.length === 0}
              title="Browse all items in the preview"
              className="cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Card Grid with Dual Action: Third-Page vs Popup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const sub = cat?.submenus.find((s) => s.id === item.submenuId);

            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                {/* Image / Thumbnail */}
                <div
                  className="relative aspect-video bg-neutral-950 overflow-hidden cursor-pointer"
                  onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                >
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes('hero_golf')) {
                          target.src = '/images/hero_golf.jpg';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Trophy className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                  {item.mediaType === 'youtube' || item.mediaType === 'both' ? (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-neutral-950/80 border border-neutral-700 text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      <span>Video</span>
                    </div>
                  ) : null}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-amber-400">
                        {cat?.label} · {sub?.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-neutral-400">{item.date}</span>
                    </div>

                    <h3
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="font-['Outfit'] text-lg font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Dual Navigation Actions: Third-Page OR Popup */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="cursor-pointer flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors text-center"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenModal(item)}
                      className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors flex items-center gap-1"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Bottom Section: Contact (Recruiter Inquiries, Contact Info & Form) */}
      <ContactSection profile={profile} />
    </div>
  );
};
