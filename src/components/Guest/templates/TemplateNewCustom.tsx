import React, { useState } from 'react';
import { Sparkles, Play, Heart } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';

// Assets for new custom template design
import weddingTitleImage from '../../../assets/images/frome3.png';
import guestFrameBanner from '../../../assets/images/fram002.png';
import { formatImageUrl } from '../../../utils/imageHelper';

interface TemplateNewCustomProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
  isOpening?: boolean;
}

/**
 * TemplateNewCustom: គំរូរចនាប័ទ្មថ្មី (New Custom Template)
 * លក្ខណៈពិសេស៖ នៅពេលចុចបើកសំបុត្រ បង្ហាញ Effect ពន្លឺពី File ligt001.gif
 * រួមជាមួយនឹង Dynamic Zoom-Out មុនពេលបង្ហាញធៀបទី២។
 */
export const TemplateNewCustom: React.FC<TemplateNewCustomProps> = ({
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

  const handleOpenClick = () => {
    onOpen();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden shadow-2xl bg-transparent select-none font-battambang shrink-0 scale-100 opacity-100">
      
      {/* Background Cover Image or Custom Background - Smooth Opacity transition (1.0 to 0.0 over 5 seconds) without Zoom */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={formatImageUrl(couple.cardBackgroundImage) || formatImageUrl(couple.coverPhoto)}
          alt="គំរូថ្មី សិរីមង្គលអាពាហ៍ពិពាហ៍"
          className={`w-full h-full object-cover object-center block transform-gpu scale-100 ${
            isOpening ? 'animate-fade-out-5s' : 'animate-smooth-kenburns opacity-100'
          }`}
        />
        {/* Light gradient overlay for maximum image clarity and brightness */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none ${
            isOpening ? 'animate-fade-out-5s' : 'opacity-100'
          }`}
        ></div>
      </div>

      {/* OVERLAY CONTENT - Smooth Opacity transition (1.0 to 0.0 over 5 seconds) */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 pt-[16.67%] sm:pt-[18%] pb-[16.67%] sm:pb-[18%] z-20 text-center pointer-events-none scale-100 ${
          isOpening ? 'animate-fade-out-5s' : 'opacity-100'
        }`}
      >
        
        {/* Top Header */}
        <div className="pt-2 space-y-1.5 animate-smooth-fade-down delay-100">
          <img
            src={weddingTitleImage}
            alt="សិរីមង្គល អាពាហ៍ពិពាហ៍"
            className="w-56 sm:w-68 h-auto object-contain mx-auto animate-golden-shimmer"
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

        {/* Lower Section: Guest Box & Open Button */}
        <div className="space-y-2 pb-2 sm:pb-4 pointer-events-auto">
          
          {/* "សូមគោរពអញ្ជើញ" */}
          <div className="space-y-1 animate-smooth-fade-up delay-300 pt-2 sm:pt-3">
            <p className="text-sm sm:text-base font-normal font-battambang text-white mb-1">
              សូមគោរពអញ្ជើញ
            </p>

            {/* Guest Name Plaque */}
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto animate-smooth-fade-up delay-450 flex flex-col items-center justify-center pt-1">
              <h3 className="relative z-10 text-base sm:text-lg md:text-xl font-normal text-[#FFE58F] font-khmer-title tracking-wide px-2 leading-none pb-0 truncate max-w-full translate-y-1 sm:translate-y-2">
                {currentGuest ? `${currentGuest.titleKh} ${currentGuest.fullNameKh}` : 'លោក-អ្នក ភ្ញៀវកិត្តិយស'}
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
                id="open-template-custom-btn"
                onClick={handleOpenClick}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D372] to-[#B8962D] text-gray-900 shadow-xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-amber-400/30 animate-golden-ripple cursor-pointer font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 text-amber-300 flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-amber-300 ml-0.5" />
                </div>
                <span className={`text-xs sm:text-sm font-normal ${khmerTitleFont} tracking-wide text-gray-900`}>
                  ចូលមើលធៀបអញ្ជើញ
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
