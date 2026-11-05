import { Category, PortfolioItem, SiteProfile, Submenu } from '../types/portfolio';
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
  subtitle: 'Junior Golfer · All-State Swimmer · STEM Honors Student',
  bio: 'Jackson Hong is a dedicated student-athlete focused on tournament golf and sprint butterfly swimming. Combining rigorous physical discipline with academic excellence in physics and biomechanics, Jackson strives for peak performance on the course, in the water, and in the classroom.',
  location: 'Southern California, USA',
  graduationYear: 'Class of 2026',
  gpa: '3.96 Unweighted / 4.42 Weighted',
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
    galleryImages: [HERO_GOLF_IMAGE, PORTRAIT_IMAGE],
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
    galleryImages: [SWIMMING_IMAGE],
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
    galleryImages: [PORTRAIT_IMAGE],
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
    galleryImages: [PORTRAIT_IMAGE],
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

// Convert uploaded file from user's computer into base64 data URL with optional client-side optimization
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // If it's an image, we can optionally resize if exceedingly large (>5MB) to keep IndexedDB snappy
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read file'));
        return;
      }

      // If file is > 3MB, downscale via canvas to keep preview lightning fast
      if (file.size > 3 * 1024 * 1024 && file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1920;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
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

// Storage Service API
export const PortfolioStorage = {
  // Get Categories & Submenus
  async getCategories(): Promise<Category[]> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_CATEGORIES, 'readonly');
      const store = tx.objectStore(STORE_CATEGORIES);
      const req = store.getAll();
      const result = await new Promise<Category[]>((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (result && result.length > 0) {
        return result;
      }
    } catch {
      // Fallback to localStorage
    }

    const local = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // ignore
      }
    }

    // Seed defaults
    await this.saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  // Save Categories & Submenus
  async saveCategories(categories: Category[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
      const db = await openDatabase();
      const tx = db.transaction(STORE_CATEGORIES, 'readwrite');
      const store = tx.objectStore(STORE_CATEGORIES);
      store.clear();
      for (const cat of categories) {
        store.put(cat);
      }
    } catch {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    }
  },

  // Get All Portfolio Items
  async getItems(): Promise<PortfolioItem[]> {
    const normalizeMedia = (item: PortfolioItem): PortfolioItem => {
      let cover = item.coverImage;
      if (!cover || cover.includes('jackson_hero_golf')) {
        cover = HERO_GOLF_IMAGE;
      } else if (cover.includes('jackson_swimming_action')) {
        cover = SWIMMING_IMAGE;
      } else if (cover.includes('jackson_portrait_headshot')) {
        cover = PORTRAIT_IMAGE;
      }

      const gallery = (item.galleryImages || []).map(img => {
        if (!img || img.includes('jackson_hero_golf')) return HERO_GOLF_IMAGE;
        if (img.includes('jackson_swimming_action')) return SWIMMING_IMAGE;
        if (img.includes('jackson_portrait_headshot')) return PORTRAIT_IMAGE;
        return img;
      });

      // Update old un-embeddable Rick Astley test video ID to verified USGA Junior Championship video
      let youtubeId = item.youtubeVideoId;
      let youtubeUrl = item.youtubeUrl;
      if (youtubeId === 'ScMzIvxBSi4') {
        if (item.id === 'item-golf-1') {
          youtubeId = 'rh1x18eIhco';
          youtubeUrl = 'https://www.youtube.com/watch?v=rh1x18eIhco';
        } else {
          youtubeId = 'OQsQQk-n-7A';
          youtubeUrl = 'https://www.youtube.com/watch?v=OQsQQk-n-7A';
        }
      }

      return {
        ...item,
        coverImage: cover,
        galleryImages: gallery,
        youtubeVideoId: youtubeId,
        youtubeUrl
      };
    };

    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_ITEMS, 'readonly');
      const store = tx.objectStore(STORE_ITEMS);
      const req = store.getAll();
      const result = await new Promise<PortfolioItem[]>((resolve) => {
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (result && result.length > 0) {
        return result.map(normalizeMedia).sort((a, b) => b.createdAt - a.createdAt);
      }
    } catch {
      // Fallback
    }

    const local = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed.map(normalizeMedia).sort((a: PortfolioItem, b: PortfolioItem) => b.createdAt - a.createdAt);
      } catch {
        // ignore
      }
    }

    // Seed default items
    await this.saveItems(DEFAULT_ITEMS);
    return DEFAULT_ITEMS;
  },

  // Save All Items
  async saveItems(items: PortfolioItem[]): Promise<void> {
    try {
      // Save items to IndexedDB
      const db = await openDatabase();
      const tx = db.transaction(STORE_ITEMS, 'readwrite');
      const store = tx.objectStore(STORE_ITEMS);
      store.clear();
      for (const item of items) {
        store.put(item);
      }

      // Also save lightweight copy in localStorage (without massive data URLs if any)
      const lightweight = items.map(item => ({
        ...item,
        coverImage: item.coverImage.startsWith('data:') && item.coverImage.length > 200000 ? '' : item.coverImage,
        galleryImages: item.galleryImages.filter(img => !img.startsWith('data:') || img.length < 200000)
      }));
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(lightweight));
    } catch {
      try {
        localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
      } catch {
        // storage quota fallback
      }
    }
  },

  // Create single item
  async createItem(item: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PortfolioItem> {
    const items = await this.getItems();
    const newItem: PortfolioItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    items.unshift(newItem);
    await this.saveItems(items);
    return newItem;
  },

  // Update single item
  async updateItem(id: string, updates: Partial<PortfolioItem>): Promise<PortfolioItem | null> {
    const items = await this.getItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const updatedItem: PortfolioItem = {
      ...items[idx],
      ...updates,
      updatedAt: Date.now()
    };
    items[idx] = updatedItem;
    await this.saveItems(items);
    return updatedItem;
  },

  // Delete item
  async deleteItem(id: string): Promise<boolean> {
    const items = await this.getItems();
    const filtered = items.filter(i => i.id !== id);
    if (filtered.length === items.length) return false;
    await this.saveItems(filtered);
    return true;
  },

  // Add a brand new submenu (e.g. ATHLETICS · GOLF, ATHLETICS · Swimming, etc.)
  async addSubmenu(categoryId: string, submenuName: string): Promise<Submenu | null> {
    const categories = await this.getCategories();
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return null;

    const trimmed = submenuName.trim();
    if (!trimmed) return null;

    // Check duplicate
    const existing = cat.submenus.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing;

    const id = `${categoryId}-${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSub: Submenu = {
      id,
      name: trimmed,
      categoryId
    };

    cat.submenus.push(newSub);
    await this.saveCategories(categories);
    return newSub;
  },

  // Delete a submenu
  async deleteSubmenu(categoryId: string, submenuId: string): Promise<boolean> {
    const categories = await this.getCategories();
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return false;

    cat.submenus = cat.submenus.filter(s => s.id !== submenuId);
    await this.saveCategories(categories);
    return true;
  },

  // Add a brand new top Category
  async addCategory(label: string, description?: string): Promise<Category | null> {
    const categories = await this.getCategories();
    const trimmed = label.trim().toUpperCase();
    if (!trimmed) return null;

    const id = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (categories.find(c => c.id === id)) {
      return null;
    }

    const newCat: Category = {
      id,
      label: trimmed,
      description: description || '',
      submenus: []
    };

    categories.push(newCat);
    await this.saveCategories(categories);
    return newCat;
  },

  // Delete top category
  async deleteCategory(categoryId: string): Promise<boolean> {
    let categories = await this.getCategories();
    const initialLen = categories.length;
    categories = categories.filter(c => c.id !== categoryId);
    if (categories.length === initialLen) return false;
    await this.saveCategories(categories);
    return true;
  },

  // Admin Password Management (Initial password: 1111)
  getAdminPassword(): string {
    const pwd = localStorage.getItem(LOCAL_STORAGE_PASSWORD_KEY);
    return pwd || DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(newPassword: string): void {
    localStorage.setItem(LOCAL_STORAGE_PASSWORD_KEY, newPassword);
  },

  verifyPassword(inputPassword: string): boolean {
    const stored = this.getAdminPassword();
    return inputPassword.trim() === stored;
  },

  // Profile data
  getProfile(): SiteProfile {
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: SiteProfile): void {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
  },

  // Reset all data to factory showcase
  async resetToDefaults(): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_ITEMS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_CATEGORIES_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_PASSWORD_KEY);

    try {
      const db = await openDatabase();
      const tx = db.transaction([STORE_ITEMS, STORE_CATEGORIES], 'readwrite');
      tx.objectStore(STORE_ITEMS).clear();
      tx.objectStore(STORE_CATEGORIES).clear();
    } catch {
      // ignore
    }

    await this.saveCategories(DEFAULT_CATEGORIES);
    await this.saveItems(DEFAULT_ITEMS);
    this.saveProfile(DEFAULT_PROFILE);
    this.setAdminPassword(DEFAULT_ADMIN_PASSWORD);
  }
};
