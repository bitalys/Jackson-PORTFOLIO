import React, { useState, useEffect } from 'react';
import { Category, PortfolioItem, SiteProfile } from './types/portfolio';
import { PortfolioStorage, DEFAULT_PROFILE } from './services/storage';
import { supabase } from './lib/supabase';
import { AppRoute, parseHash, navigateTo } from './utils/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CategorySubPage } from './pages/CategorySubPage';
import { ItemThirdPage } from './pages/ItemThirdPage';
import { AboutSubPage } from './pages/AboutSubPage';
import { ContactSubPage } from './pages/ContactSubPage';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AdminModal } from './components/AdminModal';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Multi-Page Routing state from URL hash
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    parseHash(window.location.hash)
  );

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

  // Modal Lightbox state (for popup preview)
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

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
    const handleHashChange = () => {
      const parsed = parseHash(window.location.hash);
      setCurrentRoute(parsed);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Card Actions
  const handleEditItem = (item: PortfolioItem) => {
    setEditingItemInitial(item);
    setAdminModalOpen(true);
  };

  const handleDeleteItem = async (id: string) => {
    await PortfolioStorage.deleteItem(id);
    await loadData();
    if (activeModalItem?.id === id) {
      setActiveModalItem(null);
    }
    // If we're currently on the deleted item's third-page, redirect to home
    if (currentRoute.page === 'item' && currentRoute.itemId === id) {
      navigateTo({ page: 'home' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Multi-Page Header */}
      <Header
        categories={categories}
        currentRoute={currentRoute}
        isAdmin={isAdmin}
        onOpenAdmin={() => {
          setEditingItemInitial(null);
          setAdminModalOpen(true);
        }}
      />

      {/* Main Multi-Page Content Views */}
      <main className="flex-1">
        {loading ? (
          <div className="py-32 text-center text-neutral-500 text-sm">
            Loading portfolio...
          </div>
        ) : loadError ? (
          <div className="py-32 px-4 text-center space-y-4">
            <p className="text-neutral-300 text-sm">We couldn't load the portfolio. Please try again in a moment.</p>
            <p className="text-neutral-500 text-xs break-words">{loadError}</p>
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-md bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            >
              Try Again
            </button>
          </div>
        ) : currentRoute.page === 'home' ? (
          /* Level 1: Main Home Page */
          <HomePage
            profile={profile}
            categories={categories}
            items={items}
            onOpenModal={(item) => setActiveModalItem(item)}
            isAdmin={isAdmin}
            onOpenAdmin={() => {
              setEditingItemInitial(null);
              setAdminModalOpen(true);
            }}
          />
        ) : currentRoute.page === 'category' ? (
          /* Level 2: Dedicated Category Sub-Page (서브 페이지) */
          <CategorySubPage
            categoryId={currentRoute.categoryId}
            submenuId={currentRoute.submenuId}
            categories={categories}
            items={items}
            isAdmin={isAdmin}
            onOpenModal={(item) => setActiveModalItem(item)}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onOpenAdmin={() => {
              setEditingItemInitial(null);
              setAdminModalOpen(true);
            }}
          />
        ) : currentRoute.page === 'item' ? (
          /* Level 3: Dedicated Third-Page (서드 페이지) */
          <ItemThirdPage
            itemId={currentRoute.itemId}
            items={items}
            categories={categories}
            isAdmin={isAdmin}
            onEditItem={handleEditItem}
            onOpenModal={(item) => setActiveModalItem(item)}
          />
        ) : currentRoute.page === 'about' ? (
          /* Dedicated About Sub-Page */
          <AboutSubPage profile={profile} />
        ) : currentRoute.page === 'contact' ? (
          /* Dedicated Contact Sub-Page */
          <ContactSubPage profile={profile} />
        ) : null}
      </main>

      {/* Global Footer */}
      <Footer
        profile={profile}
        isAdmin={isAdmin}
        onOpenAdmin={() => {
          setEditingItemInitial(null);
          setAdminModalOpen(true);
        }}
      />

      {/* Quick Lightbox Popup Modal (팝업 연결 구조) */}
      <ItemDetailModal
        item={activeModalItem}
        items={items}
        categories={categories}
        onClose={() => setActiveModalItem(null)}
        onNavigateItem={(item) => setActiveModalItem(item)}
        isAdmin={isAdmin}
        onEditItem={(item) => {
          setActiveModalItem(null);
          handleEditItem(item);
        }}
      />

      {/* Admin Management Modal */}
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
    </div>
  );
}
