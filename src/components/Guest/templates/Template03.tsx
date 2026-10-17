import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { CoupleEvent, Guest } from '../../../types';

// High-resolution assets
import guestFrameBanner from '../../../assets/images/fram002.png';
import weddingArtworkDefault from '../../../assets/images/frome.jpg';
import weddingTitleImage from '../../../assets/images/frome3.png';
import { formatImageUrl } from '../../../utils/imageHelper';

interface TemplateNewCustomProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
  isOpening?: boolean;
}

export const TemplateNewCustom: React.FC<TemplateNewCustomProps> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
  isOpening = false
}) => {
  const formatLatinName = (name?: string) => {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
  };

  // If card is open (Hero Section view)
  if (isOpen) {
    return (
      <div className="relative w-full h-full overflow-hidden flex flex-col items-center select-none">
        {/* Content Overlay restored and repositioned */}
        <div className="relative z-10 w-full h-full flex flex-col items-center p-6 text-center" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
          {/* Top Header */}
          <div className="animate-smooth-fade-down flex flex-col items-center">
            <img 
              src={weddingTitleImage} 
              alt="សិរីមង្គល អាពាហ៍ពិពាហ៍" 
              className="w-full max-w-[240px] sm:max-w-[300px] h-auto object-contain drop-shadow-lg"
            />
            <div className="flex items-center justify-center gap-2 mt-2">
               <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#F3D372]"></span>
               <span className="text-[#FFD700] text-[10px]">❖</span>
               <span 
                 className="text-[10px] sm:text-[11px] font-serif-luxury tracking-[0.2em] text-[#FFF8DC] uppercase font-normal"
                 style={{ fontWeight: 'bold', lineHeight: '19.4981px', fontSize: '11.817px' }}
               >
                 WEDDING INVITATION
               </span>
               <span className="text-[#FFD700] text-[10px]">❖</span>
               <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#F3D372]"></span>
            </div>
          </div>

          <div className="flex-grow-[6]" style={{ paddingBottom: '14px', paddingTop: '84px' }} /> {/* Adjusted via Focus Mode */}

          {/* Couple Names Section - Positioned at the bottom next to scroll indicator */}
          <div className="flex flex-col items-center gap-1 animate-smooth-fade-up" style={{ marginTop: '0px', marginBottom: '29px' }}>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl font-khmer-title font-normal text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-relaxed"
              style={{ marginLeft: '0px', paddingLeft: '0px', paddingBottom: '-2px', fontSize: '26.179px' }}
            >
              {couple.groomNameKh} & {couple.brideNameKh}
            </h2>
            {(couple.groomNameEn || couple.brideNameEn) && (
              <p 
                className="text-sm sm:text-base font-serif-luxury tracking-[0.15em] text-white/85 drop-shadow-md"
                style={{ fontFamily: "'Playfair Display', serif", textDecorationLine: 'none', marginBottom: '0px', fontSize: '15.8165px', paddingLeft: '0px', marginLeft: '0px', marginTop: '-6px' }}
              >
                {formatLatinName(couple.groomNameEn)} & {formatLatinName(couple.brideNameEn)}
              </p>
            )}
          </div>

          <div className="h-4 sm:h-6" /> {/* Small space before scroll indicator */}

          {/* Scroll Indicator */}
          <div className="flex flex-col items-center gap-1 animate-bounce opacity-90">
            <span className="font-battambang tracking-wider text-white/90" style={{ marginTop: '-33px', fontSize: '12.817px' }}>អូសចុះក្រោម</span>
            <div className="rounded-full border border-amber-300/40 flex items-center justify-center bg-black/20 backdrop-blur-sm w-8" style={{ height: '33px' }}>
              <svg className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0px', marginTop: '-4px' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex flex-col justify-between overflow-hidden shadow-2xl bg-black select-none font-battambang shrink-0 transition-opacity duration-1000 ${isOpening ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Background Artwork - Uses Couple Photo for high impact */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src={couple.cardBackgroundImage || formatImageUrl(couple.coverPhoto) || weddingArtworkDefault}
          alt="Wedding Backdrop"
          className="w-full h-full object-cover object-center block animate-smooth-kenburns transform-gpu"
        />
        {/* Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-50% to-black/70 pointer-events-none"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 z-20 text-center pointer-events-none">
        
        {/* Top Header - Stylized Title Image */}
        <div className="pt-8 sm:pt-12 space-y-3 animate-smooth-fade-down flex flex-col items-center">
          <div className="relative inline-block px-4">
             <img 
               src={weddingTitleImage} 
               alt="សិរីមង្គល អាពាហ៍ពិពាហ៍" 
               className="w-full max-w-[280px] sm:max-w-[340px] h-auto object-contain drop-shadow-md"
             />
          </div>
          
          <div className="flex items-center justify-center gap-2.5">
            <span className="h-[1px] w-5 sm:w-8 bg-white/20"></span>
            <span className="text-[#FFE58F] text-[10px]">❖</span>
            <span className="text-[10px] sm:text-[11px] font-serif-luxury tracking-[0.25em] text-white uppercase font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
              WEDDING INVITATION
            </span>
            <span className="text-[#FFE58F] text-[10px]">❖</span>
            <span className="h-[1px] w-5 sm:w-8 bg-white/20"></span>
          </div>
        </div>

        {/* Bottom Section - Guest & Button */}
        <div className="pb-12 space-y-5 pointer-events-auto">
          <div className="animate-smooth-fade-up delay-200">
            <p className="text-sm sm:text-base text-white/90 drop-shadow-md font-battambang font-medium mb-1.5">
              សូមគោរពអញ្ជើញ
            </p>
            
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto flex flex-col items-center justify-center mt-1">
              <h3 
                className="relative z-10 text-xl sm:text-2xl md:text-3xl font-normal font-khmer-title tracking-wide px-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-tight"
                style={{ paddingTop: '-1px', fontSize: '22.634px', color: '#f5ce6a' }}
              >
                {currentGuest ? `${currentGuest.titleKh} ${currentGuest.fullNameKh}` : 'លោក-អ្នក ភ្ញៀវកិត្តិយស'}
              </h3>
              <img
                src={guestFrameBanner}
                alt="Divider"
                className="w-full max-w-[300px] h-auto object-contain opacity-100"
                style={{ paddingTop: '0px', paddingLeft: '0px', paddingBottom: '-4px', marginTop: '-53px' }}
              />
            </div>
          </div>

          <div className="animate-smooth-fade-up delay-500 pt-3">
            <button
              onClick={onOpen}
              className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D372] to-[#B8962D] text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-amber-400/20 cursor-pointer font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-gray-900 text-amber-300 flex items-center justify-center shadow-inner">
                <Play className="w-4 h-4 fill-amber-300 ml-0.5" />
              </div>
              <span className="text-sm sm:text-base font-normal font-khmer-title tracking-wide text-gray-900">
                បើកសំបុត្រ
              </span>
              <Sparkles className="w-4 h-4 text-gray-900" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
