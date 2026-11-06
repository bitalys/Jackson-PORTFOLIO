import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Lock, Unlock, Plus, Trash2, Edit3, Upload, Film, 
  Image as ImageIcon, Check, RefreshCw, KeyRound, Layers,
  ListPlus, FileText, ArrowLeft, Star, AlertTriangle, Search, Filter, User, Folder, LayoutGrid, List
} from 'lucide-react';
import { Category, PortfolioItem, StatHighlight, Submenu, MediaType, SiteProfile } from '../types/portfolio';
import { 
  PortfolioStorage,
  extractYouTubeId,
  DEFAULT_PROFILE,
  PORTRAIT_IMAGE,
  SWIMMING_IMAGE
} from '../services/storage';
import { supabase } from '../lib/supabase';
import { ConfirmDialog } from './ConfirmDialog';

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  categories: Category[];
  items: PortfolioItem[];
  onDataChanged: () => void | Promise<void>;
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
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const promptDelete = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    confirmLabel?: string
  ) => {
    setDeleteConfirm({
      isOpen: true,
      title,
      description,
      onConfirm,
      confirmLabel
    });
  };

  const closeDeleteConfirm = React.useCallback(
    () => setDeleteConfirm((prev) => ({ ...prev, isOpen: false })),
    []
  );

  // Items Tab Filter & Categorization State
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [filterSubmenuId, setFilterSubmenuId] = useState<string>('all');
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [viewModeGrouping, setViewModeGrouping] = useState<'grouped' | 'list'>('grouped');

  // About / Profile CMS State
  const [aboutProfile, setAboutProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [savedProfile, setSavedProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [aboutSaving, setAboutSaving] = useState(false);

  const reloadAboutProfile = React.useCallback(async () => {
    try {
      const p = await PortfolioStorage.getProfile();
      setAboutProfile(p);
      setSavedProfile(p);
    } catch (err) {
      setAboutFeedback({ type: 'error', message: errorMessage(err, 'About 내용을 불러오지 못했습니다.') });
    }
  }, []);
  const [aboutFeedback, setAboutFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync aboutProfile on open or tab change
  useEffect(() => {
    if (isOpen) {
      reloadAboutProfile();
    }
  }, [isOpen, activeTab, reloadAboutProfile]);
  
  // Password prompt state
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
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
  const [uploadingCount, setUploadingCount] = useState(0);
  const [savingItem, setSavingItem] = useState(false);

  // Cloud migration state
  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Synchronize when opening or setting edit item
  React.useEffect(() => {
    if (editingItemInitial && isAdmin) {
      handleStartEdit(editingItemInitial);
    }
  }, [editingItemInitial, isAdmin]);

  if (!isOpen) return null;

  // Handle Login
  // - 클라우드 모드: Supabase 이메일/비밀번호 로그인
  // - 브라우저 모드: 기존 비밀번호 (초기 1111)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supabase) {
      setLoggingIn(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput
      });
      setLoggingIn(false);
      if (error) {
        setPasswordError('이메일 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      setPasswordError('');
      setPasswordInput('');
      onLoginSuccess();
      return;
    }
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
    // 자료 관리에서 카테고리/서브메뉴 필터가 선택돼 있으면 그 분류로 바로 등록
    const filterCat = categories.find((c) => c.id === filterCategoryId);
    const defaultCat = filterCat?.id || categories[0]?.id || 'athletics';
    setCategoryId(defaultCat);
    const catObj = categories.find((c) => c.id === defaultCat);
    const filterSub = catObj?.submenus.find((sm) => sm.id === filterSubmenuId);
    setSubmenuId(filterSub?.id || catObj?.submenus[0]?.id || '');
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
    const fileArr = Array.from(files);
    setUploadingCount((n) => n + fileArr.length);
    try {
      const urls: string[] = [];
      for (const file of fileArr) {
        urls.push(await PortfolioStorage.uploadImage(file));
        setUploadingCount((n) => n - 1);
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
    } catch (err) {
      setFormFeedback({ type: 'error', message: errorMessage(err, '사진 업로드 중 오류가 발생했습니다.') });
    } finally {
      setUploadingCount(0);
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

    if (uploadingCount > 0) {
      setFormFeedback({ type: 'error', message: '사진 업로드가 끝난 뒤 저장해 주세요.' });
      return;
    }

    const cleanedHighlights = highlights.filter((h) => h.label.trim() && h.value.trim());

    // When one or more photos exist, default the first photo as the cover if not set
    const finalCover = coverImage || (galleryImages.length > 0 ? galleryImages[0] : '');
    // Gallery images should not duplicate the cover image
    const finalGallery = galleryImages.filter((img) => img !== finalCover);

    setSavingItem(true);
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

      await onDataChanged();
      setTimeout(() => {
        setIsEditing(false);
        setFormFeedback(null);
      }, 700);
    } catch (err) {
      setFormFeedback({ type: 'error', message: errorMessage(err, '저장 중 오류가 발생했습니다.') });
    } finally {
      setSavingItem(false);
    }
  };

  // Delete Item (최종 확인 후 삭제)
  const handleDeleteItem = (item: PortfolioItem) => {
    promptDelete(
      '자료 삭제 확인',
      `'${item.title}' 자료를 삭제하시겠습니까? 업로드된 사진과 상세 내용이 모두 삭제됩니다.`,
      async () => {
        await PortfolioStorage.deleteItem(item.id);
        await onDataChanged();
      }
    );
  };

  // Items tab: filter + grouping
  const normalizedQuery = itemSearchQuery.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (filterCategoryId !== 'all' && item.categoryId !== filterCategoryId) return false;
    if (filterSubmenuId !== 'all' && item.submenuId !== filterSubmenuId) return false;
    if (!normalizedQuery) return true;
    return [item.title, item.subtitle, item.summary, item.date]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(normalizedQuery));
  });
  const filterCategory = categories.find((c) => c.id === filterCategoryId);

  // 카테고리 > 서브메뉴 순서로 그룹 구성 (어느 분류에도 속하지 않는 자료는 '미분류'로)
  const groupedItems: {
    key: string;
    categoryLabel: string;
    submenuName: string;
    categoryId: string;
    submenuId: string;
    items: PortfolioItem[];
  }[] = [];
  const placedIds = new Set<string>();
  categories.forEach((cat) => {
    cat.submenus.forEach((sub) => {
      const list = filteredItems.filter((i) => i.categoryId === cat.id && i.submenuId === sub.id);
      list.forEach((i) => placedIds.add(i.id));
      if (list.length > 0 || (filterCategoryId === cat.id && (filterSubmenuId === 'all' || filterSubmenuId === sub.id) && !normalizedQuery)) {
        groupedItems.push({ key: `${cat.id}/${sub.id}`, categoryLabel: cat.label, submenuName: sub.name, categoryId: cat.id, submenuId: sub.id, items: list });
      }
    });
    const orphan = filteredItems.filter((i) => i.categoryId === cat.id && !placedIds.has(i.id));
    orphan.forEach((i) => placedIds.add(i.id));
    if (orphan.length > 0) {
      groupedItems.push({ key: `${cat.id}/_none`, categoryLabel: cat.label, submenuName: '서브메뉴 미지정', categoryId: cat.id, submenuId: '', items: orphan });
    }
  });
  const unplaced = filteredItems.filter((i) => !placedIds.has(i.id));
  if (unplaced.length > 0) {
    groupedItems.push({ key: '_none', categoryLabel: '미분류', submenuName: '카테고리 없음', categoryId: '', submenuId: '', items: unplaced });
  }

  const handleStartNewItemIn = (catId: string, subId: string) => {
    handleStartNewItem();
    if (catId) {
      setCategoryId(catId);
      setSubmenuId(subId || categories.find((c) => c.id === catId)?.submenus[0]?.id || '');
    }
  };

  // Create Submenu (서브 메뉴 새로 생성)
  const handleCreateSubmenu = async (catId: string) => {
    if (!newSubmenuName.trim()) return;
    let created;
    try {
      created = await PortfolioStorage.addSubmenu(catId, newSubmenuName.trim());
    } catch (err) {
      alert(errorMessage(err, '서브메뉴 생성 중 오류가 발생했습니다.'));
      return;
    }
    if (created) {
      setNewSubmenuName('');
      await onDataChanged();
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
      `'${subName || '서브메뉴'}' 서브메뉴를 삭제하시겠습니까? 해당 서브메뉴에 속한 자료는 카테고리에 안전하게 유지됩니다.`,
      async () => {
        await PortfolioStorage.deleteSubmenu(catId, subId);
        await onDataChanged();
      }
    );
  };

  // Create Top Category
  const handleCreateCategory = async () => {
    if (!newCategoryLabel.trim()) return;
    try {
      const cat = await PortfolioStorage.addCategory(newCategoryLabel.trim());
      if (cat) {
        setNewCategoryLabel('');
        await onDataChanged();
      } else {
        alert('이미 존재하는 카테고리이거나 생성이 불가능합니다.');
      }
    } catch (err) {
      alert(errorMessage(err, '카테고리 생성 중 오류가 발생했습니다.'));
    }
  };

  // Delete Top Category with confirmation dialog
  const handleDeleteCategory = (catId: string, catLabel?: string) => {
    promptDelete(
      '카테고리 삭제 확인',
      `'${catLabel || '카테고리'}' 카테고리를 삭제하시겠습니까? 포함된 하위 서브메뉴가 함께 삭제됩니다.`,
      async () => {
        await PortfolioStorage.deleteCategory(catId);
        await onDataChanged();
      }
    );
  };

  // About CMS Handlers (Home 상단 About 내용 수정)
  const handlePortraitUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAboutFeedback({ type: 'success', message: '사진을 업로드하는 중입니다...' });
    try {
      const url = await PortfolioStorage.uploadImage(files[0]);
      setAboutProfile((prev) => ({ ...prev, portraitImage: url }));
      setAboutFeedback({ type: 'success', message: '인물 프로필 사진이 등록되었습니다. 하단 [저장하기]를 눌러 적용하세요.' });
    } catch (err) {
      setAboutFeedback({ type: 'error', message: errorMessage(err, '사진 업로드 중 오류가 발생했습니다.') });
    }
  };

  const handleSwimmingUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAboutFeedback({ type: 'success', message: '사진을 업로드하는 중입니다...' });
    try {
      const url = await PortfolioStorage.uploadImage(files[0]);
      setAboutProfile((prev) => ({ ...prev, swimmingImage: url }));
      setAboutFeedback({ type: 'success', message: '수영/경기 사진이 등록되었습니다. 하단 [저장하기]를 눌러 적용하세요.' });
    } catch (err) {
      setAboutFeedback({ type: 'error', message: errorMessage(err, '사진 업로드 중 오류가 발생했습니다.') });
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

  const handleSaveAboutProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutSaving(true);
    try {
      await PortfolioStorage.saveProfile(aboutProfile, savedProfile);
      setSavedProfile(aboutProfile);
      await onDataChanged();
      setAboutFeedback({ type: 'success', message: 'Home 상단 About 소개 내용이 성공적으로 저장되었습니다!' });
      setTimeout(() => setAboutFeedback(null), 4000);
    } catch (err) {
      setAboutFeedback({ type: 'error', message: errorMessage(err, '저장 중 오류가 발생했습니다.') });
    } finally {
      setAboutSaving(false);
    }
  };

  // Change Admin Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (supabase) {
      if (newPassword.trim().length < 6) {
        setPasswordSuccess('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword.trim() });
      if (error) {
        setPasswordSuccess(`비밀번호 변경 실패: ${error.message}`);
        return;
      }
    } else {
      PortfolioStorage.setAdminPassword(newPassword.trim());
    }
    setPasswordSuccess('비밀번호가 성공적으로 변경되었습니다!');
    setNewPassword('');
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  // 이 브라우저에 저장돼 있던 자료를 Supabase로 옮기기
  const handleMigrateToCloud = () => {
    promptDelete(
      '클라우드로 자료 옮기기',
      '이 브라우저에 저장된 자료, 카테고리, About 내용과 사진을 Supabase로 옮깁니다. 현재 클라우드에 있는 내용은 이 브라우저의 내용으로 덮어쓰여집니다. 계속하시겠습니까?',
      async () => {
        setMigrating(true);
        setMigrationMessage({ type: 'info', message: '이전을 시작합니다...' });
        try {
          const result = await PortfolioStorage.migrateLocalToCloud((message) =>
            setMigrationMessage({ type: 'info', message })
          );
          await onDataChanged();
          await reloadAboutProfile();
          setMigrationMessage({
            type: 'success',
            message: `이전 완료: 자료 ${result.items}개, 사진 ${result.images}장을 Supabase로 옮겼습니다.`
          });
        } catch (err) {
          setMigrationMessage({ type: 'error', message: errorMessage(err, '이전 중 오류가 발생했습니다.') });
        } finally {
          setMigrating(false);
        }
      },
      '옮기기'
    );
  };

  // Reset to Factory Default Data with confirmation dialog
  const handleResetDefaults = () => {
    promptDelete(
      '전체 데이터 초기화 확인',
      PortfolioStorage.isCloud
        ? '클라우드(Supabase)에 저장된 모든 자료, 카테고리, About 내용을 기본 예시 데이터로 초기화하시겠습니까? 모든 방문자에게 바로 적용됩니다.'
        : '모든 포트폴리오 자료와 카테고리를 잭슨 홍(Jackson Hong)의 기본 예시 데이터로 초기화하시겠습니까? 초기 비밀번호는 1111로 복원됩니다.',
      async () => {
        await PortfolioStorage.resetToDefaults();
        await onDataChanged();
        await reloadAboutProfile();
        setFormFeedback({ type: 'success', message: '기본 예시 데이터로 복원되었습니다.' });
      }
    );
  };

  const adminInputCls =
    'w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed';

  const renderItemRow = (item: PortfolioItem) => {
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
            onClick={() => handleDeleteItem(item)}
            className="cursor-pointer p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
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
              {supabase
                ? 'Supabase에 등록한 관리자 이메일과 비밀번호로 로그인해주세요.'
                : '포트폴리오 자료와 서브 메뉴를 관리하려면 비밀번호를 입력해주세요.'}
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div className="space-y-2">
                {supabase && (
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="관리자 이메일"
                    autoComplete="username"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-center text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    autoFocus
                    required
                  />
                )}
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder={supabase ? '비밀번호' : '비밀번호 입력 (초기: 1111)'}
                  autoComplete="current-password"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-3 text-center text-base text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono tracking-widest"
                  autoFocus={!supabase}
                />
                {passwordError && (
                  <p className="text-xs text-red-400 mt-2 font-medium">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="cursor-pointer disabled:opacity-60 w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-bold text-sm hover:bg-amber-400 active:bg-amber-600 transition-colors shadow-lg shadow-amber-500/10"
              >
                {loggingIn ? '로그인 중...' : '로그인 (Login)'}
              </button>

              {!supabase && (
                <div className="pt-2 text-xs text-neutral-400 font-medium">
                  안내: 초기 관리자 비밀번호는 <strong className="text-amber-400 font-mono">1111</strong> 입니다.
                </div>
              )}
            </form>
          </div>
        ) : (
          /* Logged In: Admin Console */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Admin Tabs */}
            {!isEditing && (
              <div className="flex items-center gap-2 px-6 pt-4 border-b border-neutral-800 bg-neutral-950/40 overflow-x-auto whitespace-nowrap">
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

                    {uploadingCount > 0 && (
                      <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        사진 {uploadingCount}장 업로드 중...
                      </p>
                    )}

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
                      disabled={savingItem || uploadingCount > 0}
                      className="cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-lg shadow-amber-500/10"
                    >
                      {savingItem ? '저장 중...' : editItemId ? '수정사항 저장' : '새 자료 등록'}
                    </button>
                  </div>
                </form>
              ) : activeTab === 'items' ? (
                /* -------------------- 2. ITEMS LIST TAB -------------------- */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="font-['Outfit'] text-base font-bold text-white">
                        등록된 자료 목록 ({filteredItems.length}
                        {filteredItems.length !== items.length && ` / 전체 ${items.length}`}개)
                      </h3>
                      <p className="text-xs text-neutral-400">
                        카테고리와 서브메뉴별로 분류해서 자료를 관리할 수 있습니다.
                      </p>
                    </div>

                    <button
                      onClick={handleStartNewItem}
                      className="cursor-pointer flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        자료 추가하기
                        {filterCategory && ` (${filterCategory.label}${
                          filterSubmenuId !== 'all'
                            ? ' · ' + (filterCategory.submenus.find((sm) => sm.id === filterSubmenuId)?.name || '')
                            : ''
                        })`}
                      </span>
                    </button>
                  </div>

                  {/* Category chips */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-neutral-500 mr-1" />
                      {[{ id: 'all', label: '전체' }, ...categories].map((c) => {
                        const count = c.id === 'all' ? items.length : items.filter((i) => i.categoryId === c.id).length;
                        const active = filterCategoryId === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              setFilterCategoryId(c.id);
                              setFilterSubmenuId('all');
                            }}
                            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                              active
                                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                                : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                            }`}
                          >
                            {c.label} <span className="font-mono opacity-70">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Submenu chips for selected category */}
                    {filterCategory && filterCategory.submenus.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pl-5">
                        <Filter className="w-3.5 h-3.5 text-neutral-500 mr-1" />
                        {[{ id: 'all', name: '전체 서브메뉴' }, ...filterCategory.submenus].map((sm) => {
                          const count = items.filter(
                            (i) => i.categoryId === filterCategory.id && (sm.id === 'all' || i.submenuId === sm.id)
                          ).length;
                          const active = filterSubmenuId === sm.id;
                          return (
                            <button
                              key={sm.id}
                              onClick={() => setFilterSubmenuId(sm.id)}
                              className={`cursor-pointer px-2.5 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                                active
                                  ? 'bg-neutral-100 border-neutral-100 text-neutral-950'
                                  : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                              }`}
                            >
                              {sm.name} <span className="font-mono opacity-70">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Search + view mode */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        placeholder="제목, 부제목, 요약, 일자로 검색"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
                      <button
                        onClick={() => setViewModeGrouping('grouped')}
                        title="분류별 보기"
                        className={`cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                          viewModeGrouping === 'grouped' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>분류별</span>
                      </button>
                      <button
                        onClick={() => setViewModeGrouping('list')}
                        title="전체 목록 보기"
                        className={`cursor-pointer flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${
                          viewModeGrouping === 'list' ? 'bg-neutral-800 text-amber-300' : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>목록</span>
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  {filteredItems.length === 0 && (viewModeGrouping === 'list' || groupedItems.length === 0) ? (
                    <div className="p-10 text-center rounded-xl border border-dashed border-neutral-800 text-xs text-neutral-400">
                      조건에 맞는 자료가 없습니다.
                    </div>
                  ) : viewModeGrouping === 'grouped' ? (
                    <div className="space-y-6">
                      {groupedItems.map((group) => (
                        <div key={group.key} className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-neutral-800/70">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-bold text-amber-400 tracking-wide">{group.categoryLabel}</span>
                              <span className="text-neutral-600">›</span>
                              <span className="font-bold text-white">{group.submenuName}</span>
                              <span className="font-mono text-neutral-500">({group.items.length})</span>
                            </div>
                            {group.categoryId && (
                              <button
                                onClick={() => handleStartNewItemIn(group.categoryId, group.submenuId)}
                                className="cursor-pointer flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                              >
                                <Plus className="w-3 h-3" />
                                <span>이 분류에 추가</span>
                              </button>
                            )}
                          </div>
                          {group.items.length === 0 ? (
                            <p className="text-[11px] text-neutral-500 pl-1">등록된 자료가 없습니다.</p>
                          ) : (
                            <div className="space-y-2">{group.items.map(renderItemRow)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">{filteredItems.map(renderItemRow)}</div>
                  )}
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
                              onClick={() => handleDeleteCategory(cat.id, cat.label)}
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
                                    onClick={() => handleDeleteSubmenu(cat.id, sub.id, sub.name)}
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
              ) : activeTab === 'about' ? (
                /* -------------------- 4. HOME ABOUT CMS TAB -------------------- */
                <form onSubmit={handleSaveAboutProfile} className="space-y-6 max-w-3xl mx-auto">
                  <div className="pb-3 border-b border-neutral-800">
                    <h3 className="font-['Outfit'] text-base font-bold text-white">
                      Home 상단 About 소개 관리
                    </h3>
                    <p className="text-xs text-neutral-400">
                      홈 첫 화면 상단의 제목, 소개 문구, 사진, 바이오, 핵심 분야, 성과 지표를 수정합니다. 수정 후 하단 [저장하기]를 눌러 적용하세요.
                    </p>
                  </div>

                  {aboutFeedback && (
                    <div
                      className={`p-3 rounded-lg text-xs font-medium ${
                        aboutFeedback.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {aboutFeedback.message}
                    </div>
                  )}

                  {/* Headline & Intro */}
                  <div className="space-y-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="text-xs font-bold text-amber-400">상단 제목 & 소개 문구</div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">메인 제목 (Headline)</label>
                      <textarea
                        rows={2}
                        value={aboutProfile.subtitle}
                        onChange={(e) => setAboutProfile((p) => ({ ...p, subtitle: e.target.value }))}
                        className={adminInputCls}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        소개 문단 (Intro) — "Welcome to the official portfolio of {aboutProfile.name || '이름'}." 뒤에 이어지는 문장
                      </label>
                      <textarea
                        rows={3}
                        value={aboutProfile.intro ?? DEFAULT_PROFILE.intro ?? ''}
                        onChange={(e) => setAboutProfile((p) => ({ ...p, intro: e.target.value }))}
                        className={adminInputCls}
                      />
                    </div>
                  </div>

                  {/* Basic profile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="sm:col-span-2 text-xs font-bold text-amber-400">기본 프로필</div>
                    {(
                      [
                        ['name', '이름 (Name)'],
                        ['title', '직함 (Title) — 프로필 사진 위 문구'],
                        ['location', '지역 (Location)'],
                        ['graduationYear', '졸업 연도 (Class of)']
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">{label}</label>
                        <input
                          type="text"
                          value={aboutProfile[key] || ''}
                          onChange={(e) => setAboutProfile((p) => ({ ...p, [key]: e.target.value }))}
                          className={adminInputCls}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Photos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="sm:col-span-2 text-xs font-bold text-amber-400">사진</div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-300 block">인물 프로필 사진</label>
                      <label className="cursor-pointer block relative aspect-square max-w-[180px] rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 group">
                        <img src={aboutProfile.portraitImage || PORTRAIT_IMAGE} alt="portrait" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center gap-1 bg-neutral-950/70 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-3.5 h-3.5" /> 사진 변경
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePortraitUpload(e.target.files)} />
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-neutral-300 block">수영 / 경기 사진</label>
                      <label className="cursor-pointer block relative aspect-video max-w-[260px] rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 group">
                        <img src={aboutProfile.swimmingImage || SWIMMING_IMAGE} alt="swimming" className="w-full h-full object-cover" />
                        <span className="absolute inset-0 flex items-center justify-center gap-1 bg-neutral-950/70 text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-3.5 h-3.5" /> 사진 변경
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSwimmingUpload(e.target.files)} />
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aboutProfile.swimmingCaption ?? DEFAULT_PROFILE.swimmingCaption ?? ''}
                          onChange={(e) => setAboutProfile((p) => ({ ...p, swimmingCaption: e.target.value }))}
                          placeholder="사진 하단 문구"
                          className={adminInputCls}
                        />
                        <input
                          type="text"
                          value={aboutProfile.swimmingCaptionValue ?? DEFAULT_PROFILE.swimmingCaptionValue ?? ''}
                          onChange={(e) => setAboutProfile((p) => ({ ...p, swimmingCaptionValue: e.target.value }))}
                          placeholder="기록"
                          className={`${adminInputCls} w-24 font-mono`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-4 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="text-xs font-bold text-amber-400">바이오 (Biography)</div>
                    {(
                      [
                        ['bio', '바이오 1 — 전체 소개'],
                        ['bioGolf', '바이오 2 — 골프'],
                        ['bioSwim', '바이오 3 — 수영']
                      ] as const
                    ).map(([key, label]) => (
                      <div key={key} className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-300">{label}</label>
                        <textarea
                          rows={3}
                          value={aboutProfile[key] ?? DEFAULT_PROFILE[key] ?? ''}
                          onChange={(e) => setAboutProfile((p) => ({ ...p, [key]: e.target.value }))}
                          className={adminInputCls}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Pillars */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="text-xs font-bold text-amber-400">핵심 분야 카드 (4개)</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(aboutProfile.pillars && aboutProfile.pillars.length > 0
                        ? aboutProfile.pillars
                        : DEFAULT_PROFILE.pillars || []
                      ).map((pillar, idx) => (
                        <div key={pillar.id || idx} className="space-y-1.5 p-3 rounded-lg border border-neutral-800 bg-neutral-900/50">
                          <input
                            type="text"
                            value={pillar.title}
                            onChange={(e) => handleUpdateAboutPillar(idx, 'title', e.target.value)}
                            placeholder="제목"
                            className={`${adminInputCls} font-semibold`}
                          />
                          <textarea
                            rows={2}
                            value={pillar.description}
                            onChange={(e) => handleUpdateAboutPillar(idx, 'description', e.target.value)}
                            placeholder="설명"
                            className={adminInputCls}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800">
                    <div className="text-xs font-bold text-amber-400">하단 성과 지표 (4개)</div>
                    <div className="space-y-2">
                      {aboutProfile.metrics.map((m, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <input type="text" value={m.label} onChange={(e) => handleUpdateAboutMetric(idx, 'label', e.target.value)} placeholder="항목명" className={adminInputCls} />
                          <input type="text" value={m.value} onChange={(e) => handleUpdateAboutMetric(idx, 'value', e.target.value)} placeholder="값" className={`${adminInputCls} font-mono font-semibold`} />
                          <input type="text" value={m.sublabel} onChange={(e) => handleUpdateAboutMetric(idx, 'sublabel', e.target.value)} placeholder="보조 설명" className={adminInputCls} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setAboutProfile(savedProfile);
                        setAboutFeedback(null);
                      }}
                      className="cursor-pointer px-4 py-2.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 rounded-lg transition-colors"
                    >
                      변경 취소
                    </button>
                    <button
                      type="submit"
                      disabled={aboutSaving}
                      className="cursor-pointer disabled:opacity-60 px-6 py-2.5 text-xs font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors shadow-lg shadow-amber-500/10"
                    >
                      {aboutSaving ? '저장 중...' : '저장하기'}
                    </button>
                  </div>
                </form>
              ) : (
                /* -------------------- 5. SETTINGS TAB -------------------- */
                <div className="space-y-6 max-w-xl mx-auto">
                  {/* Storage mode */}
                  <div
                    className={`p-6 rounded-xl border space-y-3 ${
                      PortfolioStorage.isCloud ? 'border-emerald-900/60 bg-emerald-950/10' : 'border-neutral-800 bg-neutral-950/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <Upload className={`w-4 h-4 ${PortfolioStorage.isCloud ? 'text-emerald-400' : 'text-neutral-400'}`} />
                      <span>저장 위치: {PortfolioStorage.isCloud ? '클라우드 (Supabase)' : '이 브라우저'}</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {PortfolioStorage.isCloud
                        ? '자료와 사진이 Supabase에 저장되어 모든 기기와 방문자에게 바로 반영됩니다.'
                        : 'Supabase 환경변수가 설정되지 않아 이 브라우저에만 저장됩니다. 다른 기기나 방문자에게는 보이지 않습니다.'}
                    </p>

                    {PortfolioStorage.isCloud && (
                      <div className="pt-2 space-y-2 border-t border-neutral-800">
                        <p className="text-xs text-neutral-300 font-semibold">이 브라우저의 기존 자료를 클라우드로 옮기기</p>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                          Supabase를 쓰기 전에 이 브라우저에서 등록하거나 수정한 자료와 사진을 클라우드로 한 번에 옮깁니다.
                          예전에 작업하던 브라우저에서 실행해 주세요. 현재 클라우드 내용은 덮어쓰여집니다.
                        </p>
                        {migrationMessage && (
                          <p
                            className={`text-[11px] font-medium break-words ${
                              migrationMessage.type === 'success'
                                ? 'text-emerald-400'
                                : migrationMessage.type === 'error'
                                ? 'text-red-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {migrationMessage.message}
                          </p>
                        )}
                        <button
                          onClick={handleMigrateToCloud}
                          disabled={migrating}
                          className="cursor-pointer disabled:opacity-60 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs rounded-lg transition-colors border border-emerald-500/30"
                        >
                          {migrating ? '옮기는 중...' : '이 브라우저 자료를 Supabase로 옮기기'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Change Password */}
                  <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>관리자 비밀번호 변경</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {PortfolioStorage.isCloud
                        ? '현재 로그인한 Supabase 관리자 계정의 비밀번호를 변경합니다. (6자 이상)'
                        : '현재 설정된 비밀번호를 새로운 비밀번호로 변경할 수 있습니다. (초기 비밀번호: 1111)'}
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
                        <p className={`text-xs ${passwordSuccess.includes('성공') ? 'text-emerald-400' : 'text-red-400'}`}>{passwordSuccess}</p>
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
                      {PortfolioStorage.isCloud ? (
                        <> 클라우드 데이터가 초기화되어 <strong className="text-red-300">모든 방문자에게 바로 적용</strong>됩니다.</>
                      ) : (
                        <> 비밀번호도 초기 비밀번호인 <strong className="text-amber-400 font-mono">1111</strong>로 재설정됩니다.</>
                      )}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        onConfirm={deleteConfirm.onConfirm}
        confirmLabel={deleteConfirm.confirmLabel}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
};
