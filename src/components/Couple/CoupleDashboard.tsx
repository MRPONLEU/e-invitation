import React, { useState } from 'react';
import { Template, CoupleEvent, Guest, AgendaItem, BankAccount, Language, MusicTrack } from '../../types';
import { audioSynthesizer } from '../../utils/audioSynthesizer';
import { formatImageUrl, handleImageError } from '../../utils/imageHelper';
import { 
  Heart, 
  Palette, 
  Users, 
  MessageSquareHeart, 
  Copy, 
  Check, 
  Send, 
  Share2, 
  Eye, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Clock, 
  QrCode, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  Music, 
  Upload, 
  ExternalLink,
  Download,
  Smartphone,
  ChevronRight,
  Info,
  ShieldCheck,
  MoreVertical,
  Facebook,
  Phone,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  Tag,
  Star,
  BookOpen,
  Globe,
  LayoutDashboard,
  Settings,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getGuestInvitationUrl, getAppBaseUrl } from '../../utils/urlHelper';
import { ShareGuideModal } from '../ShareGuideModal';
import { requestAppFullscreen } from '../../utils/fullscreen';

interface CoupleDashboardProps {
  couple: CoupleEvent;
  setCouples: React.Dispatch<React.SetStateAction<CoupleEvent[]>>;
  templates: Template[];
  musicTracks?: MusicTrack[];
  onPreviewGuest: (guestCode?: string) => void;
  lang: Language;
  activeTab?: 'overview' | 'template' | 'settings' | 'guests' | 'wishes';
  onTabChange?: (tab: 'overview' | 'template' | 'settings' | 'guests' | 'wishes') => void;
  onGoToAdmin?: () => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({
  couple,
  setCouples,
  templates,
  musicTracks = [],
  onPreviewGuest,
  lang,
  activeTab: controlledTab,
  onTabChange,
  onGoToAdmin,
}) => {
  const [internalTab, setInternalTab] = useState<'overview' | 'template' | 'settings' | 'guests' | 'wishes'>('overview');
  const activeTab = controlledTab ?? internalTab;
  const setActiveTab = (tab: 'overview' | 'template' | 'settings' | 'guests' | 'wishes') => {
    setInternalTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [playingMusicTrackId, setPlayingMusicTrackId] = useState<string | null>(null);
  const [musicCategoryFilter, setMusicCategoryFilter] = useState<string>('all');
  const [musicSearchQuery, setMusicSearchQuery] = useState<string>('');

  const handleTogglePlayMusicTrack = (trackId: string, customAudioUrl?: string) => {
    if (playingMusicTrackId === trackId) {
      audioSynthesizer.stop();
      setPlayingMusicTrackId(null);
    } else {
      const track = musicTracks.find(t => t.id === trackId);
      audioSynthesizer.stop();
      audioSynthesizer.start(customAudioUrl || track?.audioUrl);
      setPlayingMusicTrackId(trackId);
    }
  };
  const [openMenuGuestId, setOpenMenuGuestId] = useState<string | null>(null);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestSideFilter, setGuestSideFilter] = useState<'all' | 'groom' | 'bride' | 'mutual'>('all');
  const [guestStatusFilter, setGuestStatusFilter] = useState<'all' | 'attending' | 'pending' | 'declined'>('all');
  const [showShareGuide, setShowShareGuide] = useState(false);

  // Modal states
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isBatchImportModalOpen, setIsBatchImportModalOpen] = useState(false);
  const [batchNamesText, setBatchNamesText] = useState('');
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // New Guest Form
  const [guestForm, setGuestForm] = useState<Partial<Guest>>({
    titleKh: 'លោក',
    titleEn: 'Mr.',
    fullNameKh: '',
    fullNameEn: '',
    phone: '',
    side: 'groom',
    category: 'Friend',
    paxExpected: 2,
    tableNumber: '',
    specialNote: ''
  });

  // Current active template
  const activeTemplate = templates.find(t => t.id === couple.templateId) || templates[0];

  // Helper to format guest display name politely
  const formatGuestDisplayName = (guest?: Guest | null): string => {
    if (!guest) return 'ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា';
    const name = guest.fullNameKh || guest.fullNameEn || 'ភ្ញៀវកិត្តិយស';
    const title = guest.titleKh || '';
    if (name.startsWith(title)) {
      return name;
    }
    return title ? `${title} ${name}` : name;
  };

  // Save notification state
  const [saveToast, setSaveToast] = useState(false);
  const [copyToastMessage, setCopyToastMessage] = useState<string | null>(null);

  // Wish deletion states
  const [deletingWishId, setDeletingWishId] = useState<string | null>(null);
  const [showClearAllWishesConfirm, setShowClearAllWishesConfirm] = useState(false);

  // Helper to delete an individual wish
  const handleDeleteWish = (wishId: string) => {
    updateCouple(prev => ({
      ...prev,
      wishes: (prev.wishes || []).filter(w => w.id !== wishId)
    }));
    setDeletingWishId(null);
  };

  // Helper to clear all wishes
  const handleClearAllWishes = () => {
    updateCouple(prev => ({
      ...prev,
      wishes: []
    }));
    setShowClearAllWishesConfirm(false);
  };

  // Helper to update current couple data
  const updateCouple = (updater: (prev: CoupleEvent) => CoupleEvent) => {
    setCouples(prev => prev.map(c => c.id === couple.id ? updater(c) : c));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Copy helper with feedback
  const handleCopy = (text: string, key: string, toastLabel?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setCopyToastMessage(toastLabel || 'បានចម្លងសារអញ្ជើញរួចរាល់! លោកអ្នកអាចចុច Paste (Ctrl+V) ក្នុង Telegram បានភ្លាមៗ');
    setTimeout(() => {
      setCopiedKey(null);
      setCopyToastMessage(null);
    }, 2800);
  };

  // Generate Personalized Invitation Link for a guest
  const getGuestInviteLink = (guestCode: string) => {
    return getGuestInvitationUrl(couple.id, guestCode);
  };

  // Generate Telegram / Social polite invite message
  const getSocialMessage = (guest: Guest) => {
    const inviteLink = getGuestInviteLink(guest.code);
    const guestTitleName = formatGuestDisplayName(guest);
    const programName = `អាពាហ៍ពិពាហ៍ (${couple.groomNameKh} & ${couple.brideNameKh})`;
    return `យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ${guestTitleName} ដើម្បីចូលរួមកម្មវិធី${programName}របស់យើងខ្ញុំ។ យើងខ្ញុំសង្ឃឹមថាលោកអ្នកនឹងអញ្ជើញចូលរួម សូមអរគុណ!

👉 សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញឌីជីថល៖
${inviteLink}`;
  };

  // Generate Direct 1-Click Telegram Share
  const handleDirectTelegramShare = (targetGuest?: Guest | null) => {
    const guestCode = targetGuest?.code || '';
    const inviteLink = getGuestInvitationUrl(couple.id, guestCode || undefined);

    const recipientName = targetGuest ? formatGuestDisplayName(targetGuest) : 'ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា';
    const programName = `អាពាហ៍ពិពាហ៍ (${couple.groomNameKh} & ${couple.brideNameKh})`;
    
    const captionText = `យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ${recipientName} ដើម្បីចូលរួមកម្មវិធី${programName}របស់យើងខ្ញុំ។ យើងខ្ញុំសង្ឃឹមថាលោកអ្នកនឹងអញ្ជើញចូលរួម សូមអរគុណ!

👉 សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញឌីជីថល៖
${inviteLink}`;

    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(`យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ${recipientName} ដើម្បីចូលរួមកម្មវិធី${programName}របស់យើងខ្ញុំ។ យើងខ្ញុំសង្ឃឹមថាលោកអ្នកនឹងអញ្ជើញចូលរួម សូមអរគុណ!\n\n👉 សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញឌីជីថល៖`)}`;

    try {
      navigator.clipboard.writeText(captionText);
      setCopiedKey(targetGuest ? `tg_${targetGuest.id}` : 'master_tg');
      setCopyToastMessage(`បានចម្លងសារ និងបើក Telegram ជូន «${recipientName}» រួចរាល់!`);
      setTimeout(() => {
        setCopiedKey(null);
        setCopyToastMessage(null);
      }, 3000);
    } catch {
      // ignore
    }

    window.open(telegramShareUrl, '_blank');
  };

  // Generate Direct Telegram Share Link
  const getTelegramShareUrl = (guest: Guest) => {
    const inviteLink = getGuestInviteLink(guest.code);
    const guestTitleName = formatGuestDisplayName(guest);
    const programName = `អាពាហ៍ពិពាហ៍ (${couple.groomNameKh} & ${couple.brideNameKh})`;
    const text = `យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ${guestTitleName} ដើម្បីចូលរួមកម្មវិធី${programName}របស់យើងខ្ញុំ។ យើងខ្ញុំសង្ឃឹមថាលោកអ្នកនឹងអញ្ជើញចូលរួម សូមអរគុណ!\n\n👉 សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញឌីជីថល៖`;
    return `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
  };

  // Save guest (single)
  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.fullNameKh?.trim()) return;

    if (editingGuest) {
      updateCouple(prev => ({
        ...prev,
        guests: prev.guests.map(g => g.id === editingGuest.id ? { ...g, ...guestForm } as Guest : g)
      }));
    } else {
      const uniqueCode = `g-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const newGuest: Guest = {
        id: `gst_${Date.now()}`,
        code: uniqueCode,
        titleKh: guestForm.titleKh || 'លោក',
        titleEn: guestForm.titleEn || 'Mr.',
        fullNameKh: guestForm.fullNameKh,
        fullNameEn: guestForm.fullNameEn || '',
        phone: guestForm.phone || '',
        side: guestForm.side || 'groom',
        category: guestForm.category || 'Friend',
        paxExpected: Number(guestForm.paxExpected) || 1,
        tableNumber: guestForm.tableNumber || '',
        rsvpStatus: 'pending',
        specialNote: guestForm.specialNote || ''
      };

      updateCouple(prev => ({
        ...prev,
        guests: [newGuest, ...prev.guests]
      }));
    }

    setIsGuestModalOpen(false);
    setEditingGuest(null);
    setGuestForm({
      titleKh: 'លោក',
      titleEn: 'Mr.',
      fullNameKh: '',
      fullNameEn: '',
      phone: '',
      side: 'groom',
      category: 'Friend',
      paxExpected: 2,
      tableNumber: '',
      specialNote: ''
    });
  };

  // Batch import guests
  const handleBatchImport = () => {
    const lines = batchNamesText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const newGuests: Guest[] = lines.map((line, idx) => {
      // Check if title is prefix
      let titleKh = 'លោក';
      let cleanName = line;
      const titles = ['ឯកឧត្តម', 'លោកជំទាវ', 'លោក', 'លោកស្រី', 'អ្នកនាង', 'កញ្ញា', 'លោកពូ', 'អ្នកមីង', 'មិត្ត'];
      for (const t of titles) {
        if (line.startsWith(t)) {
          titleKh = t;
          cleanName = line.replace(t, '').trim();
          break;
        }
      }

      return {
        id: `gst_b_${Date.now()}_${idx}`,
        code: `inv-${Date.now().toString(36)}-${idx + 1}`,
        titleKh,
        titleEn: 'Guest',
        fullNameKh: cleanName || line,
        side: 'mutual',
        category: 'Friend',
        paxExpected: 2,
        rsvpStatus: 'pending'
      };
    });

    updateCouple(prev => ({
      ...prev,
      guests: [...newGuests, ...prev.guests]
    }));

    setBatchNamesText('');
    setIsBatchImportModalOpen(false);
    try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }); } catch {}
  };

  // Filtered guest list
  const guestsList = couple.guests || [];
  const filteredGuests = guestsList.filter(g => {
    const q = (guestSearch || '').toLowerCase();
    const matchSearch = (g.fullNameKh || '').toLowerCase().includes(q) ||
                        (g.fullNameEn || '').toLowerCase().includes(q) ||
                        (g.phone && g.phone.includes(guestSearch)) ||
                        (g.titleKh && g.titleKh.includes(guestSearch));
    const matchSide = guestSideFilter === 'all' || g.side === guestSideFilter;
    const matchStatus = guestStatusFilter === 'all' || g.rsvpStatus === guestStatusFilter;
    return matchSearch && matchSide && matchStatus;
  });

  // Calculate stats
  const totalGuests = guestsList.length;
  const attendingGuests = guestsList.filter(g => g.rsvpStatus === 'attending');
  const totalAttendingPax = attendingGuests.reduce((acc, g) => acc + (g.attendeesCount || g.paxExpected || 1), 0);
  const pendingCount = guestsList.filter(g => g.rsvpStatus === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
      
      {/* TOAST NOTIFICATION WHEN INFO IS SAVED */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2 text-xs font-normal animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'km' ? 'បានរក្សាទុកព័ត៌មានជោគជ័យ!' : 'Changes saved successfully!'}</span>
        </div>
      )}



      {/* TOP NAVIGATION TABS ROW */}
      <div className="bg-white border border-[#EAE6E1] rounded-2xl p-2 shadow-2xs overflow-x-auto no-scrollbar font-battambang">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: 'overview', labelKh: 'គ្រប់គ្រងទូទៅ', labelEn: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'template', labelKh: 'ម៉ូតសំបុត្រ', labelEn: 'Template', icon: <Palette className="w-4 h-4" /> },
            { id: 'settings', labelKh: 'ការកំណត់ & បទភ្លេង', labelEn: 'Settings & Music', icon: <Settings className="w-4 h-4" /> },
            { id: 'guests', labelKh: 'បញ្ជីភ្ញៀវ', labelEn: 'Guest List', icon: <Users className="w-4 h-4" />, badge: totalGuests },
            { id: 'wishes', labelKh: 'សារជូនពរ', labelEn: 'Wishes & RSVP', icon: <MessageSquareHeart className="w-4 h-4" />, badge: (couple.wishes || []).length },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-normal transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF1B6B] to-[#FF4585] text-white shadow-xs font-medium'
                    : 'bg-[#FAF8F5] text-gray-600 hover:text-gray-900 hover:bg-[#F3EFEA] border border-[#EAE6E1]'
                }`}
              >
                {t.icon}
                <span>{lang === 'km' ? t.labelKh : t.labelEn}</span>
                {t.badge !== undefined && (
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

      {/* ========================================================================= */}
      {/* PAGE: គ្រប់គ្រងទូទៅ (DEDICATED OVERVIEW DASHBOARD)                        */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Couple Bento Hero Card */}
          <div className="bg-white border border-[#EAE6E1] rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Couple Header Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={formatImageUrl(couple.coverPhoto)} 
                    alt={couple.groomNameKh} 
                    onError={(e) => handleImageError(e)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-sm"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white flex items-center justify-center text-xs font-normal shadow-xs">
                    💍
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-normal">
                      {couple.packageType}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#D4AF37]" />
                      {couple.weddingDate}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-normal text-gray-900 font-khmer-title mt-1 tracking-tight">
                    {couple.groomNameKh} <span className="text-[#D4AF37]">&</span> {couple.brideNameKh}
                  </h2>

                  <p className="text-xs text-gray-500 mt-0.5">
                    {couple.venueNameKh}
                  </p>
                </div>
              </div>



            </div>

            {/* Quick Bento Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-gray-100">
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-gray-100">
                <span className="text-[11px] text-gray-500 font-normal block">{lang === 'km' ? 'ភ្ញៀវសរុប' : 'Total Invited'}</span>
                <div className="text-xl font-normal text-gray-900 mt-1">{totalGuests} <span className="text-xs font-normal text-gray-500">{lang === 'km' ? 'នាក់' : 'guests'}</span></div>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-normal block">{lang === 'km' ? 'បានឆ្លើយតបចូលរួម' : 'Confirmed Pax'}</span>
                <div className="text-xl font-normal text-emerald-800 mt-1">{totalAttendingPax} <span className="text-xs font-normal text-emerald-600">{lang === 'km' ? 'នាក់' : 'pax'}</span></div>
              </div>
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100">
                <span className="text-[11px] text-amber-700 font-normal block">{lang === 'km' ? 'រង់ចាំឆ្លើយតប' : 'Pending RSVPs'}</span>
                <div className="text-xl font-normal text-amber-800 mt-1">{pendingCount} <span className="text-xs font-normal text-amber-600">{lang === 'km' ? 'នាក់' : 'pending'}</span></div>
              </div>
              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100">
                <span className="text-[11px] text-purple-700 font-normal block">{lang === 'km' ? 'ពាក្យជូនពរ' : 'Guest Wishes'}</span>
                <div className="text-xl font-normal text-purple-800 mt-1">{(couple.wishes || []).length} <span className="text-xs font-normal text-purple-600">{lang === 'km' ? 'សារ' : 'wishes'}</span></div>
              </div>
            </div>

          </div>

          {/* Quick Jump Navigation Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">

            {/* 1. Module: រចនាប័ទ្ម (Template) */}
            <div className="bg-white border border-[#EAE6E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-[#FF1B6B]/40 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#FF1B6B] flex items-center justify-center">
                    <Palette className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-normal text-gray-400 uppercase tracking-wider">
                    {activeTemplate?.nameKh || 'Classic Gold'}
                  </span>
                </div>
                <h3 className="text-sm font-normal text-gray-900 mt-3">
                  {lang === 'km' ? 'រចនាប័ទ្ម & ម៉ូតសំបុត្រ' : 'Template & Design'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {lang === 'km' ? 'ជ្រើសរើស និងតុបតែងម៉ូតសំបុត្រ ប្តូរពណ៌ Palette និងបទភ្លេងការ' : 'Choose template design, customize color palette and music'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('template')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#FF1B6B] text-xs font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'km' ? 'ចូលរៀបចំម៉ូត' : 'Customize Template'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Module: បញ្ជីភ្ញៀវ (Guest List) */}
            <div className="bg-white border border-[#EAE6E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-[#D4AF37]/50 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#8C6D1F] flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-normal bg-[#D4AF37]/20 text-[#8C6D1F] px-2 py-0.5 rounded-full">
                    {totalGuests} {lang === 'km' ? 'នាក់' : 'guests'}
                  </span>
                </div>
                <h3 className="text-sm font-normal text-gray-900 mt-3">
                  {lang === 'km' ? 'បញ្ជីភ្ញៀវ' : 'Guest List'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {lang === 'km' ? 'គ្រប់គ្រងបញ្ជីភ្ញៀវ ចម្លង Link ផ្ទាល់ខ្លួន និងផ្ញើសារតាម Telegram' : 'Manage guests, copy personalized invite links and Telegram messages'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('guests')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] text-xs font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'km' ? 'ចូលបញ្ជីភ្ញៀវ' : 'Manage Guests'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Module: សារជូនពរ & RSVP (Wishes & RSVPs) */}
            <div className="bg-white border border-[#EAE6E1] rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquareHeart className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {(couple.wishes || []).length} {lang === 'km' ? 'សារ' : 'wishes'}
                  </span>
                </div>
                <h3 className="text-sm font-normal text-gray-900 mt-3">
                  {lang === 'km' ? 'ការឆ្លើយតប & សារជូនពរ' : 'RSVPs & Guestbook'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {lang === 'km' ? 'ពិនិត្យមើលសារជូនពរឌីជីថលពីភ្ញៀវ និងចំនួនអ្នកចូលរួមពិតប្រាកដ' : 'View digital wishes from loved ones and RSVP attendance confirmations'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('wishes')}
                className="mt-4 w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-normal flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'km' ? 'ពិនិត្យមើលសារ' : 'View Wishes'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Quick Share Link & Recent RSVPs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Share Public Invitation Card */}
            <div className="bg-gradient-to-br from-[#0B132B] to-[#1C2A4A] rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-pink-400 text-xs font-normal uppercase tracking-wider">
                  <Share2 className="w-4 h-4" />
                  <span>{lang === 'km' ? 'ចែករំលែកសំបុត្រអញ្ជើញ' : 'Share Invitation'}</span>
                </div>
                <h3 className="text-lg font-normal mt-2 text-white font-khmer-title">
                  {lang === 'km' ? 'តំណភ្ជាប់សំបុត្រមេ (Public Link)' : 'Master Invitation Link'}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {lang === 'km' ? 'ប្រើប្រាស់តំណភ្ជាប់នេះ ដើម្បីផ្ញើជូនភ្ញៀវទូទៅ ឬបង្ហោះលើបណ្តាញសង្គម' : 'Share this public link anywhere or post to social media'}
                </p>

                <div className="mt-4 p-3 bg-black/30 rounded-xl border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-300 truncate font-mono">
                    {getGuestInvitationUrl(couple.id)}
                  </span>
                  <button
                    onClick={() => handleCopy(getGuestInvitationUrl(couple.id), 'public_qr_link')}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copiedKey === 'public_qr_link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Quick Telegram Share for Master Link */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleDirectTelegramShare(null)}
                    className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'ផ្ញើតាម Telegram ភ្លាមៗ' : 'Share to Telegram'}</span>
                  </button>
                  <button
                    onClick={() => handleCopy(`យើងខ្ញុំមានកិត្តិយសសូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ដើម្បីចូលរួមកម្មវិធីអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ (${couple.groomNameKh} & ${couple.brideNameKh})។ យើងខ្ញុំសង្ឃឹមថាលោកអ្នកនឹងអញ្ជើញចូលរួម សូមអរគុណ!\n\n👉 សូមចុចតំណភ្ជាប់ខាងក្រោមដើម្បីបើកមើលសំបុត្រអញ្ជើញឌីជីថល៖\n${getGuestInvitationUrl(couple.id)}`, 'master_msg')}
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    title={lang === 'km' ? 'ចម្លងសារអញ្ជើញទូទៅ' : 'Copy Message'}
                  >
                    {copiedKey === 'master_msg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{lang === 'km' ? 'ចម្លងសារ' : 'Copy Msg'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    requestAppFullscreen();
                    onPreviewGuest();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF1B6B] to-[#FF4585] text-white text-xs font-normal hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'មើលធៀប' : 'Open Preview'}</span>
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  {lang === 'km' ? 'បង្ហាញដូចទូរស័ព្ទពិត' : 'Live Phone Preview'}
                </span>
              </div>
            </div>

            {/* Recent RSVPs & Wishes Feed */}
            <div className="lg:col-span-2 bg-white border border-[#EAE6E1] rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <MessageSquareHeart className="w-4 h-4 text-[#FF1B6B]" />
                    <h3 className="text-sm font-normal text-gray-900">
                      {lang === 'km' ? 'សារជូនពរថ្មីៗចុងក្រោយ' : 'Recent Wishes & RSVPs'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('wishes')}
                    className="text-xs font-normal text-[#FF1B6B] hover:underline cursor-pointer"
                  >
                    {lang === 'km' ? 'មើលទាំងអស់' : 'View All'} ({(couple.wishes || []).length})
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {(couple.wishes || []).slice(0, 3).map((w) => (
                    <div key={w.id} className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-gray-100 flex items-start gap-3 group relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 text-white flex items-center justify-center text-xs font-normal shrink-0">
                        {w.guestName ? w.guestName.charAt(0) : '❤️'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-normal text-gray-900 truncate">
                            {w.guestName}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] text-gray-400">{w.date}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteWish(w.id)}
                              className="text-gray-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer"
                              title={lang === 'km' ? 'លុបសារ' : 'Delete'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                          "{w.message}"
                        </p>
                      </div>
                    </div>
                  ))}

                  {(couple.wishes || []).length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-xs">
                      <MessageSquareHeart className="w-8 h-8 mx-auto mb-2 opacity-30 text-gray-400" />
                      <p>{lang === 'km' ? 'មិនទាន់មានសារជូនពរនៅឡើយទេ' : 'No wishes received yet'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{lang === 'km' ? 'ចំនួនអ្នកឆ្លើយតបចូលរួមសរុប៖' : 'Total Confirmed Attendees:'} <strong className="text-emerald-700 font-normal">{totalAttendingPax} នាក់</strong></span>
                <button 
                  onClick={() => setActiveTab('guests')}
                  className="font-normal text-[#8C6D1F] hover:underline cursor-pointer"
                >
                  {lang === 'km' ? 'ពិនិត្យបញ្ជីភ្ញៀវ' : 'Check Guest List'} &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE: បញ្ជីភ្ញៀវ (DEDICATED GUEST LIST PAGE)                               */}
      {/* ========================================================================= */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          
          {/* Guest Page Header Title */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-normal text-gray-900 font-khmer-title">
                {lang === 'km' ? 'បញ្ជីភ្ញៀវ' : 'Guest List'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {lang === 'km' ? 'គ្រប់គ្រងបញ្ជីភ្ញៀវកិត្តិយស បង្កើតតំណភ្ជាប់ផ្ទាល់ខ្លួន និងចម្លងសារផ្ញើតាម Telegram' : 'Manage guests, create personalized URLs and copy Telegram invitation messages'}
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-[#8C6D1F] border border-amber-200 rounded-full text-xs font-normal">
              {totalGuests} {lang === 'km' ? 'ភ្ញៀវសរុប' : 'Total Guests'}
            </span>
          </div>
          
          {/* Guest management toolbar with single Add Guest button */}
          <div className="bg-white border border-[#EAE6E1] rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={lang === 'km' ? 'ស្វែងរកឈ្មោះភ្ញៀវ...' : 'Search guest name...'}
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F5F0] border border-[#EAE6E1] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
              />
            </div>

            <button
              id="couple-add-single-guest-btn"
              onClick={() => {
                setEditingGuest(null);
                setGuestForm({
                  titleKh: 'លោក',
                  fullNameKh: '',
                  titleEn: 'Mr.',
                  fullNameEn: '',
                  phone: '',
                  side: 'groom',
                  category: 'VIP',
                  tableNumber: '',
                  paxExpected: 2
                });
                setIsGuestModalOpen(true);
              }}
              className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-xl text-xs font-normal flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'km' ? '+ បញ្ចូលឈ្មោះភ្ញៀវ' : '+ Add Guest Name'}</span>
            </button>
          </div>

          {/* Guests List (Mobile & Tablet View: Clean item showing ONLY Guest Name) */}
          <div className="block lg:hidden space-y-2.5">
            {filteredGuests.length === 0 ? (
              <div className="bg-white border border-[#EAE6E1] rounded-2xl p-6 text-center text-gray-400 text-xs">
                {lang === 'km' ? 'មិនមានទិន្នន័យភ្ញៀវនៅឡើយទេ' : 'No guests found'}
              </div>
            ) : (
              filteredGuests.map((guest) => {
                const guestLink = getGuestInviteLink(guest.code);
                const socialMsg = getSocialMessage(guest);
                const isLinkCopied = copiedKey === `link_${guest.id}`;
                const isMsgCopied = copiedKey === `msg_${guest.id}`;

                return (
                  <div 
                    key={guest.id}
                    className="bg-white border border-[#EAE6E1] rounded-2xl p-3 shadow-xs flex items-center justify-between gap-2 hover:border-[#D4AF37]/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[#FAF0D7] text-[#8C6D1F] flex items-center justify-center font-medium text-xs shrink-0">
                        {guest.titleKh ? guest.titleKh.substring(0, 2) : 'ភ្ញៀវ'}
                      </div>
                      <div className="min-w-0 font-normal text-gray-900 text-sm truncate">
                        <span className="text-[#8C6D1F] mr-1">{guest.titleKh}</span>
                        <span>{guest.fullNameKh}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      {/* Icon 1: Copy Full Telegram Invitation Message */}
                      <button
                        onClick={() => handleCopy(socialMsg, `msg_${guest.id}`)}
                        title={isMsgCopied ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លងសារ & Link' : 'Copy Message & Link')}
                        className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                          isMsgCopied
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-[#FAF8F3] hover:bg-[#F3ECE0] text-[#8C6D1F] border-amber-200/80 shadow-2xs'
                        }`}
                      >
                        {isMsgCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#8C6D1F]" />}
                      </button>

                      {/* Icon 2: 3 Dots Menu Button */}
                      <button
                        onClick={() => setOpenMenuGuestId(openMenuGuestId === guest.id ? null : guest.id)}
                        title={lang === 'km' ? 'ជម្រើសផ្សេងទៀត' : 'More options'}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          openMenuGuestId === guest.id
                            ? 'bg-[#1A1A1A] text-white border-black'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200 shadow-2xs'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuGuestId === guest.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-20 cursor-default"
                            onClick={() => setOpenMenuGuestId(null)}
                          />
                          
                          <div className="absolute right-0 top-11 w-48 bg-white border border-[#EAE6E1] rounded-2xl shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                            {/* Copy Telegram Message */}
                            <button
                              onClick={() => {
                                handleCopy(socialMsg, `msg_${guest.id}`);
                                setOpenMenuGuestId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-amber-50 hover:text-[#8C6D1F] flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#8C6D1F]" />
                              <span>{lang === 'km' ? 'ចម្លងសារ & Link' : 'Copy Message & Link'}</span>
                            </button>

                            {/* Preview Card */}
                            <button
                              onClick={() => {
                                onPreviewGuest(guest.code);
                                setOpenMenuGuestId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>{lang === 'km' ? 'មើលសំបុត្រអញ្ជើញ' : 'Preview Card'}</span>
                            </button>

                            {/* Edit Guest */}
                            <button
                              onClick={() => {
                                setEditingGuest(guest);
                                setGuestForm(guest);
                                setIsGuestModalOpen(true);
                                setOpenMenuGuestId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs text-gray-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                              <span>{lang === 'km' ? 'កែប្រែទិន្នន័យ' : 'Edit Guest'}</span>
                            </button>

                            <div className="my-1 border-t border-gray-100" />

                            {/* Delete Guest */}
                            <button
                              onClick={() => {
                                updateCouple(prev => ({
                                  ...prev,
                                  guests: prev.guests.filter(g => g.id !== guest.id)
                                }));
                                setOpenMenuGuestId(null);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>{lang === 'km' ? 'លុបឈ្មោះភ្ញៀវ' : 'Delete Guest'}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Guests Table (Desktop View ONLY) */}
          <div className="hidden lg:block bg-white border border-[#EAE6E1] rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600 min-w-[600px]">
                <thead className="bg-[#FAF9F6] text-gray-700 font-medium uppercase tracking-wider text-[10px] border-b border-[#EAE6E1]">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'គោរមងារ & ឈ្មោះភ្ញៀវ' : 'Guest Name & Title'}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'ចំណាត់ថ្នាក់ / ភាគី' : 'Category / Side'}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'ចំនួនភ្ញៀវ / តុ' : 'Pax / Table'}</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'ស្ថានភាព RSVP' : 'RSVP Status'}</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-normal">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                        <p>{lang === 'km' ? 'មិនមានទិន្នន័យភ្ញៀវនៅឡើយទេ' : 'No guests found'}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const guestLink = getGuestInviteLink(guest.code);
                      const socialMsg = getSocialMessage(guest);
                      const isLinkCopied = copiedKey === `link_${guest.id}`;
                      const isMsgCopied = copiedKey === `msg_${guest.id}`;

                      return (
                        <tr key={guest.id} className="hover:bg-[#FCFBF8] transition-colors">
                          
                          {/* Name and Title */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#FAF0D7] text-[#8C6D1F] flex items-center justify-center font-medium text-xs shrink-0">
                                {guest.titleKh.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-normal text-gray-900 text-sm flex items-center gap-1.5">
                                  <span className="text-[#8C6D1F] font-normal">{guest.titleKh}</span>
                                  <span>{guest.fullNameKh}</span>
                                </div>
                                {guest.phone && (
                                  <div className="text-[11px] text-gray-400 font-mono">
                                    {guest.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category and Side */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {guest.category}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {guest.side === 'groom' ? 'ខាងប្រុស' : guest.side === 'bride' ? 'ខាងស្រី' : 'ទាំងសងខាង'}
                              </span>
                            </div>
                          </td>

                          {/* Pax and Table */}
                          <td className="py-4 px-4">
                            <div className="font-normal text-gray-800">
                              {guest.paxExpected} {lang === 'km' ? 'នាក់' : 'pax'}
                            </div>
                            {guest.tableNumber && (
                              <div className="text-[10px] text-[#8C6D1F] font-medium">
                                {lang === 'km' ? 'តុលេខ៖' : 'Table:'} {guest.tableNumber}
                              </div>
                            )}
                          </td>

                          {/* RSVP status */}
                          <td className="py-4 px-4">
                            {guest.rsvpStatus === 'attending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {lang === 'km' ? `ចូលរួម (${guest.attendeesCount || guest.paxExpected} នាក់)` : `Attending (${guest.attendeesCount || guest.paxExpected})`}
                              </span>
                            ) : guest.rsvpStatus === 'declined' ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                {lang === 'km' ? 'មិនអាចចូលរួម' : 'Declined'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                                {lang === 'km' ? 'រង់ចាំឆ្លើយតប' : 'Pending'}
                              </span>
                            )}
                          </td>

                          {/* Actions: Copy Invitation Msg & Link, Preview, Edit, Delete */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              
                              {/* 1. Copy Invitation Message & Link */}
                              <button
                                onClick={() => handleCopy(socialMsg, `msg_${guest.id}`)}
                                title={isMsgCopied ? (lang === 'km' ? 'បានចម្លង!' : 'Copied!') : (lang === 'km' ? 'ចម្លងសារ & Link' : 'Copy Message & Link')}
                                className={`h-8 px-3 rounded-xl border flex items-center gap-1.5 font-medium text-xs transition-all cursor-pointer ${
                                  isMsgCopied
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                    : 'bg-[#FAF8F3] hover:bg-[#F3ECE0] text-[#8C6D1F] border-[#DFBA49]/60 shadow-2xs'
                                }`}
                              >
                                {isMsgCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{lang === 'km' ? 'បានចម្លង' : 'Copied'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{lang === 'km' ? 'ចម្លង' : 'Copy'}</span>
                                  </>
                                )}
                              </button>

                              {/* 2. Preview As Guest (Eye) */}
                              <button
                                onClick={() => {
                                  requestAppFullscreen();
                                  onPreviewGuest(guest.code);
                                }}
                                title="Open Live Card as Guest (Full Screen)"
                                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* 4. Edit Guest */}
                              <button
                                onClick={() => {
                                  setEditingGuest(guest);
                                  setGuestForm(guest);
                                  setIsGuestModalOpen(true);
                                }}
                                title="Edit Guest Info"
                                className="w-8 h-8 rounded-xl hover:bg-gray-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* 5. Delete Guest */}
                              <button
                                onClick={() => {
                                  updateCouple(prev => ({
                                    ...prev,
                                    guests: prev.guests.filter(g => g.id !== guest.id)
                                  }));
                                }}
                                title="Delete Guest"
                                className="w-8 h-8 rounded-xl hover:bg-rose-50 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TEMPLATE SELECTOR & CUSTOMIZER */}
      {activeTab === 'template' && (
        <div className="space-y-6">
          
          {/* Centered Clean Title: ម៉ូតសំបុត្រអញ្ជើញ */}
          <div className="text-center py-2">
            <h3 className="text-xl sm:text-2xl font-normal text-gray-900 font-khmer-title inline-flex items-center justify-center gap-2">
              <span className="w-2.5 h-6 bg-[#D4AF37] rounded-full"></span>
              <span>{lang === 'km' ? 'ម៉ូតសំបុត្រអញ្ជើញ' : 'Wedding Invitation Templates'}</span>
              <span className="w-2.5 h-6 bg-[#D4AF37] rounded-full"></span>
            </h3>
          </div>

          {/* Template Catalog Grid */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => {
                const isSelected = couple.templateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => updateCouple(prev => ({ ...prev, templateId: tpl.id }))}
                    className={`cursor-pointer rounded-2xl border-2 overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-md bg-amber-50/20'
                        : 'border-gray-200 hover:border-[#D4AF37]/60 bg-white'
                    }`}
                  >
                    <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
                      <img 
                        src={formatImageUrl(tpl.coverImage)} 
                        alt={tpl.nameKh}
                        onError={(e) => handleImageError(e)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />

                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-[#D4AF37] text-white p-1.5 rounded-full shadow-md z-10">
                          <Check className="w-4 h-4 font-normal" />
                        </div>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-normal text-gray-900 truncate block font-khmer-title" title={tpl.nameKh}>
                          {tpl.nameKh}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {tpl.code}
                        </span>
                      </div>
                      <span className={`text-[11px] font-normal shrink-0 ${isSelected ? 'text-[#8C6D1F] font-semibold' : 'text-gray-600'}`}>
                        {isSelected ? '✓ កំពុងជ្រើសរើស' : 'ចុចជ្រើសរើស'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}



      {/* TAB: SETTINGS & MUSIC (ការកំណត់ & បទភ្លេង) */}
      {activeTab === 'settings' && (
        <div className="space-y-6">

          {/* Centered Clean Title: ការកំណត់ (Settings) */}
          <div className="text-center py-2">
            <h3 className="text-xl sm:text-2xl font-normal text-gray-900 font-khmer-title inline-flex items-center justify-center gap-2">
              <span className="w-2.5 h-6 bg-[#D4AF37] rounded-full"></span>
              <span>{lang === 'km' ? 'ការកំណត់រចនាបថ & បទភ្លេង' : 'Theme & Music Settings'}</span>
              <span className="w-2.5 h-6 bg-[#D4AF37] rounded-full"></span>
            </h3>
          </div>

          {/* Slug URL Customization */}
          <div className="bg-white border border-[#EAE6E1] rounded-3xl p-6 space-y-4 shadow-xs">
            <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#D4AF37]" />
              <span>{lang === 'km' ? 'តំណភ្ជាប់សំបុត្រអញ្ជើញ (Slug URL)' : 'Invitation Slug URL'}</span>
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-mono">/?c=</span>
              <input
                type="text"
                value={couple.slug || ''}
                onChange={(e) => {
                  const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                  setCouples(prev => {
                    const duplicate = prev.find(c => c.slug === newSlug && c.id !== couple.id);
                    if (duplicate) {
                      alert(lang === 'km' 
                        ? `Slug URL "${newSlug}" នេះមានរួចរាល់ហើយក្នុងប្រព័ន្ធ! សូមធ្វើការផ្លាស់ប្ដូរ Slug URL ផ្សេង។` 
                        : `Slug URL "${newSlug}" already exists! Please choose a different Slug URL.`);
                      return prev;
                    }
                    return prev.map(c => c.id === couple.id ? { ...c, slug: newSlug } : c);
                  });
                }}
                placeholder="pov-pean-dieb-samphous"
                className="flex-1 px-4 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] outline-hidden font-mono text-gray-900"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              {lang === 'km' ? 'ឧ. pov-pean-dieb-samphous នឹងបង្កើតលីង ?c=pov-pean-dieb-samphous' : 'E.g. pov-pean-dieb-samphous'}
            </p>
          </div>

          {/* Theme Customization Overrides */}
          <div className="bg-white border border-[#EAE6E1] rounded-3xl p-6 space-y-6 shadow-xs">
            <h4 className="text-base font-normal text-gray-900 font-khmer-title">
              {lang === 'km' ? 'កែសម្រួលរូបរាង & បែបផែនបន្ថែម (Visual Effects)' : 'Theme Overrides & Effects'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              
              {/* Petal animation toggle */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] flex items-center justify-between">
                <div>
                  <div className="font-normal text-xs text-gray-900">
                    {lang === 'km' ? 'ធ្លាក់ផ្កាកុលាប & ពន្លឺចែងចាំង' : 'Falling Petals / Sparkles'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {lang === 'km' ? 'បែបផែនរ៉ូមែនទិកលើអេក្រង់' : 'Floating animated particles'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={couple.customTheme.enablePetals}
                  onChange={(e) => updateCouple(prev => ({
                    ...prev,
                    customTheme: { ...prev.customTheme, enablePetals: e.target.checked }
                  }))}
                  className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Frame Overlay toggle */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] flex items-center justify-between">
                <div>
                  <div className="font-normal text-xs text-gray-900">
                    {lang === 'km' ? 'បង្ហាញស៊ុមមង្គលការ (Wedding Frame Overlay)' : 'Wedding Frame Overlay'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {lang === 'km' ? 'បង្ហាញស៊ុមតុបតែងលើធៀប' : 'Display decorative frame on invitation'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={couple.customTheme.showFrameOverlay !== false}
                  onChange={(e) => updateCouple(prev => ({
                    ...prev,
                    customTheme: { ...prev.customTheme, showFrameOverlay: e.target.checked }
                  }))}
                  className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Music auto play toggle */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] flex items-center justify-between">
                <div>
                  <div className="font-normal text-xs text-gray-900">
                    {lang === 'km' ? 'ចាក់ភ្លេងការស្វ័យប្រវត្តិ' : 'Background Music Player'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {lang === 'km' ? 'ពេលភ្ញៀវបើកសំបុត្រអញ្ជើញ' : 'Play melody on open'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={couple.customTheme.enableMusic}
                  onChange={(e) => updateCouple(prev => ({
                    ...prev,
                    customTheme: { ...prev.customTheme, enableMusic: e.target.checked }
                  }))}
                  className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Envelope wax seal style */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] space-y-2">
                <div className="font-normal text-xs text-gray-900">
                  {lang === 'km' ? 'ម៉ូតត្រាជ័រស្រោមសំបុត្រ' : 'Wax Seal Style'}
                </div>
                <select
                  value={couple.customTheme.envelopeStyle}
                  onChange={(e) => updateCouple(prev => ({
                    ...prev,
                    customTheme: { ...prev.customTheme, envelopeStyle: e.target.value as any }
                  }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-battambang"
                >
                  <option value="classic-gold">Classic Gold (ត្រាមាសបុរាណ)</option>
                  <option value="royal-red">Royal Burgundy (ក្រហមរាជវាំង)</option>
                  <option value="blush-pink">Blush Rose (ផ្កាកុលាបផ្អែម)</option>
                  <option value="emerald">Emerald Green (ត្បូងមរកត)</option>
                </select>
              </div>

              {/* Khmer Font Family Selection */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAF9F6] space-y-2">
                <div className="font-normal text-xs text-gray-900 flex items-center justify-between">
                  <span>{lang === 'km' ? 'ពុម្ពអក្សរខ្មែរ (Khmer Font)' : 'Khmer Font Family'}</span>
                  <span className="text-[10px] text-[#8C6D1F] bg-amber-100 px-1.5 py-0.5 rounded font-normal">ពេញនិយម</span>
                </div>
                <select
                  value={couple.customTheme.fontFamilyKhmer || 'battambang'}
                  onChange={(e) => updateCouple(prev => ({
                    ...prev,
                    customTheme: { ...prev.customTheme, fontFamilyKhmer: e.target.value as any }
                  }))}
                  className="w-full text-xs p-1.5 border border-gray-300 rounded-lg bg-white font-battambang"
                >
                  <option value="battambang">Khmer OS Battambang / បាត់ដំបង (ស្តង់ដារ និងច្បាស់ល្អ)</option>
                  <option value="moul">Font មូល (Moul - ក្បូរក្បាច់រាជវាំង)</option>
                  <option value="kantumruy">Font កន្ទុំរុយ (Kantumruy Pro - ទំនើប)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Admin Music Track Selection Library */}
          <div className="bg-white border border-[#EAE6E1] rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <h4 className="text-base font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                  <Music className="w-5 h-5 text-[#D4AF37]" />
                  {lang === 'km' ? 'ជ្រើសរើសបទចម្រៀង/ភ្លេងការ (Select Music Track)' : 'Select Background Music Track'}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' 
                    ? 'ជ្រើសរើសបទចម្រៀងដែលបង្កើតដោយ Admin សម្រាប់ចាក់អមសំបុត្រអញ្ជើញឌីជីថលរបស់លោកអ្នក' 
                    : 'Choose from music tracks created by Admin to play on your e-invitation'}
                </p>
              </div>

              {(couple.customTheme.musicTrack || couple.customTheme.musicUrl) && (
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[200px]">
                      {lang === 'km' ? 'បទបច្ចុប្បន្ន៖ ' : 'Current: '}{couple.customTheme.musicTrack || 'Custom Audio Link'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      audioSynthesizer.stop();
                      setPlayingMusicTrackId(null);
                      updateCouple(prev => ({
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          musicTrack: '',
                          musicUrl: ''
                        }
                      }));
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title={lang === 'km' ? 'ដកបទចម្រៀងចេញ / មិនប្រើភ្លេង' : 'Remove Selected Music'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'ដកបទចម្រៀងចេញ' : 'Remove Track'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Category Filter Pills & Search Bar (like Admin page) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', labelKh: 'ទាំងអស់', labelEn: 'All Tracks' },
                  { id: 'ភ្លេងការបុរាណ', labelKh: 'ភ្លេងការបុរាណ', labelEn: 'Classical' },
                  { id: 'ភ្លេងការសម័យ', labelKh: 'ភ្លេងការសម័យ', labelEn: 'Modern' },
                  { id: 'ភ្លេងពិណពាទ្យ', labelKh: 'ភ្លេងពិណពាទ្យ', labelEn: 'Pinpeat' },
                  { id: 'Acoustic Pop', labelKh: 'Acoustic Pop', labelEn: 'Acoustic' }
                ].map((cat) => {
                  const count = cat.id === 'all' 
                    ? musicTracks.length 
                    : musicTracks.filter(t => t.category === cat.id).length;
                  const isActive = musicCategoryFilter === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMusicCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-normal transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#D4AF37] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{lang === 'km' ? cat.labelKh : cat.labelEn}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-black/20 text-white' : 'bg-white text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={musicSearchQuery}
                  onChange={(e) => setMusicSearchQuery(e.target.value)}
                  placeholder={lang === 'km' ? 'ស្វែងរកបទចម្រៀង...' : 'Search music tracks...'}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            {/* Music Tracks Table (Exact same structure & styling as Admin page) */}
            <div className="bg-white border border-[#EAE6E1] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#EAE6E1] text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-battambang">
                      <th className="py-3 px-4 text-center w-12">#</th>
                      <th className="py-3 px-4 text-center w-16">{lang === 'km' ? 'ស្ដាប់' : 'Play'}</th>
                      <th className="py-3 px-4">{lang === 'km' ? 'ចំណងជើងបទចម្រៀង' : 'Song Title'}</th>
                      <th className="py-3 px-4">{lang === 'km' ? 'ប្រភេទបទភ្លេង' : 'Category'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'km' ? 'រយៈពេល' : 'Duration'}</th>
                      <th className="py-3 px-4 text-center">{lang === 'km' ? 'ប្រជាប្រិយភាព' : 'Popularity'}</th>
                      <th className="py-3 px-4 text-right pr-6">{lang === 'km' ? 'ជ្រើសរើស' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EDE8] text-xs font-battambang">
                    {musicTracks
                      .filter(track => {
                        const matchesCat = musicCategoryFilter === 'all' || track.category === musicCategoryFilter;
                        const matchesSearch = !musicSearchQuery.trim() || 
                          track.titleKh.toLowerCase().includes(musicSearchQuery.toLowerCase()) ||
                          (track.titleEn && track.titleEn.toLowerCase().includes(musicSearchQuery.toLowerCase()));
                        return matchesCat && matchesSearch;
                      })
                      .map((track, idx) => {
                        const isSelected = couple.customTheme.musicTrack === track.titleKh || couple.customTheme.musicTrack === track.titleEn;
                        const isPlaying = playingMusicTrackId === track.id;

                        return (
                          <tr
                            key={track.id}
                            className={`group hover:bg-amber-50/40 transition-colors ${
                              isSelected
                                ? 'bg-amber-50/70 ring-1 ring-[#D4AF37]/30'
                                : idx % 2 === 0 ? 'bg-white' : 'bg-[#FCFBF9]'
                            }`}
                          >
                            {/* Index */}
                            <td className="py-3 px-4 text-center text-gray-400 font-mono text-[11px]">
                              {idx + 1}
                            </td>

                            {/* Play / Pause Preview Button */}
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePlayMusicTrack(track.id, track.audioUrl);
                                }}
                                className={`w-8 h-8 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                                  isPlaying
                                    ? 'bg-[#D4AF37] text-white ring-4 ring-[#D4AF37]/20 scale-105 animate-pulse'
                                    : 'bg-amber-50 text-[#8C6D1F] hover:bg-amber-100 border border-amber-200/80 hover:scale-105'
                                }`}
                                title={isPlaying ? 'Pause Preview' : 'Play Preview'}
                              >
                                {isPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                            </td>

                            {/* Song Title */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-battambang text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#8C6D1F] transition-colors">
                                  {track.titleKh}
                                </span>
                                {isSelected && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>{lang === 'km' ? 'បានជ្រើសរើស' : 'Selected'}</span>
                                  </span>
                                )}
                                {isPlaying && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-amber-500 text-white shrink-0">
                                    <Volume2 className="w-3 h-3 animate-bounce" />
                                    <span>កំពុងចាក់...</span>
                                  </span>
                                )}
                              </div>
                              {track.titleEn && (
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {track.titleEn}
                                </p>
                              )}
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-amber-50/80 text-[#8C6D1F] border border-amber-200/60 font-battambang">
                                <Tag className="w-3 h-3 text-[#D4AF37]" />
                                <span>{track.category}</span>
                              </span>
                            </td>

                            {/* Duration */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 font-mono bg-gray-100/80 px-2 py-0.5 rounded-md border border-gray-200/60">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>{track.duration || '3:30'}</span>
                              </span>
                            </td>

                            {/* Popularity */}
                            <td className="py-3 px-4 text-center whitespace-nowrap font-battambang">
                              {track.isPopular ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100/80 text-amber-800 border border-amber-300/60">
                                  <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                                  <span>Popular</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-normal">-</span>
                              )}
                            </td>

                            {/* Select / Remove Button */}
                            <td className="py-3 px-4 text-right pr-6 whitespace-nowrap">
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    audioSynthesizer.stop();
                                    setPlayingMusicTrackId(null);
                                    updateCouple(prev => ({
                                      ...prev,
                                      customTheme: {
                                        ...prev.customTheme,
                                        musicTrack: '',
                                        musicUrl: ''
                                      }
                                    }));
                                  }}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title={lang === 'km' ? 'ដកបទចម្រៀងចេញ' : 'Remove Track'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{lang === 'km' ? 'ដកចេញ' : 'Remove'}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCouple(prev => ({
                                      ...prev,
                                      customTheme: {
                                        ...prev.customTheme,
                                        musicTrack: track.titleKh,
                                        musicUrl: track.audioUrl
                                      }
                                    }));
                                  }}
                                  className="px-3 py-1.5 bg-amber-50 hover:bg-[#D4AF37] text-[#8C6D1F] hover:text-white border border-amber-200/80 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                                  title={lang === 'km' ? 'ជ្រើសរើសយកបទនេះ' : 'Select Track'}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{lang === 'km' ? 'ជ្រើសរើស' : 'Select'}</span>
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

            {/* Custom Audio URL Input (Dropbox, Google Drive, MP3 Link) */}
            <div className="pt-4 border-t border-gray-100 bg-amber-50/40 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-normal text-gray-900 font-khmer-title flex items-center gap-2">
                <Music className="w-4 h-4 text-[#D4AF37]" />
                {lang === 'km' ? 'ឬ បញ្ចូល Link បទចម្រៀងផ្ទាល់ខ្លួន (Dropbox, Google Drive, MP3 Link)' : 'Or Insert Your Custom Audio Link (Dropbox, Google Drive, MP3 Link)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={couple.customTheme.musicUrl || ''}
                  onChange={(e) => {
                    const url = e.target.value;
                    updateCouple(prev => ({
                      ...prev,
                      customTheme: {
                        ...prev.customTheme,
                        musicUrl: url,
                        musicTrack: url ? 'បទចម្រៀងផ្ទាល់ខ្លួន (Custom Audio Link)' : prev.customTheme.musicTrack
                      }
                    }));
                  }}
                  placeholder="https://www.dropbox.com/scl/fi/.../song.mp3?dl=0"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
                {couple.customTheme.musicUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      audioSynthesizer.stop();
                      setPlayingMusicTrackId(null);
                      updateCouple(prev => ({
                        ...prev,
                        customTheme: {
                          ...prev.customTheme,
                          musicUrl: '',
                          musicTrack: prev.customTheme.musicTrack === 'បទចម្រៀងផ្ទាល់ខ្លួន (Custom Audio Link)' ? '' : prev.customTheme.musicTrack
                        }
                      }));
                    }}
                    className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium rounded-xl flex items-center gap-1 shrink-0 transition-colors"
                    title={lang === 'km' ? 'លុប Link ចម្រៀងផ្ទាល់ខ្លួន' : 'Clear Link'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'km' ? 'លុប Link' : 'Clear Link'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (couple.customTheme.musicUrl) {
                      handleTogglePlayMusicTrack('custom_url_track', couple.customTheme.musicUrl);
                    }
                  }}
                  className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-[#D4AF37]" />
                  <span>{lang === 'km' ? 'ស្ដាប់សាកល្បង' : 'Preview Link'}</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-500">
                💡 {lang === 'km' ? 'លោកអ្នកអាចចម្លង (Copy) Link ពី Dropbox (ដូចជា dl=0) មកបិទភ្ជាប់ (Paste) នៅទីនេះបានភ្លាមៗ! ប្រព័ន្ធនឹងបំប្លែងទៅជា Stream Audio ដោយស្វ័យប្រវត្តិ។' : 'Paste your Dropbox share link (e.g. dl=0) here directly. System converts it automatically!'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: WISHES & RSVP GUESTBOOK */}
      {activeTab === 'wishes' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EAE6E1] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-normal text-gray-900 font-khmer-title">
                {lang === 'km' ? 'សៀវភៅជូនពរឌីជីថល (Digital Guestbook)' : 'Guest Wishes & Blessings'}
              </h3>
              <p className="text-xs text-gray-500">
                {lang === 'km' ? 'សារជូនពរពីភ្ញៀវកិត្តិយសទាំងអស់' : 'All blessings left by invited guests'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(couple.wishes || []).length > 0 && (
                <>
                  {showClearAllWishesConfirm ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-in fade-in">
                      <span className="text-xs text-rose-700 font-medium">
                        {lang === 'km' ? 'លុបសារទាំងអស់?' : 'Delete all wishes?'}
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAllWishes}
                        className="px-2.5 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        {lang === 'km' ? 'លុបទាំងអស់' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearAllWishesConfirm(false)}
                        className="px-2 py-0.5 bg-white text-gray-600 border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowClearAllWishesConfirm(true)}
                      className="text-xs text-gray-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'លុបសារទាំងអស់' : 'Clear All'}</span>
                    </button>
                  )}
                </>
              )}

              <div className="text-xs font-normal text-gray-700 bg-gray-100 px-3 py-1.5 rounded-xl">
                {(couple.wishes || []).length} {lang === 'km' ? 'ពាក្យជូនពរ' : 'messages'}
              </div>
            </div>
          </div>

          {(couple.wishes || []).length === 0 ? (
            <div className="bg-white border border-[#EAE6E1] rounded-3xl p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-2xl shadow-xs">
                💌
              </div>
              <h4 className="text-base font-normal text-gray-800 font-khmer-title">
                {lang === 'km' ? 'មិនទាន់មានសារជូនពរនៅឡើយទេ' : 'No Wishes Received Yet'}
              </h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {lang === 'km' 
                  ? 'នៅពេលភ្ញៀវកិត្តិយសបើកសំបុត្រ និងបំពេញ RSVP សារជូនពររបស់ពួកគាត់នឹងបង្ហាញនៅទីនេះ។' 
                  : 'When guests open their invitation and RSVP, their blessings will appear here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(couple.wishes || []).map((w) => (
                <div key={w.id} className="bg-white border border-[#EAE6E1] rounded-2xl p-5 shadow-xs space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-normal text-xs">
                        💌
                      </div>
                      <div>
                        <h5 className="font-normal text-sm text-gray-900">{w.guestName}</h5>
                        <span className="text-[10px] text-gray-400">{w.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-50 text-emerald-700">
                        {w.attendees} នាក់ចូលរួម
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeletingWishId(w.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title={lang === 'km' ? 'លុបសារជូនពរនេះ' : 'Delete Wish'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 italic bg-[#FAF9F6] p-3 rounded-xl border border-gray-100">
                    "{w.message}"
                  </p>

                  {/* Inline Delete Confirmation */}
                  {deletingWishId === w.id && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-150">
                      <span className="text-xs text-rose-800 font-medium">
                        {lang === 'km' ? 'តើអ្នកប្រាកដជាចង់លុបសារនេះ?' : 'Delete this blessing message?'}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteWish(w.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs transition-colors"
                        >
                          {lang === 'km' ? 'លុប' : 'Delete'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingWishId(null)}
                          className="px-2 py-1 bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add or Edit Guest */}
      {isGuestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EAE6E1] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-normal text-gray-900 font-khmer-title">
                  {editingGuest ? (lang === 'km' ? 'កែប្រែព័ត៌មានភ្ញៀវ' : 'Edit Guest') : (lang === 'km' ? '+ បន្ថែមភ្ញៀវម្នាក់' : '+ Add Single Guest')}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {lang === 'km' ? 'កំណត់គោរមងារ និងឈ្មោះសម្រាប់បង្កើត Link ផ្ទាល់ខ្លួន' : 'Set title & name for personalized card'}
                </p>
              </div>
              <button 
                onClick={() => setIsGuestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                
                {/* Title (Khmer Honorific) */}
                <div>
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'គោរមងារ' : 'Title / Honorific'}
                  </label>
                  <select
                    value={guestForm.titleKh || 'លោក'}
                    onChange={(e) => setGuestForm({ ...guestForm, titleKh: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="ឯកឧត្តម">ឯកឧត្តម</option>
                    <option value="លោកជំទាវ">លោកជំទាវ</option>
                    <option value="លោក">លោក</option>
                    <option value="លោកស្រី">លោកស្រី</option>
                    <option value="អ្នកនាង">អ្នកនាង</option>
                    <option value="កញ្ញា">កញ្ញា</option>
                    <option value="លោកពូ">លោកពូ</option>
                    <option value="អ្នកមីង">អ្នកមីង</option>
                    <option value="មិត្តភក្តិ">មិត្តភក្តិ</option>
                    <option value="បងប្រុស">បងប្រុស</option>
                    <option value="បងស្រី">បងស្រី</option>
                  </select>
                </div>

                {/* Full Name */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'ឈ្មោះពេញរបស់ភ្ញៀវ' : 'Guest Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={guestForm.fullNameKh || ''}
                    onChange={(e) => setGuestForm({ ...guestForm, fullNameKh: e.target.value })}
                    placeholder="e.g. សេង ប៊ុនធឿន និងលោកជំទាវ"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={guestForm.phone || ''}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    placeholder="012 345 678"
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl font-mono"
                  />
                </div>

                {/* Side */}
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'ភាគី' : 'Side'}
                  </label>
                  <select
                    value={guestForm.side || 'groom'}
                    onChange={(e) => setGuestForm({ ...guestForm, side: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="groom">ខាងប្រុស</option>
                    <option value="bride">ខាងស្រី</option>
                    <option value="mutual">ទាំងសងខាង</option>
                  </select>
                </div>

                {/* Category */}
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'ចំណាត់ថ្នាក់' : 'Category'}
                  </label>
                  <select
                    value={guestForm.category || 'Friend'}
                    onChange={(e) => setGuestForm({ ...guestForm, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Family">សាច់ញាតិ (Family)</option>
                    <option value="Friend">មិត្តភក្តិ (Friend)</option>
                    <option value="Colleague">រួមការងារ (Colleague)</option>
                  </select>
                </div>

                {/* Expected Pax */}
                <div>
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'ចំនួនភ្ញៀវ (Pax)' : 'Expected Pax'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={guestForm.paxExpected || 2}
                    onChange={(e) => setGuestForm({ ...guestForm, paxExpected: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>

                {/* Table Number */}
                <div className="col-span-2">
                  <label className="block text-[11px] font-normal text-gray-700 mb-1">
                    {lang === 'km' ? 'លេខតុ (Table Number)' : 'Table Number'}
                  </label>
                  <input
                    type="text"
                    value={guestForm.tableNumber || ''}
                    onChange={(e) => setGuestForm({ ...guestForm, tableNumber: e.target.value })}
                    placeholder="e.g. VIP-01 ឬ A-05"
                    className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsGuestModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  {lang === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-normal bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-xl shadow-xs"
                >
                  {lang === 'km' ? 'រក្សាទុក' : 'Save'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Batch Import Guests */}
      {isBatchImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EAE6E1] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-normal text-gray-900 font-khmer-title">
                  {lang === 'km' ? 'បញ្ចូលឈ្មោះភ្ញៀវជាក្រុម (Batch Import)' : 'Batch Import Guest Names'}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {lang === 'km' ? 'ចម្លង (Copy & Paste) បញ្ជីឈ្មោះភ្ញៀវម្តងមួយបន្ទាត់' : 'Paste guest list line by line'}
                </p>
              </div>
              <button 
                onClick={() => setIsBatchImportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                rows={7}
                value={batchNamesText}
                onChange={(e) => setBatchNamesText(e.target.value)}
                placeholder={`ឧទាហរណ៍៖
ឯកឧត្តម សេង ប៊ុនធឿន និងលោកជំទាវ
លោកជំទាវ កែវ ពិសី
លោកពូ ជា សុវណ្ណ និងអ្នកមីង
លោក រតនា ចាន់ឌី
កញ្ញា លីណា សុភ័ក្រ្ត`}
                className="w-full p-3 text-xs border border-gray-300 rounded-2xl focus:ring-1 focus:ring-[#D4AF37] focus:outline-none font-sans"
              />

              <p className="text-[11px] text-gray-500">
                {lang === 'km' 
                  ? '💡 ប្រព័ន្ធនឹងសម្គាល់គោរមងារ (ឯកឧត្តម, លោកជំទាវ, លោក, លោកស្រី...) ដោយស្វ័យប្រវត្តិតាមឈ្មោះនីមួយៗ។'
                  : '💡 System will auto-detect honorifics and generate distinct invitation codes for each line.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsBatchImportModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleBatchImport}
                disabled={!batchNamesText.trim()}
                className="px-4 py-1.5 text-xs font-normal bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-xl shadow-xs disabled:opacity-50"
              >
                {lang === 'km' ? 'បង្កើត Links ទាំងអស់' : 'Generate All Links'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Copy Notification Toast */}
      {copyToastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] bg-[#1A1A1A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-amber-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="text-xs font-battambang leading-tight">
            <p className="font-bold text-amber-300 mb-0.5">ចម្លងសាររួចរាល់!</p>
            <p className="text-gray-300 text-[11px]">{copyToastMessage}</p>
          </div>
        </div>
      )}

      {/* Share / Public Link Guide Modal */}
      <ShareGuideModal
        isOpen={showShareGuide}
        onClose={() => setShowShareGuide(false)}
        lang={lang}
      />

    </div>
  );
};
