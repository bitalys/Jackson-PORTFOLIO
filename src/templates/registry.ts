import { lazy } from 'react';
import { TemplateDefinition, TemplateId } from './types';
import { ClassicTemplate } from './classic/ClassicTemplate';

// White 템플릿은 선택됐을 때만 내려받습니다 (Classic 방문자 속도에 영향 없음)
const WhiteTemplate = lazy(() => import('./white/WhiteTemplate'));

/**
 * 템플릿 목록.
 * - 선택값은 About 프로필(site_profile)에 함께 저장되어 Supabase 테이블 변경이 필요 없습니다.
 * - 주소에 ?template=<id> 를 붙이면 저장된 선택과 상관없이 미리보기할 수 있습니다.
 */
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'classic',
    name: 'Classic (기본)',
    description: '어두운 배경과 앰버 색 포인트, 카드형 자료 목록과 팝업 미리보기가 있는 현재 디자인',
    available: true,
    component: ClassicTemplate
  },
  {
    id: 'white',
    name: 'White (Editorial)',
    description:
      '크림색 배경과 남색 섹션, 큰 세리프 제목의 잡지형 디자인. 이름에 JOURNEY가 들어간 카테고리는 타임라인으로 표시',
    available: true,
    component: WhiteTemplate
  }
];

export const DEFAULT_TEMPLATE_ID: TemplateId = 'classic';

const findAvailable = (id?: string | null) => TEMPLATES.find((t) => t.id === id && t.available);

/** 주소의 ?template= 미리보기 값 (없거나 사용할 수 없으면 null) */
export function getPreviewTemplateId(): TemplateId | null {
  try {
    const id = new URLSearchParams(window.location.search).get('template');
    return findAvailable(id)?.id ?? null;
  } catch {
    return null;
  }
}

/** 미리보기 > 저장된 선택 > 기본값 순서로 실제 사용할 템플릿을 고릅니다. */
export function resolveTemplate(savedId?: string | null): TemplateDefinition {
  return (
    findAvailable(getPreviewTemplateId()) ||
    findAvailable(savedId) ||
    (TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID) as TemplateDefinition)
  );
}

/** 미리보기 주소 만들기 (현재 페이지 기준) */
export function buildPreviewUrl(id: TemplateId): string {
  const url = new URL(window.location.href);
  url.searchParams.set('template', id);
  return url.toString();
}

export function exitPreviewUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete('template');
  return url.toString();
}
