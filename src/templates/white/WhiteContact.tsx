import React from 'react';
import { TemplateProps } from '../types';
import { useContactForm } from '../../hooks/useContactForm';

export const WhiteContact: React.FC<TemplateProps> = ({ profile }) => {
  const f = useContactForm(profile.email);

  return (
    <>
      <section className="tw-page-hero tw-dark">
        <p className="tw-eyebrow">Contact</p>
        <h1 className="tw-reveal">
          Get in
          <br />
          touch.
        </h1>
        <p className="tw-hero-meta">Coaching inquiries · Schedules · Interviews · Collaborations</p>
      </section>

      <section className="tw-section">
        <div className="tw-split">
          <div className="tw-reveal">
            <p className="tw-label">Direct</p>
            <div className="tw-contact-list">
              {profile.email && (
                <div>
                  <span>Email</span>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              )}
              {profile.phone && (
                <div>
                  <span>Phone</span>
                  <span style={{ fontSize: 14, color: 'inherit', letterSpacing: 0, textTransform: 'none' }}>
                    {profile.phone}
                  </span>
                </div>
              )}
              {profile.location && (
                <div>
                  <span>Location</span>
                  <span style={{ fontSize: 14, color: 'inherit', letterSpacing: 0, textTransform: 'none' }}>
                    {profile.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="tw-reveal" style={{ position: 'relative' }}>
            <p className="tw-label">Send a message</p>
            {f.submitted ? (
              <div className="tw-success" role="status">
                <h2 className="tw-h2" style={{ fontSize: 48 }}>
                  Message sent.
                </h2>
                <p style={{ marginTop: 16 }}>Thank you for reaching out. I'll get back to you soon.</p>
              </div>
            ) : (
              <form className="tw-form" onSubmit={f.handleSubmit}>
                <div className="tw-hp" aria-hidden="true">
                  <label>
                    Leave this field empty
                    <input
                      type="text"
                      name="_gotcha"
                      tabIndex={-1}
                      autoComplete="off"
                      value={f.honeypot}
                      onChange={(e) => f.setHoneypot(e.target.value)}
                    />
                  </label>
                </div>
                <div className="tw-form-grid">
                  <div className="tw-field">
                    <label htmlFor="tw-name">Name *</label>
                    <input
                      id="tw-name"
                      name="name"
                      value={f.name}
                      onChange={(e) => f.setName(e.target.value)}
                      maxLength={f.limits.name}
                      required
                    />
                  </div>
                  <div className="tw-field">
                    <label htmlFor="tw-email">Email *</label>
                    <input
                      id="tw-email"
                      type="email"
                      name="email"
                      value={f.email}
                      onChange={(e) => f.setEmail(e.target.value)}
                      maxLength={f.limits.email}
                      required
                    />
                  </div>
                </div>
                <div className="tw-field">
                  <label htmlFor="tw-org">Organization</label>
                  <input
                    id="tw-org"
                    name="organization"
                    value={f.organization}
                    onChange={(e) => f.setOrganization(e.target.value)}
                    maxLength={f.limits.organization}
                  />
                </div>
                <div className="tw-field">
                  <label htmlFor="tw-message">Message *</label>
                  <textarea
                    id="tw-message"
                    name="message"
                    rows={5}
                    value={f.message}
                    onChange={(e) => f.setMessage(e.target.value)}
                    maxLength={f.limits.message}
                    required
                  />
                </div>
                {f.error && (
                  <div className="tw-alert" role="alert">
                    {f.error}
                  </div>
                )}
                <button type="submit" className="tw-button" disabled={f.sending}>
                  {f.sending ? 'Sending…' : 'Send message'} <span>↗</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
