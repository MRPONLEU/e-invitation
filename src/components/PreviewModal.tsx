import React from 'react';
import { Template, CoupleEvent, Language } from '../types';
import { GuestInvitationView } from './Guest/GuestInvitationView';
import { ExternalLink, X, Sparkles } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: CoupleEvent;
  templates: Template[];
  guestCode?: string;
  setCouples: React.Dispatch<React.SetStateAction<CoupleEvent[]>>;
  lang: Language;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  couple,
  templates,
  guestCode,
  setCouples,
  lang,
}) => {
  if (!isOpen) return null;

  const handleOpenInNewTab = () => {
    let url = `${window.location.origin}${window.location.pathname}#guest`;
    if (guestCode) {
      url += `?code=${guestCode}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 animate-fade-in overflow-hidden font-battambang">
      
      {/* Floating Preview Controls: Absolute positioned so card spans full height without top/bottom gap */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between z-50 pointer-events-none">
        <button
          onClick={onClose}
          className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-xs text-white/90 font-battambang flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md border border-white/15 shadow-xl"
        >
          <X className="w-4 h-4 text-amber-300" />
          <span>បិទ (Close)</span>
        </button>

        <button
          onClick={handleOpenInNewTab}
          className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 text-[#F3D372] border border-[#D4AF37]/50 text-xs font-battambang flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-xl"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>បើកក្នុង Tab ថ្មី</span>
        </button>
      </div>

      {/* Main Preview Container: Exact 9:16 Aspect Ratio expanding to fill screen height on computers/tablets (100dvh) or width on phones (100vw) */}
      <div 
        className="invitation-container relative mx-auto bg-[#1A1A1A] rounded-none overflow-hidden flex flex-col shrink-0 w-full h-[100dvh] sm:w-[min(100vw,calc(100dvh*9/16))] sm:h-[min(100dvh,calc(100vw*16/9))] sm:max-w-[calc(100dvh*9/16))] sm:max-h-[100dvh] sm:shadow-[-25px_0_45px_rgba(0,0,0,0.9),25px_0_45px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] [container-type:inline-size]"
        style={{
          containerType: 'inline-size'
        }}
      >
        <GuestInvitationView
          couple={couple}
          templates={templates}
          guestCode={guestCode}
          setCouples={setCouples}
          lang={lang}
        />
      </div>

    </div>
  );
};
