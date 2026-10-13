import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { CoupleEvent, Language } from '../../types';
import { formatImageUrl } from '../../utils/imageHelper';
import frameF0034 from '../../assets/images/T003/F0034.png';

interface WeddingGallerySlideshowProps {
  couple: CoupleEvent;
  lang: Language;
  onProceedToInvitation: () => void;
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
}

// Cinematic Ken Burns variants with alternating Zoom In and Zoom Out motions
const SLIDE_VARIANTS = [
  // 0: Smooth Zoom In (ចលនា Zoom ចូល: 1.0 -> 1.16)
  {
    initial: { scale: 1.0, opacity: 0 },
    animate: { scale: 1.16, opacity: 1 },
    exit: { scale: 1.18, opacity: 0 },
    transition: {
      scale: { duration: 6.0, ease: 'easeOut' as const },
      opacity: { duration: 1.0, ease: 'easeInOut' as const },
    },
  },
  // 1: Smooth Zoom Out (ចលនា Zoom ចេញ: 1.16 -> 1.02)
  {
    initial: { scale: 1.16, opacity: 0 },
    animate: { scale: 1.02, opacity: 1 },
    exit: { scale: 1.0, opacity: 0 },
    transition: {
      scale: { duration: 6.0, ease: 'easeOut' as const },
      opacity: { duration: 1.0, ease: 'easeInOut' as const },
    },
  },
  // 2: Smooth Zoom In (ចលនា Zoom ចូល: 1.02 -> 1.17)
  {
    initial: { scale: 1.02, opacity: 0 },
    animate: { scale: 1.17, opacity: 1 },
    exit: { scale: 1.19, opacity: 0 },
    transition: {
      scale: { duration: 6.0, ease: 'easeOut' as const },
      opacity: { duration: 1.0, ease: 'easeInOut' as const },
    },
  },
  // 3: Smooth Zoom Out (ចលនា Zoom ចេញ: 1.17 -> 1.02)
  {
    initial: { scale: 1.17, opacity: 0 },
    animate: { scale: 1.02, opacity: 1 },
    exit: { scale: 1.0, opacity: 0 },
    transition: {
      scale: { duration: 6.0, ease: 'easeOut' as const },
      opacity: { duration: 1.0, ease: 'easeInOut' as const },
    },
  },
];

export const WeddingGallerySlideshow: React.FC<WeddingGallerySlideshowProps> = ({
  couple,
  lang,
  onProceedToInvitation,
}) => {
  // Extract photos for the slideshow: If user uploaded custom galleryPhotos, use ONLY galleryPhotos!
  const photos = useMemo(() => {
    const list: string[] = [];

    // 1. If couple has custom uploaded galleryPhotos, use strictly those photos!
    if (couple.galleryPhotos && couple.galleryPhotos.length > 0) {
      for (const p of couple.galleryPhotos) {
        if (p) {
          const formatted = formatImageUrl(p);
          if (formatted && !list.includes(formatted)) {
            list.push(formatted);
          }
        }
      }
    }

    // 2. Fallback if galleryPhotos is empty: use coverPhoto and secondaryPhoto
    if (list.length === 0) {
      if (couple.coverPhoto) {
        const formatted = formatImageUrl(couple.coverPhoto);
        if (formatted) list.push(formatted);
      }
      if (couple.secondaryPhoto) {
        const formatted = formatImageUrl(couple.secondaryPhoto);
        if (formatted && !list.includes(formatted)) list.push(formatted);
      }
    }

    return list.length > 0 ? list : [formatImageUrl(couple.coverPhoto)];
  }, [couple]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideCycle, setSlideCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasCompletedCycle, setHasCompletedCycle] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showF0034, setShowF0034] = useState(false);
  const f0034TimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  const handleProceedClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isExiting) return;
    setIsExiting(true);
    onProceedToInvitation();
  };

  const SLIDE_DURATION = 5000; // 5 seconds per photo slide as requested
  const TICK_INTERVAL = 50;

  // Trigger F0034 frame display for exactly 10,000ms (10 seconds) when Photo 2 (index 1) is reached
  useEffect(() => {
    if ((currentIndex === 1 || (photos.length === 1 && currentIndex === 0)) && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setShowF0034(true);
      f0034TimerRef.current = setTimeout(() => {
        setShowF0034(false);
      }, 10000); // Display F0034 for exactly 10,000ms (10 seconds) then fade out
    }
  }, [currentIndex, photos.length]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (f0034TimerRef.current) {
        clearTimeout(f0034TimerRef.current);
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => {
      if (prev >= photos.length - 1) {
        setHasCompletedCycle(true);
        setSlideCycle((c) => c + 1);
        return 0; // Loop back to photo 1
      }
      return prev + 1;
    });
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setProgress(0);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  // Smooth progress ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => Math.min(100, prev + (TICK_INTERVAL / SLIDE_DURATION) * 100));
    }, TICK_INTERVAL);

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Advance to next slide when progress hits 100% (loops indefinitely until Skip is clicked)
  useEffect(() => {
    if (progress >= 100) {
      handleNext();
    }
  }, [progress, handleNext]);

  // Touch swipe handling for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next photo
        handleNext();
      } else {
        // Swiped right -> prev photo
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  // Screen click handler: left side goes back, right side goes next
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const currentPhoto = photos[currentIndex] || couple.coverPhoto;
  const currentVariant = SLIDE_VARIANTS[currentIndex % SLIDE_VARIANTS.length];

  return (
    <div 
      className={`absolute inset-0 z-50 w-full h-full flex flex-col justify-between bg-black select-none overflow-hidden font-battambang transition-opacity duration-1000 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ opacity: isExiting ? 0 : 1 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleScreenClick}
    >
      {/* Dynamic blurred ambient background layer to prevent letterboxing with 90% opacity/dimming */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-2xl opacity-90 scale-110 pointer-events-none transition-all duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${currentPhoto})` }}
      />
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />

      {/* 100% Full-Screen Portrait Photo with Dynamic Ken Burns Zoom In/Out Motion */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`slide-${slideCycle}-${currentIndex}`}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={currentVariant.transition}
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <img
              src={currentPhoto || undefined}
              alt={`${couple.groomNameKh} & ${couple.brideNameKh}`}
              className="w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cinematic Vignette Overlays */}
      {/* Top subtle vignette for progress bar readability */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

      {/* Bottom deep gradient for couple names and text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

      {/* Warm Golden Light Leaks / Sun Flare */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {/* Top-Right Golden Sun Flare */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-radial from-amber-300/30 via-yellow-500/10 to-transparent pointer-events-none" />

        {/* Bottom-Left Warm Ambient Glow */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-radial from-amber-500/20 via-orange-500/5 to-transparent pointer-events-none" />

        {/* Floating Fairy Bokeh Dust Particles */}
        <motion.div 
          animate={{ y: [-15, -60, -15], x: [0, 15, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-8 w-2 h-2 rounded-full bg-amber-200 blur-[0.5px] shadow-[0_0_8px_rgba(251,191,36,0.8)]"
        />
        <motion.div 
          animate={{ y: [0, -45, 0], x: [0, -20, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-yellow-300 blur-[0.5px] shadow-[0_0_10px_rgba(253,224,71,0.9)]"
        />
        <motion.div 
          animate={{ y: [-10, -50, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          className="absolute bottom-1/3 left-16 w-2.5 h-2.5 rounded-full bg-amber-100 blur-[0.5px] shadow-[0_0_8px_rgba(254,243,199,0.7)]"
        />
      </div>

      {/* ================= DEAD CENTER: COUPLE NAMES WITHOUT GOLD FRAME (SHOWS FOR 10 SECONDS ONCE) ================= */}
      <AnimatePresence>
        {showF0034 && (
          <motion.div 
            key="f0034-overlay-10s"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute z-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4 text-center flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="relative z-10 w-full flex flex-col items-center justify-center text-center space-y-2">
              {/* Khmer Names on a Single Line in White */}
              <div className="text-xl sm:text-3xl md:text-4xl font-normal font-khmer-title text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] tracking-wide">
                {couple.groomNameKh} &amp; {couple.brideNameKh}
              </div>

              {/* Latin Names Below */}
              <div className="text-xs sm:text-sm md:text-base font-normal text-white/90 font-serif-luxury tracking-widest [text-shadow:0_1px_4px_rgba(0,0,0,0.7)] uppercase">
                {couple.groomNameEn} &amp; {couple.brideNameEn}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-Right "រំលង ›" (Skip ›) Text Link - Appears only when slideshow completes one full cycle */}
      <AnimatePresence>
        {hasCompletedCycle && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: 1, 
              x: [0, 6, 0],
              scale: [1, 1.04, 1]
            }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ 
              opacity: { duration: 0.5 },
              x: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
            }}
            onClick={handleProceedClick}
            className="absolute z-30 bottom-5 right-5 sm:bottom-6 sm:right-6 pointer-events-auto bg-black/40 sm:bg-transparent backdrop-blur-xs sm:backdrop-blur-none px-3 py-1.5 sm:p-1 rounded-full text-[#FFE58F] hover:text-white font-khmer-body text-xs sm:text-base font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(255,229,143,0.8)] active:scale-95 transition-all cursor-pointer select-none flex items-center gap-1 border border-white/10 sm:border-none"
          >
            <span>{lang === 'km' ? 'រំលង' : 'Skip'}</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
              className="text-amber-300 font-bold text-base sm:text-lg"
            >
              ›
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

