import React from 'react';
import { PortfolioItem, Submenu } from '../../types/portfolio';
import { TemplateProps } from '../types';
import { href, Lines, Media, pad2, isTimelineCategory, sortForTimeline, AdminTools } from './shared';

interface Props extends TemplateProps {
  categoryId: string;
  submenuId?: string;
}

const ItemCards: React.FC<{ items: PortfolioItem[] }> = ({ items }) => (
  <div className="tw-story-grid cols-auto" style={{ marginTop: 50 }}>
    {items.map((item, i) => (
      <a
        key={item.id}
        href={href({ page: 'item', itemId: item.id })}
        className={`tw-story-card ${item.coverImage ? 'image' : ''}`}
        style={{ minHeight: 360 }}
      >
        {item.coverImage && <img src={item.coverImage} alt="" loading="lazy" referrerPolicy="no-referrer" />}
        {!item.coverImage && <span className="tw-card-nophoto">No photo</span>}
        <div className="tw-card-num">
          {pad2(i + 1)}
          {item.date ? ` · ${item.date}` : ''}
        </div>
        <h3 style={{ fontSize: 30 }}>{item.title}</h3>
        <div>
          {item.subtitle && <p style={{ marginBottom: 12 }}>{item.subtitle}</p>}
          <span className="tw-card-cta">View ↗</span>
        </div>
      </a>
    ))}
  </div>
);

export const WhiteCategory: React.FC<Props> = ({ categories, items, categoryId, submenuId, isAdmin, onOpenAdmin }) => {
  const category = categories.find((c) => c.id === categoryId) || categories[0];
  if (!category) {
    return (
      <section className="tw-section">
        <div className="tw-empty">
          <h2>Nothing here yet.</h2>
        </div>
      </section>
    );
  }

  const submenu = category.submenus.find((s) => s.id === submenuId);
  const categoryItems = items.filter((i) => i.categoryId === category.id && (!submenu || i.submenuId === submenu.id));

  // Hero text: a short description reads well as the big headline (sample: "Competing against myself.")
  const heroSource = submenu ? submenu.description : category.description;
  const heroIsHeadline = !!heroSource && heroSource.length <= 60;
  const heroTitle = heroIsHeadline ? heroSource : submenu?.name || category.label;
  const heroMeta = heroIsHeadline
    ? submenu
      ? submenu.name
      : category.submenus.map((s) => s.name).join(' · ')
    : heroSource || category.submenus.map((s) => s.name).join(' · ');

  const hero = (
    <section className="tw-page-hero tw-dark">
      <p className="tw-eyebrow">
        {submenu ? (
          <>
            <a href={href({ page: 'category', categoryId: category.id })}>{category.label}</a> · {submenu.name}
          </>
        ) : (
          category.label
        )}
      </p>
      <h1 className={`tw-reveal ${heroTitle.length > 40 ? 'tw-long' : ''}`}>
        <Lines text={heroTitle} />
      </h1>
      {heroMeta && <p className="tw-hero-meta">{heroMeta}</p>}
      <AdminTools isAdmin={isAdmin}>
        <button onClick={onOpenAdmin}>Add / edit items</button>
      </AdminTools>
    </section>
  );

  if (categoryItems.length === 0) {
    return (
      <>
        {hero}
        <section className="tw-section">
          <div className="tw-empty">
            <span className="tw-label">Coming soon</span>
            <h2>New stories are on the way.</h2>
            <p>Please check back soon.</p>
          </div>
        </section>
      </>
    );
  }

  // Journey: timeline view
  if (isTimelineCategory(category)) {
    return (
      <>
        {hero}
        <section className="tw-section tw-timeline">
          {sortForTimeline(categoryItems).map((item) => (
            <div className="tw-timeline-item" key={item.id}>
              <span>{item.date}</span>
              <div>
                <a href={href({ page: 'item', itemId: item.id })}>
                  <h2>{item.title}</h2>
                </a>
                {(item.summary || item.subtitle) && <p>{item.summary || item.subtitle}</p>}
              </div>
            </div>
          ))}
        </section>
      </>
    );
  }

  // Default: one section per sub-menu (alternating light feature / dark block)
  const groups: { sub?: Submenu; items: PortfolioItem[] }[] = submenu
    ? [{ sub: submenu, items: categoryItems }]
    : [
        ...category.submenus
          .map((sub) => ({ sub, items: categoryItems.filter((i) => i.submenuId === sub.id) }))
          .filter((g) => g.items.length > 0),
        ...(() => {
          const known = new Set(category.submenus.map((s) => s.id));
          const rest = categoryItems.filter((i) => !known.has(i.submenuId));
          return rest.length ? [{ items: rest }] : [];
        })()
      ];

  return (
    <>
      {hero}
      {groups.map((g, idx) => {
        const name = g.sub?.name || 'More';
        const label = `${pad2(idx + 1)} / ${name}`;
        const lead = g.items.find((i) => i.coverImage);
        // Key results: the photo item's results, otherwise the first item in this sub-menu that has any
        const statsItem =
          (lead?.highlights?.length ? lead : undefined) || g.items.find((i) => i.highlights && i.highlights.length > 0);
        const dark = idx % 2 === 1; // alternate background for rhythm
        const flip = idx % 2 === 1; // and the photo side

        const section = (
          <section className="tw-section" key={dark ? undefined : g.sub?.id || 'rest'}>
            <div className={`tw-feature tw-reveal ${flip ? 'flip' : ''}`}>
              <Media className="tw-feature-photo" src={lead?.coverImage} alt={name} />
              <div>
                <p className="tw-label">{label}</p>
                <h2 className="tw-h2">
                  <Lines text={name} />
                </h2>
                {g.sub?.description && (
                  <p className="tw-lead" style={{ marginTop: 28 }}>
                    {g.sub.description}
                  </p>
                )}
                {statsItem && (
                  <ul className="tw-stat-list" aria-label="Key results">
                    {statsItem.highlights.map((h) => (
                      <li key={h.id}>
                        <b>{h.value}</b>
                        <span>{h.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <ItemCards items={g.items} />
          </section>
        );

        return dark ? (
          <div className="tw-dark-wrap" key={g.sub?.id || 'rest'}>
            {section}
          </div>
        ) : (
          section
        );
      })}
    </>
  );
};
