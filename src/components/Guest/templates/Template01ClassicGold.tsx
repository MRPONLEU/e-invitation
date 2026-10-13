import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';
import guestFrameBanner from '../../../assets/images/fram002.png';
import { formatImageUrl } from '../../../utils/imageHelper';

interface Template01ClassicGoldProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
}

/**
 * Template 01: គំរូ 01 (រចនាប័ទ្ម បុរាណខ្មែរ មាសប្រណិត)
 */
export const Template01ClassicGold: React.FC<Template01ClassicGoldProps> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
}) => {
  const khmerTitleFont = couple.customTheme?.fontFamilyKhmer === 'moul'
    ? 'font-khmer-title'
    : couple.customTheme?.fontFamilyKhmer === 'kantumruy'
    ? 'font-kantumruy font-normal'
    : 'font-battambang font-normal';

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#FFF5F5] via-[#FFFDF9] to-[#FCEFEF] rounded-none p-5 sm:p-7 pt-[16.67%] sm:pt-[18%] pb-[16.67%] sm:pb-[18%] shadow-2xl overflow-y-auto no-scrollbar text-center flex flex-col justify-between animate-smooth-fade-up select-none">
      
      {/* Gold Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#DFBA49] to-[#B8962D]"></div>
      
      {/* Background Frame Border with Straight Corners */}
      <div className="absolute inset-x-2 top-2 bottom-2 rounded-none border border-[#D4AF37]/25 pointer-events-none"></div>

      {/* 1. Header Title: សិរីមង្គល អាពាហ៍ពិពាហ៍ */}
      <div className="pt-2 space-y-1 animate-smooth-fade-down delay-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[11px] font-normal bg-white/80 border-[#D4AF37]/30 text-[#8C6D1F]">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-normal ${khmerTitleFont} text-[#8B3A3A] tracking-wide pt-0.5`}>
          សិរីមង្គល អាពាហ៍ពិពាហ៍
        </h2>
      </div>

      {/* 2. Monogram Emblem Badge */}
      <div className="flex justify-center my-0.5 animate-smooth-fade-up delay-200">
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1.5 shadow-md border-2 border-[#D4AF37] flex items-center justify-center relative bg-gradient-to-br from-[#8B2323] via-[#A83232] to-[#681818] animate-golden-ripple">
          <div className="w-full h-full rounded-full border border-[#DFBA49]/60 flex flex-col items-center justify-center text-amber-100 font-khmer-title">
            <span className="text-xs sm:text-sm font-bold leading-none">
              {couple.groomNickKh?.substring(0, 1) || 'វ'}
            </span>
            <div className="w-4 h-[1px] bg-amber-200/50 my-0.5"></div>
            <span className="text-xs sm:text-sm font-bold leading-none">
              {couple.brideNickKh?.substring(0, 1) || 'ស'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Auspicious Date */}
      <p className="text-xs sm:text-sm font-normal font-battambang text-[#8B3A3A] animate-smooth-fade-up delay-300">
        {couple.auspiciousTextKh || `ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦`}
      </p>

      {/* 4. Center Bride & Groom Photo */}
      <div className="relative mx-auto max-w-[260px] rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-2 ring-[#D4AF37]/40 my-1 animate-smooth-fade-up delay-450">
        <img
          src={formatImageUrl(couple.coverPhoto)}
          alt={`${couple.groomNameKh} & ${couple.brideNameKh}`}
          className="w-full h-52 sm:h-60 object-cover object-top hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
      </div>

      {/* 5. Guest Honorific Box: "សូមគោរពអញ្ជើញ" */}
      <div className="space-y-1 pt-2.5 sm:pt-3.5 animate-smooth-fade-up delay-600">
        <p className="text-xs sm:text-sm font-normal font-battambang text-white mb-1">
          សូមគោរពអញ្ជើញ
        </p>
        <div className="relative max-w-[320px] sm:max-w-[360px] mx-auto flex flex-col items-center justify-center pt-1">
          <h3 className={`relative z-10 text-sm sm:text-base md:text-lg font-normal text-[#8B3A3A] ${khmerTitleFont} tracking-wide px-2 leading-none pb-0 truncate max-w-full translate-y-1 sm:translate-y-2`}>
            {currentGuest ? `${currentGuest.titleKh} ${currentGuest.fullNameKh}` : 'លោក-អ្នក ភ្ញៀវកិត្តិយស'}
          </h3>
          <img
            src={guestFrameBanner}
            alt="Gold Divider Ornament"
            className="w-full max-w-[300px] sm:max-w-[340px] h-auto object-contain select-none pointer-events-none -mt-7 min-[400px]:-mt-8 sm:-mt-9"
          />
        </div>
      </div>

      {/* 6. Interactive Open Button "បើកសំបុត្រ" */}
      {!isOpen && (
        <div className="pt-1.5 animate-smooth-fade-up delay-750">
          <button
            id="open-template-01-btn"
            onClick={onOpen}
            className="group relative inline-flex flex-col items-center justify-center gap-1"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#8B2323] via-[#A83232] to-[#8B2323] text-amber-200 border-2 border-[#D4AF37] ring-4 ring-[#D4AF37]/30 shadow-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 animate-golden-ripple">
              <Play className="w-5 h-5 fill-amber-200 ml-0.5" />
            </div>
            <span className={`text-xs font-normal ${khmerTitleFont} text-[#8B3A3A] group-hover:text-red-700 transition-colors`}>
              បើកសំបុត្រ
            </span>
          </button>
        </div>
      )}

    </div>
  );
};
