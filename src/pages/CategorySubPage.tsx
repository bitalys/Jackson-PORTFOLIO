import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, LayoutGrid, List, Play, Image as ImageIcon, 
  ExternalLink, Eye, ArrowLeft, Star, Edit2, Trash2, Calendar, FileText
} from 'lucide-react';
import { Category, PortfolioItem, Submenu } from '../types/portfolio';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { navigateTo } from '../utils/router';

interface CategorySubPageProps {
  categoryId: string;
  submenuId?: string;
  categories: Category[];
  items: PortfolioItem[];
  isAdmin: boolean;
  onOpenModal: (item: PortfolioItem) => void;
  onEditItem: (item: PortfolioItem) => void;
  onDeleteItem: (id: string) => void;
  onOpenAdmin: () => void;
}

export const CategorySubPage: React.FC<CategorySubPageProps> = ({
  categoryId,
  submenuId,
  categories,
  items,
  isAdmin,
  onOpenModal,
  onEditItem,
  onDeleteItem,
  onOpenAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Resolve current category
  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const currentSubmenu = currentCategory?.submenus.find((s) => s.id === submenuId);

  // Filter items belonging to this category and submenu
  const categoryItems = useMemo(() => {
    return items.filter((item) => {
      if (item.categoryId !== currentCategory?.id) return false;
      if (submenuId && item.submenuId !== submenuId) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSubtitle = (item.subtitle || '').toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchDetails = (item.details || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSubtitle && !matchSummary && !matchDetails) {
          return false;
        }
      }

      return true;
    });
  }, [items, currentCategory, submenuId, searchQuery]);

  // Breadcrumbs items
  const breadcrumbItems = [
    {
      label: currentCategory ? currentCategory.label : categoryId.toUpperCase(),
      route: { page: 'category' as const, categoryId: currentCategory?.id || categoryId },
      active: !submenuId
    },
    ...(currentSubmenu
      ? [
          {
            label: currentSubmenu.name,
            active: true
          }
        ]
      : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <Breadcrumbs items={breadcrumbItems} />

        <button
          onClick={() => navigateTo({ page: 'home' })}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* 2. Sub-Page Hero Banner */}
      <div className="p-8 sm:p-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
            <span>Category</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>{currentCategory?.label}</span>
            {currentSubmenu && (
              <>
                <span aria-hidden="true" className="text-neutral-600">·</span>
                <span className="text-white">{currentSubmenu.name}</span>
              </>
            )}
          </div>

          <h1 className="font-['Outfit'] text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {currentSubmenu ? `${currentCategory?.label} · ${currentSubmenu.name}` : currentCategory?.label}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            {currentSubmenu?.description ||
              currentCategory?.description ||
              `Competition videos, results, research and activities in ${currentCategory?.label}.`}
          </p>

          <div className="flex items-center gap-6 pt-2 text-xs text-neutral-400 font-mono">
            <span>Items: <strong className="text-white tabular-nums">{categoryItems.length}</strong></span>
            <span>Sections: <strong className="text-white tabular-nums">{currentCategory?.submenus.length}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Sub-Menu Tabs Ribbon (GOLF, Swimming, Conditioning etc.) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Submenu Tabs Bar */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto scrollbar-none">
            {/* All in Category Tab */}
            <button
              onClick={() => navigateTo({ page: 'category', categoryId: currentCategory.id })}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                !submenuId
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All {currentCategory.label}
            </button>

            {/* Individual Sub-menus */}
            {currentCategory.submenus.map((sub) => {
              const isActive = submenuId === sub.id;
              const subCount = items.filter(
                (i) => i.categoryId === currentCategory.id && i.submenuId === sub.id
              ).length;

              return (
                <button
                  key={sub.id}
                  onClick={() =>
                    navigateTo({ page: 'category', categoryId: currentCategory.id, submenuId: sub.id })
                  }
                  className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sub.name} ({subCount})
                </button>
              );
            })}

            {/* Admin Add Submenu button */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg ml-1 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>서브메뉴 생성</span>
              </button>
            )}
          </div>

          {/* Search & View Mode Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or event..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`cursor-pointer p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`cursor-pointer p-1.5 rounded ${
                  viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
                }`}
                title="List"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Items Showcase (Sub-page content with Third-page & Popup options) */}
      {categoryItems.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 space-y-4">
          <FileText className="w-10 h-10 mx-auto text-neutral-600" />
          <h3 className="text-lg font-bold text-white">No items yet</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            There are no items in this section yet. Please check back soon.
          </p>
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="cursor-pointer px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-lg hover:bg-amber-400"
            >
              + 자료 추가하기
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="divide-y divide-neutral-800/80 border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden">
          {categoryItems.map((item) => {
            const sub = currentCategory.submenus.find((s) => s.id === item.submenuId);

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-800 shrink-0 relative cursor-pointer group"
                  >
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                    {item.youtubeVideoId && (
                      <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                        <Play className="w-4 h-4 text-amber-400 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-amber-400">{sub?.name || item.submenuId}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-neutral-400">{item.date}</span>
                    </div>

                    <h3
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="font-['Outfit'] text-base sm:text-lg font-bold text-white hover:text-amber-400 cursor-pointer truncate"
                    >
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="text-xs text-neutral-400 truncate">{item.subtitle}</p>
                    )}

                    <p className="text-xs text-neutral-300 line-clamp-1">{item.summary}</p>
                  </div>
                </div>

                {/* Dual Buttons: Third-page & Popup */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                    className="cursor-pointer px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => onOpenModal(item)}
                    className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                      title="수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryItems.map((item) => {
            const sub = currentCategory.submenus.find((s) => s.id === item.submenuId);

            return (
              <div
                key={item.id}
                className="group rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                {/* Media Thumbnail */}
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
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {item.mediaType === 'youtube' || item.mediaType === 'both' ? (
                      <div className="px-2.5 py-1 rounded bg-neutral-950/80 border border-neutral-700 text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Video</span>
                      </div>
                    ) : null}
                  </div>

                  {item.featured && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase">
                      Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold text-amber-400">
                        {currentCategory.label} · {sub?.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-neutral-400">{item.date}</span>
                    </div>

                    <h3
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="font-['Outfit'] text-lg font-bold text-white group-hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                    >
                      {item.title}
                    </h3>

                    {item.subtitle && (
                      <p className="text-xs text-neutral-400 line-clamp-1">{item.subtitle}</p>
                    )}

                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Highlights */}
                  {item.highlights && item.highlights.length > 0 && (
                    <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-xs">
                      {item.highlights.slice(0, 2).map((h) => (
                        <div key={h.id}>
                          <span className="text-[10px] text-neutral-400 uppercase block truncate">
                            {h.label}
                          </span>
                          <span className="font-bold text-white font-mono truncate block">
                            {h.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navigation Actions: Third-Page vs Popup */}
                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigateTo({ page: 'item', itemId: item.id })}
                      className="cursor-pointer flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onOpenModal(item)}
                      className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition-colors flex items-center gap-1"
                      title="Quick Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => onEditItem(item)}
                        className="cursor-pointer p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                        title="자료 수정"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
