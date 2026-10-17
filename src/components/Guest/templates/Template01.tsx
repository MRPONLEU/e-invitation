import React, { useRef, useState } from 'react';
import { CoupleEvent, Guest } from '../../../types';
import introVideo from '../../../assets/images/T001/001.mp4';
import flowerFrame from '../../../assets/images/T001/003.png';
import openBtnImage from '../../../assets/images/T001/004.png';
import guestFrameBanner from '../../../assets/images/fram002.png';
import { formatImageUrl } from '../../../utils/imageHelper';

import photo2Default from '../../../assets/images/T001/001.png';

interface Template01ClassicGoldProps {
  couple: CoupleEvent;
  currentGuest: Guest | null;
  onOpen: () => void;
  isOpen?: boolean;
}

/**
 * Template 01: គំរូ 01 (Fullscreen Video Intro - Plays with Audio ONLY on Open Button Click)
 */
export const Template01ClassicGold: React.FC<Template01ClassicGoldProps> = ({
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

  const handleOpenAndPlayVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    if (!hasStarted) {
      setIsAnimating(true);

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
      }, 700);
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

  // If card is open (Hero Section view - Photo 2)
  if (isOpen) {
    const photoUrl = formatImageUrl(couple.coverPhoto) || photo2Default;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-transparent">
        <img 
          src={photoUrl} 
          alt="Couple Cover" 
          className="relative z-10 w-full h-full object-cover animate-pull-out"
        />
        { (currentGuest || true) && (
          <div className="absolute inset-0 flex flex-col justify-end pb-36 items-center z-50 animate-pull-out pointer-events-none" style={{ animationDelay: '0.4s' }}>
            {/* Refined Dark Gradient for premium legibility */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0" />
            
            <div className="relative z-10 text-center px-8 w-full max-w-[380px]">
              <p className="text-white/90 text-sm sm:text-base font-battambang font-medium mb-1.5 drop-shadow-md">
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
          </div>
        )}
      </div>
    );
  }

  // Opening screen (First image / Video intro view)
  return (
    <div 
      className={`relative w-full h-full bg-transparent rounded-none overflow-hidden text-center flex flex-col justify-center items-center p-6 select-none animate-smooth-fade-up text-[#cc9900]`}
    >

      {/* Fullscreen Video (001.mp4) - plays ONLY upon clicking Open */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          ref={videoRef}
          src={introVideo}
          preload="auto"
          playsInline
          muted={isMuted}
          onEnded={handleVideoEnded}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Open Button */}
      {!isOpen && !isDismissed && (
        <div className="absolute inset-0 z-10 flex items-center justify-center p-4 animate-smooth-fade-up pointer-events-none">
          <button
            id="open-template-01-btn"
            type="button"
            onClick={handleOpenAndPlayVideo}
            className={`group relative cursor-pointer pointer-events-auto transition-all duration-700 ease-in-out hover:scale-105 active:scale-95 focus:outline-none ${
              isAnimating ? 'translate-y-72 opacity-0 scale-90' : 'translate-y-0 opacity-100 scale-100'
            }`}
            aria-label="បើកសំបុត្រ"
          >
            <img 
              src={openBtnImage} 
              alt="បើកសំបុត្រ" 
              className="w-auto max-w-[110px] sm:max-w-[140px] md:max-w-[160px] max-h-[30vh] object-contain"
            />
          </button>
        </div>
      )}
    </div>
  );
};
