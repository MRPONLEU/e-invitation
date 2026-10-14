import React, { useState, useEffect } from 'react';
import { Template, CoupleEvent, Language, MusicTrack } from './types';
import { INITIAL_TEMPLATES, INITIAL_COUPLES, INITIAL_MUSIC_TRACKS, DEFAULT_WEDDING_AGENDAS, isTemplateSupported } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginGate } from './components/Admin/AdminLoginGate';
import { CoupleDashboard } from './components/Couple/CoupleDashboard';
import { CoupleLoginGate } from './components/Couple/CoupleLoginGate';
import { GuestInvitationView } from './components/Guest/GuestInvitationView';
import { PreviewModal } from './components/PreviewModal';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  AdminUserState, 
  AUTHORIZED_ADMIN_EMAIL, 
  getStoredAdminSession, 
  saveAdminSession, 
  adminLogout 
} from './lib/adminAuth';

const STORAGE_TEMPLATES_KEY = 'e_invitation_templates_v4';
const STORAGE_COUPLES_KEY = 'e_invitation_couples_v4';
const STORAGE_MUSIC_KEY = 'e_invitation_music_v1';
const STORAGE_LANG_KEY = 'e_invitation_lang_v1';
const STORAGE_VIEW_KEY = 'e_invitation_current_view_v2';
const STORAGE_SELECTED_COUPLE_KEY = 'e_invitation_selected_couple_id_v2';
const STORAGE_COUPLE_TAB_KEY = 'e_invitation_couple_tab_v2';
const STORAGE_ADMIN_SECTION_KEY = 'e_invitation_admin_section_v2';

import { requestAppFullscreen } from './utils/fullscreen';

// Helper for deleted template persistence
const getDeletedTemplateIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
  } catch {
    return [];
  }
};

// Helper for deleted music track persistence
const getDeletedMusicTrackIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('deleted_music_track_ids') || '[]');
  } catch {
    return [];
  }
};

// Helper for deleted couple persistence
const getDeletedCoupleIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('deleted_couple_ids') || '[]');
  } catch {
    return [];
  }
};

export default function App() {
  const [_templates, _setTemplates] = useState<Template[]>(() => {
    const deletedIds = getDeletedTemplateIds();
    return INITIAL_TEMPLATES.filter(t => isTemplateSupported(t) && !deletedIds.includes(t.id));
  });
  const [_musicTracks, _setMusicTracks] = useState<MusicTrack[]>(() => {
    const deletedIds = getDeletedMusicTrackIds();
    return INITIAL_MUSIC_TRACKS.filter(t => !deletedIds.includes(t.id));
  });
  const [_couples, _setCouples] = useState<CoupleEvent[]>(() => {
    const deletedIds = getDeletedCoupleIds();
    return INITIAL_COUPLES.filter(c => !deletedIds.includes(c.id));
  });
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUserState | null>(() => getStoredAdminSession());

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        const session: AdminUserState = {
          email: AUTHORIZED_ADMIN_EMAIL,
          displayName: fbUser.displayName || 'Admin Ponleu',
          photoURL: fbUser.photoURL || undefined,
          method: 'google',
          loginTime: Date.now()
        };
        setAdminUser(session);
        saveAdminSession(session);
      }
    });
    return () => unsub();
  }, []);

  const handleAdminLogout = async () => {
    await adminLogout();
    setAdminUser(null);
  };

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    const init = async () => {
      const { subscribeToCollection } = await import('./lib/firebaseSync');
      unsubs.push(subscribeToCollection<Template>('templates', (data) => {
        const deletedIds = getDeletedTemplateIds();
        if (!data || data.length === 0) {
          _setTemplates(INITIAL_TEMPLATES.filter(t => isTemplateSupported(t) && !deletedIds.includes(t.id)));
        } else {
          const map = new Map<string, Template>();
          INITIAL_TEMPLATES.filter(isTemplateSupported).forEach(t => {
            if (!deletedIds.includes(t.id)) map.set(t.id, t);
          });
          data.forEach(t => {
            if (isTemplateSupported(t) && !deletedIds.includes(t.id)) {
              map.set(t.id, { ...map.get(t.id), ...t });
            }
          });
          const validTemplates = Array.from(map.values()).filter(isTemplateSupported);
          _setTemplates(validTemplates);

          // If Firestore contains unsupported templates that have no code in src/components/Guest/templates,
          // clean them up from Firestore and record them as deleted so they never appear
          const unsupportedInDb = data.filter(t => !isTemplateSupported(t));
          if (unsupportedInDb.length > 0) {
            const addedDeleted = unsupportedInDb.map(t => t.id);
            const updatedDeleted = Array.from(new Set([...deletedIds, ...addedDeleted]));
            localStorage.setItem('deleted_template_ids', JSON.stringify(updatedDeleted));
            import('./lib/firebaseSync').then(({ syncCollectionToFirestore }) => {
              syncCollectionToFirestore('templates', data, validTemplates);
            });
          }
        }
      }));
      unsubs.push(subscribeToCollection<MusicTrack>('musicTracks', (data) => {
        const deletedIds = getDeletedMusicTrackIds();
        if (!data || data.length === 0) {
          _setMusicTracks(INITIAL_MUSIC_TRACKS.filter(t => !deletedIds.includes(t.id)));
        } else {
          const map = new Map<string, MusicTrack>();
          INITIAL_MUSIC_TRACKS.forEach(t => {
            if (!deletedIds.includes(t.id)) map.set(t.id, t);
          });
          data.forEach(t => {
            if (!deletedIds.includes(t.id)) map.set(t.id, { ...map.get(t.id), ...t });
          });
          _setMusicTracks(Array.from(map.values()));
        }
      }));
      unsubs.push(subscribeToCollection<CoupleEvent>('couples', (data) => {
        const deletedIds = getDeletedCoupleIds();
        if (!data || data.length === 0) {
          _setCouples(INITIAL_COUPLES.filter(c => !deletedIds.includes(c.id)));
        } else {
          const map = new Map<string, CoupleEvent>();
          INITIAL_COUPLES.forEach(c => {
            if (!deletedIds.includes(c.id)) map.set(c.id, c);
          });
          const mainPromo = data.find(x => x.adminPromo?.textKh || x.adminPromo?.imageUrl)?.adminPromo || INITIAL_COUPLES[0]?.adminPromo;
          const mainPhone = data.find(x => x.contactPhone)?.contactPhone || INITIAL_COUPLES[0]?.contactPhone;
          const mainFacebook = data.find(x => x.contactFacebook)?.contactFacebook || INITIAL_COUPLES[0]?.contactFacebook;
          const mainTelegram = data.find(x => x.contactTelegram)?.contactTelegram || INITIAL_COUPLES[0]?.contactTelegram;
          const mainLocName1 = data.find(x => x.contactLocationName)?.contactLocationName || INITIAL_COUPLES[0]?.contactLocationName;
          const mainLoc1 = data.find(x => x.contactLocation)?.contactLocation || INITIAL_COUPLES[0]?.contactLocation;
          const mainLocName2 = data.find(x => x.contactLocationName2)?.contactLocationName2 || INITIAL_COUPLES[0]?.contactLocationName2;
          const mainLoc2 = data.find(x => x.contactLocation2)?.contactLocation2 || INITIAL_COUPLES[0]?.contactLocation2;

          data.forEach(c => {
            if (!deletedIds.includes(c.id)) {
              const base = map.get(c.id) || c;
              const merged: CoupleEvent = { ...base, ...c };
              if (!merged.adminPromo && mainPromo) {
                merged.adminPromo = mainPromo;
              }
              if (!merged.contactPhone && mainPhone) {
                merged.contactPhone = mainPhone;
              }
              if (!merged.contactFacebook && mainFacebook) {
                merged.contactFacebook = mainFacebook;
              }
              if (!merged.contactTelegram && mainTelegram) {
                merged.contactTelegram = mainTelegram;
              }
              if (!merged.contactLocation && mainLoc1) {
                merged.contactLocationName = mainLocName1;
                merged.contactLocation = mainLoc1;
              }
              if (!merged.contactLocation2 && mainLoc2) {
                merged.contactLocationName2 = mainLocName2;
                merged.contactLocation2 = mainLoc2;
              }
              if (
                !merged.agendas || 
                merged.agendas.length < 5 || 
                !merged.agendas.some(a => a.day === 2) || 
                (merged.weddingProgramDay1TitleKh && merged.weddingProgramDay1TitleKh.includes('២០២៤'))
              ) {
                merged.weddingProgramDay1TitleKh = 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦';
                merged.weddingProgramDay2TitleKh = 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦';
                merged.agendas = DEFAULT_WEDDING_AGENDAS;
              }
              map.set(c.id, merged);
            }
          });
          _setCouples(Array.from(map.values()).filter(c => !deletedIds.includes(c.id)));
        }
      }));
      setIsFirebaseReady(true);
    };
    init();
    return () => unsubs.forEach(u => u());
  }, []);

  const setTemplates = React.useCallback((action: React.SetStateAction<Template[]>) => {
    _setTemplates(prev => {
      const current = prev.length ? prev : INITIAL_TEMPLATES.filter(isTemplateSupported);
      const next = typeof action === 'function' ? (action as any)(current) : action;
      // Record any removed templates to deleted_template_ids
      const removedIds = current.filter(p => !next.some((n: Template) => n.id === p.id)).map(p => p.id);
      if (removedIds.length > 0) {
        const deletedIds = getDeletedTemplateIds();
        const updated = Array.from(new Set([...deletedIds, ...removedIds]));
        localStorage.setItem('deleted_template_ids', JSON.stringify(updated));
        import('./lib/firebaseSync').then(({ deleteDocumentFromFirestore }) => {
          removedIds.forEach(id => deleteDocumentFromFirestore('templates', id));
        });
      }
      import('./lib/firebaseSync').then(({ syncCollectionToFirestore }) => {
        syncCollectionToFirestore('templates', current, next);
      });
      return next;
    });
  }, []);

  const setMusicTracks = React.useCallback((action: React.SetStateAction<MusicTrack[]>) => {
    _setMusicTracks(prev => {
      const current = prev.length ? prev : INITIAL_MUSIC_TRACKS;
      const next = typeof action === 'function' ? (action as any)(current) : action;
      // Record any removed tracks to deleted_music_track_ids
      const removedIds = current.filter(p => !next.some((n: MusicTrack) => n.id === p.id)).map(p => p.id);
      if (removedIds.length > 0) {
        const deletedIds = getDeletedMusicTrackIds();
        const updated = Array.from(new Set([...deletedIds, ...removedIds]));
        localStorage.setItem('deleted_music_track_ids', JSON.stringify(updated));
        import('./lib/firebaseSync').then(({ deleteDocumentFromFirestore }) => {
          removedIds.forEach(id => deleteDocumentFromFirestore('musicTracks', id));
        });
      }
      import('./lib/firebaseSync').then(({ syncCollectionToFirestore }) => {
        syncCollectionToFirestore('musicTracks', current, next);
      });
      return next;
    });
  }, []);

  const setCouples = React.useCallback((action: React.SetStateAction<CoupleEvent[]>) => {
    _setCouples(prev => {
      const deletedIds = getDeletedCoupleIds();
      const current = prev.length ? prev : INITIAL_COUPLES.filter(c => !deletedIds.includes(c.id));
      const next = (typeof action === 'function' ? (action as any)(current) : action).filter((c: CoupleEvent) => !deletedIds.includes(c.id));
      const removedIds = current.filter(p => !next.some((n: CoupleEvent) => n.id === p.id)).map(p => p.id);
      if (removedIds.length > 0) {
        const updatedDeleted = Array.from(new Set([...deletedIds, ...removedIds]));
        localStorage.setItem('deleted_couple_ids', JSON.stringify(updatedDeleted));
        import('./lib/firebaseSync').then(({ deleteDocumentFromFirestore }) => {
          removedIds.forEach(id => deleteDocumentFromFirestore('couples', id));
        });
      }
      import('./lib/firebaseSync').then(({ syncCollectionToFirestore }) => {
        syncCollectionToFirestore('couples', current, next);
      });
      return next;
    });
  }, []);

  const deletedTemplateIds = getDeletedTemplateIds();
  const templates = (_templates.length ? _templates : INITIAL_TEMPLATES)
    .filter(t => isTemplateSupported(t) && !deletedTemplateIds.includes(t.id));
  const deletedMusicTrackIds = getDeletedMusicTrackIds();
  const musicTracks = (_musicTracks.length ? _musicTracks : INITIAL_MUSIC_TRACKS)
    .filter(t => !deletedMusicTrackIds.includes(t.id));
  const couples = _couples.length ? _couples : INITIAL_COUPLES;

  const [selectedCoupleId, setSelectedCoupleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SELECTED_COUPLE_KEY);
      if (saved) return saved;
    } catch {}
    return couples[0]?.id || 'couple_368';
  });

  const [currentView, setCurrentView] = useState<'admin' | 'couple' | 'guest'>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('c') || searchParams.get('guest') || window.location.pathname.startsWith('/c/')) {
      return 'guest';
    }
    const hash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (hash.startsWith('manage') || hash.startsWith('edit') || hash.startsWith('couple')) {
      return 'couple';
    }
    // Link ដើម (original root link without specific route) always defaults to admin!
    return 'admin';
  });

  const [currentGuestCode, setCurrentGuestCode] = useState<string | undefined>(undefined);
  const [activeCoupleTab, setActiveCoupleTab] = useState<'overview' | 'template' | 'settings' | 'guests' | 'wishes'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COUPLE_TAB_KEY);
      if (saved && ['overview', 'template', 'settings', 'guests', 'wishes'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'overview';
  });
  const [adminActiveSection, setAdminActiveSection] = useState<'overview' | 'templates' | 'couples' | 'footer' | 'music'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_SECTION_KEY);
      if (saved && ['overview', 'templates', 'couples', 'footer', 'music'].includes(saved)) {
        return saved as any;
      }
    } catch {}
    return 'overview';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSource, setPreviewSource] = useState<'admin' | 'couple' | null>(null);

  // Keep a ref of couples to avoid triggering URL reset when couples state updates
  const couplesRef = React.useRef(couples);
  useEffect(() => {
    couplesRef.current = couples;
  }, [couples]);

  // Persist navigation states to localStorage so page refresh never loses the active view or couple
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, currentView);
    } catch {}
  }, [currentView]);

  useEffect(() => {
    try {
      if (selectedCoupleId) {
        localStorage.setItem(STORAGE_SELECTED_COUPLE_KEY, selectedCoupleId);
      }
    } catch {}
  }, [selectedCoupleId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COUPLE_TAB_KEY, activeCoupleTab);
    } catch {}
  }, [activeCoupleTab]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ADMIN_SECTION_KEY, adminActiveSection);
    } catch {}
  }, [adminActiveSection]);

  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      return (saved === 'en' || saved === 'km') ? (saved as Language) : 'km';
    } catch {
      return 'km';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch (err) {
      console.warn('Failed to save lang', err);
    }
  }, [lang]);

  // URL Hash & Search Query Parser for direct links (Supports #manage/slug, ?c=slug, #admin-templates, etc.)
  const parseUrl = React.useCallback((isInitialMount = false) => {
    const currentCouples = couplesRef.current.length ? couplesRef.current : INITIAL_COUPLES;
    const rawHash = window.location.hash || '';
    const cleanHash = rawHash.replace(/^#\/?/, '').trim();
    const searchParams = new URLSearchParams(window.location.search);
    
    let coupleSlug = searchParams.get('c') || searchParams.get('couple') || '';
    let guestParam = searchParams.get('guest');
    const editParam = searchParams.get('edit') || searchParams.get('manage');
    const viewParam = searchParams.get('view');

    // Check pathname (e.g. /c/vibol-socheata)
    const pathname = window.location.pathname;
    if (pathname.startsWith('/c/')) {
      const pathSlug = pathname.replace('/c/', '').split('/')[0];
      if (pathSlug) coupleSlug = decodeURIComponent(pathSlug);
    }

    // Helper to find couple by ID (primary, 100% unique) or slug/name (fallback)
    const findCouple = (target: string) => {
      if (!target) return undefined;
      const decoded = decodeURIComponent(target).trim().toLowerCase();
      const cleanTarget = decoded.replace(/[-_\s]/g, '');

      // 1. Direct ID match first (100% exact & unique!)
      const byId = currentCouples.find(c => {
        const cId = (c.id || '').trim().toLowerCase();
        const cIdClean = cId.replace(/[-_\s]/g, '');
        return cId === decoded || cIdClean === cleanTarget;
      });
      if (byId) return byId;

      // 2. Exact slug match
      const bySlug = currentCouples.find(c => {
        const cSlug = (c.slug || '').trim().toLowerCase();
        const cSlugClean = cSlug.replace(/[-_\s]/g, '');
        return cSlug === decoded || cSlugClean === cleanTarget;
      });
      if (bySlug) return bySlug;

      // 3. Fallback partial slug or name match
      return currentCouples.find(c => {
        const cSlugClean = (c.slug || '').trim().toLowerCase().replace(/[-_\s]/g, '');
        if (cleanTarget.length >= 4 && (cSlugClean.startsWith(cleanTarget) || cleanTarget.startsWith(cSlugClean))) return true;
        const namesClean = `${c.groomNameEn || ''}${c.brideNameEn || ''}${c.groomNickKh || ''}${c.brideNickKh || ''}${c.groomNameKh || ''}${c.brideNameKh || ''}`.toLowerCase().replace(/[-_\s]/g, '');
        if (cleanTarget.length >= 4 && namesClean.includes(cleanTarget)) return true;
        return false;
      });
    };

    // 1. GUEST INVITATION LINK (query param ?c=... or ?guest=... or pathname /c/...)
    if (coupleSlug || guestParam) {
      if (coupleSlug) {
        const found = findCouple(coupleSlug);
        if (found) {
          setSelectedCoupleId(found.id);
          setCurrentGuestCode(guestParam || undefined);
          setCurrentView('guest');
          return;
        }
        if (currentCouples.length > 0) {
          setSelectedCoupleId(currentCouples[0].id);
          setCurrentGuestCode(guestParam || undefined);
          setCurrentView('guest');
          return;
        }
      } else if (guestParam) {
        setCurrentGuestCode(guestParam);
        setCurrentView('guest');
        return;
      }
    }

    // 2. GUEST ROUTE via hash (#guest?id=...&g=...)
    if (cleanHash.startsWith('guest')) {
      const qIndex = cleanHash.indexOf('?');
      if (qIndex !== -1) {
        const hashParams = new URLSearchParams(cleanHash.slice(qIndex + 1));
        const hashC = hashParams.get('id') || hashParams.get('c');
        const hashG = hashParams.get('g') || hashParams.get('guest');
        if (hashC) {
          const found = findCouple(hashC);
          if (found) setSelectedCoupleId(found.id);
        }
        if (hashG) setCurrentGuestCode(hashG);
      }
      setCurrentView('guest');
      return;
    }

    // 3. COUPLE MANAGEMENT ROUTE (#manage/... or #edit/... or #couple or ?edit=... or ?view=couple)
    if (cleanHash.startsWith('manage') || cleanHash.startsWith('edit') || cleanHash === 'couple' || editParam || viewParam === 'couple') {
      let identifier = '';
      let subTab: 'overview' | 'template' | 'settings' | 'guests' | 'wishes' | undefined;
      
      if (cleanHash.startsWith('manage/') || cleanHash.startsWith('edit/')) {
        const parts = cleanHash.replace(/^(manage|edit)\//, '').split('/');
        identifier = parts[0] || '';
        if (parts[1] && ['overview', 'template', 'settings', 'guests', 'wishes'].includes(parts[1])) {
          subTab = parts[1] as any;
        }
      } else if (cleanHash === 'couple' || cleanHash === 'manage' || cleanHash === 'edit') {
        identifier = '';
      } else if (editParam) {
        identifier = editParam;
      }

      const found = identifier ? findCouple(identifier) : undefined;
      if (found) {
        setSelectedCoupleId(found.id);
        if (subTab) setActiveCoupleTab(subTab);
        setCurrentView('couple');
        return;
      } else if (!identifier) {
        // If no identifier specified in hash, use currently selected couple or saved in storage
        const savedCoupleId = localStorage.getItem(STORAGE_SELECTED_COUPLE_KEY);
        const targetId = (savedCoupleId && findCouple(savedCoupleId)?.id) || selectedCoupleId || (currentCouples[0]?.id || 'couple_368');
        setSelectedCoupleId(targetId);
        if (subTab) setActiveCoupleTab(subTab);
        setCurrentView('couple');
        return;
      } else if (currentCouples.length > 0) {
        setSelectedCoupleId(currentCouples[0].id);
        if (subTab) setActiveCoupleTab(subTab);
        setCurrentView('couple');
        return;
      }
    }

    // 4. ADMIN ROUTE (#admin, #admin-templates, #admin-couples, etc. or ?view=admin)
    if (cleanHash.startsWith('admin') || viewParam === 'admin') {
      setCurrentView('admin');
      if (cleanHash === 'admin-templates' || cleanHash === 'admin/templates') {
        setAdminActiveSection('templates');
      } else if (cleanHash === 'admin-couples' || cleanHash === 'admin/couples') {
        setAdminActiveSection('couples');
      } else if (cleanHash === 'admin-music' || cleanHash === 'admin/music') {
        setAdminActiveSection('music');
      } else if (cleanHash === 'admin-footer' || cleanHash === 'admin/footer') {
        setAdminActiveSection('footer');
      } else {
        setAdminActiveSection('overview');
      }
      return;
    }

    // 5. ORIGINAL / ROOT LINK (Link ដើម)
    // When visiting the root URL with no specific couple (#manage) or guest (?c=) parameters:
    // ALWAYS OPEN ADMIN DASHBOARD!
    setCurrentView('admin');
    setAdminActiveSection('overview');
    if (window.location.hash !== '#admin') {
      window.location.hash = '#admin';
    }
  }, [selectedCoupleId]);

  useEffect(() => {
    parseUrl(true);
    const onHashChange = () => parseUrl(false);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [parseUrl]);

  // Re-run parseUrl when Firestore completes sync or couples load so incoming URLs map to loaded data
  useEffect(() => {
    parseUrl(false);
  }, [isFirebaseReady, couples, parseUrl]);

  const [previewTemplateOverride, setPreviewTemplateOverride] = useState<string | null>(null);

  // Active couple object
  const activeCouple = couples.find(c => c.id === selectedCoupleId) || couples[0] || INITIAL_COUPLES[0];

  const handleSelectCoupleFromAdmin = (coupleId: string) => {
    setSelectedCoupleId(coupleId);
    setActiveCoupleTab('overview');
    window.location.hash = `#manage/${coupleId}/overview`;
    setCurrentView('couple');
  };

  const handlePreviewCouple = (coupleId?: string, guestCode?: string, source: 'admin' | 'couple' = 'admin', templateId?: string) => {
    requestAppFullscreen();
    // When Admin clicks to preview invitation, always use the 1st couple (couples[0]) to display
    const targetCouple = (source === 'admin')
      ? (couples[0] || INITIAL_COUPLES[0])
      : (couples.find(c => c.id === coupleId) || couples[0] || INITIAL_COUPLES[0]);

    setSelectedCoupleId(targetCouple.id);
    setCurrentGuestCode(guestCode);
    setPreviewSource(source);
    setPreviewTemplateOverride(templateId || null);
    setCurrentView('guest');
  };

  // If in Guest Invitation full view
  if (currentView === 'guest') {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-black font-battambang selection:bg-[#D4AF37]/25 selection:text-[#8C6D1F] flex flex-col items-center justify-center p-0 relative">
        
        {/* Guest View: Clean invitation with no back button */}

        {/* Responsive Fixed 9:16 Aspect Ratio Container: Dynamically fills screen height on desktops/tablets (100dvh) or width on phones (100vw) while strictly preserving 9:16 proportions */}
        <div 
          className="invitation-container relative mx-auto bg-[#1A1A1A] rounded-none overflow-hidden flex flex-col shrink-0 w-full h-[100dvh] sm:w-[min(100vw,calc(100dvh*9/16))] sm:h-[min(100dvh,calc(100vw*16/9))] sm:max-w-[calc(100dvh*9/16))] sm:max-h-[100dvh] sm:shadow-[-25px_0_45px_rgba(0,0,0,0.9),25px_0_45px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)] [container-type:inline-size]"
          style={{
            containerType: 'inline-size'
          }}
        >
          <GuestInvitationView
            couple={previewTemplateOverride ? { ...activeCouple, templateId: previewTemplateOverride } : activeCouple}
            templates={templates}
            guestCode={currentGuestCode}
            setCouples={setCouples}
            lang={lang}
            onBack={previewSource ? () => {
              if (previewSource === 'admin') {
                window.location.hash = '#admin';
                setCurrentView('admin');
                setAdminActiveSection(previewTemplateOverride ? 'templates' : 'overview');
              } else {
                window.location.hash = `#manage/${activeCouple.id}`;
                setCurrentView('couple');
              }
              setPreviewSource(null);
              setPreviewTemplateOverride(null);
            } : undefined}
            backButtonLabel={previewSource === 'admin' ? (lang === 'km' ? 'ត្រឡប់ទៅ Admin' : 'Back to Admin') : (lang === 'km' ? 'ត្រឡប់ទៅផ្ទាំងគូស្នេហ៍' : 'Back to Dashboard')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex font-battambang selection:bg-[#D4AF37]/25 selection:text-[#8C6D1F]">
      
      {/* 1. Left Sidebar Navigation - Displayed in Admin and Couple modes */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(v) => {
          if (v === 'guest') {
            setPreviewSource(currentView === 'admin' ? 'admin' : 'couple');
          } else if (v === 'admin') {
            window.location.hash = '#admin';
          } else if (v === 'couple') {
            window.location.hash = `#manage/${activeCouple.id}/${activeCoupleTab || 'overview'}`;
          }
          setCurrentView(v);
          if (v !== 'guest') {
            setCurrentGuestCode(undefined);
          }
        }}
        couples={couples}
        selectedCoupleId={selectedCoupleId}
        setSelectedCoupleId={setSelectedCoupleId}
        activeCoupleTab={activeCoupleTab}
        setActiveCoupleTab={setActiveCoupleTab}
        adminActiveSection={adminActiveSection}
        setAdminActiveSection={setAdminActiveSection}
        lang={lang}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* 2. Main Content Wrapper (Shifted by w-72 for Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top Header Bar with Breadcrumb and Controls */}
        <Navbar
          currentView={currentView}
          setCurrentView={(v) => {
            if (v === 'guest') {
              setPreviewSource(currentView === 'admin' ? 'admin' : 'couple');
            } else if (v === 'admin') {
              window.location.hash = '#admin';
            } else if (v === 'couple') {
              window.location.hash = `#manage/${activeCouple.id}/${activeCoupleTab || 'overview'}`;
            }
            setCurrentView(v);
            if (v !== 'guest') {
              setCurrentGuestCode(undefined);
            }
          }}
          couples={couples}
          selectedCoupleId={selectedCoupleId}
          setSelectedCoupleId={setSelectedCoupleId}
          lang={lang}
          setLang={setLang}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
          activeCoupleTab={activeCoupleTab}
          setActiveCoupleTab={setActiveCoupleTab}
          adminActiveSection={adminActiveSection}
          setAdminActiveSection={setAdminActiveSection}
          adminUser={adminUser}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-x-hidden">
          {currentView === 'admin' && (
            adminUser ? (
              <AdminDashboard
                templates={templates}
                setTemplates={setTemplates}
                couples={couples}
                setCouples={setCouples}
                musicTracks={musicTracks}
                setMusicTracks={setMusicTracks}
                onSelectCouple={handleSelectCoupleFromAdmin}
                onPreviewCouple={(id, tplId) => handlePreviewCouple(id, undefined, 'admin', tplId)}
                lang={lang}
                activeSection={adminActiveSection}
                setActiveSection={setAdminActiveSection}
              />
            ) : (
              <AdminLoginGate
                onSuccess={(user) => setAdminUser(user)}
                onCancel={() => {
                  window.location.hash = `#manage/${activeCouple.id}/overview`;
                  setCurrentView('couple');
                  setActiveCoupleTab('overview');
                }}
                lang={lang}
              />
            )
          )}

          {currentView === 'couple' && (
            <CoupleLoginGate couple={activeCouple} lang={lang}>
              <CoupleDashboard
                couple={activeCouple}
                setCouples={setCouples}
                templates={templates}
                musicTracks={musicTracks}
                onPreviewGuest={(guestCode) => handlePreviewCouple(activeCouple.id, guestCode, 'couple')}
                lang={lang}
                activeTab={activeCoupleTab}
                onTabChange={(tab) => {
                  setActiveCoupleTab(tab);
                  window.location.hash = `#manage/${activeCouple.id}/${tab}`;
                }}
                onGoToAdmin={() => {
                  window.location.hash = '#admin';
                  setCurrentView('admin');
                  setAdminActiveSection('overview');
                }}
              />
            </CoupleLoginGate>
          )}
        </main>

      </div>

      {/* Pop Up Preview Modal */}
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        couple={activeCouple}
        templates={templates}
        guestCode={currentGuestCode}
        setCouples={setCouples}
        lang={lang}
      />

    </div>
  );
}
