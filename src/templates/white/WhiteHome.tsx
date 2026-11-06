import React from 'react';
import { TemplateProps } from '../types';
import { PORTRAIT_IMAGE } from '../../services/storage';
import { href, Lines, Media, pad2, isLong } from './shared';

export const WhiteHome: React.FC<TemplateProps> = ({ profile, categories, items, isAdmin, onOpenAdmin }) => {
  const w = profile.white || {};
  const heroTitle = w.heroTitle || profile.subtitle;
  const featured = items.filter((i) => i.featured).slice(0, 3);
  const stories = featured.length > 0 ? featured : items.slice(0, 3);
  const pillars = profile.pillars || [];
  const topMetric = profile.metrics?.[0];

  return (
    <>
      {/* Hero */}
      <section className="tw-hero tw-dark">
        <div className="tw-hero-copy tw-reveal">
          <p className="tw-eyebrow">{profile.name}</p>
          <h1 className={isLong(heroTitle, 28) ? 'tw-long' : ''}>
            <Lines text={heroTitle} />
          </h1>
          <p className="tw-hero-sub">{w.heroTagline || profile.title}</p>
          <a className="tw-button light" href={href({ page: 'about' })}>
            {w.heroButton || 'Explore my journey'} <span>↗</span>
          </a>
          {isAdmin && (
            <div className="tw-admin-bar">
              <button onClick={onOpenAdmin}>Edit content</button>
            </div>
          )}
        </div>
        <Media className="tw-hero-visual" src={profile.portraitImage || PORTRAIT_IMAGE} alt={profile.name} />
      </section>

      {/* 01 Who I am */}
      <section className="tw-section tw-reveal">
        <div className="tw-label">01 / Who I am</div>
        <div className="tw-split">
          <h2 className="tw-h2">
            <Lines text={w.whoTitle || 'Who I am.'} />
          </h2>
          <div>
            {profile.intro && <p className="tw-lead">{profile.intro}</p>}
            {profile.bio && <p>{profile.bio}</p>}
            <a className="tw-text-link" href={href({ page: 'about' })}>
              About {profile.name.split(' ')[0]} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* 02 My world (pillars) */}
      {pillars.length > 0 && (
        <section className="tw-section tw-dark">
          <div className="tw-label">02 / My world</div>
          <div className="tw-quad tw-reveal">
            {pillars.slice(0, 4).map((p, i) => (
              <article key={p.id || i}>
                <span>{pad2(i + 1)}</span>
                <h3>{p.title}</h3>
                {p.tags && <p>{p.tags}</p>}
                <small>{p.description}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* 03 Featured stories */}
      {stories.length > 0 && (
        <section className="tw-section">
          <div className="tw-label">03 / Featured stories</div>
          <h2 className="tw-stories-title tw-reveal">
            <Lines text={w.storiesTitle || 'Selected\nwork.'} />
          </h2>
          <div className="tw-story-grid">
            {stories.map((item, i) => {
              const withImage = i > 0 && !!item.coverImage;
              return (
                <a
                  key={item.id}
                  href={href({ page: 'item', itemId: item.id })}
                  className={`tw-story-card ${withImage ? 'image' : ''}`}
                >
                  {withImage && <img src={item.coverImage} alt="" loading="lazy" referrerPolicy="no-referrer" />}
                  <div className="tw-card-num">{pad2(i + 1)}</div>
                  <h3>{item.title}</h3>
                  <div>
                    {item.subtitle && <p style={{ marginBottom: 12 }}>{item.subtitle}</p>}
                    <span className="tw-card-cta">Read more ↗</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* 04 Featured achievement (first metric) */}
      {topMetric && topMetric.value && (
        <section className="tw-section tw-dark tw-achievement">
          <div className="tw-label">04 / Featured achievement</div>
          <div className="tw-achievement-number tw-reveal">{topMetric.value}</div>
          <div className="tw-metric">{topMetric.label}</div>
          <div className="tw-achievement-copy">
            <h2 className="tw-h2">
              <Lines text={w.achievementTitle || 'Proudest\nmoment.'} />
            </h2>
            {topMetric.sublabel && <p>{topMetric.sublabel}</p>}
          </div>
        </section>
      )}

      {/* 05 Explore categories */}
      {categories.length > 0 && (
        <section className="tw-section">
          <div className="tw-label">05 / Explore</div>
          <div className="tw-split tw-reveal">
            <h2 className="tw-h2">
              <Lines text={w.exploreTitle || 'Explore\nmy work.'} />
            </h2>
            <div>{w.exploreText && <p className="tw-lead">{w.exploreText}</p>}</div>
          </div>
          <div className="tw-strip">
            {categories.map((c) => (
              <a key={c.id} href={href({ page: 'category', categoryId: c.id })}>
                <b>{c.label}</b>
                <span>{c.submenus.map((s) => s.name).join(' · ') || c.description}</span>
                <span>↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 06 What's next */}
      {(w.nextTitle || w.nextText) && (
        <section className="tw-next tw-dark">
          <div className="tw-label">06 / What's next?</div>
          <h2 className="tw-reveal">
            <Lines text={w.nextTitle} />
          </h2>
          {w.nextText && <p>{w.nextText}</p>}
          <a className="tw-button light" href={href({ page: 'contact' })}>
            Get in touch <span>↗</span>
          </a>
        </section>
      )}
    </>
  );
};
