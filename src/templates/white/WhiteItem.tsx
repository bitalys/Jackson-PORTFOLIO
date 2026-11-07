import React, { useEffect, useState } from 'react';
import { TemplateProps } from '../types';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ImageLightbox } from '../../components/ImageLightbox';
import { StageArrows } from '../../components/StageArrows';
import { navigateTo } from '../../utils/router';
import { href, Lines, categoryLabel, youtubeEmbed, AdminTools } from './shared';

interface Props extends TemplateProps {
  itemId: string;
}

export const WhiteItem: React.FC<Props> = ({ items, categories, itemId, isAdmin, onEditItem, onDeleteItem }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const item = items.find((i) => i.id === itemId);

  // Same rule as the Classic template: photo-focused items (or items without a video) open on the gallery
  const defaultTab = (): 'video' | 'gallery' =>
    !item || item.mediaType === 'image' || !item.youtubeVideoId ? 'gallery' : 'video';
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'gallery'>(defaultTab);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    setActiveMediaTab(defaultTab());
    setSelectedPhotoIndex(0);
    setLightboxIndex(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, item?.mediaType, item?.youtubeVideoId]);

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
  const embed = youtubeEmbed(item);
  // All photos including the cover (same as Classic): cover first, then the gallery photos
  const allPhotos = Array.from(new Set([item.coverImage, ...(item.galleryImages || [])].filter(Boolean)));
  const showTabs = !!embed && allPhotos.length > 0;
  const showVideo = !!embed && (activeMediaTab === 'video' || allPhotos.length === 0);
  const current = Math.min(selectedPhotoIndex, Math.max(allPhotos.length - 1, 0));
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
        {/* Media: Official Video / Photo Gallery tabs (same structure as Classic) */}
        {showTabs && (
          <div className="tw-media-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeMediaTab === 'video'}
              className={activeMediaTab === 'video' ? 'active' : ''}
              onClick={() => setActiveMediaTab('video')}
            >
              ▶ Official Video
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeMediaTab === 'gallery'}
              className={activeMediaTab === 'gallery' ? 'active' : ''}
              onClick={() => setActiveMediaTab('gallery')}
            >
              Photo Gallery ({allPhotos.length})
            </button>
          </div>
        )}

        {showVideo ? (
          <div className="tw-reveal">
            <div className="tw-video">
              <iframe
                src={embed!}
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            <div className="tw-media-note">
              <span>Video not playing due to browser or third-party restrictions?</span>
              <a
                href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeVideoId}`}
                target="_blank"
                rel="noreferrer"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        ) : allPhotos.length > 0 ? (
          <div className="tw-reveal">
            <div className="tw-photo-stage">
              <button
                type="button"
                className="tw-zoom tw-photo-open"
                onClick={() => setLightboxIndex(current)}
                aria-label="Open photo viewer"
              >
                <img src={allPhotos[current]} alt={`${item.title} photo ${current + 1}`} referrerPolicy="no-referrer" />
                <span className="tw-photo-hint">Click to enlarge</span>
              </button>
              <StageArrows count={allPhotos.length} index={current} onChange={setSelectedPhotoIndex} tone="light" />
            </div>
            {allPhotos.length > 1 && (
              <div className="tw-thumbs">
                {allPhotos.map((src, i) => (
                  <button
                    key={`${src}-${i}`}
                    type="button"
                    className={i === current ? 'active' : ''}
                    onClick={() => setSelectedPhotoIndex(i)}
                    aria-label={`Show photo ${i + 1}`}
                    aria-current={i === current}
                    title={`Photo ${i + 1}`}
                  >
                    <img src={src} alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

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
            </div>
          </div>
        </div>
      </section>

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

      <ImageLightbox
        images={allPhotos}
        index={lightboxIndex}
        onIndexChange={(i) => {
          setLightboxIndex(i);
          setSelectedPhotoIndex(i);
        }}
        onClose={() => setLightboxIndex(null)}
        title={item.title}
      />

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
