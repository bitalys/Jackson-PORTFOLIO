import React, { useState } from 'react';
import { PortfolioItem } from '../../types/portfolio';
import { TemplateProps } from '../types';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { HomePage } from '../../pages/HomePage';
import { CategorySubPage } from '../../pages/CategorySubPage';
import { ItemThirdPage } from '../../pages/ItemThirdPage';
import { AboutSubPage } from '../../pages/AboutSubPage';
import { ContactSubPage } from '../../pages/ContactSubPage';
import { ItemDetailModal } from '../../components/ItemDetailModal';

/** Classic (기본) 템플릿: 어두운 배경 + 앰버 포인트의 기존 디자인 */
export const ClassicTemplate: React.FC<TemplateProps> = ({
  profile,
  categories,
  items,
  route,
  isAdmin,
  loading,
  loadError,
  onRetry,
  onOpenAdmin,
  onEditItem,
  onDeleteItem
}) => {
  // Quick lightbox popup (Classic 전용 기능)
  const [activeModalItem, setActiveModalItem] = useState<PortfolioItem | null>(null);

  const handleDeleteItem = async (id: string) => {
    await onDeleteItem(id);
    if (activeModalItem?.id === id) setActiveModalItem(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Header categories={categories} currentRoute={route} isAdmin={isAdmin} onOpenAdmin={onOpenAdmin} />

      <main className="flex-1">
        {loading ? (
          <div className="py-32 text-center text-neutral-500 text-sm">Loading portfolio...</div>
        ) : loadError ? (
          <div className="py-32 px-4 text-center space-y-4">
            <p className="text-neutral-300 text-sm">We couldn't load the portfolio. Please try again in a moment.</p>
            <p className="text-neutral-500 text-xs break-words">{loadError}</p>
            <button
              onClick={onRetry}
              className="cursor-pointer px-4 py-2 text-xs font-semibold rounded-md bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            >
              Try Again
            </button>
          </div>
        ) : route.page === 'home' ? (
          <HomePage
            profile={profile}
            categories={categories}
            items={items}
            onOpenModal={setActiveModalItem}
            isAdmin={isAdmin}
            onOpenAdmin={onOpenAdmin}
          />
        ) : route.page === 'category' ? (
          <CategorySubPage
            categoryId={route.categoryId}
            submenuId={route.submenuId}
            categories={categories}
            items={items}
            isAdmin={isAdmin}
            onOpenModal={setActiveModalItem}
            onEditItem={onEditItem}
            onDeleteItem={handleDeleteItem}
            onOpenAdmin={onOpenAdmin}
          />
        ) : route.page === 'item' ? (
          <ItemThirdPage
            itemId={route.itemId}
            items={items}
            categories={categories}
            isAdmin={isAdmin}
            onEditItem={onEditItem}
            onOpenModal={setActiveModalItem}
          />
        ) : route.page === 'about' ? (
          <AboutSubPage profile={profile} />
        ) : route.page === 'contact' ? (
          <ContactSubPage profile={profile} />
        ) : null}
      </main>

      <Footer profile={profile} isAdmin={isAdmin} onOpenAdmin={onOpenAdmin} />

      <ItemDetailModal
        item={activeModalItem}
        items={items}
        categories={categories}
        onClose={() => setActiveModalItem(null)}
        onNavigateItem={setActiveModalItem}
        isAdmin={isAdmin}
        onEditItem={(item) => {
          setActiveModalItem(null);
          onEditItem(item);
        }}
      />
    </div>
  );
};

export default ClassicTemplate;
