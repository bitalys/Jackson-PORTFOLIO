import React from 'react';
import { ArrowDown, Play, Trophy } from 'lucide-react';
import { SiteProfile, PortfolioItem } from '../types/portfolio';
import { HERO_GOLF_IMAGE } from '../services/storage';

interface HeroProps {
  profile: SiteProfile;
  featuredVideoItem?: PortfolioItem;
  onOpenItem: (item: PortfolioItem) => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  profile,
  featuredVideoItem,
  onOpenItem,
  onExploreClick
}) => {
  return (
    <section className="relative pt-8 pb-16 border-b border-neutral-800/60 overflow-hidden">
      {/* Background glow subtlety */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Split Screen Hero: 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch min-h-[500px]">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col justify-center py-4 lg:py-8">
            {/* Unboxed Kicker */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider uppercase text-amber-400 mb-4">
              <span>Scholar-Athlete</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Tournament Golf</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>CIF Swimming</span>
            </div>

            {/* Main Headline with text-wrap balance */}
            <h1 className="font-['Outfit'] text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6 max-w-2xl text-balance">
              Precision on the course, power in the pool, focus in research.
            </h1>

            {/* Lead copy */}
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              Welcome to the personal portfolio of <strong className="text-white font-semibold">{profile.name}</strong>. 
              Documenting tournament performances, athletic milestones in golf and swimming, academic biomechanics projects, and community mentorship.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="cursor-pointer inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-amber-500 text-neutral-950 font-semibold text-sm hover:bg-amber-400 active:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10"
              >
                <span>자료 둘러보기 (Explore Works)</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {featuredVideoItem && (
                <button
                  onClick={() => onOpenItem(featuredVideoItem)}
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-3.5 rounded-lg bg-neutral-900 text-neutral-200 border border-neutral-700/80 font-medium text-sm hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>스윙 영상 재생 (Watch Swing Reel)</span>
                </button>
              )}
            </div>

            {/* Quick credentials unboxed */}
            <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-400">
              <span className="text-neutral-200 font-medium">{profile.graduationYear}</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span>{profile.location}</span>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <span className="text-amber-400/90 font-mono tabular-nums">GPA {profile.gpa.split(' ')[0]}</span>
            </div>
          </div>

          {/* Right Column: Hero Visual Container at Matching Height */}
          <div className="lg:col-span-5 relative flex flex-col justify-stretch">
            <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
              <img
                src={HERO_GOLF_IMAGE}
                alt="Jackson Hong tournament golf swing follow-through"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== '/images/hero_golf.jpg') {
                    target.src = '/images/hero_golf.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent pointer-events-none" />

              {/* Floating Action / Metric Overlay */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Tournament Record</span>
                  </div>
                  <div className="text-white font-['Outfit'] font-bold text-base mt-0.5">
                    Tournament Low: 68 (-4)
                  </div>
                  <p className="text-xs text-neutral-400">AJGA Junior All-Star Invitational</p>
                </div>

                {featuredVideoItem && (
                  <button
                    onClick={() => onOpenItem(featuredVideoItem)}
                    className="cursor-pointer p-3 rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400 hover:scale-105 transition-all shadow-md"
                    title="Play Video"
                    aria-label="Play Video"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-metric KPI achievement strip below hero split */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {profile.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider block">
                {metric.label}
              </span>
              <div className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
                {metric.value}
              </div>
              <p className="text-xs text-neutral-500 truncate">
                {metric.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
