import React, { useEffect, useRef, useState } from 'react';
import './white.css';
import { TemplateProps } from '../types';
import { href, initials, Lines } from './shared';
import { WhiteHome } from './WhiteHome';
import { WhiteCategory } from './WhiteCategory';
import { WhiteItem } from './WhiteItem';
import { WhiteAbout } from './WhiteAbout';
import { WhiteContact } from './WhiteContact';

const FONT_LINK_ID = 'tw-fonts';

/** White 템플릿에서만 쓰는 글꼴(Playfair Display, DM Sans)을 필요할 때만 불러옵니다. */
function useTemplateFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@500;600&display=swap';
    document.head.appendChild(link);
  }, []);
}

/** 상단 스크롤 진행 막대 */
function useScrollProgress(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref]);
}

/** 스크롤하면 섹션이 부드럽게 올라오는 효과 (화면에 들어올 때 한 번) */
function useReveal(rootRef: React.RefObject<HTMLDivElement | null>, deps: unknown[]) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('tw-in-view');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    root
      .querySelectorAll('.tw-reveal, .tw-story-card, .tw-timeline-item, .tw-award-row > div')
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** White (Editorial) 템플릿 */
export const WhiteTemplate: React.FC<TemplateProps> = (props) => {
  const { profile, categories, route, isAdmin, loading, loadError, onRetry, onOpenAdmin } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const w = profile.white || {};

  useTemplateFonts();
  useScrollProgress(progressRef);
  useReveal(rootRef, [route, loading, props.items, categories]);

  useEffect(() => setMenuOpen(false), [route]);

  const isActive = (page: string, categoryId?: string) =>
    route.page === page && (!categoryId || (route.page === 'category' && route.categoryId === categoryId));

  let page: React.ReactNode;
  if (loading) {
    page = <div className="tw-status tw-label">Loading…</div>;
  } else if (loadError) {
    page = (
      <div className="tw-status">
        <p className="tw-lead" style={{ margin: '0 auto 16px' }}>
          We couldn't load the portfolio. Please try again in a moment.
        </p>
        <p style={{ color: 'var(--tw-muted)', fontSize: 12 }}>{loadError}</p>
        <button className="tw-button" onClick={onRetry} style={{ margin: '20px auto 0' }}>
          Try again <span>↻</span>
        </button>
      </div>
    );
  } else if (route.page === 'category') {
    page = <WhiteCategory {...props} categoryId={route.categoryId} submenuId={route.submenuId} />;
  } else if (route.page === 'item') {
    page = <WhiteItem {...props} itemId={route.itemId} />;
  } else if (route.page === 'about') {
    page = <WhiteAbout {...props} />;
  } else if (route.page === 'contact') {
    page = <WhiteContact {...props} />;
  } else {
    page = <WhiteHome {...props} />;
  }

  return (
    <div className="tw" ref={rootRef}>
      <div className="tw-progress" ref={progressRef} />

      <header className="tw-header">
        <a className="tw-brand" href={href({ page: 'home' })} aria-label="Home">
          {initials(profile.name)}
          <span>.</span>
        </a>
        <button
          className="tw-menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'CLOSE' : 'MENU'}
        </button>
        <nav className={`tw-nav ${menuOpen ? 'open' : ''}`}>
          <a href={href({ page: 'about' })} className={isActive('about') ? 'active' : ''}>
            About
          </a>
          {categories.map((c) => (
            <a
              key={c.id}
              href={href({ page: 'category', categoryId: c.id })}
              className={isActive('category', c.id) ? 'active' : ''}
            >
              {c.label}
            </a>
          ))}
          <a href={href({ page: 'contact' })} className={isActive('contact') ? 'active' : ''}>
            Contact
          </a>
          {isAdmin && (
            <button className="tw-admin-pill" onClick={onOpenAdmin}>
              Admin
            </button>
          )}
        </nav>
      </header>

      <main>{page}</main>

      {/* Closing statement (sample: KEEP EXPLORING.) */}
      {!loading && !loadError && route.page !== 'contact' && (
        <section className="tw-final">
          <p className="tw-eyebrow">{profile.name}</p>
          <h2 className="tw-reveal">
            <Lines text={w.closingTitle || "Let's\nconnect."} />
          </h2>
          {w.closingText && <p>{w.closingText}</p>}
          <div className="tw-final-links">
            <a href={href({ page: 'contact' })}>CONTACT ↗</a>
            <a href={href({ page: 'about' })}>ABOUT ↗</a>
          </div>
        </section>
      )}

      <footer className="tw-footer">
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <span>{profile.title}</span>
          <button onClick={onOpenAdmin}>{isAdmin ? 'Admin Mode' : 'Admin Login'}</button>
        </span>
      </footer>
    </div>
  );
};

export default WhiteTemplate;
