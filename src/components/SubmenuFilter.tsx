import React from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { Category, Submenu } from '../types/portfolio';

interface SubmenuFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSubmenuId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  onSelectSubmenu: (submenuId: string | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
  filteredCount: number;
  viewMode: 'grid' | 'list';
  onToggleViewMode: (mode: 'grid' | 'list') => void;
  isAdmin: boolean;
  onQuickAddSubmenu: (categoryId: string) => void;
}

export const SubmenuFilter: React.FC<SubmenuFilterProps> = ({
  categories,
  selectedCategoryId,
  selectedSubmenuId,
  onSelectCategory,
  onSelectSubmenu,
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
  viewMode,
  onToggleViewMode,
  isAdmin,
  onQuickAddSubmenu
}) => {
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  // Available submenus based on selected category
  const availableSubmenus: Submenu[] = currentCategory
    ? currentCategory.submenus
    : categories.flatMap((c) => c.submenus);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar: Category Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectSubmenu(null);
            }}
            className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              selectedCategoryId === null
                ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700/60'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Categories ({totalCount})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubmenu(null);
              }}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-500 text-neutral-950 shadow-sm font-bold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title, event, record..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
            <button
              onClick={() => onToggleViewMode('grid')}
              className={`cursor-pointer p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleViewMode('list')}
              className={`cursor-pointer p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Submenu Segmented Ribbon (e.g. ATHLETICS · GOLF, ATHLETICS · Swimming, etc.) */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-800/40">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider shrink-0 pr-1">
            Sub-Menu:
          </span>

          {/* All Submenu button */}
          <button
            onClick={() => onSelectSubmenu(null)}
            className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 border ${
              selectedSubmenuId === null
                ? 'bg-neutral-800 text-amber-400 border-neutral-700 font-semibold'
                : 'bg-transparent text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            {currentCategory ? `All ${currentCategory.label}` : 'All Sub-Menus'}
          </button>

          {/* Individual submenus */}
          {availableSubmenus.map((sub) => {
            const parentCat = categories.find((c) => c.id === sub.categoryId);
            const isSelected = selectedSubmenuId === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubmenu(sub.id)}
                className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 font-semibold'
                    : 'bg-transparent text-neutral-400 border-neutral-800/80 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {!currentCategory && parentCat ? `${parentCat.label} · ` : ''}
                {sub.name}
              </button>
            );
          })}

          {/* Quick add sub-menu if admin is logged in */}
          {isAdmin && (
            <button
              onClick={() => onQuickAddSubmenu(selectedCategoryId || categories[0]?.id || 'athletics')}
              className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors whitespace-nowrap shrink-0"
              title="새 서브 메뉴 추가 (Add Sub-menu)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>서브메뉴 생성</span>
            </button>
          )}
        </div>

        {/* Count result */}
        <div className="text-xs text-neutral-400 whitespace-nowrap shrink-0">
          Showing <span className="font-mono tabular-nums text-white font-medium">{filteredCount}</span> of{' '}
          <span className="font-mono tabular-nums text-neutral-400">{totalCount}</span>
        </div>
      </div>
    </div>
  );
};
