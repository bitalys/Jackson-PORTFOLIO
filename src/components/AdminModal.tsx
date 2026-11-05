import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Lock, Unlock, Plus, Trash2, Edit3, Upload, Film, 
  Image as ImageIcon, Check, RefreshCw, KeyRound, Layers,
  ListPlus, FileText, ArrowLeft, Star, AlertTriangle, Search, Filter, User, Folder, LayoutGrid, List
} from 'lucide-react';
import { Category, PortfolioItem, StatHighlight, Submenu, MediaType, SiteProfile } from '../types/portfolio';
import { 
  PortfolioStorage, 
  readFileAsDataUrl, 
  extractYouTubeId,
  DEFAULT_PROFILE
} from '../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  categories: Category[];
  items: PortfolioItem[];
  onDataChanged: () => void;
  editingItemInitial?: PortfolioItem | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLoginSuccess,
  onLogout,
  categories,
  items,
  onDataChanged,
  editingItemInitial
}) => {
  // Navigation Tabs inside Admin: items | categories | about | settings
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'about' | 'settings'>('items');

  // Confirmation modal state for destructive delete operations
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const promptDelete = (title: string, description: string, onConfirm: () => void | Promise<void>) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      description,
      onConfirm
    });
  };

  // Items Tab Filter & Categorization State
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterSubmenuId, setFilterSubmenuId] = useState<string>('all');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [viewModeGrouping, setViewModeGrouping] = useState<'grouped' | 'list'>('grouped');

  // About / Profile CMS State
  const [aboutProfile, setAboutProfile] = useState<SiteProfile>(() => PortfolioStorage.getProfile());
  const [aboutFeedback, setAboutFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync aboutProfile on open or tab change
  useEffect(() => {
    if (isOpen) {
      setAboutProfile(PortfolioStorage.getProfile());
    }
  }, [isOpen, activeTab]);
  
  // Password prompt state
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Item Form state (for Add or Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submenuId, setSubmenuId] = useState('');
  const [date, setDate] = useState('');
  const [featured, setFeatured] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>('both');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [highlights, setHighlights] = useState<StatHighlight[]>([
    { id: '1', label: 'Score / Record', value: '' },
    { id: '2', label: 'Placement', value: '' }
  ]);
  const [externalLink, setExternalLink] = useState('');
  const [externalLinkLabel, setExternalLinkLabel] = useState('');

  // File upload drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Quick Submenu Modal inside form or category tab
  const [newSubmenuName, setNewSubmenuName] = useState('');
  const [newSubmenuCategoryId, setNewSubmenuCategoryId] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  // Status messages
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize when opening or setting edit item
  React.useEffect(() => {
    if (editingItemInitial && isAdmin) {
      handleStartEdit(editingItemInitial);
    }
  }, [editingItemInitial, isAdmin]);

  if (!isOpen) return null;

  // Handle Login with password (initial password '1111')
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (PortfolioStorage.verifyPassword(passwordInput)) {
      setPasswordError('');
      setPasswordInput('');
      onLoginSuccess();
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다. (초기 비밀번호: 1111)');
    }
  };

  // Start adding new item
  const handleStartNewItem = () => {
    setEditItemId(null);
    setTitle('');
    setSubtitle('');
    const defaultCat = categories[0]?.id || 'athletics';
    setCategoryId(defaultCat);
    const catObj = categories.find((c) => c.id === defaultCat);
    setSubmenuId(catObj?.submenus[0]?.id || '');
    setDate(new Date().getFullYear().toString());
    setFeatured(false);
    setMediaType('both');
    setCoverImage('');
    setGalleryImages([]);
    setYoutubeUrl('');
    setYoutubeVideoId('');
    setSummary('');
    setDetails('');
    setHighlights([
      { id: '1', label: 'Score / Record', value: '' },
      { id: '2', label: 'Placement', value: '' }
    ]);
    setExternalLink('');
    setExternalLinkLabel('');
    setFormFeedback(null);
    setIsEditing(true);
  };

  // Start editing existing item
  const handleStartEdit = (item: PortfolioItem) => {
    setEditItemId(item.id);
    setTitle(item.title);
    setSubtitle(item.subtitle || '');
    setCategoryId(item.categoryId);
    setSubmenuId(item.submenuId);
    setDate(item.date);
    setFeatured(item.featured);
    setMediaType(item.mediaType);

    // Unify all existing images and deduplicate so cover is never duplicated in gallery
    const allImgs = Array.from(new Set([item.coverImage, ...(item.galleryImages || [])].filter(Boolean)));
    const defaultCover = item.coverImage || (allImgs.length > 0 ? allImgs[0] : '');
    setCoverImage(defaultCover);
    setGalleryImages(allImgs);

    setYoutubeUrl(item.youtubeUrl || '');
    setYoutubeVideoId(item.youtubeVideoId || '');
    setSummary(item.summary);
    setDetails(item.details || '');
    setHighlights(item.highlights && item.highlights.length > 0 ? item.highlights : [
      { id: '1', label: 'Score / Record', value: '' }
    ]);
    setExternalLink(item.externalLink || '');
    setExternalLinkLabel(item.externalLinkLabel || '');
    setFormFeedback(null);
    setIsEditing(true);
  };

  // Handle Computer Folder File Uploads (Gallery & Cover)
  const handleGalleryFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const dataUrl = await readFileAsDataUrl(files[i]);
        urls.push(dataUrl);
      }
      
      setGalleryImages((prev) => {
        const combined = Array.from(new Set([...prev, ...urls]));
        // When one or more photos are registered, default the very first photo as the cover photo!
        setCoverImage((currentCover) => {
          if (!currentCover && combined.length > 0) {
            return combined[0];
          }
          if (prev.length === 0 && combined.length > 0) {
            return combined[0];
          }
          return currentCover || combined[0];
        });
        return combined;
      });
    } catch {
      alert('갤러리 이미지를 읽는 중 오류가 발생했습니다.');
    }
  };

  // Handle YouTube URL change and auto extraction
  const handleYouTubeUrlChange = (url: string) => {
    setYoutubeUrl(url);
    const extracted = extractYouTubeId(url);
    setYoutubeVideoId(extracted);
  };

  // Highlights handlers
  const handleAddHighlight = () => {
    setHighlights((prev) => [...prev, { id: Date.now().toString(), label: '', value: '' }]);
  };
  const handleUpdateHighlight = (id: string, field: 'label' | 'value', text: string) => {
    setHighlights((prev) => prev.map((h) => (h.id === id ? { ...h, [field]: text } : h)));
  };
  const handleRemoveHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormFeedback({ type: 'error', message: '자료 제목을 입력해주세요.' });
      return;
    }
    if (!categoryId) {
      setFormFeedback({ type: 'error', message: '카테고리를 선택해주세요.' });
      return;
    }

    const cleanedHighlights = highlights.filter((h) => h.label.trim() && h.value.trim());

    // When one or more photos exist, default the first photo as the cover if not set
    const finalCover = coverImage || (galleryImages.length > 0 ? galleryImages[0] : '');
    // Gallery images should not duplicate the cover image
    const finalGallery = galleryImages.filter((img) => img !== finalCover);

    try {
      if (editItemId) {
        await PortfolioStorage.updateItem(editItemId, {
          title,
          subtitle,
          categoryId,
          submenuId,
          date,
          featured,
          mediaType,
          coverImage: finalCover,
          galleryImages: finalGallery,
          youtubeUrl,
          youtubeVideoId,
          summary,
          details,
          highlights: cleanedHighlights,
          externalLink,
          externalLinkLabel
        });
        setFormFeedback({ type: 'success', message: '자료가 성공적으로 수정되었습니다.' });
      } else {
        await PortfolioStorage.createItem({
          title,
          subtitle,
          categoryId,
          submenuId,
          date: date || new Date().getFullYear().toString(),
          featured,
          mediaType,
          coverImage: finalCover,
          galleryImages: finalGallery,
          youtubeUrl,
          youtubeVideoId,
          summary,
          details,
          highlights: cleanedHighlights,
          externalLink,
          externalLinkLabel
        });
        setFormFeedback({ type: 'success', message: '새 자료가 성공적으로 등록되었습니다.' });
      }

      onDataChanged();
      setTimeout(() => {
        setIsEditing(false);
        setFormFeedback(null);
      }, 700);
    } catch {
      setFormFeedback({ type: 'error', message: '저장 중 오류가 발생했습니다.' });
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    await PortfolioStorage.deleteItem(id);
    onDataChanged();
  };

  // Create Submenu (서브 메뉴 새로 생성)
  const handleCreateSubmenu = async (catId: string) => {
    if (!newSubmenuName.trim()) return;
    const created = await PortfolioStorage.addSubmenu(catId, newSubmenuName.trim());
    if (created) {
      setNewSubmenuName('');
      onDataChanged();
      // If currently editing, select this newly created submenu
      if (isEditing) {
        setSubmenuId(created.id);
      }
    }
  };

  // Delete Submenu with confirmation dialog
  const handleDeleteSubmenu = (catId: string, subId: string, subName?: string) => {
    promptDelete(
      '서브메뉴 삭제 확인',
      `'${subName || '서브메뉴'}'를 삭제하시겠습니까? 해당 서브메뉴에 속한 자료는 카테고리에 안전하게 유지됩니다.`,
      async () => {
        await PortfolioStorage.deleteSubmenu(catId, subId);
        onDataChanged();
      }
    );
  };

  // Create Top Category
  const handleCreateCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    const cat = await PortfolioStorage.addCategory(newCategoryLabel.trim());
    if (cat) {
      setNewCategoryLabel('');
      onDataChanged();
    } else {
      setFormFeedback({ type: 'error', message: '이미 존재하는 카테고리이거나 생성이 불가능합니다.' });
    }
  };

  // Delete Top Category with confirmation dialog
  const handleDeleteCategory = (catId: string, catLabel?: string) => {
    promptDelete(
      '카테고리 삭제 확인',
      `'${catLabel || '카테고리'}'를 삭제하시겠습니까? 포함된 하위 서브메뉴가 함께 삭제됩니다.`,
      async () => {
        await PortfolioStorage.deleteCategory(catId);
        onDataChanged();
      }
    );
  };

  // About CMS Handlers (Home 상단 About 내용 수정)
  const handlePortraitUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const dataUrl = await readFileAsDataUrl(files[0]);
      setAboutProfile((prev) => ({ ...prev, portraitImage: dataUrl }));
      setAboutFeedback({ type: 'success', message: '인물 프로필 사진이 등록되었습니다. 하단 [저장하기]를 눌러 적용하세요.' });
    } catch {
      setAboutFeedback({ type: 'error', message: '사진 파일을 읽는 중 오류가 발생했습니다.' });
    }
  };

  const handleSwimmingUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const dataUrl = await readFileAsDataUrl(files[0]);
      setAboutProfile((prev) => ({ ...prev, swimmingImage: dataUrl }));
      setAboutFeedback({ type: 'success', message: '수영/경기 사진이 등록되었습니다. 하단 [저장하기]를 눌러 적용하세요.' });
    } catch {
      setAboutFeedback({ type: 'error', message: '사진 파일을 읽는 중 오류가 발생했습니다.' });
    }
  };

  const handleUpdateAboutMetric = (index: number, field: 'label' | 'value' | 'sublabel', val: string) => {
    setAboutProfile((prev) => {
      const updated = [...prev.metrics];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      }
      return { ...prev, metrics: updated };
    });
  };

  const handleUpdateAboutPillar = (index: number, field: 'title' | 'description', val: string) => {
    setAboutProfile((prev) => {
      const updated = prev.pillars ? [...prev.pillars] : [
        { id: 'p1', title: 'Tournament Golf', description: '' },
        { id: 'p2', title: 'CIF State Swimming', description: '' },
        { id: 'p3', title: 'STEM & Research', description: '' },
        { id: 'p4', title: 'Youth Mentorship', description: '' }
      ];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: val };
      }
      return { ...prev, pillars: updated };
    });
  };

  const handleSaveAboutProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      PortfolioStorage.saveProfile(aboutProfile);
      onDataChanged();
      setAboutFeedback({ type: 'success', message: 'Home 상단 About 소개 내용이 성공적으로 저장되었습니다!' });
      setTimeout(() => setAboutFeedback(null), 4000);
    } catch {
      setAboutFeedback({ type: 'error', message: '저장 중 오류가 발생했습니다.' });
    }
  };

  // Change Admin Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    PortfolioStorage.setAdminPassword(newPassword.trim());
    setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다!');
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  // Reset to Factory Default Data with confirmation dialog
  const handleResetDefaults = () => {
    promptDelete(
      '전체 데이터 초기화 확인',
      '모든 포트폴리오 자료와 카테고리를 잭슨 홍(Jackson Hong)의 기본 예시 데이터로 초기화하시겠습니까? 초기 비밀번호는 1111로 복원됩니다.',
      async () => {
        await PortfolioStorage.resetToDefaults();
        onDataChanged();
        setAboutProfile(PortfolioStorage.getProfile());
        setFormFeedback({ type: 'success', message: '기본 예시 데이터로 복원되었습니다.' });
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-950/85 backdrop-blur-md overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-lg font-bold text-white">
                관리자 페이지 (Admin CMS)
              </h2>
              <p className="text-xs text-neutral-400">
                Jackson Hong Portfolio 자료 추가, 수정, 삭제 및 서브메뉴 관리
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={onLogout}
                className="cursor-pointer px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
              >
                로그아웃
              </button>
            )}
            <button
              onClick={onClose}
              className="cursor-pointer p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In: Password Gate */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-6 text-amber-400 shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="font-['Outfit'] text-2xl font-bold text-white mb-2">
              관리자 인증
            </h3>
            <p className="text-xs text-neutral-400 mb-6">
              포트폴리오 자료와 서브 메뉴를 관리하려면 비밀번호를 입력해주세요.
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="비밀번호 입력 (초기: 1111)"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-center text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-xs text-red-400 mt-2 font-medium">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm hover:bg-amber-400 active:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10"
              >
                로그인 (Login)
              </button>

              <div className="pt-2 text-xs text-neutral-400 font-medium">
                안내: 초기 관리자 비밀번호는 <strong className="text-amber-400 font-mono">1111</strong> 입니다.
              </div>
            </form>
          </div>
        ) : (
          /* Logged In: Admin Console */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Admin Tabs */}
            {!isEditing && (
              <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-800 bg-neutral-950/40">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'items'
                      ? 'text-amber-400 border-amber-400 bg-neutral-800/60 font-bold'
                      : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>자료 관리 (Items & Works) ({items.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'categories'
                      ? 'text-amber-400 border-amber-400 bg-neutral-800/60 font-bold'
                      : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>서브 메뉴 & 카테고리 관리</span>
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'about'
                      ? 'text-amber-400 border-amber-400 bg-neutral-800/60 font-bold'
                      : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Home About 소개 관리</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                    activeTab === 'settings'
                      ? 'text-amber-400 border-amber-400 bg-neutral-800/60 font-bold'
                      : 'text-neutral-400 border-transparent hover:text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>비밀번호 & 데이터 설정</span>
                </button>
              </div>
            )}

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* -------------------- 1. ITEM EDITOR FORM -------------------- */}
              {isEditing ? (
                <form onSubmit={handleSaveItem} className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="cursor-pointer flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>목록으로 돌아가기</span>
                    </button>
                    <h3 className="font-['Outfit'] text-base font-bold text-white">
                      {editItemId ? '자료 수정 (Edit Item)' : '새 자료 추가 (Add New Item)'}
                    </h3>
                  </div>

                  {formFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
                        formFeedback.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {formFeedback.message}
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">
                        자료 제목 (Title) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="예: AJGA Junior Championship 2nd Place, CIF 100m Butterfly Gold"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-neutral-300">
                        부제목 / 장소 / 대회명 (Subtitle / Venue)
                      </label>
                      <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="예: Pebble Beach Golf Links, Olympic Aquatic Center"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Category & Submenu Selector + Quick Add Submenu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        메인 카테고리 (Category) <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setCategoryId(newCat);
                          const catObj = categories.find((c) => c.id === newCat);
                          setSubmenuId(catObj?.submenus[0]?.id || '');
                        }}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-300">
                          서브 메뉴 (Sub-menu)
                        </label>
                        <span className="text-[11px] text-amber-400">
                          새 서브메뉴 추가 가능
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={submenuId}
                          onChange={(e) => setSubmenuId(e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          {categories
                            .find((c) => c.id === categoryId)
                            ?.submenus.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Inline Quick Submenu Creator */}
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <input
                          type="text"
                          value={newSubmenuName}
                          onChange={(e) => setNewSubmenuName(e.target.value)}
                          placeholder="새 서브메뉴명 (예: GOLF, Swimming)"
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-md px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleCreateSubmenu(categoryId)}
                          className="cursor-pointer px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-md transition-colors whitespace-nowrap"
                        >
                          + 서브메뉴 생성
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        일자 / 시기 (Date / Season)
                      </label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="예: 2024.10 또는 Summer 2024"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="rounded border-neutral-700 text-amber-500 focus:ring-amber-400"
                        />
                        <span className="font-semibold text-white">메인 홈 상단에 Featured로 추천 노출</span>
                      </label>
                    </div>
                  </div>

                  {/* Media Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-neutral-300">
                      미디어 형태 (Media Type)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaType('both')}
                        className={`cursor-pointer flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          mediaType === 'both'
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        영상 + 이미지 둘 다
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('youtube')}
                        className={`cursor-pointer flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          mediaType === 'youtube'
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        유튜브 영상 중심
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('image')}
                        className={`cursor-pointer flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                          mediaType === 'image'
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        사진 갤러리 중심
                      </button>
                    </div>
                  </div>

                  {/* YouTube Video Link Input with Instant Preview */}
                  {(mediaType === 'youtube' || mediaType === 'both') && (
                    <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                        <Film className="w-4 h-4" />
                        <span>유튜브 영상 링크 추가 (YouTube Link)</span>
                      </div>
                      <input
                        type="text"
                        value={youtubeUrl}
                        onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                        placeholder="예: https://www.youtube.com/watch?v=ScMzIvxBSi4 또는 https://youtu.be/..."
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400 font-mono"
                      />

                      {/* YouTube Live Preview */}
                      {youtubeVideoId ? (
                        <div className="space-y-2">
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                            <Check className="w-3.5 h-3.5" />
                            유튜브 ID 인식 완료: <code className="bg-neutral-800 px-1 py-0.5 rounded font-mono">{youtubeVideoId}</code>
                          </span>
                          <div className="relative aspect-video max-w-md rounded-lg overflow-hidden border border-neutral-800 bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                              title="YouTube Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                            />
                          </div>
                          <a
                            href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-red-400 hover:text-red-300 font-semibold inline-flex items-center gap-1"
                          >
                            <Film className="w-3 h-3" />
                            <span>YouTube 새 탭에서 확인</span>
                          </a>
                        </div>
                      ) : youtubeUrl ? (
                        <p className="text-[11px] text-amber-400">
                          유튜브 URL을 인식하고 있습니다. 정상적인 링크인지 확인해주세요.
                        </p>
                      ) : null}
                    </div>
                  )}

                  {/* Computer Folder Image Upload (내 컴퓨터 폴더에서 업로드) */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                        <Upload className="w-4 h-4" />
                        <span>내 컴퓨터 폴더에서 사진 업로드 (Local Computer Upload)</span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        JPG, PNG, WebP 지원
                      </span>
                    </div>

                    {/* Drag and drop zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleGalleryFilesUpload(e.dataTransfer.files);
                      }}
                      onClick={() => galleryInputRef.current?.click()}
                      className={`cursor-pointer p-6 rounded-xl border-2 border-dashed text-center transition-colors ${
                        isDragging
                          ? 'border-amber-400 bg-amber-500/10'
                          : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 hover:bg-neutral-900'
                      }`}
                    >
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleGalleryFilesUpload(e.target.files)}
                      />
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                      <p className="text-xs text-neutral-200 font-semibold mb-1">
                        클릭하여 컴퓨터 폴더에서 사진 선택 또는 드래그 & 드롭
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        여러 장을 한 번에 선택하여 갤러리를 구성할 수 있습니다.
                      </p>
                    </div>

                    {/* Uploaded Images Preview Strip */}
                    {galleryImages.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <label className="text-[11px] font-semibold text-neutral-300 block">
                          업로드된 사진 목록 ({galleryImages.length}장) — 대표 사진을 선택하거나 삭제할 수 있습니다:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {galleryImages.map((img, idx) => {
                            const isCover = coverImage ? coverImage === img : idx === 0;
                            return (
                              <div
                                key={idx}
                                className={`relative rounded-lg overflow-hidden border-2 aspect-video group ${
                                  isCover ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-neutral-800'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt="uploaded"
                                  className="w-full h-full object-cover"
                                />
                                {isCover && (
                                  <span className="absolute top-1 left-1 bg-amber-500 text-neutral-950 font-bold text-[9px] px-1.5 py-0.5 rounded">
                                    대표 커버
                                  </span>
                                )}
                                <div className="absolute inset-0 bg-neutral-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                  {!isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setCoverImage(img)}
                                      className="cursor-pointer px-2 py-1 rounded bg-amber-500 text-neutral-950 text-[10px] font-bold"
                                    >
                                      커버 지정
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      promptDelete(
                                        '업로드 사진 삭제 확인',
                                        '선택한 사진을 갤러리 목록에서 삭제하시겠습니까?',
                                        () => {
                                          const updated = galleryImages.filter((_, i) => i !== idx);
                                          setGalleryImages(updated);
                                          if (isCover && updated.length > 0) {
                                            setCoverImage(updated[0]);
                                          } else if (isCover) {
                                            setCoverImage('');
                                          }
                                        }
                                      );
                                    }}
                                    className="cursor-pointer p-1 rounded bg-red-600 hover:bg-red-500 text-white transition-colors"
                                    title="사진 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Highlights Key Metrics (e.g. Score: 68 (-4), Rank: 2nd) */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-300">
                        주요 성과 / 수치 지표 (Highlights / Key Stats)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="cursor-pointer text-xs text-amber-400 hover:text-amber-300 font-semibold"
                      >
                        + 지표 추가
                      </button>
                    </div>

                    <div className="space-y-2">
                      {highlights.map((h) => (
                        <div key={h.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h.label}
                            onChange={(e) => handleUpdateHighlight(h.id, 'label', e.target.value)}
                            placeholder="항목명 (예: Score, Time, Rank)"
                            className="w-1/3 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={h.value}
                            onChange={(e) => handleUpdateHighlight(h.id, 'value', e.target.value)}
                            placeholder="값 (예: 68 (-4), 50.82s, 1st Place)"
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              promptDelete(
                                '성과 지표 삭제 확인',
                                `'${h.label || '성과 지표'}' 항목을 삭제하시겠습니까?`,
                                () => handleRemoveHighlight(h.id)
                              );
                            }}
                            className="cursor-pointer p-1.5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                            title="지표 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Details */}
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        간략 요약 (Card Summary) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="카드 목록에 표시될 1~2문장의 핵심 요약"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        상세 스토리 및 설명 (Full Narrative & Overview)
                      </label>
                      <textarea
                        rows={5}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="대회 과정, 경기 하이라이트, 기록 상세 또는 프로젝트 내용을 상세히 적어주세요."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* External Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        외부 웹사이트 / 공식 기록 링크 (URL)
                      </label>
                      <input
                        type="url"
                        value={externalLink}
                        onChange={(e) => setExternalLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        링크 버튼 문구 (Button Label)
                      </label>
                      <input
                        type="text"
                        value={externalLinkLabel}
                        onChange={(e) => setExternalLinkLabel(e.target.value)}
                        placeholder="예: AJGA 공식 리더보드 확인"
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-lg shadow-amber-500/10"
                    >
                      {editItemId ? '수정사항 저장' : '새 자료 등록'}
                    </button>
                  </div>
                </form>
              ) : activeTab === 'items' ? (
                /* -------------------- 2. ITEMS LIST TAB -------------------- */
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="font-['Outfit'] text-base font-bold text-white">
                        등록된 자료 목록 ({items.length}개)
                      </h3>
                      <p className="text-xs text-neutral-400">
                        컴퓨터에서 사진을 업로드하거나 유튜브 영상을 등록한 포트폴리오 항목입니다.
                      </p>
                    </div>

                    <button
                      onClick={handleStartNewItem}
                      className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ 자료 추가하기</span>
                    </button>
                  </div>

                  {/* List of items */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const cat = categories.find((c) => c.id === item.categoryId);
                      const sub = cat?.submenus.find((s) => s.id === item.submenuId);

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-4 hover:border-neutral-700 transition-colors"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Thumbnail */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 relative">
                              {item.coverImage ? (
                                <img
                                  src={item.coverImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              {item.youtubeVideoId && (
                                <div className="absolute inset-0 bg-neutral-950/40 flex items-center justify-center">
                                  <Film className="w-3.5 h-3.5 text-amber-400" />
                                </div>
                              )}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <span className="font-semibold text-amber-400">
                                  {cat?.label || item.categoryId} · {sub?.name || item.submenuId}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-neutral-400">{item.date}</span>
                                {item.featured && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-amber-300 text-[10px] font-bold">Featured</span>
                                  </>
                                )}
                              </div>
                              <h4 className="font-bold text-white text-sm truncate">
                                {item.title}
                              </h4>
                              <p className="text-xs text-neutral-400 truncate max-w-xl">
                                {item.summary}
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>수정</span>
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`'${item.title}' 자료를 정말 삭제하시겠습니까?`)) {
                                  handleDeleteItem(item.id);
                                }
                              }}
                              className="cursor-pointer p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : activeTab === 'categories' ? (
                /* -------------------- 3. SUBMENU & CATEGORY MANAGEMENT -------------------- */
                <div className="space-y-6">
                  <div>
                    <h3 className="font-['Outfit'] text-base font-bold text-white mb-1">
                      서브 메뉴 및 카테고리 관리 (Sub-menus & Categories)
                    </h3>
                    <p className="text-xs text-neutral-400">
                      새로운 서브 메뉴(예: ATHLETICS · GOLF, ATHLETICS · Swimming 등)를 자유롭게 추가하거나 삭제할 수 있습니다.
                    </p>
                  </div>

                  {/* Add New Top Category */}
                  <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                    <label className="text-xs font-semibold text-neutral-300 block">
                      + 새로운 대분류 카테고리 생성 (Add Top Category)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newCategoryLabel}
                        onChange={(e) => setNewCategoryLabel(e.target.value)}
                        placeholder="예: PRESS & MEDIA, CERTIFICATIONS"
                        className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 uppercase"
                      />
                      <button
                        onClick={handleCreateCategory}
                        className="cursor-pointer px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg transition-colors border border-neutral-700"
                      >
                        대분류 생성
                      </button>
                    </div>
                  </div>

                  {/* List of Categories and their Submenus */}
                  <div className="space-y-4">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-['Outfit'] text-base font-extrabold text-amber-400 tracking-wide">
                                {cat.label}
                              </h4>
                              <span className="text-xs text-neutral-400 font-mono">
                                (ID: {cat.id})
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
                            )}
                          </div>

                          {categories.length > 1 && (
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="cursor-pointer p-1.5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                              title="카테고리 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Submenus under this category */}
                        <div className="space-y-2">
                          <label className="text-xs font-semibold text-neutral-300 block">
                            서브 메뉴 목록 (Sub-menus):
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {cat.submenus.map((sub) => {
                              const itemCount = items.filter(
                                (i) => i.categoryId === cat.id && i.submenuId === sub.id
                              ).length;

                              return (
                                <div
                                  key={sub.id}
                                  className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/80 flex items-center justify-between gap-2"
                                >
                                  <div>
                                    <span className="font-bold text-xs text-white block">
                                      {sub.name}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                      연결 자료: {itemCount}개
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteSubmenu(cat.id, sub.id)}
                                    className="cursor-pointer p-1 text-neutral-500 hover:text-red-400 rounded"
                                    title="서브메뉴 삭제"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Add Submenu to this specific category */}
                          <div className="pt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={newSubmenuCategoryId === cat.id ? newSubmenuName : ''}
                              onChange={(e) => {
                                setNewSubmenuCategoryId(cat.id);
                                setNewSubmenuName(e.target.value);
                              }}
                              placeholder={`'${cat.label}'에 새 서브메뉴 추가 (예: GOLF, Swimming, Conditioning)`}
                              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                            <button
                              onClick={() => {
                                setNewSubmenuCategoryId(cat.id);
                                handleCreateSubmenu(cat.id);
                              }}
                              className="cursor-pointer px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                            >
                              + 서브메뉴 추가
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* -------------------- 4. SETTINGS TAB -------------------- */
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* Change Password */}
                  <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>관리자 비밀번호 변경</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      현재 설정된 비밀번호를 새로운 비밀번호로 변경할 수 있습니다. (초기 비밀번호: 1111)
                    </p>

                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호 입력"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      {passwordSuccess && (
                        <p className="text-xs text-emerald-400">{passwordSuccess}</p>
                      )}
                      <button
                        type="submit"
                        className="cursor-pointer px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs rounded-lg transition-colors border border-neutral-700"
                      >
                        비밀번호 변경 저장
                      </button>
                    </form>
                  </div>

                  {/* Reset to Factory Defaults */}
                  <div className="p-6 rounded-xl border border-red-950/60 bg-red-950/10 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                      <RefreshCw className="w-4 h-4" />
                      <span>기본 데이터 초기화 (Reset to Defaults)</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      모든 포트폴리오 자료와 서브 메뉴를 Jackson Hong의 기본 상태로 되돌립니다.
                      비밀번호도 초기 비밀번호인 <strong className="text-amber-400 font-mono">1111</strong>로 재설정됩니다.
                    </p>
                    <button
                      onClick={handleResetDefaults}
                      className="cursor-pointer px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-semibold text-xs rounded-lg transition-colors border border-red-500/30"
                    >
                      기본 예시 데이터로 초기화
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
