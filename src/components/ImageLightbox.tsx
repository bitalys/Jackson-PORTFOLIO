import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  /** 열려 있는 사진 번호. null이면 닫힌 상태 */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  title?: string;
}

/**
 * 사진 전용 팝업 (모든 템플릿 공통).
 * - 이전/다음 화살표 버튼, 키보드 ← → / Esc, 모바일 좌우 밀기
 * - 마지막 사진에서 다음을 누르면 첫 사진으로 돌아감
 */
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ images, index, onIndexChange, onClose, title }) => {
  const touchStartX = useRef<number | null>(null);
  const isOpen = index !== null && images.length > 0;
  const count = images.length;
  const current = isOpen ? Math.min(Math.max(index, 0), count - 1) : 0;

  const go = (delta: number) => {
    if (!isOpen || count < 2) return;
    onIndexChange((current + delta + count) % count);
  };

  // Keyboard + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopImmediatePropagation();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopImmediatePropagation();
        go(1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    // capture phase so the lightbox wins over other popups listening on window
    window.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, current, count]);

  // Preload neighbours for instant switching
  useEffect(() => {
    if (!isOpen || count < 2) return;
    [images[(current + 1) % count], images[(current - 1 + count) % count]].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [isOpen, current, count, images]);

  if (!isOpen) return null;

  const arrowCls =
    'cursor-pointer absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/55 hover:bg-black/80 text-white border border-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} photos` : 'Photos'}
      className="fixed inset-0 z-[120] flex flex-col bg-black/92 backdrop-blur-sm select-none"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 text-white text-sm" onClick={(e) => e.stopPropagation()}>
        <span className="truncate opacity-80">{title}</span>
        <div className="flex items-center gap-4 shrink-0">
          <span className="tabular-nums opacity-80" aria-live="polite">
            {current + 1} / {count}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer p-2 rounded-full hover:bg-white/15 transition-colors"
            aria-label="Close"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-20 pb-4">
        <img
          key={images[current]}
          src={images[current]}
          alt={title ? `${title} — photo ${current + 1}` : `Photo ${current + 1}`}
          className="max-h-full max-w-full object-contain shadow-2xl"
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />

        {count > 1 && (
          <>
            <button
              type="button"
              className={`${arrowCls} left-2 sm:left-5`}
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous photo"
              title="Previous (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              className={`${arrowCls} right-2 sm:right-5`}
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next photo"
              title="Next (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {count > 1 && (
        <div
          className="flex items-center justify-center gap-2 px-4 pb-4 overflow-x-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onIndexChange(i)}
              className={`cursor-pointer shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-md border-2 transition-opacity ${
                i === current ? 'border-white opacity-100' : 'border-transparent opacity-50 hover:opacity-90'
              }`}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === current}
            >
              <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};
