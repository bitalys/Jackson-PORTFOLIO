import { Category, PortfolioItem, SiteProfile } from '../types/portfolio';
import { AppRoute } from '../utils/router';

/** 사용 가능한 템플릿 ID. 새 템플릿을 추가하면 여기에 이름을 더합니다. */
export type TemplateId = 'classic' | 'white';

/**
 * 모든 템플릿이 App에서 받는 공통 데이터와 동작.
 * 데이터 불러오기, 로그인, 관리자 창, 페이지 주소(라우팅)는 App이 담당하고
 * 템플릿은 화면 모양만 담당합니다.
 */
export interface TemplateProps {
  profile: SiteProfile;
  categories: Category[];
  items: PortfolioItem[];
  route: AppRoute;
  isAdmin: boolean;

  loading: boolean;
  loadError: string | null;
  onRetry: () => void;

  /** 관리자 창 열기 */
  onOpenAdmin: () => void;
  /** 관리자: 자료 수정 창 열기 */
  onEditItem: (item: PortfolioItem) => void;
  /** 관리자: 자료 삭제 (확인 창은 템플릿 쪽에서 띄움) */
  onDeleteItem: (id: string) => Promise<void>;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  /** false면 관리자 화면에 "제작 예정"으로 표시되고 선택할 수 없음 */
  available: boolean;
  component: React.ComponentType<TemplateProps>;
}
