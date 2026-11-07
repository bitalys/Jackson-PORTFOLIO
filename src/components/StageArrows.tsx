import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StageArrowsProps {
  count: number;
  index: number;
  onChange: (index: number) => void;
  /** 'dark' = Classic (어두운 배경), 'light' = White (밝은 배경) */
  tone?: 'dark' | 'light';
}

/**
 * Photo Gallery 탭의 큰 사진 위에 올라가는 좌우 화살표와 "2 / 3" 표시.
 * 화살표를 눌러도 사진 팝업은 열리지 않습니다 (큰 사진 자체를 눌렀을 때만 열림).
 */
export const StageArrows: React.FC<StageArrowsProps> = ({ count, index, onChange, tone = 'dark' }) => {
  if (count < 2) return null;

  const go = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    e.preventDefault();
    onChange((index + delta + count) % count);
  };

  const btn =
    tone === 'light'
      ? 'bg-white/85 hover:bg-white text-neutral-900 border border-black/10'
      : 'bg-neutral-950/70 hover:bg-neutral-950/90 text-white border border-white/15';

  const arrowCls = `cursor-pointer absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${btn}`;

  return (
    <>
      <button
        type="button"
        className={`${arrowCls} left-3`}
        onClick={(e) => go(e, -1)}
        aria-label="Previous photo"
        title="Previous photo"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className={`${arrowCls} right-3`}
        onClick={(e) => go(e, 1)}
        aria-label="Next photo"
        title="Next photo"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <span
        className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-semibold tabular-nums ${
          tone === 'light' ? 'bg-neutral-900/80 text-white' : 'bg-neutral-950/75 text-neutral-100'
        }`}
        aria-live="polite"
      >
        {index + 1} / {count}
      </span>
    </>
  );
};
