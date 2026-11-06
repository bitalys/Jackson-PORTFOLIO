import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SiteProfile } from '../types/portfolio';
import { ContactSection } from '../components/ContactSection';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { navigateTo } from '../utils/router';

interface ContactSubPageProps {
  profile: SiteProfile;
}

export const ContactSubPage: React.FC<ContactSubPageProps> = ({ profile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
        <Breadcrumbs items={[{ label: 'Contact & Recruiter Inquiries', active: true }]} />

        <button
          onClick={() => navigateTo({ page: 'home' })}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Contact Section Presentation */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 overflow-hidden">
        <ContactSection profile={profile} />
      </div>
    </div>
  );
};
