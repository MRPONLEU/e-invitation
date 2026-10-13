import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Play, Volume2, VolumeX } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';

// Assets for new custom template design
import guestFrameBanner from '../../../assets/images/fram002.png';
import { formatImageUrl } from '../../../utils/imageHelper';
import { formatVideoUrl } from '../../../utils/urlHelper';

interface TemplateNewCustom003Props {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
  isOpening?: boolean;
}

/**
 * TemplateNewCustom003: គំរូរចនាប័ទ្មថ្មី 003 (New Custom Template 003)
 * លក្ខណៈពិសេស៖ ប្ដូរពីការប្រើប្រាស់ GIF មកជាការប្រើ Link Video (HTML5 <video> tag) សម្រាប់ background ជំនួសវិញ។
 */
export const TemplateNewCustom003: React.FC<TemplateNewCustom003Props> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
  isOpening = false,
}) => {
  const khmerTitleFont = couple.customTheme?.fontFamilyKhmer === 'moul'
    ? 'font-khmer-title'
    : couple.customTheme?.fontFamilyKhmer === 'kantumruy'
    ? 'font-kantumruy font-normal'
    : 'font-battambang font-normal';

  const videoRef = useRef<HTMLVideoElement>(null);
  // Browsers require initial autoplay to be muted; we unmute as soon as user interacts or toggles
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Attempt to unmute video audio on user's first touch/click/pointerdown
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play().then(() => {
          setIsMuted(false);
        }).catch(() => {
          // Keep muted if browser denies unmuting
          if (videoRef.current) videoRef.current.muted = true;
          setIsMuted(true);
        });
      }
    };

    window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });
    window.addEventListener('pointerdown', handleFirstInteraction, { capture: true, once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction, { capture: true });
      window.removeEventListener('touchstart', handleFirstInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleFirstInteraction, { capture: true });
    };
  }, []);

  // Pause Video 1 as soon as opening starts ONLY if a separate transition video (Video 2) exists
  useEffect(() => {
    if ((isOpening || isOpen) && videoRef.current && couple.customTheme?.transitionVideoUrl) {
      videoRef.current.pause();
    }
  }, [isOpening, isOpen, couple.customTheme?.transitionVideoUrl]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    videoRef.current.volume = 1.0;
    if (!nextMuted) {
      videoRef.current.play().catch(() => {});
    }
    setIsMuted(nextMuted);
  };

  const handleOpenClick = () => {
    if (videoRef.current) {
      if (couple.customTheme?.transitionVideoUrl) {
        videoRef.current.pause();
      } else {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
        setIsMuted(false);
      }
    }
    onOpen();
  };

  // Video URL fallback or custom video URL from couple settings if available
  const backgroundVideoUrl = 
    formatVideoUrl(couple.customTheme?.backgroundVideoUrl) || 
    (couple.cardBackgroundImage?.includes('drive.google.com') || couple.cardBackgroundImage?.includes('.mp4') ? formatVideoUrl(couple.cardBackgroundImage) : '') ||
    'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-background-animation-42790-large.mp4';

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden shadow-2xl bg-black select-none font-battambang shrink-0 scale-100 opacity-100">
      
      {/* Background Video / Image for Photo 1 & Photo 2 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Background HTML5 Video instead of GIF */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className={`absolute inset-0 w-full h-full object-cover object-center block ${
            isOpening ? 'animate-fade-out-10s' : 'opacity-100'
          }`}
          src={backgroundVideoUrl}
          onError={(e) => {
            const video = e.currentTarget;
            if (!video.src.includes('mixkit-golden-dust')) {
              video.src = 'https://assets.mixkit.co/videos/preview/mixkit-golden-dust-particles-background-animation-42790-large.mp4';
            }
          }}
        />

        {/* Photo 2 (រូបទីពីរ): Displays with Animation Zoom from 0 to 100 over 3 seconds */}
        {isOpen && (
          <img
            src={formatImageUrl(couple.coverPhoto) || formatImageUrl(couple.secondaryPhoto) || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1200&auto=format&fit=crop'}
            alt="រូបថតទីពីរ (Photo 2) Zoom 0 ទៅ 100"
            className="absolute inset-0 w-full h-full object-cover object-center block animate-zoom-0-to-100-3s z-10"
          />
        )}
      </div>

      {/* OVERLAY CONTENT - Shifted slightly higher */}
      <div 
        className={`absolute inset-x-0 bottom-[25%] sm:bottom-[28%] flex flex-col justify-center items-center px-4 sm:px-6 z-20 text-center pointer-events-none scale-100 ${
          isOpening ? 'animate-fade-out-10s' : 'opacity-100'
        }`}
      >
        
        {/* Guest Box & Open Button */}
        <div className="space-y-2.5 sm:space-y-3.5 pointer-events-auto w-full max-w-md mx-auto">
          
          {/* "សូមគោរពអញ្ជើញ" */}
          <div className="space-y-1 animate-smooth-fade-up delay-300">
            <p className="text-sm sm:text-base font-normal font-battambang text-[#7A5B18] mb-1">
              សូមគោរពអញ្ជើញ
            </p>

            {/* Guest Name Plaque */}
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto animate-smooth-fade-up delay-450 flex flex-col items-center justify-center pt-1">
              <h3 className="relative z-10 text-base sm:text-lg md:text-xl font-normal text-[#059669] font-khmer-title tracking-wide px-2 leading-none pb-0 truncate max-w-full translate-y-1 sm:translate-y-2">
                {currentGuest ? `${currentGuest.titleKh} ${currentGuest.fullNameKh}` : 'លោក លៃ ពន្លឺ និងភរិយា'}
              </h3>
              <img
                src={guestFrameBanner}
                alt="Gold Divider Ornament"
                className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain select-none pointer-events-none -mt-7 min-[400px]:-mt-8 sm:-mt-9"
              />
            </div>
          </div>

          {/* Open Button */}
          {!isOpen && (
            <div className="pt-2 animate-smooth-fade-up delay-600">
              <button
                id="open-template-custom003-btn"
                onClick={handleOpenClick}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#047857] text-gray-900 shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-emerald-400/30 animate-golden-ripple cursor-pointer font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 text-emerald-300 flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-emerald-300 ml-0.5" />
                </div>
                <span className={`text-xs sm:text-sm font-normal ${khmerTitleFont} tracking-wide text-gray-900`}>
                  បើកសំបុត្រ
                </span>
                <Sparkles className="w-4 h-4 text-gray-900 animate-spin-slow" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
