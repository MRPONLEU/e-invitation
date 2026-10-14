import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Template, CoupleEvent, Guest, Language } from '../../types';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Clock, 
  Volume2, 
  VolumeX, 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  QrCode, 
  MessageSquareHeart, 
  Send, 
  Navigation, 
  Sun, 
  Scissors, 
  Utensils, 
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarPlus,
  Play,
  Facebook,
  Phone,
  MessageCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Layers
} from 'lucide-react';
import { weddingAudioPlayer } from '../../utils/audioSynthesizer';
import { Template02Violet, Template01ClassicGold, TemplateNewCustom, TemplateNewCustom002, TemplateNewCustom003 } from './templates';
import { WeddingGallerySlideshow } from './WeddingGallerySlideshow';
import weddingTitleImage from '../../assets/images/frome3.png';
import loveOrnament from '../../assets/images/love.png';
import ponleuLogo from '../../assets/images/ponleu_logo.svg';
import { DEFAULT_ADMIN_PROMO_FOOTER } from '../../data/initialData';
import { TelegramIcon } from '../icons/TelegramIcon';
import frameOverlay from '../../assets/images/T003/F0030.png';
import guestFrameBanner from '../../assets/images/fram002.png';
import lightEffectGif from '../../assets/images/ligt001.webp';
import gifF0031 from '../../assets/images/T003/F0031.webp';
import gifF0032 from '../../assets/images/T003/F0032_opt.webp';
import { formatImageUrl } from '../../utils/imageHelper';
import { formatVideoUrl } from '../../utils/urlHelper';

const cleanParentName = (name?: string) => {
  if (!name) return '';
  let cleaned = name.trim();
  // Strip honorific titles from parent name (ឯកឧត្តម, លោកជំទាវ, លោក, លោកស្រី, អ្នកឧកញ៉ា, ឧកញ៉ា)
  const titlePattern = /^(ឯកឧត្តម|លោកជំទាវ|លោកស្រី|លោក|អ្នកឧកញ៉ា|ឧកញ៉ា)[\s\u200B]*/;
  while (titlePattern.test(cleaned)) {
    cleaned = cleaned.replace(titlePattern, '').trim();
  }
  return cleaned;
};

const getKhmerMonogramLetter = (fullName?: string) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  // Khmer names: [Family Name, Given Name]
  // In wedding monograms, the given name's initial or main consonant is traditionally used
  const target = parts[parts.length - 1] || parts[0];
  const match = target.match(/^[\u1780-\u17B3]/);
  return match ? match[0] : target.charAt(0);
};

const toKhmerNum = (num: number | string) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).split('').map(d => /\d/.test(d) ? khmerDigits[parseInt(d, 10)] : d).join('');
};

const formatKhmerDate = (dateString?: string) => {
  if (!dateString) return '';
  if (!dateString.includes('-')) return dateString;
  const days = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'];
  const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
  
  const [year, month, day] = dateString.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  if (isNaN(dateObj.getTime())) return dateString;
  
  const dayName = days[dateObj.getDay()];
  const khmerDay = toKhmerNum(Number(day));
  const monthName = months[dateObj.getMonth()];
  const khmerYear = toKhmerNum(year);
  
  return `${dayName} ទី${khmerDay} ខែ${monthName} ឆ្នាំ${khmerYear}`;
};

interface GuestInvitationViewProps {
  couple: CoupleEvent;
  templates: Template[];
  guestCode?: string;
  setCouples: React.Dispatch<React.SetStateAction<CoupleEvent[]>>;
  lang: Language;
  onBackToAdmin?: () => void;
  onBack?: () => void;
  backButtonLabel?: string;
}

export const GuestInvitationView: React.FC<GuestInvitationViewProps> = ({
  couple,
  templates,
  guestCode,
  setCouples,
  lang,
  onBackToAdmin,
  onBack,
  backButtonLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFrame, setShowFrame] = useState(couple.customTheme?.showFrameOverlay !== false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [showHeroText, setShowHeroText] = useState(false);
  const openingTimeoutRef = useRef<NodeJS.Timeout | number | null>(null);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Preload animated assets in background for instant zero-lag display
  useEffect(() => {
    try {
      const p1 = new Image();
      p1.src = gifF0032;
      const p2 = new Image();
      p2.src = gifF0031;
      const p3 = new Image();
      p3.src = lightEffectGif;
    } catch {}

    return () => {
      if (openingTimeoutRef.current) {
        clearTimeout(openingTimeoutRef.current);
      }
    };
  }, []);

  // Photo gallery list for lightbox navigation
  const galleryList = (couple.galleryPhotos && couple.galleryPhotos.length > 0)
    ? couple.galleryPhotos
    : (activePhoto ? [activePhoto] : []);

  const currentPhotoIndex = activePhotoIndex !== null 
    ? activePhotoIndex 
    : (activePhoto ? galleryList.indexOf(activePhoto) : -1);

  const hasMultiplePhotos = galleryList.length > 1 && currentPhotoIndex !== -1;

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultiplePhotos) return;
    const prevIdx = (currentPhotoIndex - 1 + galleryList.length) % galleryList.length;
    setActivePhotoIndex(prevIdx);
    setActivePhoto(galleryList[prevIdx]);
    setLightboxZoom(1);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultiplePhotos) return;
    const nextIdx = (currentPhotoIndex + 1) % galleryList.length;
    setActivePhotoIndex(nextIdx);
    setActivePhoto(galleryList[nextIdx]);
    setLightboxZoom(1);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!activePhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'Escape') {
        setActivePhoto(null);
        setActivePhotoIndex(null);
        setLightboxZoom(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhoto, activePhotoIndex, couple.galleryPhotos]);

  // Touch swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      handleNextPhoto();
    } else if (diff < -45) {
      handlePrevPhoto();
    }
    setTouchStartX(null);
  };

  // Prevent background scroll when photo popup is open
  useEffect(() => {
    if (activePhoto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activePhoto]);

  const enterFullScreen = () => {
    try {
      const isAlreadyFull = !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement;

      if (!isAlreadyFull) {
        const docEl = (document.documentElement || document.body) as any;
        const req = docEl.requestFullscreen ||
                    docEl.webkitRequestFullscreen ||
                    docEl.mozRequestFullScreen ||
                    docEl.msRequestFullscreen;
        if (req) {
          const res = req.call(docEl);
          if (res && typeof res.catch === 'function') {
            res.catch(() => {});
          }
        }
      }
    } catch {
      // Ignore if browser restricts in sandboxed iframe
    }
  };

  const toggleFullScreen = () => {
    const isFull = !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement ||
      !!(document as any).mozFullScreenElement ||
      !!(document as any).msFullscreenElement;

    if (!isFull) {
      enterFullScreen();
    } else {
      try {
        const docObj = document as any;
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (docObj.webkitExitFullscreen) {
          docObj.webkitExitFullscreen();
        } else if (docObj.mozCancelFullScreen) {
          docObj.mozCancelFullScreen();
        } else if (docObj.msExitFullscreen) {
          docObj.msExitFullscreen();
        }
      } catch {}
    }
  };

  // RSVP Form State
  const [rsvpAttending, setRsvpAttending] = useState<'attending' | 'declined'>('attending');
  const [rsvpPax, setRsvpPax] = useState<number>(2);
  const [rsvpName, setRsvpName] = useState<string>('');
  const [rsvpMessage, setRsvpMessage] = useState<string>('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState<boolean>(false);

  // Find personalized guest if code exists
  const currentGuest = (couple.guests || []).find(g => g.code === guestCode);

  useEffect(() => {
    if (currentGuest) {
      setRsvpName(`${currentGuest.titleKh} ${currentGuest.fullNameKh}`);
      setRsvpPax(currentGuest.paxExpected || 2);
      if (currentGuest.rsvpStatus !== 'pending') {
        setRsvpSubmitted(true);
      }
    } else {
      setRsvpName('');
    }
  }, [currentGuest]);

  // Dynamic document title and Open Graph meta tags update based on current couple data
  useEffect(() => {
    if (couple) {
      const title = `សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍ - ${couple.groomNameKh} & ${couple.brideNameKh}`;
      const desc = `សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា ចូលរួមពិធីអាពាហ៍ពិពាហ៍ ${couple.groomNameKh} & ${couple.brideNameKh} នៅ ${couple.venueNameKh}។ សូមអរគុណ!`;
      const img = formatImageUrl(couple.coverPhoto) || couple.coverPhoto || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&h=900&auto=format&fit=crop';

      document.title = title;

      const updateMeta = (property: string, content: string, isName = false) => {
        const attr = isName ? 'name' : 'property';
        let element = document.querySelector(`meta[${attr}="${property}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attr, property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      updateMeta('og:title', title);
      updateMeta('og:description', desc);
      updateMeta('twitter:title', title, true);
      updateMeta('twitter:description', desc, true);
      updateMeta('description', desc, true);

      // Remove any image tags so messengers do not display image preview cards
      const existingOgImage = document.querySelector('meta[property="og:image"]');
      if (existingOgImage) existingOgImage.remove();
      const existingTwImage = document.querySelector('meta[name="twitter:image"]');
      if (existingTwImage) existingTwImage.remove();
    }
  }, [couple]);

  // Current template
  const tpl = templates.find(t => t.id === couple.templateId) || templates[0];
  const isPurpleTheme = tpl.id === 'tpl_purple_02' || tpl.id === 'tpl_purple_368' || tpl.code === 'T368' || tpl.code === 'T02';
  const isCustomNewTheme = tpl.id === 'tpl_new_custom' || tpl.code === 'T_CUSTOM';
  const isCustom002Theme = tpl.id === 'tpl_new_custom002' || tpl.code === 'T_CUSTOM002';
  const isCustom003Theme = tpl.id === 'tpl_new_custom003' || tpl.code === 'T_CUSTOM003';

  // Dynamic Khmer font family class
  const khmerTitleFont = couple.customTheme.fontFamilyKhmer === 'moul'
    ? 'font-khmer-title'
    : couple.customTheme.fontFamilyKhmer === 'kantumruy'
    ? 'font-kantumruy font-normal'
    : 'font-battambang font-normal';

  // Countdown timer calculations
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(`${couple.weddingDate}T07:00:00`).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [couple.weddingDate]);

  const getAudioUrl = () => {
    if (couple.customTheme.musicUrl) return couple.customTheme.musicUrl;
    if (couple.customTheme.musicTrack && (couple.customTheme.musicTrack.startsWith('http://') || couple.customTheme.musicTrack.startsWith('https://'))) {
      return couple.customTheme.musicTrack;
    }
    return undefined;
  };

  // State for Photo 1 zoom animation before GIF
  const [isCoverZooming, setIsCoverZooming] = useState<boolean>(false);
  // State for ligt001.gif opening light transition effect
  const [isLightOpening, setIsLightOpening] = useState<boolean>(false);
  // State for Photo 2 revealing at 5s during GIF animation
  const [isPhoto2Visible, setIsPhoto2Visible] = useState<boolean>(false);

  // Ensure hero text is shown when invitation is opened without transition
  useEffect(() => {
    if (isOpen && !isLightOpening) {
      setShowHeroText(true);
    }
  }, [isOpen, isLightOpening]);

  // Scroll position state for dynamic background dimming & blurring when dragging text up
  const [scrollTop, setScrollTop] = useState<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Finish opening immediately if user taps/clicks during transition
  const finishOpeningImmediately = () => {
    if (openingTimeoutRef.current) {
      clearTimeout(openingTimeoutRef.current);
      openingTimeoutRef.current = null;
    }
    setIsLightOpening(false);
    
    // បង្ហាញ Slide Show បន្ទាប់ពី GIF ចប់ (លុប Photo 1 ចេញ និងមិនទាន់បង្ហាញ រូបទី២ ទេ)
    if (couple.customTheme?.showSlideshowOnOpen !== false) {
      setIsSlideshowOpen(true);
      setIsOpen(false);
      setIsPhoto2Visible(false);
    } else {
      setIsOpen(true);
      setIsPhoto2Visible(true);
      setShowHeroText(true);
    }
  };

  // Trigger GIF & Open Invitation: Plays GIF transition first over Photo 1 cover
  const triggerGifAndOpenInvitation = () => {
    // 1. Play GIF 2 transition over Cover (Do NOT reveal Photo 2 yet)
    setIsCoverZooming(false);
    setIsLightOpening(true);
    setIsOpen(false);
    setIsPhoto2Visible(false);
    setShowHeroText(false);

    // 2. Play transition for 10s (TemplateNewCustom003) or 3.5s (other templates), then show Slide Show AFTER transition finishes!
    if (openingTimeoutRef.current) {
      clearTimeout(openingTimeoutRef.current);
    }
    const transitionDuration = isCustom003Theme ? 10000 : 3500;
    openingTimeoutRef.current = setTimeout(() => {
      setIsLightOpening(false);
      if (couple.customTheme?.showSlideshowOnOpen !== false) {
        setIsSlideshowOpen(true);
        setIsOpen(false);
        setIsPhoto2Visible(false);
      } else {
        setIsOpen(true);
        setIsPhoto2Visible(true);
        setShowHeroText(true);
      }
    }, transitionDuration);
  };

  // Handle open envelope
  const handleOpenEnvelope = () => {
    enterFullScreen();

    if (couple.customTheme?.enableMusic) {
      weddingAudioPlayer.start(getAudioUrl());
      setIsPlaying(true);
    }

    // សម្រាប់តែ Template02Violet (isPurpleTheme)៖ លុបការបង្ហាញ GIF ចេញ
    if (isPurpleTheme) {
      if (couple.customTheme?.showSlideshowOnOpen !== false) {
        setIsSlideshowOpen(true);
      } else {
        setIsOpen(true);
        setIsPhoto2Visible(true);
        setShowHeroText(true);
      }
      return;
    }

    // បង្ហាញ GIF Effect ជាមុនសិន!
    triggerGifAndOpenInvitation();
  };

  // When guest proceeds from slideshow to the invitation
  const handleProceedFromSlideshow = () => {
    enterFullScreen();
    setIsSlideshowOpen(false);
    setIsOpen(true);
    setIsPhoto2Visible(true);
    setShowHeroText(true);
  };

  const toggleMusic = () => {
    const state = weddingAudioPlayer.toggle(getAudioUrl());
    setIsPlaying(state);
  };

  // Submit RSVP
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;

    const newWish = {
      id: `wsh_${Date.now()}`,
      guestName: rsvpName,
      guestTitle: currentGuest?.titleKh || '',
      message: rsvpMessage.trim() || 'សូមជូនពរឱ្យគូស្វាមីភរិយាថ្មីជួបតែសុភមង្គល និងស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង!',
      date: new Date().toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' }),
      attendees: rsvpAttending === 'attending' ? rsvpPax : 0,
      isAttending: rsvpAttending === 'attending',
      side: currentGuest?.side || 'mutual'
    };

    // Update couple
    setCouples(prev => prev.map(c => {
      if (c.id !== couple.id) return c;
      const updatedGuests = (c.guests || []).map(g => {
        if (currentGuest && g.id === currentGuest.id) {
          return {
            ...g,
            rsvpStatus: rsvpAttending,
            attendeesCount: rsvpAttending === 'attending' ? rsvpPax : 0,
            wishMessage: rsvpMessage,
            rsvpDate: new Date().toISOString().split('T')[0]
          };
        }
        return g;
      });

      return {
        ...c,
        guests: updatedGuests,
        wishes: [newWish, ...(c.wishes || [])]
      };
    }));

    setRsvpSubmitted(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`ពិធីអាពាហ៍ពិពាហ៍ ${couple.groomNameKh} & ${couple.brideNameKh}`);
    const details = encodeURIComponent(`សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍\nទីតាំង៖ ${couple.venueNameKh}\nអាសយដ្ឋាន៖ ${couple.venueAddressKh}`);
    const location = encodeURIComponent(couple.venueAddressKh || couple.venueNameKh);
    const dateFormatted = couple.weddingDate.replace(/-/g, '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dateFormatted}T000000Z/${dateFormatted}T160000Z&details=${details}&location=${location}`;
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden text-[#2D2D2D] selection:bg-[#D4AF37]/30 ${!isOpen ? `bg-gradient-to-b ${tpl.bgGradient}` : 'bg-transparent'}`}
      style={{
        '--user-text-scale': `${(couple.customTheme?.textScale || 100) / 100}`,
        fontSize: couple.customTheme?.textScale && couple.customTheme.textScale !== 100
          ? `calc(1rem * ${(couple.customTheme.textScale || 100) / 100})`
          : undefined
      } as React.CSSProperties}
    >
      
      {/* Back to Admin / Couple Dashboard Button when previewing */}
      {(onBack || onBackToAdmin) && (
        <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-[9999] animate-fade-in pointer-events-auto">
          <button
            onClick={onBack || onBackToAdmin}
            title={backButtonLabel || 'ត្រឡប់ក្រោយ'}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 10px rgba(212,175,55,0.4)',
              WebkitAppearance: 'none'
            }}
            className="flex items-center gap-1.5 bg-black/85 hover:bg-black text-white px-3.5 py-2 rounded-full shadow-2xl text-xs font-normal border border-[#D4AF37] backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer select-none"
          >
            <ChevronLeft className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-medium text-amber-200">
              {backButtonLabel || 'ថយក្រោយ'}
            </span>
          </button>
        </div>
      )}

      {/* 2nd Transition after clicking open envelope (Video for Custom003, F0031 for Custom002, or ligt001.webp) */}
      {isLightOpening && (
        <div 
          onClick={finishOpeningImmediately}
          role="button"
          tabIndex={0}
          title="ចុចដើម្បីរំលង (Tap to skip)"
          className={`absolute inset-0 z-50 cursor-pointer overflow-hidden flex items-center justify-center bg-transparent ${isCustom003Theme ? 'animate-video-fade-out-10s' : isCustom002Theme ? 'animate-gif2-fade-out' : 'animate-fade-1-to-0'}`}
        >
          {isCustom003Theme ? (
            <video
              ref={(el) => {
                if (el) {
                  el.muted = false;
                  el.volume = 1.0;
                  el.play().catch(() => {
                    if (el) {
                      el.muted = true;
                      el.play().catch(() => {});
                    }
                  });
                }
              }}
              autoPlay
              playsInline
              src={formatVideoUrl(couple.customTheme?.transitionVideoUrl) || 'https://assets.mixkit.co/videos/preview/mixkit-burst-of-golden-particles-42789-large.mp4'}
              className="w-full h-full object-cover pointer-events-none scale-100"
            />
          ) : (
            <img
              src={isCustom002Theme ? gifF0031 : lightEffectGif}
              alt={isCustom002Theme ? "GIF ទី២ (F0031)" : "Light Effect GIF"}
              className={`w-full h-full object-cover pointer-events-none ${isCustom002Theme ? 'mix-blend-normal' : 'mix-blend-screen'} scale-100`}
            />
          )}
        </div>
      )}

      {/* Topmost Fixed Frame Overlay (F0030.png) - Appears together with Photo 2 when invitation is opened */}
      {showFrame && isOpen && isPhoto2Visible && (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none animate-frame-zoom-2to1">
          <img
            src={frameOverlay}
            alt="Wedding Frame F0030"
            className="w-full h-full object-fill pointer-events-none select-none"
          />
        </div>
      )}

      {/* Background Couple Photo (Photo 2) behind all text - Displays with Animation Zoom from 0 to 100 over 3 seconds */}
      {isOpen && isPhoto2Visible && (
        <div 
          className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0A0E]"
          style={{
            filter: scrollTop > 40 ? `blur(${Math.min((scrollTop - 40) / 35, 6)}px)` : 'none'
          }}
        >
          <img 
            src={formatImageUrl(couple.coverPhoto) || formatImageUrl(couple.secondaryPhoto) || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop'}
            alt="Background Couple (Photo 2)"
            className={`w-full h-full object-cover object-center ${isCustom002Theme ? 'animate-zoom-0-to-100-3s' : 'animate-photo2-fade-in-5s'}`}
            style={{
              opacity: Math.max(0.60, 1 - Math.min(scrollTop / 350, 0.40))
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop';
            }}
          />
          {/* Progressive dimming overlay capped so photo remains 60% visible */}
          <div 
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: Math.min(scrollTop / 350, 0.40) }}
          />
        </div>
      )}

      {/* Floating Sparkles / Falling Rose Petals Layer */}
      {couple.customTheme.enablePetals && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="animate-petal absolute text-pink-300/40 text-lg sm:text-xl select-none"
              style={{
                left: `${(i * 9) + 4}%`,
                animationDuration: `${7 + (i % 5) * 2}s`,
                animationDelay: `${i * 0.8}s`
              }}
            >
              🌸
            </div>
          ))}
          {[...Array(6)].map((_, i) => (
            <div
              key={`sparkle_${i}`}
              className="animate-pulse absolute text-[#D4AF37]/30 text-sm select-none"
              style={{
                top: `${(i * 15) + 10}%`,
                right: `${(i * 12) + 5}%`,
                animationDuration: `${3 + i}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Controls (Frame, Music & Fullscreen) at Top-Right of Card */}
      <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-40 flex items-center gap-1.5">
        
        {/* Toggle Frame Button (Shown only when template has frame) */}
        {!isCustomNewTheme && !isCustom003Theme && (
          <button
            id="guest-frame-toggle-btn"
            onClick={() => setShowFrame(!showFrame)}
            className={`p-2 transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${
              showFrame ? 'text-[#D4AF37]' : 'text-gray-400/70 hover:text-[#D4AF37]'
            }`}
            title={showFrame ? 'បិទស៊ុម (Hide Frame)' : 'បើកស៊ុម (Show Frame)'}
          >
            <Layers className={`w-6 h-6 drop-shadow-md ${showFrame ? 'text-[#D4AF37]' : 'text-gray-400 opacity-60'}`} />
          </button>
        )}

        {/* Fullscreen Button */}
        <button
          id="guest-fullscreen-btn"
          onClick={toggleFullScreen}
          className="p-2 transition-all flex items-center justify-center hover:scale-110 active:scale-95 text-gray-300 hover:text-[#D4AF37]"
          title={isFullscreen ? 'ចាកចេញពី Full Screen (Exit Fullscreen)' : 'មើលពេញអេក្រង់ (Full Screen)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-6 h-6 drop-shadow-md text-[#D4AF37]" />
          ) : (
            <Maximize2 className="w-6 h-6 drop-shadow-md" />
          )}
        </button>

        {/* Audio Controller */}
        <button
          id="guest-music-btn"
          onClick={toggleMusic}
          className={`p-2 transition-all flex items-center justify-center hover:scale-110 active:scale-95 ${
            isPlaying ? 'text-[#D4AF37]' : 'text-gray-400/70 hover:text-[#D4AF37]'
          }`}
          title={isPlaying ? 'ផ្អាកភ្លេងការ (Pause Music)' : 'ចាក់ភ្លេងការ (Play Music)'}
        >
          {isPlaying ? (
            <Volume2 className="w-7 h-7 drop-shadow-md text-[#D4AF37]" />
          ) : (
            <VolumeX className="w-7 h-7 drop-shadow-md text-gray-300" />
          )}
        </button>
      </div>

      {/* FULL-SCREEN PRE-WEDDING GALLERY SLIDESHOW WITH ZOOM 0 TO 100 ANIMATION */}
      {isSlideshowOpen && (
        <div className="absolute inset-0 z-50 animate-zoom-0-to-100-3s">
          <WeddingGallerySlideshow
            couple={couple}
            lang={lang}
            onProceedToInvitation={handleProceedFromSlideshow}
            isPlayingMusic={isPlaying}
            onToggleMusic={toggleMusic}
          />
        </div>
      )}

      {/* ENVELOPE OPENING OVERLAY / WELCOME FRONT COVER (IF NOT YET OPENED) - Smooth 1.0 to 0.0 Opacity fade out over 5s upon click */}
      {!isOpen && !isSlideshowOpen ? (
        <div className={`relative z-30 w-full h-full flex items-center justify-center p-0 overflow-y-auto no-scrollbar ${isCoverZooming || isLightOpening ? (isCustom003Theme ? 'animate-fade-out-10s pointer-events-none' : 'animate-fade-out-5s pointer-events-none') : 'opacity-100'}`}>
          <div className="w-full h-full text-center animate-in fade-in zoom-in-95 duration-500 flex flex-col justify-center items-center">
            {isPurpleTheme ? (
              <Template02Violet
                couple={couple}
                currentGuest={currentGuest}
                onOpen={handleOpenEnvelope}
                isOpen={isOpen}
              />
            ) : tpl.id === 'tpl_new_custom003' || tpl.code === 'T_CUSTOM003' ? (
              <TemplateNewCustom003
                couple={couple}
                currentGuest={currentGuest}
                onOpen={handleOpenEnvelope}
                isOpen={isOpen}
                isOpening={isCoverZooming || isLightOpening}
              />
            ) : tpl.id === 'tpl_new_custom002' || tpl.code === 'T_CUSTOM002' ? (
              <TemplateNewCustom002
                couple={couple}
                currentGuest={currentGuest}
                onOpen={handleOpenEnvelope}
                isOpen={isOpen}
                isOpening={isCoverZooming || isLightOpening}
              />
            ) : tpl.id === 'tpl_new_custom' || tpl.code === 'T_CUSTOM' ? (
              <TemplateNewCustom
                couple={couple}
                currentGuest={currentGuest}
                onOpen={handleOpenEnvelope}
                isOpen={isOpen}
                isOpening={isCoverZooming || isLightOpening}
              />
            ) : (
              <Template01ClassicGold
                couple={couple}
                currentGuest={currentGuest}
                onOpen={handleOpenEnvelope}
                isOpen={isOpen}
              />
            )}
          </div>
        </div>
      ) : (

        /* LIVE INVITATION CARD CONTENT (WHEN OPENED) WITH 0.5s ZOOM OUT ANIMATION AND 2.0s SMOOTH FADE */
        <div onScroll={handleScroll} className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth animate-zoom-out-05s animate-in fade-in duration-[2000ms]">
          
          {/* Section 1: Hero Section (Matching Exact Height of Visible Phone Viewport) */}
          <div className="relative w-full h-full min-h-full flex flex-col justify-between p-5 sm:p-7 pt-[16.67%] sm:pt-[18%] pb-[16.67%] sm:pb-[18%] text-center text-white overflow-hidden select-none z-10 shrink-0">

            {/* Ambient Floating Gold Dust Sparkles */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <span className="absolute top-[18%] left-[12%] text-amber-300/60 text-xs animate-ping [animation-duration:3s]">✦</span>
              <span className="absolute top-[28%] right-[15%] text-amber-200/50 text-sm animate-pulse [animation-duration:4s]">✨</span>
              <span className="absolute top-[65%] left-[18%] text-amber-300/40 text-xs animate-pulse [animation-duration:3.5s]">✦</span>
              <span className="absolute top-[75%] right-[20%] text-amber-200/60 text-xs animate-ping [animation-duration:4.5s]">✨</span>
            </div>

            {/* Top Header with Silky Smooth GPU Fade & Slide Animation - Animates after Photo 2 is shown */}
            {showHeroText ? (
              <div className="relative z-10 pt-3 sm:pt-5 space-y-2 flex flex-col items-center animate-smooth-fade-down delay-100">
                <h1 className={`text-2xl sm:text-3xl font-normal ${khmerTitleFont} text-[#FFD700] [text-shadow:0_2px_12px_rgba(0,0,0,0.95),0_0_15px_rgba(255,215,0,0.4)] tracking-wide text-center leading-relaxed`}>
                  សិរីមង្គល<br />អាពាហ៍ពិពាហ៍
                </h1>
                <div className="flex items-center justify-center gap-2 mt-0.5 animate-ornament-expand delay-200">
                  <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#F3D372]"></span>
                  <span className="text-[#FFD700] text-[10px] sm:text-xs">❖</span>
                  <span className="text-[10px] sm:text-xs font-serif-luxury tracking-[0.25em] text-[#FFF8DC] uppercase font-bold [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
                    WEDDING INVITATION
                  </span>
                  <span className="text-[#FFD700] text-[10px] sm:text-xs">❖</span>
                  <span className="h-[1px] w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#F3D372]"></span>
                </div>
              </div>
            ) : (
              <div className="h-16 sm:h-24" />
            )}

            {/* Bottom Content: Couple Names, Date & Scroll Indicator with Staggered Pure-CSS GPU Smooth Reveal - Animates after Photo 2 is shown */}
            {showHeroText ? (
              <div className="relative z-10 space-y-4 pb-6 sm:pb-8">
                {/* Bride & Groom Name Display */}
                <div className="space-y-1">
                  <div className={`text-xl sm:text-2xl md:text-3xl font-normal ${khmerTitleFont} text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.6)] leading-snug animate-smooth-fade-up delay-200 transform-gpu`}>
                    {couple.groomNameKh} & {couple.brideNameKh}
                  </div>

                  {/* English Names */}
                  <div className="text-xs sm:text-sm font-normal text-white/95 font-serif-luxury tracking-widest [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] animate-smooth-fade-up delay-400 transform-gpu">
                    {couple.groomNameEn} & {couple.brideNameEn}
                  </div>
                </div>

                {/* Gentle Floating Scroll-Down Indicator with Golden Glow Wave */}
                <div className="pt-2 flex flex-col items-center justify-center gap-1.5 text-white/85 animate-smooth-fade-up delay-750">
                  <span className="text-[11px] font-light tracking-wider [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">អូសចុះក្រោម</span>
                  <div className="w-8 h-8 rounded-full border border-amber-300/50 bg-black/30 backdrop-blur-xs flex items-center justify-center animate-gentle-bounce animate-golden-ripple transform-gpu">
                    <ChevronDown className="w-4 h-4 text-[#FFE58F]" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 sm:h-40" />
            )}

          </div>

          {/* Detailed Content Sections Container with clean transparent background, scale-95 text size, and soft subtle text shadow */}
          <div 
            className="max-w-xl mx-auto px-4 sm:px-6 pt-20 pb-4 space-y-8 sm:space-y-10 relative z-10 text-white/95 bg-transparent -mt-32 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] scale-95 origin-top transform-gpu"
          >

            {/* Traditional Invitation Text Section */}
            <div className="text-center space-y-8 animate-in slide-in-from-bottom duration-700">
              
              <div className="space-y-1 pt-[100px]">
                <h2 className={`text-2xl sm:text-[28px] font-normal font-muol-light text-[#D4AF37] drop-shadow-sm leading-relaxed`}>
                  សិរីមង្គល<br/>អាពាហ៍ពិពាហ៍
                </h2>
                {/* Decorative divider under title */}
                <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 pt-2 pb-2">
                  <span className="w-16 h-px bg-gradient-to-l from-[#D4AF37]/60 to-transparent"></span>
                  <span className="text-sm">❖</span>
                  <span className="w-16 h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent"></span>
                </div>
              </div>

              <div className="flex justify-between items-start text-sm sm:text-base font-normal text-white/95 font-battambang">
                <div className="space-y-1.5 text-left flex-1">
                  <p className="leading-relaxed">
                    <span className="font-battambang text-white/95">លោក </span>
                    <span className="text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-muol-light">{cleanParentName(couple.groomFatherKh)}</span>
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-battambang text-white/95">លោកស្រី </span>
                    <span className="text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-muol-light">{cleanParentName(couple.groomMotherKh)}</span>
                  </p>
                </div>
                <div className="space-y-1.5 text-right flex-1">
                  <p className="leading-relaxed">
                    <span className="font-battambang text-white/95">លោក </span>
                    <span className="text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-muol-light">{cleanParentName(couple.brideFatherKh)}</span>
                  </p>
                  <p className="leading-relaxed">
                    <span className="font-battambang text-white/95">លោកស្រី </span>
                    <span className="text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-muol-light">{cleanParentName(couple.brideMotherKh)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-lg font-normal font-muol-light text-[#D4AF37] leading-relaxed pt-1">
                  មានកិត្តិយសសូមគោរពអញ្ជើញ
                </h3>
                <div className="text-sm sm:text-base leading-relaxed text-white/95 font-battambang space-y-1 sm:space-y-1.5 max-w-xl mx-auto text-center px-2 sm:px-4">
                  <p className="whitespace-nowrap">ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី</p>
                  <p className="whitespace-nowrap">អ្នកនាងកញ្ញា និង ប្រិយមិត្តទាំងអស់អញ្ជើញចូលរួមជាអធិបតី</p>
                  <p className="whitespace-nowrap">និងជាភ្ញៀវកិត្តិយសដើម្បីប្រសិទ្ធិ ពរជ័យ សិរីសួស្តី ជ័យមង្គល</p>
                  <p className="whitespace-nowrap">ដល់គូស្វាមី ភរិយាថ្មី ក្នុង <span className="text-[#F3D372] font-semibold">ពិធីរៀបអាពាហ៍ពិពាហ៍</span></p>
                  <p className="whitespace-nowrap">កូនប្រុស - កូនស្រី របស់យើងខ្ញុំ</p>
                </div>
              </div>

              {/* Couple Ornament with Initials Inside and Names Below (ទម្រង់ដូចរូបទី ២) */}
              <div className="space-y-1 my-2 max-w-lg mx-auto">
                {/* Golden Heart Filigree Ornament with Monogram Initials inside */}
                <div className="relative px-2 sm:px-4">
                  <img
                    src={loveOrnament}
                    alt="Golden Heart Filigree Ornament"
                    className="w-full h-auto object-contain mx-auto select-none pointer-events-none"
                  />
                  {/* Initials inside the heart - centered nicely inside the heart cavity */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none pt-4 min-[400px]:pt-6 sm:pt-8">
                    <div className="flex items-center justify-center gap-0.5 sm:gap-1 font-muol-light text-2xl min-[400px]:text-3xl sm:text-4xl text-[#F3D372] select-none">
                      <span>{getKhmerMonogramLetter(couple.groomNameKh) || 'វ'}</span>
                      <span>{getKhmerMonogramLetter(couple.brideNameKh) || 'ស'}</span>
                    </div>
                  </div>
                </div>

                {/* Names placed symmetrically outward under the ornament wings (ចេញក្រៅបន្តិច) */}
                <div className="flex justify-between items-start w-full px-0 sm:px-1 -mt-7 min-[400px]:-mt-9 sm:-mt-12 relative z-10 pb-2 font-battambang">
                  {/* Left: Groom Name */}
                  <div className="text-center space-y-0.5 sm:space-y-1 flex-1 max-w-[48%]">
                    <p className="text-xs min-[400px]:text-[13px] sm:text-sm text-[#F3D372] font-battambang font-medium">
                      កូនប្រុសនាម
                    </p>
                    <p className="text-lg min-[400px]:text-xl sm:text-2xl font-muol-light text-[#F3D372] leading-tight tracking-wide">
                      {couple.groomNameKh}
                    </p>
                  </div>

                  {/* Right: Bride Name */}
                  <div className="text-center space-y-0.5 sm:space-y-1 flex-1 max-w-[48%]">
                    <p className="text-xs min-[400px]:text-[13px] sm:text-sm text-[#F3D372] font-battambang font-medium">
                      កូនស្រីនាម
                    </p>
                    <p className="text-lg min-[400px]:text-xl sm:text-2xl font-muol-light text-[#F3D372] leading-tight tracking-wide">
                      {couple.brideNameKh}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date and Location matching Image 2 */}
              <div className="space-y-1.5 sm:space-y-2 font-battambang text-white/95 pt-3 text-center max-w-lg mx-auto">
                {/* Solar Date (សូរិយគតិ) - ទំហំស្មើឈ្មោះឳពុកម្ដាយ (text-sm sm:text-base font-muol-light) */}
                <p className="font-muol-light text-[#F3D372] text-sm sm:text-base leading-relaxed tracking-wide pb-1">
                  {couple.weddingDateKh || formatKhmerDate(couple.weddingDate) || 'ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦'}
                </p>

                {/* Lunar Calendar Date (ចន្ទគតិ) */}
                <p className="font-battambang font-medium text-sm sm:text-base leading-relaxed px-2">
                  {(() => {
                    const fullText = (couple.auspiciousTextKh || 'ត្រូវនឹងថ្ងៃ ៤រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០').startsWith('ត្រូវនឹង')
                      ? (couple.auspiciousTextKh || 'ត្រូវនឹងថ្ងៃ ៤រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០')
                      : `ត្រូវនឹង${couple.auspiciousTextKh}`;
                    if (fullText.startsWith('ត្រូវនឹង')) {
                      const rest = fullText.replace(/^ត្រូវនឹង\s*/, '');
                      return (
                        <>
                          <span className="text-white/90">ត្រូវនឹង</span>{' '}
                          <span className="text-[#F3D372] font-semibold">{rest}</span>
                        </>
                      );
                    }
                    return <span className="text-[#F3D372] font-semibold">{fullText}</span>;
                  })()}
                </p>

                <p className="font-battambang font-medium text-white text-sm sm:text-base leading-relaxed px-2">
                  {couple.weddingTimeKh?.includes(couple.venueNameKh || 'កេហដ្ឋានខាងស្រី')
                    ? couple.weddingTimeKh
                    : (couple.weddingTimeKh?.includes('ស្ថិតនៅ')
                        ? `${couple.weddingTimeKh} ${couple.venueNameKh || 'កេហដ្ឋានខាងស្រី'}`
                        : `${couple.weddingTimeKh || 'វេលាម៉ោង ១១:០០នាទីថ្ងៃត្រង់'} ស្ថិតនៅ${couple.venueNameKh || 'កេហដ្ឋានខាងស្រី'}`)}
                </p>

                <p className="font-battambang font-normal text-white/95 text-sm sm:text-base leading-relaxed px-4">
                  {couple.venueAddressKh?.replace(/^(កេហដ្ឋានខាងស្រី|គេហដ្ឋានខាងស្រី)[\s\u200B]*/, '') || 'ភូមិរំដេង ឃុំខ្នារពោធិ ស្រុកសូទ្រនិគ ខេត្តសៀមរាប។'}
                </p>

                <p className="font-battambang text-[#F3D372] italic font-medium text-sm sm:text-base pt-1 tracking-wide">
                  ដោយមេត្រីភាព ។ សូមអរគុណ !
                </p>
              </div>
            </div>

            {/* Event Timeline */}
            <div className="text-center space-y-6 animate-in slide-in-from-bottom duration-700 delay-150 pt-10 relative">

              <div className="space-y-1 mb-8">
                <h3 className="text-xl sm:text-2xl font-normal font-muol-light text-[#D4AF37] leading-relaxed drop-shadow-sm">
                  កម្មវិធីសិរីមង្គល<br/>អាពាហ៍ពិពាហ៍
                </h3>
                {/* Decorative divider under title */}
                <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 pt-2 pb-2">
                  <span className="w-16 h-px bg-gradient-to-l from-[#D4AF37]/60 to-transparent"></span>
                  <span className="text-sm">❖</span>
                  <span className="w-16 h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent"></span>
                </div>
              </div>
              
              {/* Event Timeline */}
              {(() => {
                const agendas = couple.agendas && couple.agendas.length > 0 ? couple.agendas : [];
                const day1Agendas = agendas.filter(a => a.day === 1 || !a.day);
                const day2Agendas = agendas.filter(a => a.day === 2);
                
                const renderAgendaIcon = (icon?: string) => {
                  switch (icon) {
                    case 'sun': return <Sun className="w-4 h-4" />;
                    case 'scissors': return <Scissors className="w-4 h-4" />;
                    case 'utensils': return <Utensils className="w-4 h-4" />;
                    case 'heart': return <Heart className="w-4 h-4" />;
                    case 'sparkles': return <Sparkles className="w-4 h-4" />;
                    default: return <Clock className="w-4 h-4" />;
                  }
                };

                const renderProgramDayHeader = (rawTitle?: string, fallback = '') => {
                  const fullText = (rawTitle || fallback).trim();
                  if (!fullText) return null;

                  let line1 = '';
                  let line2 = '';

                  if (fullText.includes('\n')) {
                    const parts = fullText.split('\n').map(s => s.trim()).filter(Boolean);
                    line1 = parts[0] || '';
                    line2 = parts.slice(1).join(' ') || '';
                  } else {
                    const match = fullText.match(/^(កម្មវិធី(?:ទី[០-៩\d]+|ថ្ងៃទី[០-៩\d]+|[០-៩\d]+)?)\s+(.+)$/);
                    if (match) {
                      line1 = match[1];
                      line2 = match[2];
                    } else {
                      line1 = fullText;
                    }
                  }

                  if (line2) {
                    return (
                      <div className="text-center pb-2.5 space-y-1">
                        <h4 className="font-muol-light text-base sm:text-lg text-[#F3D372] leading-relaxed tracking-wide drop-shadow-sm">
                          {line1}
                        </h4>
                        <p className="font-muol-light text-sm sm:text-base text-[#F3D372] leading-relaxed tracking-wide drop-shadow-sm">
                          {line2}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <h4 className="font-muol-light text-base sm:text-lg text-[#F3D372] leading-relaxed tracking-wide text-center pb-2 drop-shadow-sm">
                      {line1}
                    </h4>
                  );
                };

                return (
                  <div className="space-y-8 text-left max-w-sm mx-auto pt-2">
                    {/* Day 1 */}
                    <div className="space-y-4">
                      {renderProgramDayHeader(couple.weddingProgramDay1TitleKh, 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦')}
                      <div className="space-y-5">
                        {day1Agendas.length > 0 ? (
                          day1Agendas.map(item => (
                            <div key={item.id} className="flex items-start gap-4 group">
                              <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 flex items-center justify-center shrink-0 text-[#D4AF37] bg-black/30 backdrop-blur-sm group-hover:bg-[#D4AF37]/10 transition-colors shadow-sm">
                                {renderAgendaIcon(item.icon)}
                              </div>
                              <div className="space-y-1 pt-0.5 flex-1">
                                <p className="text-sm sm:text-base font-semibold text-[#F3D372] font-battambang tracking-wide drop-shadow-sm">{item.time}</p>
                                <h4 className="text-sm sm:text-base font-medium text-white font-battambang leading-relaxed">{item.titleKh}</h4>
                                {item.descKh && <p className="text-xs sm:text-sm text-white/80 font-battambang">{item.descKh}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-sm text-white/60 font-battambang py-3">មិនទាន់មានកម្មវិធី</p>
                        )}
                      </div>
                    </div>

                    {/* Day 2 */}
                    {(day2Agendas.length > 0 || couple.weddingProgramDay2TitleKh) && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        {renderProgramDayHeader(couple.weddingProgramDay2TitleKh, 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦')}
                        <div className="space-y-5">
                          {day2Agendas.map(item => (
                            <div key={item.id} className="flex items-start gap-4 group">
                              <div className="w-10 h-10 rounded-full border border-[#D4AF37]/50 flex items-center justify-center shrink-0 text-[#D4AF37] bg-black/30 backdrop-blur-sm group-hover:bg-[#D4AF37]/10 transition-colors shadow-sm">
                                {renderAgendaIcon(item.icon)}
                              </div>
                              <div className="space-y-1 pt-0.5 flex-1">
                                <p className="text-sm sm:text-base font-semibold text-[#F3D372] font-battambang tracking-wide drop-shadow-sm">{item.time}</p>
                                <h4 className="text-sm sm:text-base font-medium text-white font-battambang leading-relaxed">{item.titleKh}</h4>
                                {item.descKh && <p className="text-xs sm:text-sm text-white/80 font-battambang">{item.descKh}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Location */}
            <div className="text-center space-y-6 pt-10 pb-4 flex flex-col items-center">
              
               <div className="space-y-1">
                 <h3 className="text-xl sm:text-2xl font-normal font-muol-light text-[#D4AF37] leading-relaxed drop-shadow-sm">
                   ផែនទី<br/>{couple.venueNameKh || 'ទីតាំងកម្មវិធី'}
                 </h3>
                 {couple.venueAddressKh && (
                   <p className="text-white/80 font-battambang text-xs max-w-sm mx-auto pt-1 leading-relaxed">
                     {couple.venueAddressKh}
                   </p>
                 )}
                 {/* Decorative divider under title */}
                 <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 pt-2">
                   <span className="w-16 h-px bg-gradient-to-l from-[#D4AF37]/60 to-transparent"></span>
                   <span className="text-sm">❖</span>
                   <span className="w-16 h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent"></span>
                 </div>
               </div>

               {/* Drawn/Custom Map Image (If provided) - Enlarged and Responsive */}
               {couple.venueMapImage && (
                 <div className="w-full -mx-1 sm:mx-0 max-w-xl px-0 sm:px-2">
                   <div 
                     onClick={() => {
                       setActivePhoto(couple.venueMapImage!);
                       setLightboxZoom(1);
                     }}
                     className="w-full mx-auto overflow-hidden rounded-2xl border-2 border-[#D4AF37]/70 shadow-[0_8px_32px_rgba(212,175,55,0.25)] bg-black/40 cursor-pointer group relative transition-all duration-300 hover:border-[#FFE58F] hover:shadow-[0_12px_40px_rgba(212,175,55,0.4)]"
                     title="ចុចដើម្បីមើលរូបភាពធំពេញអេក្រង់"
                   >
                     <img 
                       src={couple.venueMapImage} 
                       alt="ផែនទីទីតាំងកម្មវិធី (Venue Map)" 
                       className="w-full h-auto object-contain max-h-[720px] sm:max-h-[820px] transition-transform duration-300 group-hover:scale-[1.01]"
                     />
                   </div>
                 </div>
               )}

               <a 
                 href={couple.venueMapUrl || `https://maps.google.com/?q=${encodeURIComponent((couple.venueNameKh || '') + ' ' + (couple.venueAddressKh || ''))}`} 
                 target="_blank" 
                 rel="noreferrer" 
                 className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[#D4AF37] text-white/95 bg-black/80 hover:bg-[#D4AF37]/20 transition-all font-battambang text-[15px] shadow-sm group cursor-pointer"
               >
                 <MapPin className="w-[18px] h-[18px] text-[#D4AF37] group-hover:scale-110 transition-transform" />
                 បើកមើលក្នុង <span className="font-serif-luxury tracking-wider ml-1">Google Maps</span>
               </a>
            </div>

            {/* Photo Gallery - Styled for Dark Mode / Pink Background */}
            {couple.galleryPhotos && couple.galleryPhotos.length > 0 && (
              <div className="space-y-6 pt-10 text-center border-t border-[#D4AF37]/30">
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-normal font-muol-light text-[#D4AF37] leading-relaxed drop-shadow-sm">
                    កម្រង<br/>រូបភាពអនុស្សាវរីយ៍
                  </h3>
                  {/* Decorative divider under title */}
                  <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 pt-2">
                    <span className="w-16 h-px bg-gradient-to-l from-[#D4AF37]/60 to-transparent"></span>
                    <span className="text-sm">❖</span>
                    <span className="w-16 h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent"></span>
                  </div>
                </div>

                {/* Full-Screen Slideshow Launcher Button */}
                <div className="flex justify-center pb-1">
                  <button
                    id="gallery-watch-slideshow-btn"
                    onClick={() => setIsSlideshowOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37]/25 via-[#DFBA49]/40 to-[#D4AF37]/25 hover:from-[#D4AF37]/45 hover:to-[#D4AF37]/45 border border-[#D4AF37]/70 text-[#FFE58F] text-xs font-normal transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#FFE58F]" />
                    <span>{lang === 'km' ? 'ទស្សនា Slide Show រូបភាពវិចិត្រសាល' : 'Watch Gallery Slideshow'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(couple.galleryPhotos || []).map((photo, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setActivePhoto(photo);
                        setActivePhotoIndex(idx);
                        setLightboxZoom(1);
                      }} 
                      className="relative h-36 sm:h-44 rounded-xl overflow-hidden cursor-pointer group ring-1 ring-[#D4AF37]/40 shadow-sm bg-black/10"
                    >
                      <img src={photo} alt={`Pre-wedding ${idx + 1}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2 pointer-events-none">
                        <span className="text-[10px] sm:text-xs text-amber-200 font-battambang drop-shadow-md">🔍 ប៉ះមើលធំ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Gift (KHQR) */}
            <div className="space-y-6 text-center pt-10 border-t border-[#D4AF37]/30">
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-normal font-muol-light text-[#D4AF37] leading-relaxed drop-shadow-sm">
                  ចងដៃ<br/>អាពាហ៍ពិពាហ៍
                </h3>
                {/* Decorative divider under title */}
                <div className="flex items-center justify-center gap-2 text-[#D4AF37]/60 pt-2">
                  <span className="w-16 h-px bg-gradient-to-l from-[#D4AF37]/60 to-transparent"></span>
                  <span className="text-sm">❖</span>
                  <span className="w-16 h-px bg-gradient-to-r from-[#D4AF37]/60 to-transparent"></span>
                </div>
              </div>
              {/* Digital Gift QR Cards Container: Side-by-side when 2 QRs */}
              {(() => {
                const accounts = couple.bankAccounts || [];
                const isTwoQrs = accounts.length === 2;

                return (
                  <div className={`mx-auto ${
                    isTwoQrs 
                      ? 'grid grid-cols-2 gap-2.5 sm:gap-4 max-w-sm sm:max-w-md px-1 sm:px-2' 
                      : 'flex flex-wrap items-center justify-center gap-3 max-w-[220px] sm:max-w-[250px]'
                  }`}>
                    {accounts.map((ba) => (
                      <div 
                        key={ba.id} 
                        className={`p-0 overflow-hidden rounded-xl sm:rounded-2xl border-2 border-[#D4AF37]/80 hover:border-[#FFE58F] shadow-[0_6px_24px_rgba(212,175,55,0.25)] hover:shadow-[0_10px_36px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-[1.02] cursor-pointer group bg-transparent ${
                          isTwoQrs ? 'w-full' : 'inline-flex'
                        }`}
                        onClick={() => {
                          setActivePhoto(ba.qrUrl);
                          setActivePhotoIndex(null);
                          setLightboxZoom(1);
                        }}
                        title="ចុចដើម្បីមើល QR ធំ"
                      >
                        <img 
                          src={ba.qrUrl} 
                          alt="QR Code" 
                          className={`w-auto h-auto object-contain block group-hover:scale-[1.02] transition-transform ${
                            isTwoQrs 
                              ? 'max-w-full max-h-[260px] sm:max-h-[340px]' 
                              : 'max-w-[170px] sm:max-w-[195px] max-h-[250px] sm:max-h-[280px]'
                          }`} 
                        />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* RSVP Form */}
            <div className="space-y-6 pt-10 text-center border-t border-[#D4AF37]/30 relative" id="rsvp-section">

              <h3 className={`text-xl sm:text-2xl font-normal ${khmerTitleFont} text-[#D4AF37] leading-relaxed drop-shadow-sm`}>
                ការឆ្លើយតប<br />និងសៀវភៅជូនពរ
              </h3>
              
              {rsvpSubmitted ? (
                <div className="p-6 bg-black/30 rounded-2xl border border-[#D4AF37]/40 text-center space-y-3 backdrop-blur-sm shadow-sm">
                  <div className="text-3xl text-[#D4AF37] mx-auto">✓</div>
                  <h4 className="font-normal text-base text-white/95 font-battambang">សូមអរគុណយ៉ាងជ្រាលជ្រៅ!</h4>
                  <p className="text-xs text-white/70">ការឆ្លើយតបរបស់អ្នកត្រូវបានកត់ត្រារួចរាល់។</p>
                </div>
              ) : (
                <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-lg mx-auto text-left">
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRsvpAttending('attending')} className={`p-3.5 rounded-xl border text-xs font-normal flex items-center justify-center gap-2 transition-all ${rsvpAttending === 'attending' ? 'border-[#D4AF37] bg-white/10 text-white/95 shadow-sm' : 'border-[#D4AF37]/30 text-white/70 bg-black/20'}`}>
                      ✓ ខ្ញុំនឹងចូលរួម
                    </button>
                    <button type="button" onClick={() => setRsvpAttending('declined')} className={`p-3.5 rounded-xl border text-xs font-normal flex items-center justify-center gap-2 transition-all ${rsvpAttending === 'declined' ? 'border-rose-400 bg-rose-50 text-rose-800 shadow-sm' : 'border-[#D4AF37]/30 text-white/70 bg-black/20'}`}>
                      ✕ សូមអភ័យទោស
                    </button>
                  </div>
                  <div>
                    <input type="text" required value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} placeholder="គោរមងារ និងឈ្មោះរបស់អ្នក" className="w-full px-4 py-3.5 text-sm bg-black/30 border border-[#D4AF37]/40 rounded-xl focus:border-[#D4AF37] focus:outline-none text-white/95 placeholder-gray-600 font-battambang backdrop-blur-sm" />
                  </div>
                  {rsvpAttending === 'attending' && (
                    <div>
                      <select value={rsvpPax} onChange={(e) => setRsvpPax(Number(e.target.value))} className="w-full px-4 py-3.5 text-sm bg-black/30 border border-[#D4AF37]/40 rounded-xl focus:border-[#D4AF37] focus:outline-none text-white/95 appearance-none font-battambang backdrop-blur-sm">
                        <option value={1} className="bg-[#3B1E42]">១ នាក់</option>
                        <option value={2} className="bg-[#3B1E42]">២ នាក់</option>
                        <option value={3} className="bg-[#3B1E42]">៣ នាក់</option>
                        <option value={4} className="bg-[#3B1E42]">៤ នាក់</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <textarea rows={3} value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} placeholder="ពាក្យជូនពរ..." className="w-full px-4 py-3.5 text-sm bg-black/30 border border-[#D4AF37]/40 rounded-xl focus:border-[#D4AF37] focus:outline-none text-white/95 placeholder-gray-600 font-battambang backdrop-blur-sm" />
                  </div>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#D4AF37',
                      backgroundImage: 'linear-gradient(to right, #D4AF37, #C59B27)',
                      color: '#ffffff',
                      WebkitAppearance: 'none'
                    }}
                    className="w-full py-3.5 bg-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C59B27] text-white rounded-xl text-sm font-bold shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-transform active:scale-95 font-battambang mt-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> ផ្ញើការឆ្លើយតប
                  </button>
                </form>
              )}
            </div>


          {/* Uniform Global Branding / Promo Footer */}
          {couple.adminPromo?.enabled !== false && (() => {
            const footerPhone = couple.contactPhone || DEFAULT_ADMIN_PROMO_FOOTER.contactPhone;
            const footerTelegram = couple.contactTelegram || DEFAULT_ADMIN_PROMO_FOOTER.contactTelegram;
            const footerFacebook = couple.contactFacebook || DEFAULT_ADMIN_PROMO_FOOTER.contactFacebook;
            const footerLocation = couple.contactLocation || DEFAULT_ADMIN_PROMO_FOOTER.contactLocation;
            const footerLocationName = couple.contactLocationName || DEFAULT_ADMIN_PROMO_FOOTER.contactLocationName;
            const footerLocation2 = couple.contactLocation2 || DEFAULT_ADMIN_PROMO_FOOTER.contactLocation2;
            const footerLocationName2 = couple.contactLocationName2 || DEFAULT_ADMIN_PROMO_FOOTER.contactLocationName2;
            const footerLogo = couple.adminPromo?.imageUrl || ponleuLogo;
            const footerText = couple.adminPromo?.textKh || DEFAULT_ADMIN_PROMO_FOOTER.adminPromo.textKh;
            const hasContacts = Boolean(footerPhone || footerTelegram || footerFacebook || footerLocation || footerLocation2);

            return (
              <div className="w-full text-center mt-2 pt-2 pb-6 sm:pb-8">
                <div className="p-2 sm:p-3 w-full space-y-2.5">
                  {/* Logo Display */}
                  <div className="flex items-center justify-center pt-1 pb-1">
                    <img 
                      src={footerLogo} 
                      alt="Ponleu Printing Logo" 
                      className="h-12 max-w-[280px] object-contain filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]" 
                    />
                  </div>

                  <div className="text-sm sm:text-base font-battambang text-white/95 whitespace-pre-line leading-relaxed">
                    {footerText}
                  </div>

                  {/* Contact Icons */}
                  {hasContacts && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      {footerPhone && (
                        <a 
                          href={`tel:${footerPhone.replace(/\s+/g, '')}`} 
                          className="w-8 h-8 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all text-[#D4AF37] flex items-center justify-center"
                          title={footerPhone}
                        >
                          <Phone className="w-4 h-4 text-emerald-400" />
                        </a>
                      )}
                      {footerTelegram && (
                        <a 
                          href={footerTelegram.startsWith('http') ? footerTelegram : `https://t.me/${footerTelegram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all text-[#D4AF37] flex items-center justify-center"
                          title="Telegram"
                        >
                          <TelegramIcon className="w-4 h-4 text-sky-400" />
                        </a>
                      )}
                      {footerFacebook && (
                        <a 
                          href={footerFacebook.startsWith('http') ? footerFacebook : `https://facebook.com/${footerFacebook}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="w-8 h-8 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all text-[#D4AF37] flex items-center justify-center"
                          title="Facebook"
                        >
                          <Facebook className="w-4 h-4 text-blue-400" />
                        </a>
                      )}
                      {footerLocation && (
                        <a 
                          href={footerLocation} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="h-8 px-3 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all text-[#D4AF37] flex items-center gap-1.5 text-xs font-battambang"
                          title={footerLocationName || 'Location ហាង ទី១'}
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{footerLocationName || 'ទីតាំងហាងទី១'}</span>
                        </a>
                      )}
                      {footerLocation2 && (
                        <a 
                          href={footerLocation2} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="h-8 px-3 rounded-full border border-[#D4AF37]/50 hover:bg-[#D4AF37]/20 transition-all text-[#D4AF37] flex items-center gap-1.5 text-xs font-battambang"
                          title={footerLocationName2 || 'Location ហាង ទី២'}
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{footerLocationName2 || 'ទីតាំងហាងទី២'}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

      {/* Lightbox Modal for Photo Gallery & Map with Prev/Next Navigation rendered via Portal to break free from any scroll/transform parent */}
      {activePhoto && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[999999] w-screen h-screen bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
          onClick={() => { setActivePhoto(null); setActivePhotoIndex(null); setLightboxZoom(1); }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Control Bar */}
          <div 
            className="w-full max-w-3xl flex items-center justify-between z-20 py-2 px-3 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm text-amber-300 font-battambang font-medium px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
                {activePhoto === couple.venueMapImage 
                  ? '🗺️ ផែនទីទីតាំងកម្មវិធី' 
                  : (hasMultiplePhotos 
                      ? `🖼️ រូបភាព ${currentPhotoIndex + 1} / ${galleryList.length}` 
                      : '🖼️ រូបភាព')}
              </span>
              <div className="flex items-center bg-white/15 rounded-full p-0.5 border border-white/20">
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.max(1, +(prev - 0.5).toFixed(1)))}
                  disabled={lightboxZoom <= 1}
                  className="p-1.5 hover:bg-white/25 rounded-full disabled:opacity-35 transition-all cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4 text-white" />
                </button>
                <span className="text-xs font-mono px-2 text-amber-300 min-w-[42px] text-center font-semibold">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.min(3, +(prev + 0.5).toFixed(1)))}
                  disabled={lightboxZoom >= 3}
                  className="p-1.5 hover:bg-white/25 rounded-full disabled:opacity-35 transition-all cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <button 
              type="button"
              className="text-white p-2 sm:px-3 rounded-full bg-white/20 hover:bg-white/35 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-battambang border border-white/20 shadow-md"
              onClick={() => { setActivePhoto(null); setActivePhotoIndex(null); setLightboxZoom(1); }}
              title="បិទ (Close)"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">បិទ</span>
            </button>
          </div>

          {/* Centered Image Viewport with Floating Prev/Next Buttons */}
          <div 
            className="relative flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden p-1 sm:p-2"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActivePhoto(null);
                setActivePhotoIndex(null);
                setLightboxZoom(1);
              }
            }}
          >
            {/* Previous Button (Left Arrow) */}
            {hasMultiplePhotos && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 transition-all duration-200 border border-[#D4AF37]/80 text-[#FFE58F] hover:text-white flex items-center justify-center backdrop-blur-md shadow-2xl hover:border-amber-300 cursor-pointer group"
                title="រូបភាពមុន (Previous)"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Next Button (Right Arrow) */}
            {hasMultiplePhotos && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 active:scale-90 transition-all duration-200 border border-[#D4AF37]/80 text-[#FFE58F] hover:text-white flex items-center justify-center backdrop-blur-md shadow-2xl hover:border-amber-300 cursor-pointer group"
                title="រូបភាពបន្ទាប់ (Next)"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Main Display Image */}
            <img 
              key={activePhoto}
              src={activePhoto} 
              alt={`Photo view ${currentPhotoIndex >= 0 ? currentPhotoIndex + 1 : ''}`} 
              style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-[72vh] sm:max-h-[76vh] object-contain rounded-xl shadow-2xl transition-transform duration-200 cursor-zoom-in animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxZoom(prev => (prev >= 2.5 ? 1 : +(prev + 0.5).toFixed(1)));
              }}
            />
          </div>

          {/* Bottom Thumbnails Strip (if multiple photos exist) */}
          {hasMultiplePhotos && (
            <div 
              className="w-full max-w-xl flex items-center justify-center gap-2 px-2 py-1.5 overflow-x-auto no-scrollbar z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryList.map((thumb, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => {
                    setActivePhotoIndex(tIdx);
                    setActivePhoto(thumb);
                    setLightboxZoom(1);
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 transition-all duration-200 cursor-pointer ${
                    tIdx === currentPhotoIndex 
                      ? 'ring-2 ring-[#FFE58F] scale-110 shadow-lg brightness-105' 
                      : 'opacity-50 hover:opacity-90 ring-1 ring-white/20'
                  }`}
                >
                  <img src={thumb} alt={`Thumbnail ${tIdx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <p className="text-[11px] sm:text-xs text-amber-200/70 pb-1 font-battambang text-center pointer-events-none">
            {hasMultiplePhotos 
              ? 'ចុចប៊ូតុង ◄ ► ឬអូសលើអេក្រង់ដើម្បីប្ដូររូបភាព | ចុចលើរូបដើម្បី Zoom' 
              : 'ចុចលើរូបដើម្បីពង្រីក (Zoom) ឬចុចកន្លែងទំនេរដើម្បីបិទ'}
          </p>
        </div>,
        document.body
      )}
    </div>
      )}
    </div>
  );
};
