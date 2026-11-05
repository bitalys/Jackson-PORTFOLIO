import React, { useCallback, useState } from 'react';
import { Play, Image as ImageIcon, ExternalLink, Edit2, Trash2, Calendar, Star } from 'lucide-react';
import { PortfolioItem, Category } from '../types/portfolio';
import { ConfirmDialog } from './ConfirmDialog';

interface PortfolioGridProps {
  items: PortfolioItem[];
  categories: Category[];
  viewMode: 'grid' | 'list';
  onSelectItem: (item: PortfolioItem) => void;
  isAdmin: boolean;
  onEditItem?: (item: PortfolioItem) => void;
  onDeleteItem?: (id: string) => void;
  onAddNewItem?: () => void;
}

export const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  items,
  categories,
  viewMode,
  onSelectItem,
  isAdmin,
  onEditItem,
  onDeleteItem,
  onAddNewItem
}) => {
  // 삭제 전 최종 확인
  const [pendingDelete, setPendingDelete] = useState<PortfolioItem | null>(null);
  const closeDialog = useCallback(() => setPendingDelete(null), []);
  const deleteDialog = (
    <ConfirmDialog
      isOpen={!!pendingDelete}
      title="자료 삭제 확인"
      description={`'${pendingDelete?.title ?? ''}' 자료를 삭제하시겠습니까? 업로드된 사진과 상세 내용이 모두 삭제됩니다.`}
      onConfirm={() => {
        if (pendingDelete && onDeleteItem) return onDeleteItem(pendingDelete.id);
      }}
      onCancel={closeDialog}
    />
  );

  // Helper to get category and submenu label
  const getSubmenuLabel = (item: PortfolioItem) => {
    const cat = categories.find((c) => c.id === item.categoryId);
    const sub = cat?.submenus.find((s) => s.id === item.submenuId);
    const catLabel = cat?.label || item.categoryId.toUpperCase();
    const subLabel = sub?.name || item.submenuId;
    return `${catLabel} · ${subLabel}`;
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8">
        <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2 font-['Outfit']">
          등록된 자료가 없습니다
        </h3>
        <p className="text-sm text-neutral-400 max-w-md mx-auto mb-6">
          선택한 카테고리 또는 검색 조건에 부합하는 자료가 없거나 아직 등록되지 않았습니다.
        </p>
        {isAdmin && onAddNewItem && (
          <button
            onClick={onAddNewItem}
            className="cursor-pointer px-5 py-2.5 rounded-lg bg-amber-500 text-neutral-950 font-semibold text-xs hover:bg-amber-400 transition-colors"
          >
            + 새 자료 등록하기
          </button>
        )}
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <>
      {deleteDialog}
      <div className="divide-y divide-neutral-800/80 border border-neutral-800 rounded-xl bg-neutral-900/30 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-neutral-800 shrink-0 relative border border-neutral-700/50">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('hero_golf')) {
                        target.src = '/images/hero_golf.jpg';
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                {item.mediaType === 'youtube' || item.mediaType === 'both' ? (
                  <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-amber-500 text-neutral-950">
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                {/* Unboxed Metadata */}
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="font-semibold text-amber-400">{getSubmenuLabel(item)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                  {item.featured && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-300 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Featured
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <p className="text-xs text-neutral-400 truncate">
                    {item.subtitle}
                  </p>
                )}

                <p className="text-xs text-neutral-400 line-clamp-1 max-w-2xl">
                  {item.summary}
                </p>
              </div>
            </div>

            {/* Right: Highlights & Admin Actions */}
            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800">
              {item.highlights && item.highlights.length > 0 && (
                <div className="flex items-center gap-3 text-xs">
                  {item.highlights.slice(0, 2).map((h) => (
                    <div key={h.id} className="text-right">
                      <span className="text-[10px] text-neutral-500 block uppercase">{h.label}</span>
                      <span className="font-bold text-neutral-200 font-mono tabular-nums">{h.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="cursor-pointer p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-700"
                      title="자료 수정"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete(item);
                      }}
                      className="cursor-pointer p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="자료 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      </>
    );
  }

  // Grid View (Bento Grid)
  return (
    <>
    {deleteDialog}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, idx) => {
        const isWide = item.featured && idx === 0;

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`group cursor-pointer rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col ${
              isWide ? 'md:col-span-2' : 'col-span-1'
            }`}
          >
            {/* Visual Media Showcase */}
            <div className={`relative overflow-hidden bg-neutral-950 ${isWide ? 'aspect-video lg:aspect-[21/9]' : 'aspect-video'}`}>
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
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 bg-neutral-900 p-4">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs text-neutral-400">{item.title}</span>
                </div>
              )}

              {/* Scrim overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

              {/* Media type icon / Play badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                {item.mediaType === 'youtube' || item.mediaType === 'both' ? (
                  <div className="px-2.5 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-amber-400 flex items-center gap-1.5 text-[11px] font-semibold">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Video</span>
                  </div>
                ) : null}
                {item.galleryImages && item.galleryImages.length > 0 && (
                  <div className="px-2 py-1 rounded-md bg-neutral-950/80 backdrop-blur-md border border-neutral-700/80 text-neutral-300 flex items-center gap-1 text-[11px]">
                    <ImageIcon className="w-3 h-3" />
                    <span>+{item.galleryImages.length}</span>
                  </div>
                )}
              </div>

              {/* Date & Featured Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {item.featured && (
                  <div className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Featured
                  </div>
                )}
                {isAdmin && (
                  <div
                    className="flex items-center gap-1 bg-neutral-950/90 rounded-md p-1 border border-neutral-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onEditItem && (
                      <button
                        onClick={() => onEditItem(item)}
                        className="cursor-pointer p-1 text-neutral-400 hover:text-white"
                        title="자료 수정"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    {onDeleteItem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDelete(item);
                        }}
                        className="cursor-pointer p-1 text-red-400 hover:text-red-300"
                        title="자료 삭제"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                {/* Clean unboxed metadata with dot separators */}
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                  <span className="font-semibold text-amber-400">{getSubmenuLabel(item)}</span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span className="font-mono text-neutral-400">{item.date}</span>
                </div>

                <h3 className="font-['Outfit'] text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5 leading-snug">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <p className="text-xs text-neutral-400 mb-3 font-medium">
                    {item.subtitle}
                  </p>
                )}

                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2 mb-4">
                  {item.summary}
                </p>
              </div>

              {/* Highlight metrics strip */}
              {item.highlights && item.highlights.length > 0 && (
                <div className="pt-3 border-t border-neutral-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {item.highlights.slice(0, 3).map((h) => (
                    <div key={h.id}>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider block truncate">
                        {h.label}
                      </span>
                      <span className="font-semibold text-neutral-100 font-mono tabular-nums truncate block">
                        {h.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {item.externalLink && (
                <div className="mt-3 pt-2 text-[11px] text-amber-400/90 flex items-center gap-1 hover:underline">
                  <span>{item.externalLinkLabel || '자료 링크 열기'}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
};
