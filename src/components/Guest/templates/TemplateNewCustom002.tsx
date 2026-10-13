import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';

// Assets for new custom template design
import weddingTitleImage from '../../../assets/images/frome3.png';
import guestFrameBanner from '../../../assets/images/fram002.png';
import gifF0032 from '../../../assets/images/T003/F0032_opt.webp';
import { formatImageUrl } from '../../../utils/imageHelper';

interface TemplateNewCustom002Props {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
  isOpening?: boolean;
}

/**
 * TemplateNewCustom002: គំរូរចនាប័ទ្មថ្មី 002 (New Custom Template 002)
 * លក្ខណៈពិសេស៖ បង្ហាញចលនា GIF ទី១ ពី File F0032.gif នៅលើផ្ទាំងរូបទីមួយ
 * និងបង្ហាញចលនា GIF ទី២ (F0031.gif) បន្ទាប់ពីចុចប៊ូតុងបើកធៀប។
 */
export const TemplateNewCustom002: React.FC<TemplateNewCustom002Props> = ({
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
      
      {/* Background Cover GIF / Image for Photo 1 & Photo 2 */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Photo 1: Strictly uses F0032_opt.webp animated background regardless of custom uploaded cover photo */}
        <img
          src={gifF0032}
          alt="រូបថតទីមួយ GIF F0032_opt.webp មានចលនា"
          className={`w-full h-full object-cover object-center block ${
            isOpening ? 'animate-fade-out-5s' : 'opacity-100'
          }`}
        />

        {/* Photo 2 (រូបទី២): Displays with Smooth Fade In without zoom */}
        {isOpen && (
          <img
            src={formatImageUrl(couple.coverPhoto) || formatImageUrl(couple.secondaryPhoto) || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop'}
            alt="រូបថតទីពីរ (Photo 2)"
            className="absolute inset-0 w-full h-full object-cover object-center block animate-photo2-fade-in-5s z-10"
          />
        )}

        {/* Subtle gradient overlay for text readability without altering GIF colors */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10 ${
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

        {/* Lower Section: Guest Box & Open Button */}
        <div className="space-y-2 pb-2 sm:pb-4 pointer-events-auto">
          
          {/* "សូមគោរពអញ្ជើញ" */}
          <div className="space-y-1 animate-smooth-fade-up delay-300 pt-2 sm:pt-3">
            <p className="text-sm sm:text-base font-normal font-battambang text-white mb-1">
              សូមគោរពអញ្ជើញ
            </p>

            {/* Guest Name Plaque */}
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto animate-smooth-fade-up delay-450 flex flex-col items-center justify-center pt-1">
              <h3 className="relative z-10 text-lg sm:text-xl md:text-2xl font-normal text-[#FFE58F] font-khmer-title tracking-wide px-2 leading-none pb-0 truncate max-w-full translate-y-1 sm:translate-y-2">
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
                id="open-template-custom002-btn"
                onClick={handleOpenClick}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D372] to-[#B8962D] text-gray-900 shadow-xl hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-amber-400/30 animate-golden-ripple cursor-pointer font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gray-900 text-amber-300 flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-amber-300 ml-0.5" />
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
