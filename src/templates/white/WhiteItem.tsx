import React, { useState } from 'react';
import { TemplateProps } from '../types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { navigateTo } from '../../utils/router';
import { href, Lines, Media, categoryLabel, youtubeEmbed, AdminTools } from './shared';

interface Props extends TemplateProps {
  itemId: string;
}

export const WhiteItem: React.FC<Props> = ({ items, categories, itemId, isAdmin, onEditItem, onDeleteItem }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const item = items.find((i) => i.id === itemId);

  if (!item) {
    return (
      <section className="tw-section">
        <div className="tw-empty">
          <span className="tw-label">Not found</span>
          <h2>This story is no longer available.</h2>
          <a className="tw-text-link" href={href({ page: 'home' })}>
            Back to home ↗
          </a>
        </div>
      </section>
    );
  }

  const category = categories.find((c) => c.id === item.categoryId);
  const embed = item.mediaType !== 'image' ? youtubeEmbed(item) : null;
  const gallery = (item.galleryImages || []).filter((g) => g && g !== item.coverImage);
  const related = items.filter((i) => i.categoryId === item.categoryId && i.id !== item.id).slice(0, 3);
  const paragraphs = (item.details || '').split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <section className="tw-page-hero tw-dark">
        <p className="tw-eyebrow">
          {category ? (
            <a
              href={href({ page: 'category', categoryId: item.categoryId, submenuId: item.submenuId || undefined })}
            >
              {categoryLabel(categories, item)}
            </a>
          ) : (
            categoryLabel(categories, item)
          )}
          {item.date ? ` · ${item.date}` : ''}
        </p>
        <h1 className={`tw-reveal ${item.title.length > 40 ? 'tw-long' : ''}`}>
          <Lines text={item.title} />
        </h1>
        {item.subtitle && <p className="tw-hero-meta">{item.subtitle}</p>}
        <AdminTools isAdmin={isAdmin}>
          <button onClick={() => onEditItem(item)}>Edit</button>
          <button onClick={() => setConfirmOpen(true)}>Delete</button>
        </AdminTools>
      </section>

      <section className="tw-section">
        {embed ? (
          <div className="tw-video tw-reveal">
            <iframe
              src={embed}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : (
          item.coverImage && <Media className="tw-reveal tw-cover" src={item.coverImage} alt={item.title} />
        )}

        <div className="tw-split" style={{ marginTop: 90 }}>
          <div>
            <p className="tw-label">Overview</p>
            {item.summary && <p className="tw-lead">{item.summary}</p>}
          </div>
          <div className="tw-article-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {item.highlights && item.highlights.length > 0 && (
              <div className="tw-stats">
                {item.highlights.map((h) => (
                  <div key={h.id}>
                    <b>{h.value}</b>
                    <span>{h.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="tw-meta-row">
              {item.externalLink && (
                <a className="tw-button" href={item.externalLink} target="_blank" rel="noreferrer">
                  {item.externalLinkLabel || 'Official link'} <span>↗</span>
                </a>
              )}
              {item.youtubeVideoId && (
                <a
                  className="tw-button"
                  href={`https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube <span>↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 && (
        <section className="tw-section" style={{ paddingTop: 0 }}>
          <p className="tw-label">Gallery</p>
          <div className="tw-gallery">
            {gallery.map((g, i) => (
              <a key={i} href={g} target="_blank" rel="noreferrer">
                <Media src={g} alt={`${item.title} photo ${i + 1}`} />
              </a>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="tw-section" style={{ paddingTop: 0 }}>
          <p className="tw-label">More from {category?.label}</p>
          <div className="tw-strip" style={{ marginTop: 0 }}>
            {related.map((r) => (
              <a key={r.id} href={href({ page: 'item', itemId: r.id })}>
                <b>{r.title}</b>
                <span>{[r.subtitle, r.date].filter(Boolean).join(' · ')}</span>
                <span>↗</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        title="자료 삭제 확인"
        description={`'${item.title}' 자료를 삭제하시겠습니까? 업로드된 사진과 상세 내용이 모두 삭제됩니다.`}
        onConfirm={async () => {
          await onDeleteItem(item.id);
          navigateTo({ page: 'category', categoryId: item.categoryId });
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};
