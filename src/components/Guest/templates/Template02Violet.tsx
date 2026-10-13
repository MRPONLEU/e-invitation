import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';

// High-resolution wedding artwork assets
import weddingArtwork368 from '../../../assets/images/frome1.jpg';
import weddingTitleImage from '../../../assets/images/frome3.png';
import guestFrameBanner from '../../../assets/images/fram002.png';
import { formatImageUrl } from '../../../utils/imageHelper';

interface Template02VioletProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
}

/**
 * Template 02: គំរូ 02 (រចនាប័ទ្ម ស្វាយរាជវាំង & ផ្កាឈូកមាស) / គំរូ 368
 * NOTE: នេះជាម៉ូតដើមដែលបានរៀបចំរួចរាល់ ហាមកែប្រែដើម្បីរក្សាទម្រង់ដើម
 */
export const Template02Violet: React.FC<Template02VioletProps> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
}) => {
  // Priority order for background:
  // 1. Explicit custom card background image
  // 2. Couple cover photo (if set)
  // 3. Default high-resolution Template 02 Violet artwork (frome1.jpg)
  const backgroundImageUrl = 
    formatImageUrl(couple.cardBackgroundImage) || 
    formatImageUrl(couple.coverPhoto) || 
    weddingArtwork368;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== weddingArtwork368) {
      target.src = weddingArtwork368;
    }
  };

  return (
    <div className="relative w-full h-full min-h-full flex flex-col justify-between overflow-hidden shadow-2xl bg-[#1A1A1A] select-none font-battambang shrink-0">
      
      {/* Background Artwork filling 100% entire area with instant CSS background + animated img layer */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImageUrl})` }}
      >
        <img
          src={backgroundImageUrl}
          alt="គំរូ 02 ស្វាយរាជវាំង & ផ្កាឈូកមាស"
          className="w-full h-full object-cover object-center block animate-smooth-kenburns transform-gpu"
          onError={handleImageError}
        />
        {/* Gradient Overlay: ពណ៌ប្រដេញខ្មៅស្រាល អាចមើលឃើញរូបច្បាស់ ១០០% */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
      </div>

      {/* OVERLAY CONTENT (GOLD CALLIGRAPHY, GUEST BOX, AUSPICIOUS DETAILS) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 pt-[16.67%] sm:pt-[18%] pb-[16.67%] sm:pb-[18%] z-20 text-center pointer-events-none">
        
        {/* 1. TOP HEADER: TITLE IMAGE (frome3.png) */}
        <div className="pt-1 sm:pt-2 space-y-1 animate-smooth-fade-down delay-100">
          <div className="inline-block relative">
            <img
              src={weddingTitleImage}
              alt="សិរីមង្គល អាពាហ៍ពិពាហ៍"
              className="w-52 sm:w-60 h-auto object-contain mx-auto animate-golden-shimmer"
            />
            <div className="flex items-center justify-center gap-1.5 mt-0.5 animate-ornament-expand delay-200">
              <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#F3D372]"></span>
              <span className="text-[#FFD700] text-[10px]">❖</span>
              <span className="text-[10px] sm:text-[11px] font-serif-luxury tracking-[0.22em] text-[#FFF8DC] uppercase font-bold">
                WEDDING INVITATION
              </span>
              <span className="text-[#FFD700] text-[10px]">❖</span>
              <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#F3D372]"></span>
            </div>
          </div>
        </div>

        {/* 2. LOWER SECTION: GUEST BOX & AUSPICIOUS WEDDING DETAILS */}
        <div className="space-y-2 pb-2 sm:pb-4 pointer-events-auto">
          
          {/* "សូមគោរពអញ្ជើញ" */}
          <div className="space-y-1 animate-smooth-fade-up delay-300 pt-2 sm:pt-3">
            <p 
              className="text-sm sm:text-base font-normal font-battambang text-white mb-1"
            >
              សូមគោរពអញ្ជើញ
            </p>

            {/* GUEST NAME WITH fram002.png GOLD DIVIDER */}
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto animate-smooth-fade-up delay-450 flex flex-col items-center justify-center pt-1">
              <h3 className="relative z-10 text-base sm:text-lg md:text-xl font-normal text-[#FFE58F] font-khmer-title tracking-wide px-2 leading-none pb-0 truncate max-w-full translate-y-1 sm:translate-y-2">
                {currentGuest ? `${currentGuest.titleKh} ${currentGuest.fullNameKh}` : 'លោក លៃ ពន្លឺ និងភរិយា'}
              </h3>
              <img
                src={guestFrameBanner}
                alt="Gold Divider Ornament"
                className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain select-none pointer-events-none -mt-7 min-[400px]:-mt-8 sm:-mt-9"
              />
            </div>
          </div>

          {/* OPEN INVITATION BUTTON */}
          {!isOpen && (
            <div className="pt-2 animate-smooth-fade-up delay-600">
              <button
                id="open-template-02-btn"
                onClick={onOpen}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D372] to-[#B8962D] text-gray-900 shadow-xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-amber-400/30 animate-golden-ripple cursor-pointer font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 text-amber-300 flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-amber-300 ml-0.5" />
                </div>
                <span className="text-xs sm:text-sm font-normal font-khmer-title tracking-wide text-gray-900">
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
