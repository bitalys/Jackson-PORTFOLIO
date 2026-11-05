import React from 'react';
import { Trophy, Target, BookOpen, Heart, Award } from 'lucide-react';
import { SiteProfile } from '../types/portfolio';
import { PORTRAIT_IMAGE, SWIMMING_IMAGE } from '../services/storage';

interface AboutSectionProps {
  profile: SiteProfile;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  return (
    <section id="about-section" className="py-20 border-b border-neutral-800/80 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-3">
            <span>Scholar-Athlete Biography</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span>Jackson Hong</span>
          </div>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Dedication Across Disciplines
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
            Pursuing athletic mastery on the fairway and in the pool, supported by rigorous scientific inquiry and community service.
          </p>
        </div>

        {/* 2-Column Split: Visuals + Story */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Portrait & Swimming Duo Images */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group aspect-square">
              <img
                src={PORTRAIT_IMAGE}
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
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  {profile.title}
                </span>
                <h3 className="font-['Outfit'] text-xl font-bold text-white">
                  {profile.name}
                </h3>
                <p className="text-xs text-neutral-300">{profile.location} · {profile.graduationYear}</p>
              </div>
            </div>

            {/* Swimming Inset Card */}
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video group">
              <img
                src={SWIMMING_IMAGE}
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
                As a tournament golfer, Jackson competes across AJGA, Toyota Tour Cup, and SCPGA Junior championships, refining a consistent +1.4 index with a focus on course management, pressure putting, and kinematic swing efficiency.
              </p>
              <p>
                Concurrently, as an All-State varsity swimmer, Jackson anchors the sprint butterfly and medley relays, bringing high-intensity physical conditioning and explosive athletic speed that translates directly into clubhead velocity on the golf course.
              </p>
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80">
              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Target className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-bold text-sm text-white">Tournament Golf</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  Championship experience on top coastal courses, tournament low 68 (-4), 114 mph clubhead speed.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Trophy className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-bold text-sm text-white">CIF State Swimming</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  100m Fly All-American qualifying mark (50.82s), varsity sprint anchor, mental resilience under pressure.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-bold text-sm text-white">STEM & Research</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  3.96 unweighted GPA, AP Scholar with Distinction, computer vision kinematic biomechanics research.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400">
                  <Heart className="w-4 h-4" />
                  <h4 className="font-['Outfit'] font-bold text-sm text-white">Youth Mentorship</h4>
                </div>
                <p className="text-xs text-neutral-400 leading-normal">
                  140+ volunteer hours mentoring junior athletes in golf fundamentals and water safety education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
