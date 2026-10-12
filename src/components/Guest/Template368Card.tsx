import React from 'react';
import { Sparkles, Play, Heart } from 'lucide-react';
import { CoupleEvent, Guest } from '../../types';

// High-resolution wedding artwork assets
import weddingArtwork368 from '../../assets/images/frome1.jpg';
import guestFrameBanner from '../../assets/images/fram002.png';

const toKhmerNum = (num: number | string) => {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).split('').map(d => /\d/.test(d) ? khmerDigits[parseInt(d)] : d).join('');
};

const formatKhmerDate = (dateString: string) => {
  if (!dateString || !dateString.includes('-')) return dateString;
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

interface Template368CardProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
}

export const Template368Card: React.FC<Template368CardProps> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden shadow-2xl bg-[#1A1A1A] select-none font-battambang shrink-0">
      
      {/* Background Artwork filling 100% entire area */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={couple.cardBackgroundImage || weddingArtwork368}
          alt="គំរូ 368 សិរីមង្គលអាពាហ៍ពិពាហ៍"
          className="w-full h-full object-cover object-center block animate-smooth-kenburns transform-gpu"
          onError={(e) => {
            (e.target as HTMLImageElement).src = weddingArtwork368;
          }}
        />
        {/* Gradient Overlay: ពណ៌ប្រដេញខ្មៅទៅថ្លា អាចមើលឃើញរូបច្បាស់ និងអក្សរច្បាស់ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 via-45% to-transparent pointer-events-none"></div>
      </div>

      {/* OVERLAY CONTENT (GOLD CALLIGRAPHY, GUEST BOX, AUSPICIOUS DETAILS) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 z-20 text-center pointer-events-none">
        
        {/* 1. TOP HEADER: Clean Calligraphy Text without Frame Image */}
        <div className="pt-2 sm:pt-3 space-y-1 animate-smooth-fade-down delay-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-[11px] font-normal bg-white/10 backdrop-blur-xs border-amber-300/30 text-amber-200">
            <Sparkles className="w-3 h-3 text-[#FFE58F]" />
            <span>សំបុត្រអញ្ជើញអាពាហ៍ពិពាហ៍ឌីជីថល</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal font-khmer-title text-[#FFE58F] tracking-wide pt-1">
            សិរីមង្គល អាពាហ៍ពិពាហ៍
          </h2>
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
                id="open-template-368-btn"
                onClick={onOpen}
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7E22CE] via-[#9333EA] to-[#6B21A8] text-white shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 border-2 border-[#D4AF37] ring-4 ring-purple-400/30 animate-golden-ripple"
              >
                <div className="w-6 h-6 rounded-full bg-amber-300 text-purple-900 flex items-center justify-center shadow-xs">
                  <Play className="w-3.5 h-3.5 fill-purple-900 ml-0.5" />
                </div>
                <span className="text-xs sm:text-sm font-normal font-khmer-title tracking-wide text-amber-100">
                  បើកសំបុត្រ
                </span>
                <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

