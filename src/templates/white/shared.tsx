import React from 'react';
import { Category, PortfolioItem } from '../../types/portfolio';
import { AppRoute, routeToHash } from '../../utils/router';

export const href = (route: AppRoute) => routeToHash(route);

/** 제목 안의 줄바꿈(Enter)을 화면에서도 줄바꿈으로 보여줍니다. */
export const Lines: React.FC<{ text?: string }> = ({ text }) => {
  const parts = (text || '').split('\n');
  return (
    <>
      {parts.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
};

/** 긴 제목은 글자 크기를 줄여서 표시하기 위한 기준 */
export const isLong = (text?: string, limit = 42) =>
  (text || '').split('\n').some((line) => line.length > limit) || (text || '').length > limit * 2;

/** 사진 영역: 사진이 없으면 샘플과 같은 회색 그라데이션을 보여줍니다. */
export const Media: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
}> = ({ src, alt, className = '', label, style }) => (
  <div className={`tw-media ${src ? '' : 'tw-media-empty'} ${className}`} style={style}>
    {src ? (
      <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" />
    ) : (
      <span>{label ?? 'No photo'}</span>
    )}
  </div>
);

export const pad2 = (n: number) => String(n).padStart(2, '0');

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .join('')
    .slice(0, 3) || 'JH';

export const categoryLabel = (categories: Category[], item: PortfolioItem) => {
  const cat = categories.find((c) => c.id === item.categoryId);
  const sub = cat?.submenus.find((s) => s.id === item.submenuId);
  return [cat?.label, sub?.name].filter(Boolean).join(' · ');
};

/** 카테고리 ID나 이름에 'journey'가 들어 있으면 타임라인으로 표시 */
export const isTimelineCategory = (cat?: Category) =>
  !!cat && /journey|timeline/i.test(`${cat.id} ${cat.label}`);

/** 날짜 문구에서 연도를 찾습니다. ("2025–26" → 2025, "Age 4" → 없음) */
const yearOf = (date?: string) => {
  const m = (date || '').match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
};

/**
 * 타임라인 정렬: 연도가 있는 자료는 연도순, 연도가 없는 자료(예: "Age 4")는 맨 앞.
 * 같은 연도 안에서는 먼저 등록한 자료가 먼저 나옵니다.
 */
export const sortForTimeline = (items: PortfolioItem[]) =>
  [...items].sort((a, b) => {
    const ya = yearOf(a.date);
    const yb = yearOf(b.date);
    if (ya === null && yb !== null) return -1;
    if (yb === null && ya !== null) return 1;
    if (ya !== null && yb !== null && ya !== yb) return ya - yb;
    return a.createdAt - b.createdAt;
  });

/** YouTube 영상 ID가 있으면 embed 주소 */
export const youtubeEmbed = (item: PortfolioItem) =>
  item.youtubeVideoId ? `https://www.youtube.com/embed/${item.youtubeVideoId}?rel=0` : null;

/** 관리자 전용 도구 (로그인했을 때만 보임) */
export const AdminTools: React.FC<{ isAdmin: boolean; children: React.ReactNode }> = ({ isAdmin, children }) =>
  isAdmin ? <div className="tw-admin-bar">{children}</div> : null;
