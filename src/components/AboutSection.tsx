import React from 'react';
import { Trophy, Target, BookOpen, Heart, Play, ArrowDown } from 'lucide-react';
import { SiteProfile, PortfolioItem } from '../types/portfolio';
import { PORTRAIT_IMAGE, SWIMMING_IMAGE } from '../services/storage';

interface AboutSectionProps {
  profile: SiteProfile;
  featuredVideoItem?: PortfolioItem;
  onOpenVideo?: (item: PortfolioItem) => void;
  onExploreClick?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile,
  featuredVideoItem,
  onOpenVideo,
  onExploreClick
}) => {
  return (
    <section id="about" className="pt-8 pb-16 border-b border-neutral-800/80 bg-neutral-950 relative overflow-hidden">
      {/* Subtle ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-3">
            <span>Scholar-Athlete Biography</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Jackson Hong</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Class of {profile.graduationYear}</span>
          </div>
          <h1 className="font-['Outfit'] text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
            {profile.subtitle || 'Dedication Across Disciplines: Precision on the Course, Power in the Pool.'}
          </h1>
          <p className="text-neutral-300 text-sm sm:text-lg mt-4 leading-relaxed">
            Welcome to the official portfolio of <strong className="text-white font-semibold">{profile.name}</strong>. 
            Pursuing athletic mastery on the fairway and in the pool, grounded by rigorous STEM biomechanics inquiry, academic excellence, and youth community service.
          </p>
        </div>

        {/* 2-Column Split: Visuals + Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Portrait & Swimming Duo Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group aspect-square">
              <img
                src={profile.portraitImage || PORTRAIT_IMAGE}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('portrait')) {
                    target.src = '/images/portrait.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  {profile.title}
                </span>
                <h3 className="font-['Outfit'] text-xl font-bold text-white">
                  {profile.name}
                </h3>
                <p className="text-xs text-neutral-300">{profile.location} · Class of {profile.graduationYear}</p>
              </div>
            </div>

            {/* Swimming Inset Card */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video group">
              <img
                src={profile.swimmingImage || SWIMMING_IMAGE}
                alt="Jackson Hong swimming 100m Butterfly"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('swimming')) {
                    target.src = '/images/swimming.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                <span className="text-white font-medium">CIF State Finalist · 100m Butterfly</span>
                <span className="text-amber-400 font-mono font-bold">50.82s</span>
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Pillars */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
              <p>
                {profile.bio}
              </p>
              <p>
                {profile.bioGolf || 'As a tournament golfer, Jackson competes across AJGA, Toyota Tour Cup, and SCPGA Junior championships, refining a consistent +1.4 index with a focus on course management, pressure putting, and kinematic swing efficiency.'}
              </p>
              <p>
                {profile.bioSwim || 'Concurrently, as an All-State varsity swimmer, Jackson anchors the sprint butterfly and medley relays, bringing high-intensity physical conditioning and explosive athletic speed that translates directly into clubhead velocity on the golf course.'}
              </p>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80">
              {(profile.pillars && profile.pillars.length > 0 ? profile.pillars : [
                {
                  id: 'p1',
                  title: 'Tournament Golf',
                  description: 'Championship experience on top coastal courses, tournament low 68 (-4), 114 mph clubhead speed.'
                },
                {
                  id: 'p2',
                  title: 'CIF State Swimming',
                  description: '100m Fly All-American qualifying mark (50.82s), varsity sprint anchor, mental resilience under pressure.'
                },
                {
                  id: 'p3',
                  title: 'STEM & Research',
                  description: '3.96 unweighted GPA, AP Scholar with Distinction, computer vision kinematic biomechanics research.'
                },
                {
                  id: 'p4',
                  title: 'Youth Mentorship',
                  description: '140+ volunteer hours mentoring junior athletes in golf fundamentals and water safety education.'
                }
              ]).map((pillar, idx) => {
                const PILLAR_ICONS = [Target, Trophy, BookOpen, Heart];
                const IconComponent = PILLAR_ICONS[idx % PILLAR_ICONS.length] || Target;

                return (
                  <div key={pillar.id || idx} className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <IconComponent className="w-4 h-4" />
                      <h4 className="font-['Outfit'] font-bold text-sm text-white">{pillar.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4-Metric Achievement KPI Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {profile.metrics.map((metric, idx) => (
            <div key={idx} className="space-y-1">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider block">
                {metric.label}
              </span>
              <div className="font-['Outfit'] text-2xl sm:text-3xl font-bold text-white tracking-tight tabular-nums">
                {metric.value}
              </div>
              <p className="text-xs text-neutral-500 truncate">
                {metric.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
