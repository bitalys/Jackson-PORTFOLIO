import React from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SiteProfile } from '../types/portfolio';
import { useContactForm } from '../hooks/useContactForm';

interface ContactSectionProps {
  profile: SiteProfile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ profile }) => {
  const {
    name, setName,
    email, setEmail,
    organization, setOrganization,
    message, setMessage,
    honeypot, setHoneypot,
    submitted, sending, error,
    handleSubmit,
    limits: LIMITS
  } = useContactForm(profile.email);

  return (
    <section id="contact" className="py-20 border-b border-neutral-800/80 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
              <span>Recruiter & Inquiries</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>Connect</span>
            </div>

            <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get in Touch with Jackson Hong
            </h2>

            <p className="text-neutral-400 text-sm leading-relaxed">
              For collegiate coaching inquiries, tournament schedule verification, academic transcripts, or community speaking opportunities, feel free to reach out directly.
            </p>

            <div className="space-y-4 pt-4 border-t border-neutral-800/80 text-sm">
              <div className="flex items-center gap-3 text-neutral-300">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block uppercase">Email</span>
                  <a href={`mailto:${profile.email}`} className="text-white hover:text-amber-400 transition-colors font-medium">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-300">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block uppercase">Phone / Inquiries</span>
                  <span className="text-white font-mono font-medium">{profile.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-300">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400 block uppercase">Location</span>
                  <span className="text-white font-medium">{profile.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Clean Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="relative p-6 sm:p-8 rounded-2xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="font-['Outfit'] text-xl font-bold text-white mb-2">
                Send a Message or Request Info
              </h3>
              <p className="text-xs text-neutral-400 mb-6">
                Messages are delivered directly to Jackson Hong and family athletic coordinators.
              </p>

              {submitted ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-white text-base font-['Outfit']">
                    Message sent!
                  </h4>
                  <p className="text-xs text-emerald-300">
                    Thank you for reaching out. I'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot: hidden from people, often filled by bots */}
                  <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                    <label>
                      Leave this field empty
                      <input
                        type="text"
                        name="_gotcha"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Name <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        name="name"
                        maxLength={LIMITS.name}
                        placeholder="e.g. Coach Roberts / John Smith"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        Email <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        maxLength={LIMITS.email}
                        placeholder="your.email@university.edu"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Organization / University / Club
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                        name="organization"
                        maxLength={LIMITS.organization}
                      placeholder="e.g. NCAA Athletic Dept / Junior Golf Tour"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      Message <span className="text-amber-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                        name="message"
                        maxLength={LIMITS.message}
                      placeholder="Tournament schedules, swing data requests, interviews, or any other inquiries."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                      required
                    />
                  </div>

                  {error && (
                    <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/10"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
