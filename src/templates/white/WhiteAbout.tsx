import React from 'react';
import { TemplateProps } from '../types';
import { PORTRAIT_IMAGE, SWIMMING_IMAGE } from '../../services/storage';
import { Lines, Media, pad2, isLong, AdminTools } from './shared';

export const WhiteAbout: React.FC<TemplateProps> = ({ profile, isAdmin, onOpenAdmin }) => {
  const w = profile.white || {};
  const heroTitle = w.aboutHeroTitle || profile.subtitle;
  const meta = [profile.title, profile.location, profile.graduationYear && `Class of ${profile.graduationYear}`]
    .filter(Boolean)
    .join(' · ');
  const pillars = profile.pillars || [];
  const metrics = (profile.metrics || []).filter((m) => m.value || m.label);

  return (
    <>
      <section className="tw-page-hero tw-dark">
        <p className="tw-eyebrow">About {profile.name}</p>
        <h1 className={`tw-reveal ${isLong(heroTitle, 30) ? 'tw-long' : ''}`}>
          <Lines text={heroTitle} />
        </h1>
        <p className="tw-hero-meta">{meta}</p>
        <AdminTools isAdmin={isAdmin}>
          <button onClick={onOpenAdmin}>Edit content</button>
        </AdminTools>
      </section>

      <section className="tw-section">
        <div className="tw-split tw-reveal">
          <div>
            <h2 className="tw-h2">
              <Lines text={w.whoTitle || 'Who I am.'} />
            </h2>
            <Media
              src={profile.portraitImage || PORTRAIT_IMAGE}
              alt={profile.name}
              className="tw-feature-photo"
              style={{ marginTop: 48 }}
            />
          </div>
          <div>
            {profile.intro && <p className="tw-lead">{profile.intro}</p>}
            {[profile.bio, profile.bioGolf, profile.bioSwim].filter(Boolean).map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        </div>
      </section>

      {pillars.length > 0 && (
        <section className="tw-section tw-dark">
          <div className="tw-label">My world</div>
          <div className="tw-interest-list">
            {pillars.map((p, i) => (
              <div key={p.id || i} className="tw-reveal">
                <span>{pad2(i + 1)}</span>
                <h3>{p.title}</h3>
                {p.tags && <p style={{ fontSize: 11, letterSpacing: '0.1em' }}>{p.tags}</p>}
                <p>{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {metrics.length > 0 && (
        <section className="tw-section">
          <div className="tw-label">Highlights</div>
          <div className="tw-award-row">
            {metrics.map((m, i) => (
              <div key={i}>
                <span>{m.label}</span>
                <h3>{m.value}</h3>
                {m.sublabel && <p>{m.sublabel}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.swimmingImage && (
        <section className="tw-section" style={{ paddingTop: 0 }}>
          <Media
            src={profile.swimmingImage || SWIMMING_IMAGE}
            alt={profile.swimmingCaption || profile.name}
            className="tw-cover tw-reveal"
          />
          {(profile.swimmingCaption || profile.swimmingCaptionValue) && (
            <p className="tw-label" style={{ marginTop: 18, marginBottom: 0 }}>
              {[profile.swimmingCaption, profile.swimmingCaptionValue].filter(Boolean).join(' · ')}
            </p>
          )}
        </section>
      )}

      {w.aboutQuote && (
        <section className="tw-section">
          <div className="tw-label">A note from me</div>
          <blockquote className="tw-quote tw-reveal">“{w.aboutQuote}”</blockquote>
        </section>
      )}
    </>
  );
};
