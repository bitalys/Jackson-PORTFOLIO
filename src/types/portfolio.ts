export type MediaType = 'image' | 'youtube' | 'both';

export interface StatHighlight {
  id: string;
  label: string;
  value: string;
}

export interface Submenu {
  id: string;
  name: string; // e.g. "GOLF", "Swimming", "STEM Research"
  categoryId: string; // e.g. "athletics"
  order?: number;
}

export interface Category {
  id: string;
  label: string; // e.g. "ATHLETICS", "ACADEMICS", "LEADERSHIP"
  description?: string;
  submenus: Submenu[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  subtitle?: string; // e.g. "AJGA Invitational" or "CIF Division 1"
  categoryId: string; // e.g. "athletics"
  submenuId: string; // e.g. "golf"
  date: string; // e.g. "Fall 2024" or "2024.10"
  featured: boolean;
  mediaType: MediaType;
  coverImage: string; // Data URL or Image path
  galleryImages: string[]; // Additional photo uploads from local computer
  youtubeUrl?: string; // YouTube video link
  youtubeVideoId?: string; // Extracted 11-char ID
  summary: string;
  details: string; // Full story / recap
  highlights: StatHighlight[]; // e.g. [{ label: "Score", value: "-3 (69)" }, { label: "Standing", value: "Champion" }]
  externalLink?: string;
  externalLinkLabel?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AboutPillar {
  id: string;
  title: string;
  description: string;
}

export interface SiteProfile {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  bioGolf?: string;
  bioSwim?: string;
  location: string;
  graduationYear: string;
  gpa: string;
  portraitImage?: string;
  swimmingImage?: string;
  email: string;
  phone: string;
  socials: {
    youtube?: string;
    instagram?: string;
    linkedin?: string;
  };
  metrics: {
    label: string;
    value: string;
    sublabel: string;
  }[];
  pillars?: AboutPillar[];
}
