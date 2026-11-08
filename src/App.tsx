import React, { useState, useEffect, useLayoutEffect, useRef, Suspense } from 'react';
import { Category, PortfolioItem, SiteProfile } from './types/portfolio';
import { PortfolioStorage, DEFAULT_PROFILE } from './services/storage';
import { supabase } from './lib/supabase';
import { AppRoute, parseHash, navigateTo } from './utils/router';
import { AdminModal } from './components/AdminModal';
import { resolveTemplate, getPreviewTemplateId, exitPreviewUrl } from './templates/registry';

/**
 * App: 모든 템플릿이 공유하는 기능을 담당합니다.
 * - 데이터 불러오기 (Supabase / 브라우저 저장소)
 * - 관리자 로그인 상태, 관리자 창
 * - 페이지 주소(해시 라우팅)
 * - 템플릿 선택 (관리자 설정 또는 ?template= 미리보기)
 * 화면 모양은 선택된 템플릿 컴포넌트가 그립니다.
 */
export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-Page Routing state from URL hash
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => parseHash(window.location.hash));

  // Authentication state
  // - 클라우드(Supabase) 모드: Supabase 로그인 세션으로 판단
  // - 브라우저 모드: 기존 비밀번호 방식 (세션 동안 유지)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return !supabase && sessionStorage.getItem('jh_is_admin') === 'true';
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setIsAdmin(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  // Admin Modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingItemInitial, setEditingItemInitial] = useState<PortfolioItem | null>(null);

  // Load data from Storage
  const loadData = async () => {
    try {
      const [cats, allItems, prof] = await Promise.all([
        PortfolioStorage.getCategories(),
        PortfolioStorage.getItems(),
        PortfolioStorage.getProfile()
      ]);
      setCategories(cats);
      setItems(allItems);
      setProfile(prof);
      setLoadError(null);
    } catch (err) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : 'Failed to load content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen for browser Back/Forward or hash changes
  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Always start a new page at the very top.
  // A smooth scroll animation is unreliable on phones: leftover touch momentum or late-loading
  // images cancel it, leaving the new page scrolled near the bottom. So jump instantly, before paint.
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
  }, []);
  const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const root = document.documentElement;
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    // Briefly disabling overflow stops any in-progress momentum scroll (iOS Safari)
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    toTop();
    const raf = requestAnimationFrame(() => {
      root.style.overflow = prevOverflow;
      toTop();
    });
    return () => {
      cancelAnimationFrame(raf);
      root.style.overflow = prevOverflow;
    };
  }, [currentRoute]);

  // Auth helpers
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    if (!supabase) sessionStorage.setItem('jh_is_admin', 'true');
  };

  const handleLogout = async () => {
    setIsAdmin(false);
    sessionStorage.removeItem('jh_is_admin');
    if (supabase) await supabase.auth.signOut();
  };

  const openAdmin = () => {
    setEditingItemInitial(null);
    setAdminModalOpen(true);
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItemInitial(item);
    setAdminModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await PortfolioStorage.deleteItem(id);
    await loadData();
    // If we're currently on the deleted item's page, redirect to home
    if (currentRoute.page === 'item' && currentRoute.itemId === id) {
      navigateTo({ page: 'home' });
    }
  };

  // Template selection: ?template= preview > saved choice > default
  const template = resolveTemplate(profile.template);
  const Template = template.component;
  const isPreview = getPreviewTemplateId() !== null;

  return (
    <>
      <Suspense fallback={<div style={{ padding: '160px 20px', textAlign: 'center', opacity: 0.5 }}>Loading…</div>}>
      <Template
        profile={profile}
        categories={categories}
        items={items}
        route={currentRoute}
        isAdmin={isAdmin}
        loading={loading}
        loadError={loadError}
        onRetry={() => {
          setLoading(true);
          loadData();
        }}
        onOpenAdmin={openAdmin}
        onEditItem={handleEditItem}
        onDeleteItem={handleDeleteItem}
      />
      </Suspense>

      {/* Template preview banner (shown only with ?template=) */}
      {isPreview && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-2 rounded-full bg-black/85 text-white text-xs shadow-lg backdrop-blur">
          <span>
            Preview: <strong>{template.name}</strong>
          </span>
          <a href={exitPreviewUrl()} className="underline underline-offset-2 hover:text-amber-300">
            Exit preview
          </a>
        </div>
      )}

      {/* Admin Management Modal (shared by all templates) */}
      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          setEditingItemInitial(null);
        }}
        isAdmin={isAdmin}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        categories={categories}
        items={items}
        onDataChanged={loadData}
        editingItemInitial={editingItemInitial}
      />
    </>
  );
}
