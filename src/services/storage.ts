import { Category, PortfolioItem, SiteProfile, Submenu } from '../types/portfolio';
import { supabase, isCloudEnabled, MEDIA_BUCKET } from '../lib/supabase';
import heroGolfAsset from '../assets/images/jackson_hero_golf_1793837637636.jpg';
import swimmingAsset from '../assets/images/jackson_swimming_action_1793837638448.jpg';
import portraitAsset from '../assets/images/jackson_portrait_headshot_1793837638258.jpg';

// Bundled and static image asset paths
export const HERO_GOLF_IMAGE = heroGolfAsset || '/images/hero_golf.jpg';
export const SWIMMING_IMAGE = swimmingAsset || '/images/swimming.jpg';
export const PORTRAIT_IMAGE = portraitAsset || '/images/portrait.jpg';

const DB_NAME = 'JacksonHongPortfolioDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'portfolio_items';
const STORE_CATEGORIES = 'categories';
const STORE_CONFIG = 'config';

const LOCAL_STORAGE_ITEMS_KEY = 'jh_portfolio_items_v1';
const LOCAL_STORAGE_CATEGORIES_KEY = 'jh_portfolio_categories_v1';
const LOCAL_STORAGE_PASSWORD_KEY = 'jh_admin_pwd_v1';
const LOCAL_STORAGE_PROFILE_KEY = 'jh_portfolio_profile_v1';

export const DEFAULT_ADMIN_PASSWORD = '1111';


// Initial Categories with ATHLETICS · GOLF, ATHLETICS · Swimming, etc.
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'athletics',
    label: 'ATHLETICS',
    description: 'Competitive golf tournament play, swimming championships, and athletic conditioning.',
    submenus: [
      { id: 'athletics-golf', name: 'GOLF', categoryId: 'athletics' },
      { id: 'athletics-swimming', name: 'Swimming', categoryId: 'athletics' },
      { id: 'athletics-training', name: 'Training & Fitness', categoryId: 'athletics' }
    ]
  },
  {
    id: 'academics',
    label: 'ACADEMICS',
    description: 'STEM research, sports biomechanics studies, and scholastic honors.',
    submenus: [
      { id: 'academics-stem', name: 'STEM & Research', categoryId: 'academics' },
      { id: 'academics-honors', name: 'Honors & Awards', categoryId: 'academics' }
    ]
  },
  {
    id: 'leadership',
    label: 'LEADERSHIP',
    description: 'Community initiatives, youth golf coaching, and school leadership.',
    submenus: [
      { id: 'leadership-community', name: 'Community & Service', categoryId: 'leadership' },
      { id: 'leadership-council', name: 'Athletic Council', categoryId: 'leadership' }
    ]
  }
];

export const DEFAULT_PROFILE: SiteProfile = {
  name: 'Jackson Hong',
  title: 'Competitive Scholar-Athlete',
  subtitle: 'Dedication Across Disciplines: Precision on the Course, Power in the Pool.',
  intro: 'Pursuing athletic mastery on the fairway and in the pool, grounded by rigorous STEM biomechanics inquiry, academic excellence, and youth community service.',
  bio: 'Jackson Hong is a dedicated student-athlete focused on tournament golf and sprint butterfly swimming. Combining rigorous physical discipline with academic excellence in physics and biomechanics, Jackson strives for peak performance on the course, in the water, and in the classroom.',
  bioGolf: 'As a tournament golfer, Jackson competes across AJGA, Toyota Tour Cup, and SCPGA Junior championships, refining a consistent +1.4 index with a focus on course management, pressure putting, and kinematic swing efficiency.',
  bioSwim: 'Concurrently, as an All-State varsity swimmer, Jackson anchors the sprint butterfly and medley relays, bringing high-intensity physical conditioning and explosive athletic speed that translates directly into clubhead velocity on the golf course.',
  location: 'Southern California, USA',
  graduationYear: '2026',
  gpa: '3.96 Unweighted / 4.42 Weighted',
  portraitImage: PORTRAIT_IMAGE,
  swimmingImage: SWIMMING_IMAGE,
  swimmingCaption: 'CIF State Finalist · 100m Butterfly',
  swimmingCaptionValue: '50.82s',
  email: 'jackson.hong.athletics@gmail.com',
  phone: '+1 (949) 555-0182',
  socials: {
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com'
  },
  metrics: [
    { label: 'Golf Handicap', value: '+1.4', sublabel: 'Low Tournament Round: 67 (-5)' },
    { label: '100m Butterfly PR', value: '50.82s', sublabel: 'State Championship Finalist' },
    { label: 'Academic Standing', value: '3.96 GPA', sublabel: 'AP Scholar with Distinction' },
    { label: 'Community Service', value: '140+ Hrs', sublabel: 'Youth First Tee Volunteer' }
  ],
  pillars: [
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
  ]
};

export const DEFAULT_ITEMS: PortfolioItem[] = [
  {
    id: 'item-golf-1',
    title: 'AJGA Junior All-Star Championship Showcase',
    subtitle: 'Pebble Beach Golf Links · Invitational',
    categoryId: 'athletics',
    submenuId: 'athletics-golf',
    date: 'Summer 2024',
    featured: true,
    mediaType: 'both',
    coverImage: HERO_GOLF_IMAGE,
    galleryImages: [PORTRAIT_IMAGE],
    youtubeUrl: 'https://www.youtube.com/watch?v=rh1x18eIhco',
    youtubeVideoId: 'rh1x18eIhco',
    summary: 'Carded a 4-under par final round 68 under difficult coastal wind conditions to capture 2nd place overall against top-tier national juniors.',
    details: 'The AJGA Junior Championship brought together 78 elite junior golfers across the Western conference. Jackson maintained steady ball striking hitting 14 of 18 greens in regulation during Sunday\'s final round, punctuated by an eagle on the 14th hole. The tournament demonstrated maturity in course management, emotional poise, and short game recovery around tight oceanfront greens.',
    highlights: [
      { id: 'h1', label: 'Final Round', value: '68 (-4)' },
      { id: 'h2', label: 'Finish', value: '2nd Place (Silver)' },
      { id: 'h3', label: 'Greens in Reg', value: '77.8%' },
      { id: 'h4', label: 'Avg Drive', value: '292 yards' }
    ],
    externalLink: 'https://ajga.org',
    externalLinkLabel: 'AJGA Leaderboard',
    createdAt: 1718000000000,
    updatedAt: 1718000000000
  },
  {
    id: 'item-swim-1',
    title: 'CIF State Swimming Championship — 100m Butterfly Gold',
    subtitle: 'Olympic Aquatic Center · Finals',
    categoryId: 'athletics',
    submenuId: 'athletics-swimming',
    date: 'Spring 2024',
    featured: true,
    mediaType: 'image',
    coverImage: SWIMMING_IMAGE,
    galleryImages: [],
    youtubeUrl: '',
    youtubeVideoId: '',
    summary: 'Claimed 1st place in the CIF Division 1 championship with a new school record of 50.82 seconds in the 100m Butterfly.',
    details: 'Entering the final heat as the 3rd seed, Jackson executed an explosive underwater dolphin kick off the start and nailed the turn split at 23.64 seconds. Holding off closing surges down the final 25 meters, he touched first in 50.82 seconds, earning automatic All-American qualification and leading the school relay team to team podium.',
    highlights: [
      { id: 'h1', label: 'Time', value: '50.82s (PR)' },
      { id: 'h2', label: 'Place', value: 'State Gold Medal' },
      { id: 'h3', label: 'Opening Split', value: '23.64s' },
      { id: 'h4', label: 'Honor', value: 'NISCA All-American' }
    ],
    externalLink: 'https://usaswimming.org',
    externalLinkLabel: 'USA Swimming Record',
    createdAt: 1715000000000,
    updatedAt: 1715000000000
  },
  {
    id: 'item-golf-2',
    title: 'PGA Junior Tour Regional Invitational Round Highlights',
    subtitle: 'Torrey Pines South Course',
    categoryId: 'athletics',
    submenuId: 'athletics-golf',
    date: 'Fall 2024',
    featured: true,
    mediaType: 'youtube',
    coverImage: HERO_GOLF_IMAGE,
    galleryImages: [],
    youtubeUrl: 'https://www.youtube.com/watch?v=OQsQQk-n-7A',
    youtubeVideoId: 'OQsQQk-n-7A',
    summary: 'Full tournament recap showcasing driver launch angles, wedge distance control, and clutch par saves in high-pressure match situations.',
    details: 'Video compilation featuring Jackson\'s swing mechanics, tee shot dispersion on long par 4s, and key putts throughout the two-day 36-hole event at Torrey Pines. Detailed trackman data verified an average clubhead speed of 114 mph and ball speed exceeding 168 mph.',
    highlights: [
      { id: 'h1', label: 'Total Score', value: '141 (-3)' },
      { id: 'h2', label: 'Clubhead Speed', value: '114 mph' },
      { id: 'h3', label: 'Scrambling', value: '82%' },
      { id: 'h4', label: 'Result', value: 'Top 3 Medalist' }
    ],
    externalLink: 'https://youtube.com',
    externalLinkLabel: 'Watch Swing Reel on YouTube',
    createdAt: 1726000000000,
    updatedAt: 1726000000000
  },
  {
    id: 'item-stem-1',
    title: 'Kinematic Computer Vision Model of Golf Swing Mechanics',
    subtitle: 'Applied Biomechanics Research · Science Fair Finalist',
    categoryId: 'academics',
    submenuId: 'academics-stem',
    date: 'Winter 2024',
    featured: false,
    mediaType: 'image',
    coverImage: PORTRAIT_IMAGE,
    galleryImages: [],
    youtubeUrl: '',
    youtubeVideoId: '',
    summary: 'Engineered an AI pose estimation system to analyze pelvic and shoulder rotational velocities, correlating thoracic separation angle with launch efficiency.',
    details: 'Combining passions for athletic competition and computer science, Jackson developed a video tracking pipeline using MediaPipe and Python to quantify the kinetic chain in rotational athletes. The study tracked 24 competitive junior players and presented findings at the regional STEM symposium, winning 1st place in Applied Physics & Engineering.',
    highlights: [
      { id: 'h1', label: 'Tracking Rate', value: '120 FPS CV' },
      { id: 'h2', label: 'Award', value: '1st Regional STEM' },
      { id: 'h3', label: 'Subjects', value: '24 Players' },
      { id: 'h4', label: 'Status', value: 'Manuscript Draft' }
    ],
    externalLink: '',
    externalLinkLabel: '',
    createdAt: 1709000000000,
    updatedAt: 1709000000000
  },
  {
    id: 'item-lead-1',
    title: 'First Tee Youth Clinic Director & Water Safety Mentor',
    subtitle: 'Community Athletic Outreach',
    categoryId: 'leadership',
    submenuId: 'leadership-community',
    date: '2023 - Present',
    featured: false,
    mediaType: 'image',
    coverImage: PORTRAIT_IMAGE,
    galleryImages: [],
    youtubeUrl: '',
    youtubeVideoId: '',
    summary: 'Organized and led weekend golf clinics and youth swim safety workshops for over 65 local elementary and middle school students.',
    details: 'Through partnership with local community centers and youth programs, Jackson designed an engaging, inclusive curriculum emphasizing hand-eye coordination, emotional resilience, swimming safety, and core life values learned through sport.',
    highlights: [
      { id: 'h1', label: 'Youth Reached', value: '65+ Students' },
      { id: 'h2', label: 'Volunteer Time', value: '140+ Hours' },
      { id: 'h3', label: 'Sessions', value: '24 Clinics' },
      { id: 'h4', label: 'Initiative', value: 'Founder & Coach' }
    ],
    externalLink: '',
    externalLinkLabel: '',
    createdAt: 1704000000000,
    updatedAt: 1704000000000
  }
];

// Helper: Extract YouTube 11-char ID from various link formats
export function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Match:
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID
  // https://www.youtube.com/shorts/VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // If user pasted bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return '';
}

// IndexedDB Helper
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) {
        db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Image helpers
// ---------------------------------------------------------------------------

/** 사진을 긴 변 maxDim 이하의 JPEG로 줄입니다. (GIF/SVG 또는 실패 시 원본 그대로) */
export function resizeImageFile(file: File, maxDim = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return Promise.resolve(file);
  }
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      const scale = Math.min(1, maxDim / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob && blob.size < file.size ? blob : file), 'image/jpeg', quality);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/** 기본 예시 사진(빌드 시 파일명이 바뀌는 번들 이미지)을 현재 빌드 경로로 보정 */
function normalizeMedia(item: PortfolioItem): PortfolioItem {
  const fix = (img: string) => {
    if (!img || img.includes('jackson_hero_golf')) return HERO_GOLF_IMAGE;
    if (img.includes('jackson_swimming_action')) return SWIMMING_IMAGE;
    if (img.includes('jackson_portrait_headshot')) return PORTRAIT_IMAGE;
    return img;
  };
  const cover = fix(item.coverImage);
  const gallery = Array.from(
    new Set((item.galleryImages || []).filter(Boolean).map(fix).filter((img) => img !== cover))
  );

  // Update old un-embeddable test video ID to verified videos
  let youtubeVideoId = item.youtubeVideoId;
  let youtubeUrl = item.youtubeUrl;
  if (youtubeVideoId === 'ScMzIvxBSi4') {
    youtubeVideoId = item.id === 'item-golf-1' ? 'rh1x18eIhco' : 'OQsQQk-n-7A';
    youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
  }

  return { ...item, coverImage: cover, galleryImages: gallery, youtubeVideoId, youtubeUrl };
}

function normalizeProfile(profile: SiteProfile): SiteProfile {
  const fix = (img?: string) => {
    if (!img) return img;
    if (img.includes('jackson_swimming_action')) return SWIMMING_IMAGE;
    if (img.includes('jackson_portrait_headshot')) return PORTRAIT_IMAGE;
    return img;
  };
  return { ...profile, portraitImage: fix(profile.portraitImage), swimmingImage: fix(profile.swimmingImage) };
}

const sortItems = (items: PortfolioItem[]) => [...items].sort((a, b) => b.createdAt - a.createdAt);

// ---------------------------------------------------------------------------
// Backend interface: 브라우저 저장소(Local) 또는 Supabase(Cloud)
// ---------------------------------------------------------------------------

interface StorageBackend {
  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;
  getItems(): Promise<PortfolioItem[]>;
  insertItem(item: PortfolioItem): Promise<void>;
  updateItem(item: PortfolioItem, previous: PortfolioItem): Promise<void>;
  deleteItem(item: PortfolioItem): Promise<void>;
  getProfile(): Promise<SiteProfile>;
  saveProfile(profile: SiteProfile, previous?: SiteProfile): Promise<void>;
  uploadImage(file: File): Promise<string>;
  replaceAll(categories: Category[], items: PortfolioItem[], profile: SiteProfile): Promise<void>;
}

// ----------------------------- Local (browser) -----------------------------

function idbRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Saving was aborted (storage may be full).'));
  });
}

const LocalBackend: StorageBackend = {
  async getCategories() {
    try {
      const db = await openDatabase();
      const result = await idbRequest<Category[]>(
        db.transaction(STORE_CATEGORIES, 'readonly').objectStore(STORE_CATEGORIES).getAll()
      );
      if (result && result.length > 0) {
        // IndexedDB는 id 순으로 돌려주므로, 저장했던 순서(localStorage 사본)대로 다시 정렬
        try {
          const order: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY) || '[]').map(
            (c: Category) => c.id
          );
          const rank = (id: string) => (order.indexOf(id) === -1 ? Number.MAX_SAFE_INTEGER : order.indexOf(id));
          result.sort((a, b) => rank(a.id) - rank(b.id));
        } catch {
          // keep IndexedDB order
        }
        return result;
      }
    } catch {
      // fall back to localStorage
    }
    const local = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }
    await this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  async saveCategories(categories) {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch {
      // IndexedDB is the primary store
    }
    const db = await openDatabase();
    const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
    const store = tx.objectStore(STORE_CATEGORIES);
    store.clear();
    categories.forEach((cat) => store.put(cat));
    await idbDone(tx);
  },

  async getItems() {
    try {
      const db = await openDatabase();
      const result = await idbRequest<PortfolioItem[]>(
        db.transaction(STORE_ITEMS, 'readonly').objectStore(STORE_ITEMS).getAll()
      );
      if (result && result.length > 0) return sortItems(result.map(normalizeMedia));
    } catch {
      // fall back to localStorage
    }
    const local = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return sortItems(parsed.map(normalizeMedia));
      } catch {
        // ignore
      }
    }
    await saveLocalItems(DEFAULT_ITEMS);
    return DEFAULT_ITEMS;
  },

  async insertItem(item) {
    const items = await this.getItems();
    await saveLocalItems([item, ...items]);
  },

  async updateItem(item) {
    const items = await this.getItems();
    await saveLocalItems(items.map((i) => (i.id === item.id ? item : i)));
  },

  async deleteItem(item) {
    const items = await this.getItems();
    await saveLocalItems(items.filter((i) => i.id !== item.id));
  },

  async getProfile() {
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (stored) {
      try {
        return normalizeProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
      } catch {
        // ignore
      }
    }
    return DEFAULT_PROFILE;
  },

  async saveProfile(profile) {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      throw new Error('Not enough browser storage to save. Please use smaller photos and try again.');
    }
  },

  async uploadImage(file) {
    return blobToDataUrl(await resizeImageFile(file));
  },

  async replaceAll(categories, items, profile) {
    localStorage.removeItem(LOCAL_STORAGE_ITEMS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CATEGORIES_KEY);
    await this.saveCategories(categories);
    await saveLocalItems(items);
    await this.saveProfile(profile);
  }
};

async function saveLocalItems(items: PortfolioItem[]): Promise<void> {
  const db = await openDatabase();
  const tx = db.transaction(STORE_ITEMS, 'readwrite');
  const store = tx.objectStore(STORE_ITEMS);
  store.clear();
  items.forEach((item) => store.put(item));
  await idbDone(tx);

  // 보조 사본 (큰 사진 제외). 실패해도 IndexedDB 저장은 이미 완료됨.
  try {
    const lightweight = items.map((item) => ({
      ...item,
      coverImage: item.coverImage.startsWith('data:') && item.coverImage.length > 200000 ? '' : item.coverImage,
      galleryImages: item.galleryImages.filter((img) => !img.startsWith('data:') || img.length < 200000)
    }));
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(lightweight));
  } catch {
    // ignore quota errors for the backup copy
  }
}

/** 브라우저(IndexedDB/localStorage)에 남아 있는 데이터를 읽습니다. (클라우드 이전용) */
async function readLocalData() {
  return {
    categories: await LocalBackend.getCategories(),
    items: await LocalBackend.getItems(),
    profile: await LocalBackend.getProfile()
  };
}

// ------------------------------ Cloud (Supabase) ------------------------------

interface ItemRow {
  id: string;
  title: string;
  subtitle: string | null;
  category_id: string | null;
  submenu_id: string | null;
  date: string | null;
  featured: boolean | null;
  media_type: string | null;
  cover_image: string | null;
  gallery_images: string[] | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  summary: string | null;
  details: string | null;
  highlights: PortfolioItem['highlights'] | null;
  external_link: string | null;
  external_link_label: string | null;
  created_at: string;
  updated_at: string;
}

const toRow = (item: PortfolioItem): ItemRow => ({
  id: item.id,
  title: item.title,
  subtitle: item.subtitle || null,
  category_id: item.categoryId || null,
  submenu_id: item.submenuId || null,
  date: item.date || null,
  featured: !!item.featured,
  media_type: item.mediaType,
  cover_image: item.coverImage || null,
  gallery_images: item.galleryImages || [],
  youtube_url: item.youtubeUrl || null,
  youtube_video_id: item.youtubeVideoId || null,
  summary: item.summary || null,
  details: item.details || null,
  highlights: item.highlights || [],
  external_link: item.externalLink || null,
  external_link_label: item.externalLinkLabel || null,
  created_at: new Date(item.createdAt || Date.now()).toISOString(),
  updated_at: new Date(item.updatedAt || Date.now()).toISOString()
});

const fromRow = (row: ItemRow): PortfolioItem => ({
  id: row.id,
  title: row.title,
  subtitle: row.subtitle || '',
  categoryId: row.category_id || '',
  submenuId: row.submenu_id || '',
  date: row.date || '',
  featured: !!row.featured,
  mediaType: (row.media_type as PortfolioItem['mediaType']) || 'both',
  coverImage: row.cover_image || '',
  galleryImages: row.gallery_images || [],
  youtubeUrl: row.youtube_url || '',
  youtubeVideoId: row.youtube_video_id || '',
  summary: row.summary || '',
  details: row.details || '',
  highlights: row.highlights || [],
  externalLink: row.external_link || '',
  externalLinkLabel: row.external_link_label || '',
  createdAt: Date.parse(row.created_at) || Date.now(),
  updatedAt: Date.parse(row.updated_at) || Date.now()
});

function cloud() {
  if (!supabase) throw new Error('Supabase is not configured (missing environment variables).');
  return supabase;
}

function check<T extends { error: { message: string } | null }>(res: T, action: string): T {
  if (res.error) throw new Error(`${action} failed: ${res.error.message}`);
  return res;
}

/** Supabase Storage에 올린 사진이면 버킷 내부 경로를 돌려줍니다. */
function storagePathFromUrl(url?: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
}

/** 더 이상 쓰지 않는 사진 파일을 Storage에서 정리합니다. (실패해도 무시) */
async function removeUnusedFiles(before: (string | undefined)[], after: (string | undefined)[]) {
  const keep = new Set(after.filter(Boolean));
  const paths = before
    .filter((url) => url && !keep.has(url))
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p);
  if (paths.length === 0) return;
  try {
    await cloud().storage.from(MEDIA_BUCKET).remove(Array.from(new Set(paths)));
  } catch {
    // ignore cleanup failures
  }
}

const itemImages = (item: PortfolioItem) => [item.coverImage, ...(item.galleryImages || [])];
const profileImages = (p: SiteProfile) => [p.portraitImage, p.swimmingImage];

/** 클라우드가 아직 비어 있으면(처음 사용) 기본 예시 데이터를 넣습니다. 관리자 쓰기 작업 전에 호출. */
let seededChecked = false;
async function ensureCloudSeeded() {
  if (seededChecked) return;
  const { data } = check(await cloud().from('site_profile').select('id').eq('id', 1).maybeSingle(), 'Checking initial data');
  if (!data) {
    await CloudBackend.replaceAll(DEFAULT_CATEGORIES, DEFAULT_ITEMS, DEFAULT_PROFILE);
  }
  seededChecked = true;
}

const CloudBackend: StorageBackend = {
  async getCategories() {
    const db = cloud();
    const [cats, subs] = await Promise.all([
      db.from('categories').select('*').order('sort_order'),
      db.from('submenus').select('*').order('sort_order')
    ]);
    check(cats, 'Loading categories');
    check(subs, 'Loading sub-menus');
    if (!cats.data || cats.data.length === 0) return DEFAULT_CATEGORIES;
    return cats.data.map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description || '',
      submenus: (subs.data || [])
        .filter((s) => s.category_id === c.id)
        .map((s) => ({ id: s.id, name: s.name, categoryId: s.category_id, order: s.sort_order }))
    }));
  },

  async saveCategories(categories) {
    const db = cloud();
    const catRows = categories.map((c, i) => ({
      id: c.id,
      label: c.label,
      description: c.description || '',
      sort_order: i
    }));
    const subRows = categories.flatMap((c) =>
      c.submenus.map((s, i) => ({ id: s.id, category_id: c.id, name: s.name, sort_order: i }))
    );

    check(await db.from('categories').upsert(catRows), 'Saving categories');
    if (subRows.length) check(await db.from('submenus').upsert(subRows), 'Saving sub-menus');

    // 목록에서 빠진 서브메뉴 / 카테고리 삭제
    const existingSubs = check(await db.from('submenus').select('id'), 'Checking sub-menus').data || [];
    const subIds = new Set(subRows.map((s) => s.id));
    const staleSubs = existingSubs.map((s) => s.id).filter((id) => !subIds.has(id));
    if (staleSubs.length) check(await db.from('submenus').delete().in('id', staleSubs), 'Deleting sub-menus');

    const existingCats = check(await db.from('categories').select('id'), 'Checking categories').data || [];
    const catIds = new Set(catRows.map((c) => c.id));
    const staleCats = existingCats.map((c) => c.id).filter((id) => !catIds.has(id));
    if (staleCats.length) check(await db.from('categories').delete().in('id', staleCats), 'Deleting categories');
  },

  async getItems() {
    const db = cloud();
    const [items, profile] = await Promise.all([
      db.from('items').select('*').order('created_at', { ascending: false }),
      db.from('site_profile').select('id').eq('id', 1).maybeSingle()
    ]);
    check(items, 'Loading items');
    // 아직 한 번도 저장한 적 없는 빈 클라우드라면 기본 예시를 보여줌
    if ((!items.data || items.data.length === 0) && !profile.data) return DEFAULT_ITEMS;
    return sortItems((items.data as ItemRow[]).map(fromRow).map(normalizeMedia));
  },

  async insertItem(item) {
    await ensureCloudSeeded();
    check(await cloud().from('items').insert(toRow(item)), 'Creating item');
  },

  async updateItem(item, previous) {
    await ensureCloudSeeded();
    check(await cloud().from('items').upsert(toRow(item)), 'Updating item');
    await removeUnusedFiles(itemImages(previous), itemImages(item));
  },

  async deleteItem(item) {
    await ensureCloudSeeded();
    check(await cloud().from('items').delete().eq('id', item.id), 'Deleting item');
    await removeUnusedFiles(itemImages(item), []);
  },

  async getProfile() {
    const res = check(await cloud().from('site_profile').select('data').eq('id', 1).maybeSingle(), 'Loading About');
    if (!res.data) return DEFAULT_PROFILE;
    return normalizeProfile({ ...DEFAULT_PROFILE, ...(res.data.data as SiteProfile) });
  },

  async saveProfile(profile, previous) {
    await ensureCloudSeeded();
    check(await cloud().from('site_profile').upsert({ id: 1, data: profile }), 'Saving About');
    if (previous) await removeUnusedFiles(profileImages(previous), profileImages(profile));
  },

  async uploadImage(file) {
    const blob = await resizeImageFile(file);
    const ext = blob.type === 'image/jpeg' ? 'jpg' : (file.name.split('.').pop() || 'img').toLowerCase();
    const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const bucket = cloud().storage.from(MEDIA_BUCKET);
    check(await bucket.upload(path, blob, { contentType: blob.type || file.type, cacheControl: '31536000' }), 'Uploading photo');
    return bucket.getPublicUrl(path).data.publicUrl;
  },

  async replaceAll(categories, items, profile) {
    const db = cloud();
    await this.saveCategories(categories);

    const rows = items.map(toRow);
    if (rows.length) check(await db.from('items').upsert(rows), 'Saving items');
    const existing = check(await db.from('items').select('id'), 'Checking items').data || [];
    const ids = new Set(rows.map((r) => r.id));
    const stale = existing.map((r) => r.id).filter((id) => !ids.has(id));
    if (stale.length) check(await db.from('items').delete().in('id', stale), 'Deleting item');

    check(await db.from('site_profile').upsert({ id: 1, data: profile }), 'Saving About');
    seededChecked = true;
  }
};

/** 사진 문자열이 data URL(브라우저 저장 방식)이면 Storage에 올리고 URL을 돌려줍니다. */
async function uploadIfDataUrl(img: string | undefined, cache: Map<string, string>): Promise<string | undefined> {
  if (!img || !img.startsWith('data:')) return img;
  const cached = cache.get(img);
  if (cached) return cached;
  const blob = await dataUrlToBlob(img);
  const file = new File([blob], `migrated.${blob.type.split('/')[1] || 'jpg'}`, { type: blob.type });
  const url = await CloudBackend.uploadImage(file);
  cache.set(img, url);
  return url;
}

// ---------------------------------------------------------------------------
// Public API used by the UI
// ---------------------------------------------------------------------------

const backend = (): StorageBackend => (isCloudEnabled ? CloudBackend : LocalBackend);

export const PortfolioStorage = {
  /** Supabase(클라우드) 사용 여부 */
  isCloud: isCloudEnabled,

  getCategories: () => backend().getCategories(),
  getItems: () => backend().getItems(),
  getProfile: () => backend().getProfile(),

  async saveProfile(profile: SiteProfile, previous?: SiteProfile): Promise<void> {
    await backend().saveProfile(profile, previous);
  },

  /** 사진 파일을 저장하고, 화면에 쓸 수 있는 주소(URL 또는 data URL)를 돌려줍니다. */
  uploadImage: (file: File) => backend().uploadImage(file),

  async createItem(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
    const now = Date.now();
    const newItem: PortfolioItem = {
      ...item,
      id: `item-${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    await backend().insertItem(newItem);
    return newItem;
  },

  async updateItem(id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem | null> {
    const items = await backend().getItems();
    const previous = items.find((i) => i.id === id);
    if (!previous) return null;
    const updated: PortfolioItem = { ...previous, ...updates, updatedAt: Date.now() };
    await backend().updateItem(updated, previous);
    return updated;
  },

  async deleteItem(id: string): Promise<boolean> {
    const items = await backend().getItems();
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    await backend().deleteItem(item);
    return true;
  },

  // Add a brand new submenu (e.g. ATHLETICS · GOLF, ATHLETICS · Swimming, etc.)
  async addSubmenu(categoryId: string, submenuName: string): Promise<Submenu | null> {
    const categories = await backend().getCategories();
    const cat = categories.find((c) => c.id === categoryId);
    const trimmed = submenuName.trim();
    if (!cat || !trimmed) return null;

    const existing = cat.submenus.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const newSub: Submenu = {
      id: `${categoryId}-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      name: trimmed,
      categoryId
    };
    cat.submenus.push(newSub);
    await backend().saveCategories(categories);
    return newSub;
  },

  async deleteSubmenu(categoryId: string, submenuId: string): Promise<boolean> {
    const categories = await backend().getCategories();
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return false;
    cat.submenus = cat.submenus.filter((s) => s.id !== submenuId);
    await backend().saveCategories(categories);
    return true;
  },

  async addCategory(label: string, description?: string): Promise<Category | null> {
    const categories = await backend().getCategories();
    const trimmed = label.trim().toUpperCase();
    if (!trimmed) return null;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (categories.find((c) => c.id === id)) return null;

    const newCat: Category = { id, label: trimmed, description: description || '', submenus: [] };
    categories.push(newCat);
    await backend().saveCategories(categories);
    return newCat;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    const categories = await backend().getCategories();
    const filtered = categories.filter((c) => c.id !== categoryId);
    if (filtered.length === categories.length) return false;
    await backend().saveCategories(filtered);
    return true;
  },

  // Local-mode admin password (클라우드 모드에서는 Supabase 로그인을 사용)
  getAdminPassword(): string {
    return localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(newPassword: string): void {
    localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, newPassword);
  },

  verifyPassword(inputPassword: string): boolean {
    return inputPassword.trim() === this.getAdminPassword();
  },

  /** 모든 자료를 기본 예시 데이터로 되돌립니다. (클라우드 모드에서는 모든 방문자에게 적용) */
  async resetToDefaults(): Promise<void> {
    await backend().replaceAll(DEFAULT_CATEGORIES, DEFAULT_ITEMS, DEFAULT_PROFILE);
    if (!isCloudEnabled) this.setAdminPassword(DEFAULT_ADMIN_PASSWORD);
  },

  /**
   * 이 브라우저에 저장돼 있던 자료(카테고리, 자료, About, 사진)를 Supabase로 옮깁니다.
   * 사진(data URL)은 Storage에 업로드한 뒤 URL로 바꿔 저장합니다.
   */
  async migrateLocalToCloud(onProgress?: (message: string) => void): Promise<{ items: number; images: number }> {
    if (!isCloudEnabled) throw new Error('Supabase is not configured, so migration is not possible.');
    const { categories, items, profile } = await readLocalData();
    const cache = new Map<string, string>();

    const migratedItems: PortfolioItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      onProgress?.(`Uploading item photos... (${i + 1}/${items.length}) ${item.title}`);
      const cover = (await uploadIfDataUrl(item.coverImage, cache)) || '';
      const gallery: string[] = [];
      for (const img of item.galleryImages || []) {
        const url = await uploadIfDataUrl(img, cache);
        if (url) gallery.push(url);
      }
      migratedItems.push({ ...item, coverImage: cover, galleryImages: gallery });
    }

    onProgress?.('Uploading About photos...');
    const migratedProfile: SiteProfile = {
      ...profile,
      portraitImage: await uploadIfDataUrl(profile.portraitImage, cache),
      swimmingImage: await uploadIfDataUrl(profile.swimmingImage, cache)
    };

    onProgress?.('Saving to Supabase...');
    await CloudBackend.replaceAll(categories, migratedItems, migratedProfile);
    return { items: migratedItems.length, images: cache.size };
  }
};
