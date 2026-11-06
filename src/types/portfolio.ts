export type MediaType = 'image' | 'youtube' | 'both';

export interface StatHighlight {
  id: string;
  label: string;
  value: string;
}

export interface Submenu {
  id: string;
  name: string; // e.g. "GOLF", "Swimming", "STEM Research"
  categoryId: string; // e.g. "athletics"
  description?: string; // 서브메뉴 설명 (카테고리 페이지에서 서브메뉴 선택 시 표시)
  order?: number;
}

export interface Category {
  id: string;
  label: string; // e.g. "ATHLETICS", "ACADEMICS", "LEADERSHIP"
  description?: string;
  submenus: Submenu[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle?: string; // e.g. "AJGA Invitational" or "CIF Division 1"
  categoryId: string; // e.g. "athletics"
  submenuId: string; // e.g. "golf"
  date: string; // e.g. "Fall 2024" or "2024.10"
  featured: boolean;
  mediaType: MediaType;
  coverImage: string; // Data URL or Image path
  galleryImages: string[]; // Additional photo uploads from local computer
  youtubeUrl?: string; // YouTube video link
  youtubeVideoId?: string; // Extracted 11-char ID
  summary: string;
  details: string; // Full story / recap
  highlights: StatHighlight[]; // e.g. [{ label: "Score", value: "-3 (69)" }, { label: "Standing", value: "Champion" }]
  externalLink?: string;
  externalLinkLabel?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AboutPillar {
  id: string;
  title: string;
  description: string;
  tags?: string; // 예: "History · Politics · Writing" (White 템플릿에서 표시)
}

/**
 * White(Editorial) 템플릿 전용 문구. 모두 선택 항목이며, 비어 있으면 해당 문구 대신
 * 기존 About 내용(제목/소개 등)이나 기본 문구를 사용하거나 섹션을 숨깁니다.
 * 제목 항목은 줄바꿈(Enter)이 화면에도 그대로 반영됩니다.
 */
export interface WhiteTemplateContent {
  heroTitle?: string; // 홈 첫 화면 큰 제목
  heroTagline?: string; // 홈 첫 화면 제목 아래 한 줄
  heroButton?: string; // 홈 첫 화면 버튼 문구
  whoTitle?: string; // 01 Who I am 제목
  storiesTitle?: string; // 03 대표 자료 제목
  achievementTitle?: string; // 04 대표 성과 제목 (숫자는 성과 지표 1번)
  exploreTitle?: string; // 05 분야 둘러보기 제목
  exploreText?: string; // 05 분야 둘러보기 설명
  nextTitle?: string; // 06 What's next 제목 (비우면 섹션 숨김)
  nextText?: string; // 06 What's next 설명
  closingTitle?: string; // 하단 큰 문구 (예: KEEP EXPLORING.)
  closingText?: string; // 하단 큰 문구 아래 한 줄
  aboutHeroTitle?: string; // About 페이지 큰 제목
  aboutQuote?: string; // About 페이지 인용문 (비우면 숨김)
}

export interface SiteProfile {
  name: string;
  title: string;
  subtitle: string;
  intro?: string; // Home 상단 소개 문단 (이름 뒤에 이어지는 문장)
  bio: string;
  bioGolf?: string;
  bioSwim?: string;
  location: string;
  graduationYear: string;
  gpa: string;
  portraitImage?: string;
  swimmingImage?: string;
  swimmingCaption?: string; // 수영 사진 하단 문구
  swimmingCaptionValue?: string; // 수영 사진 하단 우측 기록
  email: string;
  phone: string;
  socials: {
    youtube?: string;
    instagram?: string;
    linkedin?: string;
  };
  metrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  pillars?: AboutPillar[];
  template?: string; // 사이트 디자인 템플릿 ID (예: 'classic', 'white')
  white?: WhiteTemplateContent; // White 템플릿 전용 문구
}
