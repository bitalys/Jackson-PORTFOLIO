import React from 'react';
import { ArrowRight, Trophy, Sparkles, ChevronRight, Play, Eye } from 'lucide-react';
import { Category, PortfolioItem, SiteProfile } from '../types/portfolio';
import { Hero } from '../components/Hero';
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
  // Find featured video item for hero
  const featuredVideoItem =
    items.find((i) => i.featured && (i.mediaType === 'youtube' || i.mediaType === 'both')) ||
    items.find((i) => i.mediaType === 'youtube' || i.mediaType === 'both') ||
    items[0];

  // Featured items list
  const featuredItems = items.filter((i) => i.featured).slice(0, 3);
  const displayItems = featuredItems.length > 0 ? featuredItems : items.slice(0, 3);

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <Hero
        profile={profile}
        featuredVideoItem={featuredVideoItem}
        onOpenItem={onOpenModal}
        onExploreClick={() => {
          const el = document.getElementById('category-gateways');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Sub-Page Gateways Hub (서브 페이지 허브) */}
      <section id="category-gateways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-2">
              <span>Navigation Architecture</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Sub-Pages Hub</span>
            </div>
            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              카테고리별 서브 페이지 (Sub-Pages)
            </h2>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              각 메뉴를 클릭하면 독립된 전용 서브 페이지로 이동하며, 내부에서 세부 서브메뉴(GOLF, Swimming 등)와 개별 서드 페이지로 연결됩니다.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold hover:bg-amber-500/30 transition-colors shrink-0"
            >
              <span>+ 새 서브메뉴 및 자료 추가</span>
            </button>
          )}
        </div>

        {/* 3-Column Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);

            return (
              <div
                key={cat.id}
                onClick={() => navigateTo({ page: 'category', categoryId: cat.id })}
                className="group cursor-pointer rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 hover:border-amber-500/50 hover:bg-neutral-900 transition-all flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="font-['Outfit'] text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {cat.label}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      {catItems.length}개 자료
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {cat.description || `${cat.label} 관련 대회 기록, 영상 및 성과 자료`}
                  </p>

                  {/* Submenu chips preview */}
                  <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                      포함된 서브 메뉴:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.submenus.map((sub) => (
                        <span
                          key={sub.id}
                          className="text-[11px] text-neutral-300 font-medium px-2 py-0.5 rounded bg-neutral-950/80 border border-neutral-800"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub-page button CTA */}
                <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  <span>{cat.label} 서브 페이지 바로가기</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Records & Highlights Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Works</span>
            </div>
            <h2 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              주요 추천 자료 및 경기 하이라이트
            </h2>
          </div>

          <button
            onClick={() => navigateTo({ page: 'category', categoryId: categories[0]?.id || 'athletics' })}
            className="cursor-pointer text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>전체 서브페이지 보기</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="cursor-pointer flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors text-center"
                    >
                      서드 페이지로 보기 (상세)
                    </button>
                    <button
                      onClick={() => onOpenModal(item)}
                      className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors flex items-center gap-1"
                      title="팝업으로 빠르게 보기 (Quick Popup)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>팝업</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Quick Gateway to About & Contact Sub-Pages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigateTo({ page: 'about' })}
            className="group cursor-pointer p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Biography & Regimen
              </span>
              <h3 className="font-['Outfit'] text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Jackson Hong 소개 (About Sub-Page)
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                골프 및 수영 선수로서의 철학, 주간 훈련 루틴, 학업 성과 및 대학 진학 포부를 담은 전용 서브 페이지입니다.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-amber-400">
              <span>About 페이지로 이동</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => navigateTo({ page: 'contact' })}
            className="group cursor-pointer p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                Recruiter & Inquiries
              </span>
              <h3 className="font-['Outfit'] text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                코치 및 리크루터 문의 (Contact Sub-Page)
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                대학 코치진, 스카우트, 토너먼트 일정 확인 및 공식 성적표 요청을 위한 전용 문의 서브 페이지입니다.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-white group-hover:text-amber-400">
              <span>Contact 페이지로 이동</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
