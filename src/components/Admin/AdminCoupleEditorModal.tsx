import React, { useState } from 'react';
import { CoupleEvent, Language, AgendaItem, BankAccount, MusicTrack } from '../../types';
import { DEFAULT_WEDDING_AGENDAS, INITIAL_MUSIC_TRACKS } from '../../data/initialData';
import { audioSynthesizer } from '../../utils/audioSynthesizer';
import weddingArtwork368 from '../../assets/images/frome1.jpg';
import weddingArtworkClassic from '../../assets/images/frome.jpg';
import sparklingGifEffect from '../../assets/images/ligt001.webp';
import gifF0031 from '../../assets/images/T003/F0031.webp';
import gifF0032 from '../../assets/images/T003/F0032_opt.webp';
import { formatImageUrl, compressImageFile, handleImageError } from '../../utils/imageHelper';
import { formatVideoUrl, getCouplePortalUrl, getGuestInvitationUrl } from '../../utils/urlHelper';
import { requestAppFullscreen } from '../../utils/fullscreen';
import { 
  Users, 
  Plus, 
  Calendar, 
  Check, 
  Eye, 
  X, 
  Copy,
  Share2, 
  MapPin, 
  Trash2, 
  Clock, 
  Save,
  RotateCcw,
  Sparkles,
  Sun,
  Scissors,
  Utensils,
  Heart,
  QrCode,
  Upload,
  Image as ImageIcon,
  Music,
  Play,
  Pause,
  Volume2,
  Tag,
  Lock,
  KeyRound,
  User,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Star,
  Film
} from 'lucide-react';

interface AdminCoupleEditorModalProps {
  editingCouple: CoupleEvent;
  setEditingCouple: React.Dispatch<React.SetStateAction<CoupleEvent | null>>;
  onSave: (updated: CoupleEvent) => void;
  onPreviewCouple: (coupleId: string) => void;
  musicTracks?: MusicTrack[];
  allCouples?: CoupleEvent[];
  lang: Language;
}

export type EditTabType = 'account' | 'couple' | 'parents' | 'venue' | 'agenda' | 'photos' | 'music' | 'banks';

export const AdminCoupleEditorModal: React.FC<AdminCoupleEditorModalProps> = ({
  editingCouple,
  setEditingCouple,
  onSave,
  onPreviewCouple,
  musicTracks = INITIAL_MUSIC_TRACKS,
  allCouples = [],
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<EditTabType>('account');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [newGalleryPhotoUrl, setNewGalleryPhotoUrl] = useState('');
  const [copiedLinkKey, setCopiedLinkKey] = useState<string | null>(null);

  const handleCopyLink = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkKey(key);
    setTimeout(() => setCopiedLinkKey(null), 2500);
  };

  const handleSave = () => {
    if (!editingCouple.slug || !editingCouple.slug.trim()) {
      alert(lang === 'km' ? 'សូមបញ្ចូល Slug URL!' : 'Please enter a Slug URL!');
      return;
    }
    const cleanSlug = editingCouple.slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const duplicate = allCouples.find(c => c.slug === cleanSlug && c.id !== editingCouple.id);
    if (duplicate) {
      alert(lang === 'km' 
        ? `Slug URL "${cleanSlug}" នេះមានរួចរាល់ហើយក្នុងប្រព័ន្ធ! សូមធ្វើការផ្លាស់ប្ដូរ Slug URL ផ្សេងដើម្បីជៀសវាងការជាន់គ្នា។` 
        : `Slug URL "${cleanSlug}" already exists! Please choose a different Slug URL.`);
      return;
    }
    onSave({ ...editingCouple, slug: cleanSlug });
  };
  const [galleryLightbox, setGalleryLightbox] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  // Playback Preview Handler
  const handleTogglePlayMusic = (trackId: string, customAudioUrl?: string) => {
    if (playingTrackId === trackId) {
      audioSynthesizer.stop();
      setPlayingTrackId(null);
    } else {
      const track = musicTracks.find(t => t.id === trackId);
      audioSynthesizer.stop();
      audioSynthesizer.start(customAudioUrl || track?.audioUrl);
      setPlayingTrackId(trackId);
    }
  };

  // Gallery handlers
  const handleUploadGalleryPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.70);
        setEditingCouple(prev => {
          if (!prev) return null;
          const current = prev.galleryPhotos || [];
          return {
            ...prev,
            galleryPhotos: [...current, compressed]
          };
        });
      } catch (err) {
        console.error('Compression failed:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const newUrl = reader.result;
            setEditingCouple(prev => {
              if (!prev) return null;
              const current = prev.galleryPhotos || [];
              return {
                ...prev,
                galleryPhotos: [...current, newUrl]
              };
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddGalleryPhotoByUrl = () => {
    if (!newGalleryPhotoUrl.trim()) return;
    const formatted = formatImageUrl(newGalleryPhotoUrl.trim());
    setEditingCouple(prev => {
      if (!prev) return null;
      return {
        ...prev,
        galleryPhotos: [...(prev.galleryPhotos || []), formatted]
      };
    });
    setNewGalleryPhotoUrl('');
  };

  const handleDeleteGalleryPhoto = (index: number) => {
    setEditingCouple(prev => {
      if (!prev) return null;
      const updated = [...(prev.galleryPhotos || [])];
      updated.splice(index, 1);
      return {
        ...prev,
        galleryPhotos: updated
      };
    });
  };

  const handleMoveGalleryPhoto = (index: number, direction: 'left' | 'right') => {
    setEditingCouple(prev => {
      if (!prev) return null;
      const updated = [...(prev.galleryPhotos || [])];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return {
        ...prev,
        galleryPhotos: updated
      };
    });
  };

  // Agenda handlers
  const handleUpdateEditingAgenda = (id: string, updates: Partial<AgendaItem>) => {
    setEditingCouple(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agendas: (prev.agendas || []).map(a => a.id === id ? { ...a, ...updates } : a)
      };
    });
  };

  const handleAddEditingAgenda = (day: 1 | 2) => {
    const newItem: AgendaItem = {
      id: `ag_${Date.now()}`,
      day,
      time: day === 1 ? '០៣:០០ រសៀល' : '០៨:០០ ព្រឹក',
      titleKh: day === 1 ? 'ពិធីសែនព្រេន ឬពិធីជួបជុំ' : 'ពិធីសិរីមង្គលថ្មី',
      titleEn: 'New Wedding Ceremony',
      icon: day === 1 ? 'clock' : 'heart'
    };
    setEditingCouple(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agendas: [...(prev.agendas || []), newItem]
      };
    });
  };

  const handleDeleteEditingAgenda = (id: string) => {
    setEditingCouple(prev => {
      if (!prev) return null;
      return {
        ...prev,
        agendas: (prev.agendas || []).filter(a => a.id !== id)
      };
    });
  };

  const handleResetEditingAgendas = () => {
    setEditingCouple(prev => {
      if (!prev) return null;
      return {
        ...prev,
        weddingProgramDay1TitleKh: 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
        weddingProgramDay2TitleKh: 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
        agendas: DEFAULT_WEDDING_AGENDAS
      };
    });
  };

  // Bank handlers
  const handleAddEditingBank = () => {
    const newBank: BankAccount = {
      id: `ba_${Date.now()}`,
      bankName: 'ABA Bank (KHQR)',
      accountName: `${editingCouple.groomNameKh} & ${editingCouple.brideNameKh}`,
      accountNumber: '000 000 000',
      qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ABA_GIFT_PAY',
      currency: 'USD'
    };
    setEditingCouple(prev => prev ? {
      ...prev,
      bankAccounts: [...(prev.bankAccounts || []), newBank]
    } : null);
  };

  const handleUpdateEditingBank = (id: string, updates: Partial<BankAccount>) => {
    setEditingCouple(prev => prev ? {
      ...prev,
      bankAccounts: (prev.bankAccounts || []).map(b => b.id === id ? { ...b, ...updates } : b)
    } : null);
  };

  const handleDeleteEditingBank = (id: string) => {
    setEditingCouple(prev => prev ? {
      ...prev,
      bankAccounts: (prev.bankAccounts || []).filter(b => b.id !== id)
    } : null);
  };

  const handleUploadKHQR = async (bankId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 600, 600, 0.75);
        handleUpdateEditingBank(bankId, { qrUrl: compressed });
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            handleUpdateEditingBank(bankId, { qrUrl: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  interface EditTabItem {
    id: EditTabType;
    labelKh: string;
    labelEn: string;
    icon: React.ReactNode;
    badge?: number;
  }

  const EDIT_TABS: EditTabItem[] = [
    { id: 'account', labelKh: 'គណនី & Password', labelEn: 'Account & Security', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'couple', labelKh: 'កូនកម្លោះ-កូនក្រមុំ', labelEn: 'Groom & Bride', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'parents', labelKh: 'មាតាបិតាទាំងសងខាង', labelEn: 'Parents Info', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'venue', labelKh: 'កាលបរិច្ឆេទ & ទីតាំង', labelEn: 'Date & Venue', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'agenda', labelKh: 'កាលវិភាគកម្មវិធី', labelEn: 'Wedding Agendas', icon: <Clock className="w-3.5 h-3.5" />, badge: (editingCouple.agendas || []).length },
    { id: 'photos', labelKh: 'រូបថត & Gallery', labelEn: 'Photos & Gallery', icon: <ImageIcon className="w-3.5 h-3.5" />, badge: (editingCouple.galleryPhotos || []).length },
    { id: 'music', labelKh: 'បទភ្លេងការ', labelEn: 'Music Track', icon: <Music className="w-3.5 h-3.5" /> },
    { id: 'banks', labelKh: 'គណនីធនាគារ KHQR', labelEn: 'Bank Accounts & QR', icon: <QrCode className="w-3.5 h-3.5" />, badge: (editingCouple.bankAccounts || []).length },
  ];

  const currentTabIndex = EDIT_TABS.findIndex(t => t.id === activeTab);
  const prevTab = currentTabIndex > 0 ? EDIT_TABS[currentTabIndex - 1] : null;
  const nextTab = currentTabIndex < EDIT_TABS.length - 1 ? EDIT_TABS[currentTabIndex + 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF8F5] flex flex-col w-full h-full overflow-hidden animate-in fade-in duration-200 font-battambang">
      
      {/* 1. TOP STICKY FULLSCREEN HEADER */}
      <div className="bg-white/95 backdrop-blur-md border-b border-[#EAE6E1] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setEditingCouple(null)}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={lang === 'km' ? 'ចាកចេញ' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-normal text-gray-900 font-khmer-title flex items-center gap-2 truncate">
              <span className="w-2.5 h-5 bg-[#D4AF37] rounded-full shrink-0"></span>
              <span className="truncate">
                {lang === 'km' 
                  ? `កែប្រែព័ត៌មានលម្អិត: ${editingCouple.groomNameKh} & ${editingCouple.brideNameKh}` 
                  : `Edit Details: ${editingCouple.groomNameEn} & ${editingCouple.brideNameEn}`}
              </span>
            </h3>
            <p className="text-[11px] text-gray-500 truncate hidden sm:block">
              {lang === 'km' 
                ? 'កែប្រែឈ្មោះ ឪពុកម្តាយ កាលបរិច្ឆេទ ទីតាំង រូបថត កាលវិភាគ បទភ្លេង និងកុងធនាគារ' 
                : 'Update names, parents, date, venue, photos, agendas, music and bank accounts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              requestAppFullscreen();
              onPreviewCouple(editingCouple.id);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200/80 text-xs font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{lang === 'km' ? 'មើលធៀបការ' : 'Preview Live'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEditingCouple(null)}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-normal rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'km' ? 'បោះបង់' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={() => onSave(editingCouple)}
            className="px-4 sm:px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white text-xs font-normal rounded-xl shadow-xs hover:brightness-110 flex items-center gap-2 cursor-pointer font-medium"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'km' ? 'រក្សាទុក' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* 2. HORIZONTAL SCROLLABLE TABS BAR */}
      <div className="bg-white border-b border-[#EAE6E1] px-4 sm:px-8 py-2.5 overflow-x-auto no-scrollbar shrink-0 shadow-2xs z-10">
        <div className="flex items-center gap-2 min-w-max">
          {EDIT_TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as EditTabType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-normal transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white shadow-xs font-medium'
                    : 'bg-[#FAF8F5] text-gray-600 hover:text-gray-900 hover:bg-[#F3EFEA] border border-[#EAE6E1]'
                }`}
              >
                {t.icon}
                <span>{lang === 'km' ? t.labelKh : t.labelEn}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200/80 text-gray-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN TAB CONTENT BODY (FULLSCREEN SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6">
        <div className="max-w-5xl mx-auto w-full space-y-6">

          {/* TAB 1: គណនី & PASSWORD */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'ព័ត៌មានចូលប្រព័ន្ធរបស់កូនកម្លោះក្រមុំ (Couple Login Security)' : 'Couple Login Security'}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' 
                    ? 'កំណត់ Username & Password សម្រាប់ឱ្យកូនកម្លោះក្រមុំចូលគ្រប់គ្រងធៀបការ បញ្ជីភ្ញៀវ និងសារជូនពរ' 
                    : 'Configure login credentials for the couple to access their management portal'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'ឈ្មោះអ្នកប្រើប្រាស់ (Username)' : 'Username'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. sokha2026"
                    value={editingCouple.manageUsername || ''}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, manageUsername: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-gray-900 font-medium"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    {lang === 'km' ? 'ប្រើប្រាស់ជាអក្សរឡាតាំង ឬលេខ ដោយមិនដកឃ្លា' : 'Latin letters or digits without spaces.'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'លេខកូដសម្ងាត់ (Password)' : 'Password'}</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="e.g. 123456"
                      value={editingCouple.managePassword || ''}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, managePassword: e.target.value } : null)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] text-gray-900 font-mono font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer p-0.5"
                      title={showEditPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {lang === 'km' ? 'កូដសម្ងាត់សម្រាប់ចូលបញ្ជីគ្រប់គ្រង' : 'Secret password to unlock dashboard.'}
                  </p>
                </div>
              </div>

              {/* Slug URL Edit Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <label className="block text-xs font-medium text-amber-950">
                  {lang === 'km' ? 'Slug URL (តំណភ្ជាប់កាតអញ្ជើញ)' : 'Slug URL'}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">/?c=</span>
                  <input
                    type="text"
                    value={editingCouple.slug || ''}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-') } : null)}
                    placeholder="pov-pean-dieb-samphous"
                    className="flex-1 px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] outline-hidden font-mono text-gray-900"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  {lang === 'km' ? 'ឧ. pov-pean-dieb-samphous សម្រាប់លីង ?c=pov-pean-dieb-samphous' : 'E.g. pov-pean-dieb-samphous'}
                </p>
              </div>

              {/* Couple Portal Link & Guest Invitation Link */}
              <div className="pt-2 border-t border-gray-100 space-y-3">
                <h5 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'តំណភ្ជាប់ប្រព័ន្ធ (System Links)' : 'System Links'}</span>
                </h5>

                {/* 1. Couple Portal Management Link (Admin -> Couple) */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-950 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{lang === 'km' ? 'តំណភ្ជាប់សម្រាប់កូនកម្លោះ-ក្រមុំ (Couple Portal Link)' : 'Couple Management Link'}</span>
                    </span>
                    <span className="text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full font-medium">
                      {lang === 'km' ? 'ផ្ញើឱ្យកូនកម្លោះ-ក្រមុំ' : 'Send to Couple'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getCouplePortalUrl(editingCouple.id)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-300/80 rounded-xl font-mono text-gray-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(getCouplePortalUrl(editingCouple.id), 'couple_portal')}
                      className="px-3 py-1.5 bg-[#8C6D1F] hover:bg-[#735919] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      {copiedLinkKey === 'couple_portal' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLinkKey === 'couple_portal' ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លង Link' : 'Copy')}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-900/80">
                    {lang === 'km' ? '📌 Admin បង្កើតគូស្នេហ៍រួច ចម្លងតំណភ្ជាប់នេះផ្ញើឱ្យកូនកម្លោះក្រមុំ ដើម្បីឱ្យពួកគាត់ចូលរៀបចំកាត និងបង្កើតភ្ញៀវ' : 'Admin generates this link and sends it to the couple to manage their invitations.'}
                  </p>
                </div>

                {/* 2. Guest Invitation Link */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-900 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                      <span>{lang === 'km' ? 'តំណភ្ជាប់សំបុត្រអញ្ជើញភ្ញៀវ (Guest Invitation Link)' : 'Guest Invitation Link'}</span>
                    </span>
                    <span className="text-[10px] text-gray-600 bg-gray-200/70 px-2 py-0.5 rounded-full font-medium">
                      {lang === 'km' ? 'សំបុត្រការឌីជីថល' : 'e-Invitation'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getGuestInvitationUrl(editingCouple.slug || editingCouple.id)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-mono text-gray-800 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(getGuestInvitationUrl(editingCouple.slug || editingCouple.id), 'guest_invite')}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      {copiedLinkKey === 'guest_invite' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLinkKey === 'guest_invite' ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លង Link' : 'Copy')}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {lang === 'km' ? '📌 តំណភ្ជាប់មេសម្រាប់ភ្ញៀវទូទៅ (កូនកម្លោះ-ក្រមុំក៏អាចបង្កើត Link ផ្ទាល់ខ្លួនសម្រាប់ភ្ញៀវម្នាក់ៗបានផងដែរ)' : 'Main link for guests (the couple can also create personalized links for each guest in their portal).'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: កូនកម្លោះ & កូនក្រមុំ */}
          {activeTab === 'couple' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'ឈ្មោះកូនកម្លោះ & កូនក្រមុំ (Bride & Groom Information)' : 'Bride & Groom Information'}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' ? 'បញ្ចូលឈ្មោះផ្លូវការ ឈ្មោះហៅក្រៅ និងឈ្មោះជាភាសាអង់គ្លេស' : 'Formal names, nicknames and English names'}
                </p>
              </div>

              {/* Groom Section */}
              <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200/60 space-y-4">
                <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  🤵 {lang === 'km' ? 'ព័ត៌មានកូនកម្លោះ (Groom)' : 'Groom Information'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះខ្មែរផ្លូវការ' : 'Groom Name (Khmer)'}</label>
                    <input
                      type="text"
                      value={editingCouple.groomNameKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, groomNameKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះហៅក្រៅ (Nickname)' : 'Groom Nickname'}</label>
                    <input
                      type="text"
                      placeholder="ឧ. វិបុល"
                      value={editingCouple.groomNickKh || ''}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, groomNickKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះឡាតាំង (English)' : 'Groom Name (English)'}</label>
                    <input
                      type="text"
                      value={editingCouple.groomNameEn}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, groomNameEn: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>

              {/* Bride Section */}
              <div className="p-5 rounded-2xl bg-pink-50/40 border border-pink-200/60 space-y-4">
                <span className="text-xs font-semibold text-pink-900 uppercase tracking-wider flex items-center gap-1.5">
                  👰 {lang === 'km' ? 'ព័ត៌មានកូនក្រមុំ (Bride)' : 'Bride Information'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះខ្មែរផ្លូវការ' : 'Bride Name (Khmer)'}</label>
                    <input
                      type="text"
                      value={editingCouple.brideNameKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, brideNameKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះហៅក្រៅ (Nickname)' : 'Bride Nickname'}</label>
                    <input
                      type="text"
                      placeholder="ឧ. សុជាតា"
                      value={editingCouple.brideNickKh || ''}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, brideNickKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះឡាតាំង (English)' : 'Bride Name (English)'}</label>
                    <input
                      type="text"
                      value={editingCouple.brideNameEn}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, brideNameEn: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: មាតាបិតាទាំងសងខាង */}
          {activeTab === 'parents' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'ឈ្មោះមាតាបិតាទាំងសងខាង (Parents Information)' : 'Parents Information'}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' ? 'ឈ្មោះឪពុក និងម្តាយ របស់កូនកម្លោះ និងកូនក្រមុំ' : 'Names of Groom and Bride parents'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Groom Parents */}
                <div className="p-5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-3">
                  <span className="text-xs font-semibold text-[#8C6D1F] uppercase tracking-wider block">
                    {lang === 'km' ? 'មាតាបិតាខាងកូនកម្លោះ' : "Groom's Parents"}
                  </span>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">{lang === 'km' ? 'លោកឪពុក' : 'Father Name'}</label>
                    <input
                      type="text"
                      placeholder="លោក..."
                      value={editingCouple.groomFatherKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, groomFatherKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">{lang === 'km' ? 'អ្នកម្តាយ' : 'Mother Name'}</label>
                    <input
                      type="text"
                      placeholder="អ្នកស្រី..."
                      value={editingCouple.groomMotherKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, groomMotherKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {/* Bride Parents */}
                <div className="p-5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-3">
                  <span className="text-xs font-semibold text-pink-700 uppercase tracking-wider block">
                    {lang === 'km' ? 'មាតាបិតាខាងកូនក្រមុំ' : "Bride's Parents"}
                  </span>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">{lang === 'km' ? 'លោកឪពុក' : 'Father Name'}</label>
                    <input
                      type="text"
                      placeholder="លោក..."
                      value={editingCouple.brideFatherKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, brideFatherKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">{lang === 'km' ? 'អ្នកម្តាយ' : 'Mother Name'}</label>
                    <input
                      type="text"
                      placeholder="អ្នកស្រី..."
                      value={editingCouple.brideMotherKh}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, brideMotherKh: e.target.value } : null)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: កាលបរិច្ឆេទ & ទីតាំង */}
          {activeTab === 'venue' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'កាលបរិច្ឆេទ & ទីតាំងពិធី (Date & Venue)' : 'Date & Venue'}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' ? 'កាលបរិច្ឆេទមង្គលការ ទីតាំងកម្មវិធី តំណភ្ជាប់ Google Maps និងរូបភាពផែនទី' : 'Wedding date, venue location, Google Maps and map image'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'កាលបរិច្ឆេទមង្គលការ (Wedding Date)' : 'Wedding Date'}</label>
                  <input
                    type="date"
                    value={editingCouple.weddingDate}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, weddingDate: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ពេលវេលាទទួលភ្ញៀវ (Wedding Time)' : 'Wedding Time'}</label>
                  <input
                    type="text"
                    placeholder="វេលាម៉ោង ៧:០០ ព្រឹក ដល់ ១០:០០ យប់"
                    value={editingCouple.weddingTimeKh || ''}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, weddingTimeKh: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'កាលបរិច្ឆេទចន្ទគតិ (Lunar Date Text)' : 'Lunar Date Text'}</label>
                  <input
                    type="text"
                    placeholder="ត្រូវនឹងថ្ងៃទី... ខែ... ឆ្នាំ..."
                    value={editingCouple.auspiciousTextKh || ''}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, auspiciousTextKh: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'ឈ្មោះទីកន្លែងពិធី (Venue Name)' : 'Venue Name'}</label>
                  <input
                    type="text"
                    placeholder="មជ្ឈមណ្ឌលសន្និបាត ឬគេហដ្ឋាន..."
                    value={editingCouple.venueNameKh}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, venueNameKh: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">{lang === 'km' ? 'អាសយដ្ឋានទីតាំង (Venue Address)' : 'Venue Address'}</label>
                  <input
                    type="text"
                    placeholder="ផ្លូវ... សង្កាត់... ខណ្ឌ..."
                    value={editingCouple.venueAddressKh}
                    onChange={(e) => setEditingCouple(prev => prev ? { ...prev, venueAddressKh: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FAF9F6] border border-gray-300 rounded-xl focus:bg-white focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Google Maps Link */}
              <div className="p-5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'តំណភ្ជាប់ Google Maps (Link Share)' : 'Google Maps Share Link'}</span>
                  </label>
                  {editingCouple.venueMapUrl && (
                    <a
                      href={editingCouple.venueMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#8C6D1F] hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{lang === 'km' ? 'សាកល្បងបើកមើល Link' : 'Test Link'}</span>
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="https://maps.app.goo.gl/... ឬ https://maps.google.com/?q=..."
                  value={editingCouple.venueMapUrl || ''}
                  onChange={(e) => setEditingCouple(prev => prev ? { ...prev, venueMapUrl: e.target.value } : null)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:border-[#D4AF37]"
                />
              </div>

              {/* Venue Map Image */}
              <div className="p-5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-3">
                <label className="block text-xs font-medium text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'រូបភាពផែនទីទីតាំង (Venue Map Image / Screenshot)' : 'Venue Map Image / Screenshot'}</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {editingCouple.venueMapImage ? (
                    <div className="relative group shrink-0">
                      <img
                        src={editingCouple.venueMapImage}
                        alt="Venue Map"
                        className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border-2 border-amber-300/80 bg-white shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingCouple(prev => prev ? { ...prev, venueMapImage: '' } : null)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors cursor-pointer"
                        title="លុបរូបផែនទី"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 text-[10px] shrink-0">
                      <MapPin className="w-6 h-6 text-gray-300 mb-1" />
                      <span>{lang === 'km' ? 'គ្មានរូបផែនទី' : 'No Map Image'}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2 w-full">
                    <input
                      type="url"
                      placeholder="https://.../map.jpg"
                      value={editingCouple.venueMapImage || ''}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, venueMapImage: e.target.value } : null)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37]"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50/60 border border-amber-300/80 text-[#8C6D1F] rounded-xl text-xs font-medium transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{lang === 'km' ? 'Upload រូបភាពផែនទី (ស្វ័យប្រវត្តិបង្រួម)' : 'Upload Map Image (Auto-compressed)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 800, 800, 0.70);
                              setEditingCouple(prev => prev ? { ...prev, venueMapImage: compressed } : null);
                            } catch {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  setEditingCouple(prev => prev ? { ...prev, venueMapImage: reader.result as string } : null);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: កាលវិភាគកម្មវិធី */}
          {activeTab === 'agenda' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'កាលវិភាគកម្មវិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ (Wedding Program Agendas)' : 'Wedding Program Agendas'}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === 'km' ? 'កំណត់ពេលវេលា ឈ្មោះពិធី និងជ្រើសរើស Icon សម្រាប់ថ្ងៃទី១ និងថ្ងៃទី២' : 'Timeline ceremonies and icons for Day 1 and Day 2'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetEditingAgendas}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] text-xs font-normal flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'ផ្ទុកគំរូកម្មវិធីស្ដង់ដារ' : 'Load Default Agendas'}</span>
                </button>
              </div>

              {/* Day 1 Section */}
              <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-500 mb-1">{lang === 'km' ? 'ចំណងជើងកម្មវិធី ថ្ងៃទី១ ៖' : 'Day 1 Title:'}</label>
                    <input
                      type="text"
                      value={editingCouple.weddingProgramDay1TitleKh || 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦'}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, weddingProgramDay1TitleKh: e.target.value } : null)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {lang === 'km' ? '✨ បង្ហាញលើធៀបជា ២ ជួរត្រឹមកណ្ដាល (កម្មវិធីទី១ / ថ្ងៃសៅរ៍...)' : '✨ Displays on card as 2 centered lines'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddEditingAgenda(1)}
                    className="self-start sm:self-end px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#8C6D1F] rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? '+ ថែមពិធីថ្ងៃទី១' : '+ Add Day 1 Ceremony'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editingCouple.agendas || []).filter(a => a.day === 1).map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shadow-2xs">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { time: e.target.value })}
                        placeholder="ម៉ោង..."
                        className="w-28 px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-amber-900 font-medium"
                      />
                      <input
                        type="text"
                        value={item.titleKh}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { titleKh: e.target.value })}
                        placeholder="ឈ្មោះពិធី..."
                        className="flex-1 min-w-[160px] px-2.5 py-1 text-xs border border-gray-300 rounded-lg"
                      />
                      <select
                        value={item.icon || 'clock'}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { icon: e.target.value as any })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded-lg bg-gray-50"
                      >
                        <option value="clock">🕒 ម៉ោង</option>
                        <option value="heart">💍 ពិធី</option>
                        <option value="sparkles">✨ សិរីមង្គល</option>
                        <option value="scissors">✂️ កាត់សក់</option>
                        <option value="utensils">🍽️ ពិសារភោជនាហារ</option>
                        <option value="sun">☀️ ពេលព្រឹក</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteEditingAgenda(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day 2 Section */}
              <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] text-gray-500 mb-1">{lang === 'km' ? 'ចំណងជើងកម្មវិធី ថ្ងៃទី២ ៖' : 'Day 2 Title:'}</label>
                    <input
                      type="text"
                      value={editingCouple.weddingProgramDay2TitleKh || 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦'}
                      onChange={(e) => setEditingCouple(prev => prev ? { ...prev, weddingProgramDay2TitleKh: e.target.value } : null)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-medium text-gray-900"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {lang === 'km' ? '✨ បង្ហាញលើធៀបជា ២ ជួរត្រឹមកណ្ដាល (កម្មវិធីទី២ / ថ្ងៃអាទិត្យ...)' : '✨ Displays on card as 2 centered lines'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddEditingAgenda(2)}
                    className="self-start sm:self-end px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#8C6D1F] rounded-xl text-xs flex items-center gap-1 cursor-pointer shrink-0 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? '+ ថែមពិធីថ្ងៃទី២' : '+ Add Day 2 Ceremony'}</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editingCouple.agendas || []).filter(a => a.day === 2).map((item) => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-gray-200 flex flex-wrap sm:flex-nowrap items-center gap-2.5 shadow-2xs">
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { time: e.target.value })}
                        placeholder="ម៉ោង..."
                        className="w-28 px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-amber-900 font-medium"
                      />
                      <input
                        type="text"
                        value={item.titleKh}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { titleKh: e.target.value })}
                        placeholder="ឈ្មោះពិធី..."
                        className="flex-1 min-w-[160px] px-2.5 py-1 text-xs border border-gray-300 rounded-lg"
                      />
                      <select
                        value={item.icon || 'clock'}
                        onChange={(e) => handleUpdateEditingAgenda(item.id, { icon: e.target.value as any })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded-lg bg-gray-50"
                      >
                        <option value="clock">🕒 ម៉ោង</option>
                        <option value="heart">💍 ពិធី</option>
                        <option value="sparkles">✨ សិរីមង្គល</option>
                        <option value="scissors">✂️ កាត់សក់</option>
                        <option value="utensils">🍽️ ពិសារភោជនាហារ</option>
                        <option value="sun">☀️ ពេលព្រឹក</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteEditingAgenda(item.id)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: រូបថត & GALLERY */}
          {activeTab === 'photos' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-4">
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'រូបថតមង្គលការ & រូបភាពអនុស្សាវរីយ៍ Gallery' : 'Wedding Photos & Gallery'}</span>
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' 
                    ? 'គ្រប់រូបភាពដែល Upload នឹងត្រូវបង្រួមស្វ័យប្រវត្តិតូចបំផុត (<70KB) ដើម្បីធានាដំណើរការលឿនរហ័សលើទូរស័ព្ទ' 
                    : 'All uploaded images are automatically compressed to ultra-small size (<70KB) for fast loading on phones'}
                </p>
              </div>

              {/* 2 Main Wedding Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. Front Cover (ទំព័រមុខធៀបការ) */}
                <div className="p-5 bg-gradient-to-br from-purple-50/50 to-purple-50/20 border-2 border-purple-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                    <span className="text-xs font-semibold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                      {lang === 'km' ? '១. រូបភាព ឬ GIF ទំព័រមុខ' : '1. Front Photo / GIF'}
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-200 text-purple-900 font-bold">GIF OK</span>
                    </span>
                    <span className="text-[10px] text-purple-800 font-medium">Front Card</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-purple-300 shadow-sm bg-black/5 relative group">
                      <img 
                        src={formatImageUrl(editingCouple.cardBackgroundImage) || weddingArtwork368} 
                        alt="Front Card" 
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e, weddingArtwork368)}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        placeholder="URL https://..."
                        value={editingCouple.cardBackgroundImage || ''}
                        onChange={(e) => {
                          const val = formatImageUrl(e.target.value);
                          setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: val } : null);
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                      />

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{lang === 'km' ? 'Upload រូប/GIF' : 'Upload File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const data = await compressImageFile(file, 800, 800, 0.70);
                                  setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: data } : null);
                                } catch {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: reader.result as string } : null);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }
                            }}
                          />
                        </label>

                        {editingCouple.cardBackgroundImage && (
                          <button
                            type="button"
                            onClick={() => setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: '' } : null)}
                            className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            {lang === 'km' ? 'លុប' : 'Remove'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sample selection pills */}
                  <div className="pt-2 border-t border-purple-100 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-500">{lang === 'km' ? 'គំរូ GIF ៖' : 'Samples:'}</span>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: gifF0031 } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-purple-100/80 hover:bg-purple-200 text-purple-900 cursor-pointer"
                    >
                      ✨ ភ្លើងចែងចាំង 01
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: gifF0032 } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-purple-100/80 hover:bg-purple-200 text-purple-900 cursor-pointer"
                    >
                      🌟 ផ្កាយរះ 02
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? { ...prev, cardBackgroundImage: sparklingGifEffect } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-purple-100/80 hover:bg-purple-200 text-purple-900 cursor-pointer"
                    >
                      💫 ពន្លឺមាស 03
                    </button>
                  </div>
                </div>

                {/* Background Video Section (For Template 003 / Video Background) */}
                <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/20 border-2 border-indigo-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{lang === 'km' ? '🎬 វីដេអូទី ១ (Video 1) ៖ ផ្ទៃខាងក្រោយទំព័រមុខ' : '🎬 Video 1: Front Cover Background'}</span>
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {lang === 'km' ? 'ចាក់រង្វិលជុំ (Loop) លើផ្ទាំងមុខកាត មុនពេលចុចបើក' : 'Loops on front cover before guests tap "Open"'}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                      {lang === 'km' ? 'វីដេអូទី ១' : 'Video 1'}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-indigo-300 shadow-sm bg-black relative group">
                      <video 
                        src={formatVideoUrl(editingCouple.customTheme?.backgroundVideoUrl) || 'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-background-animation-42790-large.mp4'} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        placeholder="URL https://... (Direct .mp4, Dropbox, Google Drive)"
                        value={editingCouple.customTheme?.backgroundVideoUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setEditingCouple(prev => prev ? {
                            ...prev,
                            customTheme: {
                              ...prev.customTheme,
                              backgroundVideoUrl: val
                            }
                          } : null);
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl outline-hidden focus:border-indigo-400"
                      />

                      <div className="flex items-center gap-2">
                        {editingCouple.customTheme?.backgroundVideoUrl && (
                          <button
                            type="button"
                            onClick={() => setEditingCouple(prev => prev ? {
                              ...prev,
                              customTheme: {
                                ...prev.customTheme,
                                backgroundVideoUrl: ''
                              }
                            } : null)}
                            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {lang === 'km' ? 'ប្រើ Default' : 'Reset'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sample video presets */}
                  <div className="pt-2 border-t border-indigo-100 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-500">{lang === 'km' ? 'គំរូស្រាប់ ៖' : 'Presets:'}</span>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-background-animation-42790-large.mp4'
                        }
                      } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-indigo-100/80 hover:bg-indigo-200 text-indigo-900 cursor-pointer"
                    >
                      ✨ ធូលីពន្លឺមាស
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-glitter-dust-loop-background-42792-large.mp4'
                        }
                      } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-indigo-100/80 hover:bg-indigo-200 text-indigo-900 cursor-pointer"
                    >
                      🌟 ផ្កាយចែងចាំង
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          backgroundVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-floating-particles-of-light-31475-large.mp4'
                        }
                      } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-indigo-100/80 hover:bg-indigo-200 text-indigo-900 cursor-pointer"
                    >
                      💫 ភាគល្អិតអណ្តែត
                    </button>
                  </div>

                  {/* 2nd Video Section: Opening Transition Video */}
                  <div className="pt-3 border-t border-indigo-100">
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <span className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-amber-600" />
                          <span>{lang === 'km' ? '💥 វីដេអូទី ២ (Video 2) ៖ ចលនាពេលចុច «បើកសំបុត្រ»' : '💥 Video 2: Opening Transition (On Open)'}</span>
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {lang === 'km' ? 'ចាក់ពេញអេក្រង់ ១០វិនាទីភ្លាមៗ ពេលភ្ញៀវចុច «បើកសំបុត្រ»' : 'Plays full-screen for 10s right when guests tap "Open"'}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {lang === 'km' ? 'វីដេអូទី ២' : 'Video 2'}
                      </span>
                    </div>

                    <div className="flex gap-4 items-center mt-2">
                      <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-black relative group">
                        <video 
                          src={formatVideoUrl(editingCouple.customTheme?.transitionVideoUrl) || 'https://assets.mixkit.co/videos/preview/mixkit-burst-of-golden-particles-42789-large.mp4'} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          type="text"
                          placeholder="URL https://... (Direct .mp4, Dropbox, Google Drive for Video 2)"
                          value={editingCouple.customTheme?.transitionVideoUrl || ''}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setEditingCouple(prev => prev ? {
                              ...prev,
                              customTheme: {
                                ...prev.customTheme,
                                transitionVideoUrl: val
                              }
                            } : null);
                          }}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl outline-hidden focus:border-amber-400"
                        />

                        <div className="flex items-center gap-2">
                          {editingCouple.customTheme?.transitionVideoUrl && (
                            <button
                              type="button"
                              onClick={() => setEditingCouple(prev => prev ? {
                                ...prev,
                                customTheme: {
                                ...prev.customTheme,
                                transitionVideoUrl: ''
                              }
                            } : null)}
                            className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {lang === 'km' ? 'ប្រើ Default' : 'Reset'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-100 flex items-center gap-1.5 flex-wrap mt-2">
                    <span className="text-[10px] text-gray-500">{lang === 'km' ? 'គំរូ Video 2 ៖' : 'Video 2 Presets:'}</span>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          transitionVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-burst-of-golden-particles-42789-large.mp4'
                        }
                      } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-100/80 hover:bg-amber-200 text-amber-900 cursor-pointer"
                    >
                      💥 ផ្ទុះពន្លឺមាស
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          transitionVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-bright-light-particles-loop-31478-large.mp4'
                        }
                      } : null)}
                      className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-100/80 hover:bg-amber-200 text-amber-900 cursor-pointer"
                    >
                      ✨ ពន្លឺហោះហើរ
                    </button>
                  </div>
                </div>
                </div>

                {/* 2. Main Cover Photo (រូបថតធំលើធៀបការ) */}
                <div className="p-5 bg-gradient-to-br from-amber-50/50 to-amber-50/20 border-2 border-amber-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <span className="text-xs font-semibold text-amber-950 uppercase tracking-wider">
                      {lang === 'km' ? '២. រូបថតធំលើធៀបការ (Main Cover)' : '2. Main Cover Photo'}
                    </span>
                    <span className="text-[10px] text-[#8C6D1F] font-medium">Inside Card</span>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-amber-300 shadow-sm bg-black/5 relative group">
                      <img 
                        src={formatImageUrl(editingCouple.coverPhoto)} 
                        alt="Main Cover" 
                        className="w-full h-full object-cover"
                        onError={(e) => handleImageError(e)}
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        placeholder="URL https://..."
                        value={editingCouple.coverPhoto || ''}
                        onChange={(e) => {
                          const val = formatImageUrl(e.target.value);
                          setEditingCouple(prev => prev ? { ...prev, coverPhoto: val } : null);
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                      />

                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-xl text-xs font-medium transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{lang === 'km' ? 'Upload រូបថតធំ (ស្វ័យប្រវត្តិបង្រួម)' : 'Upload Cover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const compressed = await compressImageFile(file, 800, 800, 0.70);
                                setEditingCouple(prev => prev ? { ...prev, coverPhoto: compressed } : null);
                              } catch {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setEditingCouple(prev => prev ? { ...prev, coverPhoto: reader.result as string } : null);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

              </div>

              {/* SLIDESHOW TOGGLE SWITCH (បិទ/បើក Slide Show) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-purple-50/60 border-2 border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎬</span>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-900 font-khmer-title">
                      {lang === 'km' ? 'ចាក់ Slide Show រូបថតមង្គលការពេលបើកសំបុត្រ' : 'Auto Play Photo Slideshow on Open'}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      editingCouple.customTheme?.showSlideshowOnOpen !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {editingCouple.customTheme?.showSlideshowOnOpen !== false 
                        ? (lang === 'km' ? 'កំពុងបើក Slide' : 'Slide Enabled') 
                        : (lang === 'km' ? 'បានបិទ Slide' : 'Slide Disabled')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 max-w-xl">
                    {lang === 'km' 
                      ? 'នៅពេលភ្ញៀវចុច «បើកសំបុត្រ» ប្រព័ន្ធនឹងចាក់បង្ហាញ Slide Show រូបថត Pre-wedding ពេញអេក្រង់។ លោកអ្នកអាចចុចបិទត្រង់នេះ ប្រសិនបើមិនចង់ឱ្យមាន Slide ទេ (ចូលទៅទំព័រធៀបផ្ទាល់)។' 
                      : 'When guests tap "Open Invitation", automatically present full-screen photo slideshow. Toggle off here to disable slideshow and go straight to invitation.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 self-end sm:self-center">
                  <input
                    type="checkbox"
                    checked={editingCouple.customTheme?.showSlideshowOnOpen !== false}
                    onChange={(e) => {
                      setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          showSlideshowOnOpen: e.target.checked
                        }
                      } : null);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                </label>
              </div>

              {/* Gallery Section */}
              <div className="p-5 bg-[#FAF9F6] border border-gray-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                      <span>{lang === 'km' ? 'រូបភាពអនុស្សាវរីយ៍បន្ថែម Gallery (Album)' : 'Photo Gallery Album'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        {(editingCouple.galleryPhotos || []).length} {lang === 'km' ? 'សន្លឹក' : 'photos'}
                      </span>
                    </h5>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {lang === 'km' ? 'Upload រូបថតច្រើនសន្លឹកក្នុងពេលតែមួយ (Batch upload) ដោយស្វ័យប្រវត្តិបង្រួមទំហំ' : 'Batch upload multiple photos with auto-compression'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? '+ Upload រូបថតច្រើនសន្លឹក' : '+ Upload Photos'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadGalleryPhotos(e.target.files)}
                      />
                    </label>

                    {(editingCouple.galleryPhotos || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => setEditingCouple(prev => prev ? { ...prev, galleryPhotos: [] } : null)}
                        className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        {lang === 'km' ? 'លុបទាំងអស់' : 'Clear All'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Photo by URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://... ឬ Dropbox / Google Drive link"
                    value={newGalleryPhotoUrl}
                    onChange={(e) => setNewGalleryPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryPhotoByUrl}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#8C6D1F] text-xs font-medium rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'បន្ថែម URL' : 'Add URL'}</span>
                  </button>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {(editingCouple.galleryPhotos || []).map((photo, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-2xs aspect-square">
                      <img 
                        src={formatImageUrl(photo)} 
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setGalleryLightbox(formatImageUrl(photo) || photo)}
                        onError={(e) => handleImageError(e)}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryPhoto(index)}
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs cursor-pointer shadow-xs"
                            title="លុបរូប"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex justify-between gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveGalleryPhoto(index, 'left')}
                            className="p-1 bg-white/80 hover:bg-white disabled:opacity-30 text-gray-800 rounded text-[10px] font-bold cursor-pointer"
                            title="រំកិលទៅមុខ"
                          >
                            ◀
                          </button>
                          <button
                            type="button"
                            disabled={index === (editingCouple.galleryPhotos?.length || 1) - 1}
                            onClick={() => handleMoveGalleryPhoto(index, 'right')}
                            className="p-1 bg-white/80 hover:bg-white disabled:opacity-30 text-gray-800 rounded text-[10px] font-bold cursor-pointer"
                            title="រំកិលទៅក្រោយ"
                          >
                            ▶
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {(editingCouple.galleryPhotos || []).length === 0 && (
                    <div className="col-span-full py-8 text-center text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-300">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                      <p>{lang === 'km' ? 'មិនទាន់មានរូបថត Gallery នៅឡើយទេ។ ចុចប៊ូតុង Upload ខាងលើដើម្បីបញ្ចូល។' : 'No gallery photos yet. Click upload button above.'}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: បទភ្លេងការ */}
          {activeTab === 'music' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                    <Music className="w-4 h-4 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'ជ្រើសរើសបទចម្រៀង / ភ្លេងការ (Music Tracks)' : 'Wedding Music Tracks'}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === 'km' ? 'ជ្រើសរើសបទភ្លេងការពីបណ្ណាល័យ ឬបញ្ចូល Link MP3 / Dropbox ផ្ទាល់ខ្លួន' : 'Choose tracks from library or use custom MP3 / Dropbox link'}
                  </p>
                </div>

                {/* Auto Play Switch */}
                <label className="relative inline-flex items-center gap-2.5 px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100/80 transition-colors self-start sm:self-auto shrink-0">
                  <input
                    type="checkbox"
                    checked={editingCouple.customTheme?.enableMusic !== false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditingCouple(prev => prev ? {
                        ...prev,
                        customTheme: {
                          primaryColor: prev.customTheme?.primaryColor || '#D4AF37',
                          accentColor: prev.customTheme?.accentColor || '#8C6D1F',
                          enablePetals: prev.customTheme?.enablePetals ?? true,
                          envelopeStyle: prev.customTheme?.envelopeStyle || 'classic-gold',
                          musicTrack: prev.customTheme?.musicTrack || '',
                          musicUrl: prev.customTheme?.musicUrl || '',
                          fontFamilyKhmer: prev.customTheme?.fontFamilyKhmer,
                          enableMusic: checked
                        }
                      } : null);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                  <span className="text-xs font-medium text-amber-950 font-battambang">
                    {lang === 'km' ? 'ចាក់ភ្លេងស្វ័យប្រវត្តិ (Auto-play)' : 'Auto-play Music'}
                  </span>
                </label>
              </div>

              {/* Music Tracks Table */}
              <div className="border border-[#EAE6E1] rounded-2xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAE6E1] text-[11px] font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4 text-center w-12 hidden sm:table-cell">#</th>
                      <th className="py-3 px-2 sm:px-4 text-center w-12 sm:w-14">{lang === 'km' ? 'ស្ដាប់' : 'Play'}</th>
                      <th className="py-3 px-2 sm:px-4">{lang === 'km' ? 'ចំណងជើងបទចម្រៀង' : 'Title'}</th>
                      <th className="py-3 px-4 hidden sm:table-cell">{lang === 'km' ? 'ប្រភេទ' : 'Category'}</th>
                      <th className="py-3 px-4 text-center hidden sm:table-cell">{lang === 'km' ? 'រយៈពេល' : 'Duration'}</th>
                      <th className="py-3 px-2 sm:px-4 text-right pr-3 sm:pr-6">{lang === 'km' ? 'ជ្រើសរើស' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE8]">
                    {musicTracks.map((track, idx) => {
                      const isSelected = editingCouple.customTheme?.musicTrack === track.titleKh || editingCouple.customTheme?.musicTrack === track.titleEn;
                      const isPlaying = playingTrackId === track.id;

                      return (
                        <tr
                          key={track.id}
                          onClick={() => {
                            setEditingCouple(prev => prev ? {
                              ...prev,
                              customTheme: {
                                ...prev.customTheme,
                                musicTrack: track.titleKh,
                                musicUrl: track.audioUrl
                              }
                            } : null);
                          }}
                          className={`hover:bg-amber-50/70 cursor-pointer transition-colors ${isSelected ? 'bg-amber-50/90 font-medium ring-1 ring-[#D4AF37]/30' : ''}`}
                        >
                          <td className="py-3 px-4 text-center text-gray-400 font-mono text-[11px] hidden sm:table-cell">{idx + 1}</td>
                          <td className="py-2.5 px-2 sm:py-3 sm:px-4 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePlayMusic(track.id, track.audioUrl);
                              }}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                                isPlaying ? 'bg-[#D4AF37] text-white animate-pulse' : 'bg-amber-50 text-[#8C6D1F] hover:bg-amber-100'
                              }`}
                            >
                              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                            </button>
                          </td>
                          <td className="py-2.5 px-2 sm:py-3 sm:px-4 min-w-0 max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                              <span className="text-gray-900 truncate block font-battambang">{track.titleKh}</span>
                              {isSelected && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full shrink-0 font-battambang">
                                  ✓ <span className="hidden sm:inline">បានរើស</span>
                                </span>
                              )}
                            </div>
                            {track.titleEn && <p className="text-[11px] text-gray-400 truncate hidden sm:block font-battambang">{track.titleEn}</p>}
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-battambang">
                              {track.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-500 font-mono text-[11px] hidden sm:table-cell">
                            {track.duration || '3:30'}
                          </td>
                          <td className="py-2.5 px-2 sm:py-3 sm:px-4 text-right pr-3 sm:pr-6 whitespace-nowrap">
                            {isSelected ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  audioSynthesizer.stop();
                                  setPlayingTrackId(null);
                                  setEditingCouple(prev => prev ? {
                                    ...prev,
                                    customTheme: { ...prev.customTheme, musicTrack: '', musicUrl: '' }
                                  } : null);
                                }}
                                className="px-2.5 py-1 text-[11px] bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer"
                              >
                                {lang === 'km' ? 'ដកចេញ' : 'Remove'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCouple(prev => prev ? {
                                    ...prev,
                                    customTheme: {
                                      ...prev.customTheme,
                                      musicTrack: track.titleKh,
                                      musicUrl: track.audioUrl
                                    }
                                  } : null);
                                }}
                                className="px-3 py-1 text-[11px] bg-amber-50 hover:bg-[#D4AF37] text-[#8C6D1F] hover:text-white rounded-lg transition-colors cursor-pointer"
                              >
                                {lang === 'km' ? 'ជ្រើសរើស' : 'Select'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: គណនីធនាគារ KHQR */}
          {activeTab === 'banks' && (
            <div className="bg-white rounded-3xl border border-[#EAE6E1] p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div>
                  <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#D4AF37]" />
                    <span>{lang === 'km' ? 'កុងធនាគារចងដៃ & ABA KHQR (Bank Accounts & Digital Gifts)' : 'Bank Accounts & Digital Gifts'}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {lang === 'km' ? 'បញ្ចូលកុងធនាគារសម្រាប់ទទួលចំណងដៃ និងរូបភាព QR Code' : 'Bank accounts and QR codes for digital wedding gifts'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddEditingBank}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? '+ បន្ថែមកុងធនាគារ' : '+ Add Bank'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(editingCouple.bankAccounts || []).map((bank) => (
                  <div key={bank.id} className="p-5 bg-[#FAF9F6] rounded-2xl border border-gray-200 space-y-4 relative">
                    <button
                      type="button"
                      onClick={() => handleDeleteEditingBank(bank.id)}
                      className="absolute top-3.5 right-3.5 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="លុបកុងនេះ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {bank.qrUrl ? (
                          <img src={bank.qrUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
                        ) : (
                          <QrCode className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-xs text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs font-medium">
                          <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{lang === 'km' ? 'Upload QR Code' : 'Upload QR'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadKHQR(bank.id, e)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-0.5">{lang === 'km' ? 'ឈ្មោះធនាគារ (Bank Name)' : 'Bank Name'}</label>
                        <input
                          type="text"
                          value={bank.bankName}
                          onChange={(e) => handleUpdateEditingBank(bank.id, { bankName: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-medium"
                          placeholder="e.g. ABA Bank / Wing / ACLEDA"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-0.5">{lang === 'km' ? 'ឈ្មោះម្ចាស់គណនី (Account Name)' : 'Account Name'}</label>
                        <input
                          type="text"
                          value={bank.accountName}
                          onChange={(e) => handleUpdateEditingBank(bank.id, { accountName: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl"
                          placeholder="e.g. SOKHA & KANHA"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-0.5">{lang === 'km' ? 'លេខគណនី (Account Number)' : 'Account Number'}</label>
                        <input
                          type="text"
                          value={bank.accountNumber}
                          onChange={(e) => handleUpdateEditingBank(bank.id, { accountNumber: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl font-mono text-[#8C6D1F]"
                          placeholder="000 123 456"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(editingCouple.bankAccounts || []).length === 0 && (
                  <div className="col-span-full py-8 text-center text-gray-400 text-xs bg-white rounded-xl border border-dashed border-gray-300">
                    <QrCode className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                    <p>{lang === 'km' ? 'មិនទាន់មានគណនីធនាគារ ឬ KHQR នៅឡើយទេ។ ចុចប៊ូតុងខាងលើដើម្បីបន្ថែម។' : 'No bank accounts yet. Click button above to add.'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. BOTTOM STICKY FOOTER ACTION BAR */}
      <div className="bg-white/95 backdrop-blur-md border-t border-[#EAE6E1] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shrink-0 shadow-xs z-20">
        <div className="text-xs text-gray-500 hidden sm:block">
          <span>{lang === 'km' ? 'ផ្ទាំងបច្ចុប្បន្ន ៖ ' : 'Current Tab: '}</span>
          <strong className="text-gray-900 font-medium">
            {EDIT_TABS.find(t => t.id === activeTab)?.[lang === 'km' ? 'labelKh' : 'labelEn']}
          </strong>
          <span className="text-gray-400 ml-2">({currentTabIndex + 1} / {EDIT_TABS.length})</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {prevTab && (
            <button
              type="button"
              onClick={() => setActiveTab(prevTab.id as EditTabType)}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'ថយក្រោយ' : 'Previous'}</span>
            </button>
          )}

          {nextTab && (
            <button
              type="button"
              onClick={() => setActiveTab(nextTab.id as EditTabType)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200 text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <span>{lang === 'km' ? 'បន្ទាប់' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white text-xs rounded-xl shadow-xs hover:brightness-110 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <Save className="w-4 h-4" />
            <span>{lang === 'km' ? 'រក្សាទុក' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Lightbox for Gallery Photo in Modal */}
      {galleryLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setGalleryLightbox(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 text-white p-2.5 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer"
            onClick={() => setGalleryLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={galleryLightbox} 
            alt="Enlarged photo" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
};
