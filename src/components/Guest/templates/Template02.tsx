import React, { useRef, useState } from 'react';
import { CoupleEvent, Guest } from '../../../types';
import { Sparkles, Play } from 'lucide-react';
import introVideo from '../../../assets/images/T002/video_2026-10-14_23-30-33 (1).mp4';
import flowerFrame from '../../../assets/images/T001/003.png';
import openBtnImage from '../../../assets/images/T001/004.png';
import guestFrameBanner from '../../../assets/images/fram002.png';
import coverImage from '../../../assets/images/T002/F007.png';
import { formatImageUrl } from '../../../utils/imageHelper';

import photo2Default from '../../../assets/images/T001/001.png';

interface Template02ClassicGoldProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
}

/**
 * Template 02: គំរូ 02 (Copied from Template 01)
 */
export const Template02ClassicGold: React.FC<Template02ClassicGoldProps> = ({
  couple,
  currentGuest,
  onOpen,
  isOpen = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleOpenAndPlayVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasStarted) {
      setIsFlipped(true);

      // Start video playback with full audio ONLY when user clicks "បើកសំបុត្រ"
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        setIsMuted(false);
        setHasStarted(true);

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Video play error on open:", err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          });
        }
      }

      setTimeout(() => {
        setIsDismissed(true);
      }, 1000); // Wait for flip animation to complete
    } else {
      // If already playing video, proceeding directly to Photo 2 / Invitation
      onOpen();
    }
  };

  const handleVideoEnded = () => {
    // When video finishes playing, show Photo 2 (invitation view) directly
    onOpen();
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMutedState = !videoRef.current.muted;
      videoRef.current.muted = nextMutedState;
      setIsMuted(nextMutedState);
      if (!nextMutedState) {
        videoRef.current.volume = 1.0;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // If card is open (Hero Section view)
  if (isOpen) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-end pb-[20%] bg-transparent select-none">
        {/* Main Content at 3/4 Position */}
        <div className="flex flex-col items-center gap-12">
          {/* Top Titles */}
          <div className="text-center space-y-1 animate-smooth-fade-down">
            <h2 className="text-3xl sm:text-4xl font-muol-light text-[#e6b800] leading-relaxed">
              សិរីមង្គល
            </h2>
            <h2 className="text-3xl sm:text-4xl font-muol-light text-[#e6b800] leading-relaxed">
              អាពាហ៍ពិពាហ៍
            </h2>
            <div className="flex items-center justify-center gap-3 pt-2">
              <span className="h-[1px] w-8 bg-[#e6b800]/40"></span>
              <span className="text-[10px] sm:text-[11px] font-serif-luxury tracking-[0.3em] text-[#e6b800] uppercase">
                Wedding Invitation
              </span>
              <span className="h-[1px] w-8 bg-[#e6b800]/40"></span>
            </div>
          </div>

          {/* Couple Names Section (Gold) */}
          <div className="text-center space-y-0 animate-smooth-fade-up">
            <h2 className="text-2xl sm:text-3xl font-muol-light text-[#e6b800] leading-tight">
              {couple.groomNameKh}
            </h2>
            <div className="flex items-center justify-center -my-1">
              <span className="text-[#e6b800]/80 text-xl font-serif-luxury">&</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-muol-light text-[#e6b800] leading-tight">
              {couple.brideNameKh}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Opening screen (Front Cover -> Video Flip)
  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <div 
        className={`relative w-full h-full transition-all duration-1000 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT: Cover Image & Button */}
        <div className={`absolute inset-0 w-full h-full backface-hidden z-20 flex flex-col justify-end pb-20 items-center ${isDismissed ? 'hidden' : ''}`} style={{ backfaceVisibility: 'hidden' }}>
          <img 
            src={coverImage} 
            alt="Cover" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" /> {/* Subtle overlay */}

          {/* Couple Names Section (Positioned inside the Wreath at 1/3) */}
          <div className="absolute top-[30%] inset-x-0 z-30 flex flex-col justify-center items-center pointer-events-none animate-smooth-fade-down">
            <div className="text-center space-y-0">
              <h2 className="text-xl sm:text-2xl font-muol-light text-[#e6b800] leading-[1.2]">
                {couple.groomNameKh}
              </h2>
              <div className="flex items-center justify-center -my-1">
                <span className="text-[#e6b800]/80 text-lg sm:text-xl font-serif-luxury">&</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-muol-light text-[#e6b800] leading-[1.2]">
                {couple.brideNameKh}
              </h2>
            </div>
          </div>
          
          {/* Guest Name Section (Pattern from Template 03) */}
          <div className="relative z-30 mb-8 text-center animate-smooth-fade-up">
            <p className="text-white/90 text-sm sm:text-base font-battambang font-medium mb-1.5">
              សូមគោរពអញ្ជើញ
            </p>
            
            <div className="relative max-w-[340px] sm:max-w-[380px] mx-auto flex flex-col items-center justify-center mt-1">
              <h3 
                className="relative z-10 text-xl sm:text-2xl md:text-3xl font-normal font-khmer-title tracking-wide px-3 leading-tight"
                style={{ paddingTop: '-1px', fontSize: '22.634px', color: '#e6b800' }}
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

          <div className="relative z-30 animate-smooth-fade-up delay-300">
            <button
              onClick={handleOpenAndPlayVideo}
              className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D372] to-[#B8962D] text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white ring-4 ring-amber-400/20 animate-golden-ripple cursor-pointer font-medium"
            >
              <div className="w-7 h-7 rounded-full bg-gray-900 text-amber-300 flex items-center justify-center shadow-inner">
                <Play className="w-4 h-4 fill-amber-300 ml-0.5" />
              </div>
              <span className="text-sm sm:text-base font-normal font-khmer-title tracking-wide text-gray-900">
                បើកធៀប
              </span>
              <Sparkles className="w-4 h-4 text-gray-900 animate-pulse" />
            </button>
          </div>
        </div>

        {/* BACK: Video Intro */}
        <div 
          className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden" 
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <video
            ref={videoRef}
            src={introVideo}
            preload="auto"
            playsInline
            muted={isMuted}
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />
          
          {/* Skip / Continue button overlay (optional, but good for UX) */}
          {hasStarted && (
            <div className="absolute bottom-10 right-10 z-30">
               <button 
                onClick={() => onOpen()}
                className="text-white/60 text-xs font-battambang underline"
               >
                រំលង
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
