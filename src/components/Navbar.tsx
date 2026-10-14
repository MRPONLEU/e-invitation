import React, { useState, useRef, useEffect } from 'react';
import { Template, CoupleEvent, Language } from '../types';
import { 
  Menu,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { formatImageUrl } from '../utils/imageHelper';
import { toggleAppFullscreen } from '../utils/fullscreen';

interface NavbarProps {
  currentView: 'admin' | 'couple' | 'guest';
  setCurrentView: (view: 'admin' | 'couple' | 'guest') => void;
  couples: CoupleEvent[];
  selectedCoupleId: string;
  setSelectedCoupleId: (id: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onToggleMobileSidebar?: () => void;
  activeCoupleTab?: 'overview' | 'template' | 'settings' | 'guests' | 'wishes';
  setActiveCoupleTab?: (tab: 'overview' | 'template' | 'settings' | 'guests' | 'wishes') => void;
  adminActiveSection?: 'overview' | 'templates' | 'couples' | 'footer' | 'music';
  setAdminActiveSection?: (section: 'overview' | 'templates' | 'couples' | 'footer' | 'music') => void;
  adminUser?: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  couples,
  selectedCoupleId,
  setSelectedCoupleId,
  lang,
  setLang,
  onToggleMobileSidebar,
  setActiveCoupleTab,
  setAdminActiveSection
}) => {
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement ||
      !!(document as any).mozFullScreenElement ||
      !!(document as any).msFullscreenElement;
  });

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement || 
        !!(document as any).webkitFullscreenElement ||
        !!(document as any).mozFullScreenElement ||
        !!(document as any).msFullscreenElement;
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#EAE6E1] shadow-2xs font-battambang">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Side: Mobile Menu Button & App Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Sidebar Toggle Button */}
          {currentView !== 'guest' && (
            <button
              id="mobile-sidebar-toggle-btn"
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200 cursor-pointer"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* App Brand Logo */}
          <div 
            onClick={() => {
              window.location.hash = '#admin';
              setCurrentView('admin');
            }}
            className="flex items-center gap-2.5 select-none cursor-pointer group"
          >
            <div 
              style={{
                backgroundColor: '#FF1B6B',
                backgroundImage: 'linear-gradient(135deg, #FF0055 0%, #FF1B6B 50%, #FF4585 100%)',
                color: '#ffffff'
              }}
              className="w-9 h-9 rounded-xl bg-[#FF1B6B] bg-gradient-to-tr from-[#FF0055] via-[#FF1B6B] to-[#FF4585] flex items-center justify-center text-[#ffffff] shadow-sm shadow-pink-500/20 shrink-0 group-hover:scale-105 transition-transform"
            >
              <span className="font-serif-luxury font-normal text-base italic tracking-tighter text-white" style={{ color: '#ffffff' }}>eI</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-normal text-gray-900 tracking-tight">eInvite</span>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-pink-50 text-[#FF1B6B] font-normal border border-pink-100/60">Wedding</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">ធៀបការឌីជីថល</span>
            </div>
          </div>
        </div>

        {/* Far Right: Expand/Compress Fullscreen Toggle Button */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={() => toggleAppFullscreen()}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-amber-50 hover:bg-amber-100/90 text-[#8C6D1F] border border-amber-300/80 rounded-2xl text-xs font-medium flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-2xs group"
            title={isFullscreen ? (lang === 'km' ? 'បង្រួមអេក្រង់' : 'Exit Fullscreen') : (lang === 'km' ? 'ពង្រីកពេញអេក្រង់' : 'Fullscreen')}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span className="font-battambang hidden sm:inline">{lang === 'km' ? 'បង្រួមអេក្រង់' : 'Exit Fullscreen'}</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span className="font-battambang hidden sm:inline">{lang === 'km' ? 'ពង្រីកពេញអេក្រង់' : 'Fullscreen'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};
