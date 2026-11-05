import React from 'react';
import { ArrowUp, Lock, Unlock } from 'lucide-react';
import { SiteProfile } from '../types/portfolio';
import { navigateTo } from '../utils/router';

interface FooterProps {
  profile: SiteProfile;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  profile,
  isAdmin,
  onOpenAdmin
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 py-12 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-900">
          {/* Brand & Subtitle */}
          <div className="text-center md:text-left space-y-1">
            <button
              onClick={() => navigateTo({ page: 'home' })}
              className="cursor-pointer font-['Outfit'] font-bold text-lg text-white hover:text-amber-400 transition-colors tracking-tight"
            >
              {profile.name}
            </button>
            <p className="text-neutral-400 text-xs">
              Competitive Golf & Swimming · STEM Research · Student Leadership
            </p>
          </div>

          {/* Clean Navigation Links to Sub-pages */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300">
            <button
              onClick={() => navigateTo({ page: 'home' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo({ page: 'category', categoryId: 'athletics' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Athletics (Golf & Swim)
            </button>
            <button
              onClick={() => navigateTo({ page: 'category', categoryId: 'academics' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Academics
            </button>
            <button
              onClick={() => navigateTo({ page: 'category', categoryId: 'leadership' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Leadership
            </button>
            <button
              onClick={() => navigateTo({ page: 'about' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              About
            </button>
            <button
              onClick={() => navigateTo({ page: 'contact' })}
              className="cursor-pointer hover:text-white transition-colors"
            >
              Contact
            </button>
            <button
              onClick={onOpenAdmin}
              className="cursor-pointer text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              {isAdmin ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>{isAdmin ? '관리자 모드 활성화됨' : '관리자 로그인 (CMS)'}</span>
            </button>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="cursor-pointer p-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 transition-colors"
            title="맨 위로 이동 (Back to Top)"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Quiet copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-400 text-[11px]">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            <span>Portfolio Multi-Tier Architecture</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-neutral-400">Class of 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
