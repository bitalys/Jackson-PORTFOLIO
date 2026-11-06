import React, { useState } from 'react';
import { Lock, Unlock, Menu, X, ChevronDown } from 'lucide-react';
import { Category } from '../types/portfolio';
import { AppRoute, navigateTo } from '../utils/router';

interface HeaderProps {
  categories: Category[];
  currentRoute: AppRoute;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  categories,
  currentRoute,
  isAdmin,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Check if a category is currently active
  const isCategoryActive = (categoryId: string) => {
    return currentRoute.page === 'category' && currentRoute.categoryId === categoryId;
  };

  // Navigate to About section on Home
  const handleAboutClick = () => {
    if (currentRoute.page === 'home') {
      const el = document.getElementById('about');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigateTo({ page: 'home' });
      setTimeout(() => {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Navigate to Contact section on Home
  const handleContactClick = () => {
    if (currentRoute.page === 'home') {
      const el = document.getElementById('contact');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigateTo({ page: 'home' });
      setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => {
            navigateTo({ page: 'home' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left group cursor-pointer"
        >
          <span className="font-['Outfit'] text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap shrink-0">
            JACKSON HONG
          </span>
          <span className="block text-[11px] font-medium tracking-widest text-neutral-400 uppercase -mt-0.5">
            Scholar · Athlete Portfolio
          </span>
        </button>

        {/* Zone 2: Navigation Links (Multi-Page Navigation with Submenu Dropdowns) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
          {/* Home Link */}
          <button
            onClick={() => navigateTo({ page: 'home' })}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
              currentRoute.page === 'home'
                ? 'text-white border-amber-400 font-semibold'
                : 'border-transparent hover:text-white'
            }`}
          >
            Home
          </button>

          {/* Categories with Dropdown menus */}
          {categories.map((cat) => {
            const active = isCategoryActive(cat.id);
            const isOpen = activeDropdown === cat.id;

            return (
              <div
                key={cat.id}
                className="relative"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => navigateTo({ page: 'category', categoryId: cat.id })}
                  className={`cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 ${
                    active
                      ? 'text-white border-amber-400 font-semibold'
                      : 'border-transparent hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.submenus.length > 0 && (
                    <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Submenu Dropdown */}
                {cat.submenus.length > 0 && isOpen && (
                  <div className="absolute left-0 top-full pt-2 w-56 z-50">
                    <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-1">
                      <button
                        onClick={() => {
                          navigateTo({ page: 'category', categoryId: cat.id });
                          setActiveDropdown(null);
                        }}
                        className="cursor-pointer w-full text-left px-3 py-2 text-xs font-semibold rounded-lg text-amber-400 hover:bg-neutral-800 transition-colors flex items-center justify-between"
                      >
                        <span>All {cat.label}</span>
                        <span className="text-[10px] text-neutral-500">→</span>
                      </button>

                      <div className="border-t border-neutral-800 my-1" />

                      {cat.submenus.map((sub) => {
                        const isSubActive =
                          currentRoute.page === 'category' &&
                          currentRoute.categoryId === cat.id &&
                          currentRoute.submenuId === sub.id;

                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              navigateTo({ page: 'category', categoryId: cat.id, submenuId: sub.id });
                              setActiveDropdown(null);
                            }}
                            className={`cursor-pointer w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                              isSubActive
                                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                                : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                            }`}
                          >
                            <span>{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* About Link - navigates to Home's About section */}
          <button
            onClick={handleAboutClick}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 border-transparent text-neutral-300 hover:text-white hover:border-amber-400"
          >
            About
          </button>

          {/* Contact Link - navigates to Home's Contact section */}
          <button
            onClick={handleContactClick}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors pb-1 border-b-2 border-transparent text-neutral-300 hover:text-white hover:border-amber-400"
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAdmin}
            className={`cursor-pointer flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white'
            }`}
            title="Admin Page"
          >
            {isAdmin ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Mode</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </>
            )}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-md border border-neutral-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-neutral-950 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              navigateTo({ page: 'home' });
              setMobileMenuOpen(false);
            }}
            className={`block w-full text-left px-3 py-2 text-sm rounded ${
              currentRoute.page === 'home' ? 'bg-neutral-800 text-amber-400 font-semibold' : 'text-neutral-300'
            }`}
          >
            Home
          </button>

          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1 pl-1">
              <button
                onClick={() => {
                  navigateTo({ page: 'category', categoryId: cat.id });
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 text-sm font-semibold rounded ${
                  isCategoryActive(cat.id) ? 'bg-neutral-800 text-amber-400' : 'text-white'
                }`}
              >
                {cat.label}
              </button>

              <div className="pl-4 space-y-1 border-l border-neutral-800">
                {cat.submenus.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      navigateTo({ page: 'category', categoryId: cat.id, submenuId: sub.id });
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-2 py-1.5 text-xs text-neutral-400 hover:text-white rounded"
                  >
                    · {sub.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-neutral-800 flex gap-2">
            <button
              onClick={() => {
                handleAboutClick();
                setMobileMenuOpen(false);
              }}
              className="flex-1 text-center py-2 text-sm text-neutral-300 hover:text-white bg-neutral-900 rounded transition-colors"
            >
              About
            </button>
            <button
              onClick={() => {
                handleContactClick();
                setMobileMenuOpen(false);
              }}
              className="flex-1 text-center py-2 text-sm text-neutral-300 hover:text-white bg-neutral-900 rounded transition-colors"
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
