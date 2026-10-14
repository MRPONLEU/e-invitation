import React, { useState, useRef, useEffect } from 'react';
import { Template, CoupleEvent, Language } from '../types';
import { 
  Menu,
  Search, 
  X, 
  Users, 
  Palette, 
  Mail, 
  ExternalLink,
  Sparkles,
  ChevronRight,
  Heart
} from 'lucide-react';
import { formatImageUrl } from '../utils/imageHelper';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter couples, guests, and actions
  const query = searchTerm.trim().toLowerCase();

  const matchingCouples = query 
    ? couples.filter(c => 
        (c.groomNameKh || '').toLowerCase().includes(query) ||
        (c.brideNameKh || '').toLowerCase().includes(query) ||
        (c.groomNameEn || '').toLowerCase().includes(query) ||
        (c.brideNameEn || '').toLowerCase().includes(query) ||
        (c.venueNameKh || '').toLowerCase().includes(query)
      )
    : [];

  const matchingGuests: { couple: CoupleEvent; guest: any }[] = [];
  if (query) {
    couples.forEach(c => {
      (c.guests || []).forEach(g => {
        if (
          (g.fullNameKh || '').toLowerCase().includes(query) ||
          (g.fullNameEn || '').toLowerCase().includes(query) ||
          (g.code || '').toLowerCase().includes(query)
        ) {
          if (matchingGuests.length < 5) {
            matchingGuests.push({ couple: c, guest: g });
          }
        }
      });
    });
  }

  const handleSelectCouple = (coupleId: string) => {
    setSelectedCoupleId(coupleId);
    setCurrentView('couple');
    if (setActiveCoupleTab) setActiveCoupleTab('overview');
    setIsSearchOpen(false);
    setSearchTerm('');
  };

  const handleSelectGuest = (coupleId: string, guestCode: string) => {
    setSelectedCoupleId(coupleId);
    window.location.hash = `#guest?id=${coupleId}&g=${guestCode}`;
    setCurrentView('guest');
    setIsSearchOpen(false);
    setSearchTerm('');
  };

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
              className="w-9 h-9 rounded-xl bg-[#FF1B6B] bg-gradient-to-tr from-[#FF0055] via-[#FF1B6B] to-[#FF4585] flex items-center justify-center text-white shadow-sm shadow-pink-500/20 shrink-0 group-hover:scale-105 transition-transform"
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

        {/* Center/Right: Universal Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center w-full">
            <Search className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            
            <input
              type="text"
              id="navbar-search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={lang === 'km' ? 'ស្វែងរកគូស្នេហ៍, ឈ្មោះភ្ញៀវ, ទីតាំងមង្គលការ...' : 'Search couples, guests, wedding venues...'}
              className="w-full pl-10 pr-9 py-2 bg-[#F7F5F0] hover:bg-[#F2EFE8] focus:bg-white border border-[#EAE6E1] focus:border-[#D4AF37] rounded-2xl text-xs font-battambang text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-2xs"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Results Dropdown */}
          {isSearchOpen && searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[70vh] overflow-y-auto">
              
              {/* Couples Section */}
              {matchingCouples.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 px-2.5 py-1 block">
                    {lang === 'km' ? 'គូស្វាមីភរិយា (Couples)' : 'Couples'}
                  </span>
                  <div className="space-y-1">
                    {matchingCouples.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCouple(c.id)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-amber-50/70 cursor-pointer transition-colors"
                      >
                        <img
                          src={formatImageUrl(c.coverPhoto)}
                          alt={c.groomNameKh}
                          className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-normal text-gray-900 truncate font-khmer-title">
                            {c.groomNameKh} & {c.brideNameKh}
                          </h5>
                          <p className="text-[10px] text-gray-500 truncate font-battambang">
                            {c.weddingDate} • {c.venueNameKh}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guests Section */}
              {matchingGuests.length > 0 && (
                <div className="p-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 px-2.5 py-1 block">
                    {lang === 'km' ? 'ភ្ញៀវកិត្តិយស (Guests)' : 'Guests'}
                  </span>
                  <div className="space-y-1">
                    {matchingGuests.map(({ couple, guest }) => (
                      <div
                        key={`${couple.id}_${guest.id}`}
                        onClick={() => handleSelectGuest(couple.id, guest.code)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-pink-50/70 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-normal text-gray-900 truncate">
                            {guest.titleKh} {guest.fullNameKh}
                          </h5>
                          <p className="text-[10px] text-gray-400 truncate">
                            ធៀបការ៖ {couple.groomNameKh} & {couple.brideNameKh} (កូដ: {guest.code})
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[10px] font-medium shrink-0 ml-2">
                          {lang === 'km' ? 'មើលធៀប' : 'View'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {matchingCouples.length === 0 && matchingGuests.length === 0 && (
                <div className="p-6 text-center text-gray-500 space-y-1">
                  <Search className="w-6 h-6 text-gray-300 mx-auto" />
                  <p className="text-xs font-battambang">
                    {lang === 'km' ? `រកមិនឃើញលទ្ធផលសម្រាប់ «${searchTerm}» ទេ` : `No results found for "${searchTerm}"`}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {lang === 'km' ? 'សូមសាកល្បងវាយឈ្មោះកូនកម្លោះ កូនក្រមុំ ឬឈ្មោះភ្ញៀវ' : 'Try searching groom/bride or guest name'}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </header>
  );
};
