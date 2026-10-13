import React, { useState } from 'react';
import { CoupleEvent, Template, Language, AgendaItem, BankAccount, MusicTrack } from '../../types';
import { DEFAULT_WEDDING_AGENDAS, INITIAL_MUSIC_TRACKS } from '../../data/initialData';
import { audioSynthesizer } from '../../utils/audioSynthesizer';
import weddingArtwork368 from '../../assets/images/frome1.jpg';
import weddingArtworkClassic from '../../assets/images/frome.jpg';
import sparklingGifEffect from '../../assets/images/ligt001.webp';
import gifF0031 from '../../assets/images/T003/F0031.webp';
import gifF0032 from '../../assets/images/T003/F0032_opt.webp';
import { formatImageUrl, compressImageFile, handleImageError } from '../../utils/imageHelper';
import { storeMedia } from '../../utils/mediaStorage';
import { requestAppFullscreen } from '../../utils/fullscreen';
import { 
  Users, 
  Plus, 
  Calendar, 
  Check, 
  Copy, 
  Share2, 
  Edit3, 
  ExternalLink, 
  Search, 
  Eye, 
  X, 
  MapPin, 
  Package as PackageIcon, 
  Trash2, 
  Clock, 
  Save,
  RotateCcw,
  Sparkles,
  Sun,
  Scissors,
  Utensils,
  Heart,
  QrCode,
  Upload,
  Image as ImageIcon,
  Music,
  Play,
  Pause,
  Volume2,
  Tag,
  Send,
  Globe,
  Lock,
  KeyRound,
  User,
  EyeOff,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getGuestInvitationUrl, getCouplePortalUrl } from '../../utils/urlHelper';
import { ShareGuideModal } from '../ShareGuideModal';
import { AdminCoupleEditorModal } from './AdminCoupleEditorModal';

interface AdminCouplesPageProps {
  couples: CoupleEvent[];
  setCouples: React.Dispatch<React.SetStateAction<CoupleEvent[]>>;
  templates: Template[];
  musicTracks?: MusicTrack[];
  lang: Language;
  onOpenNewCouple: () => void;
  onSelectCouple: (coupleId: string) => void;
  onPreviewCouple: (coupleId: string) => void;
}

export const AdminCouplesPage: React.FC<AdminCouplesPageProps> = ({
  couples,
  setCouples,
  templates,
  musicTracks = INITIAL_MUSIC_TRACKS,
  lang,
  onOpenNewCouple,
  onSelectCouple,
  onPreviewCouple,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedDetailCouple, setSelectedDetailCouple] = useState<CoupleEvent | null>(null);
  const [editingCouple, setEditingCouple] = useState<CoupleEvent | null>(null);
  const [adminGalleryLightbox, setAdminGalleryLightbox] = useState<string | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [showShareGuide, setShowShareGuide] = useState(false);
  const [saveToastMsg, setSaveToastMsg] = useState<string | null>(null);
  const [coupleToDelete, setCoupleToDelete] = useState<CoupleEvent | null>(null);

  const confirmDeleteCouple = (c: CoupleEvent) => {
    if (couples.length <= 1) {
      alert(lang === 'km' 
        ? 'មិនអាចលុបបានទេ! ប្រព័ន្ធត្រូវរក្សាទុកយ៉ាងហោចណាស់គូស្នេហ៍ចំនួន ១។' 
        : 'Cannot delete! At least one couple must remain in the system.');
      return;
    }
    setCouples(prev => prev.filter(item => item.id !== c.id));
    setCoupleToDelete(null);
    setSaveToastMsg(lang === 'km' 
      ? `បានលុបគូស្នេហ៍ «${c.groomNameKh} & ${c.brideNameKh}» ដោយជោគជ័យ!` 
      : `Couple "${c.groomNameKh} & ${c.brideNameKh}" deleted successfully!`);
    setTimeout(() => setSaveToastMsg(null), 3500);
  };

  // Audio Playback Preview Handler
  const handleTogglePlayMusic = (trackId: string, customAudioUrl?: string) => {
    if (playingTrackId === trackId) {
      audioSynthesizer.stop();
      setPlayingTrackId(null);
    } else {
      const track = musicTracks.find(t => t.id === trackId);
      audioSynthesizer.stop();
      audioSynthesizer.start(customAudioUrl || track?.audioUrl);
      setPlayingTrackId(trackId);
    }
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredCouples = couples || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Banner for Success Save */}
      {saveToastMsg && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl font-medium text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{saveToastMsg}</span>
        </div>
      )}
      
      {/* Page Header - Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-1">
        <h2 className="text-xl sm:text-2xl font-normal text-gray-900 font-khmer-title flex items-center gap-2.5">
          <span className="w-2.5 h-6 bg-pink-500 rounded-full"></span>
          <span>{lang === 'km' ? 'គ្រប់គ្រងគណនីគូស្វាមីភរិយា' : 'Couple Accounts'}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowShareGuide(true)}
            className="bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200/90 px-3.5 py-2 rounded-xl text-xs font-normal shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
            title={lang === 'km' ? 'របៀបបង្កើត Link សាធារណៈ ជៀសវាង Error 403' : 'Public Link Guide'}
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{lang === 'km' ? 'Link សាធារណៈ' : 'Public Link Guide'}</span>
          </button>

          <button
            onClick={onOpenNewCouple}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8962D] text-white px-4 py-2 rounded-xl text-xs font-normal hover:brightness-110 shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'km' ? '+ បង្កើតគណនីថ្មី' : '+ Create Couple'}</span>
          </button>
        </div>
      </div>

      {/* Mobile View: Clean list with Photo + Name + View Button ONLY */}
      <div className="block md:hidden space-y-3">
        {filteredCouples.map((c) => {
          return (
            <div 
              key={c.id}
              className="bg-white border border-[#EAE6E1] rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 hover:border-[#D4AF37]/50 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img 
                  src={formatImageUrl(c.coverPhoto)} 
                  alt={c.groomNameKh} 
                  onError={(e) => handleImageError(e)}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#D4AF37]/50 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-normal text-gray-900 text-sm truncate">
                    {c.groomNameKh} & {c.brideNameKh}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-sans truncate">
                    {c.groomNameEn} & {c.brideNameEn}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailCouple(c)}
                className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200/80 rounded-xl text-xs font-normal flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors shadow-2xs"
              >
                <Eye className="w-4 h-4 text-[#8C6D1F]" />
                <span>{lang === 'km' ? 'មើល' : 'View'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Desktop View: Full Table */}
      <div className="hidden md:block bg-white border border-[#EAE6E1] rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#FAF9F6] text-gray-700 font-medium uppercase tracking-wider text-[10px] border-b border-[#EAE6E1]">
              <tr>
                <th className="py-3.5 px-4 min-w-[180px]">{lang === 'km' ? 'គូស្វាមីភរិយា' : 'Couple'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'កាលបរិច្ឆេទ & ទីតាំង' : 'Date & Venue'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{lang === 'km' ? 'ម៉ូត Templet' : 'Assigned Template'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal">
              {filteredCouples.map((c) => {
                const assignedTemplate = templates.find(t => t.id === c.templateId) || templates[0];
                const guestInvitationUrl = getGuestInvitationUrl(c.id);
                const couplePortalUrl = getCouplePortalUrl(c.id);

                return (
                  <tr key={c.id} className="hover:bg-[#FCFBF8] transition-colors">
                    
                    {/* Couple Names */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img 
                          src={formatImageUrl(c.coverPhoto)} 
                          alt={c.groomNameKh} 
                          onError={(e) => handleImageError(e)}
                          className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/50 shrink-0"
                        />
                        <div>
                          <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                            {c.groomNameKh} & {c.brideNameKh}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-sans whitespace-nowrap">
                            <span>{c.groomNameEn} & {c.brideNameEn}</span>
                            {c.manageUsername && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-mono border border-amber-200">
                                <Lock className="w-2.5 h-2.5 text-[#D4AF37]" />
                                {c.manageUsername}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Wedding Date & Venue */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-800 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{c.weddingDate}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 truncate max-w-[180px]">
                        {c.venueNameKh}
                      </div>
                    </td>

                    {/* Template Assigned */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignedTemplate.primaryColor }}></span>
                        {assignedTemplate.code} - {assignedTemplate.nameKh.split('(')[0]}
                      </span>
                    </td>

                    {/* Actions: Copy Couple Portal Link, Manage, Preview Guest */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Copy Portal Link for Couple (Icon Only) */}
                        <button
                          onClick={() => handleCopyLink(couplePortalUrl, `couple_${c.id}`)}
                          title={lang === 'km' ? 'Copy Link ផ្ញើឱ្យកូនកម្លោះក្រមុំកែប្រែ' : 'Copy Couple Management Link'}
                          className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200/80 cursor-pointer transition-colors"
                        >
                          {copiedId === `couple_${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Copy Guest Invitation Link (Icon Only) */}
                        <button
                          onClick={() => handleCopyLink(guestInvitationUrl, `guest_${c.id}`)}
                          title={lang === 'km' ? 'Copy Link សំបុត្រអញ្ជើញភ្ញៀវ' : 'Copy Guest Invitation Link'}
                          className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer transition-colors"
                        >
                          {copiedId === `guest_${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Wedding Details */}
                        <button
                          onClick={() => setEditingCouple(c)}
                          className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors"
                          title={lang === 'km' ? 'កែប្រែព័ត៌មានលម្អិត' : 'Edit Wedding Details'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open Couple Portal / Edit (Icon Only) */}
                        <button
                          onClick={() => onSelectCouple(c.id)}
                          className="p-1.5 bg-[#1A1A1A] hover:bg-black text-white rounded-xl cursor-pointer transition-colors"
                          title={lang === 'km' ? 'គ្រប់គ្រង Portal' : 'Manage Portal'}
                        >
                          <Users className="w-3.5 h-3.5" />
                        </button>

                        {/* View Live Guest Card */}
                        <button
                          onClick={() => onPreviewCouple(c.id)}
                          className="p-1.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#8C6D1F] cursor-pointer"
                          title="Preview e-Invitation"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Couple */}
                        <button
                          onClick={() => setCoupleToDelete(c)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 cursor-pointer transition-colors"
                          title={lang === 'km' ? 'លុបគូស្នេហ៍នេះ' : 'Delete Couple'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Viewing Couple Details */}
      {selectedDetailCouple && (() => {
        const c = selectedDetailCouple;
        const assignedTemplate = templates.find(t => t.id === c.templateId) || templates[0];
        const guestsCount = c.guests?.length || 0;
        const rsvpCount = c.guests ? c.guests.filter(g => g.rsvpStatus === 'attending').length : 0;
        const guestInvitationUrl = getGuestInvitationUrl(c.id);
        const couplePortalUrl = getCouplePortalUrl(c.id);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-md w-full my-auto max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#EAE6E1]">
              
              {/* Header with Photo & Close button */}
              <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#FAF8F3] to-[#F5EBD0] border-b border-[#EAE6E1] text-center shrink-0">
                <button
                  onClick={() => setSelectedDetailCouple(null)}
                  className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-xs cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                <img 
                  src={formatImageUrl(c.coverPhoto)} 
                  alt={c.groomNameKh} 
                  onError={(e) => handleImageError(e)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-2.5"
                />

                <h3 className="text-lg sm:text-xl font-normal text-gray-900 font-khmer-title">
                  {c.groomNameKh} & {c.brideNameKh}
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  {c.groomNameEn} & {c.brideNameEn}
                </p>
              </div>

              {/* Details Body (Scrollable) */}
              <div className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1 overscroll-contain">
                
                {/* Wedding Date & Venue */}
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F6] border border-[#EAE6E1]">
                  <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase text-gray-400 font-medium block">
                      {lang === 'km' ? 'កាលបរិច្ឆេទ & ទីតាំង' : 'Date & Venue'}
                    </span>
                    <p className="font-medium text-gray-900 mt-0.5">{c.weddingDate}</p>
                    <p className="text-gray-600 mt-0.5">{c.venueNameKh}</p>
                    {c.venueAddressKh && <p className="text-gray-500 text-[11px] mt-0.5">{c.venueAddressKh}</p>}
                    
                    {/* Map Link & Image Indicator */}
                    {(c.venueMapUrl || c.venueMapImage) && (
                      <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-200/60">
                        {c.venueMapImage && (
                          <div className="flex items-center gap-1.5">
                            <img
                              src={c.venueMapImage}
                              alt="Map Thumbnail"
                              className="w-8 h-8 rounded-lg object-cover border border-amber-300 shrink-0"
                            />
                            <span className="text-[10px] text-amber-900 font-medium">{lang === 'km' ? 'មានរូបផែនទី' : 'Map Image'}</span>
                          </div>
                        )}
                        {c.venueMapUrl && (
                          <a
                            href={c.venueMapUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#8C6D1F] hover:underline font-medium bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                          >
                            <MapPin className="w-3 h-3 text-[#D4AF37]" />
                            <span>{lang === 'km' ? 'បើក Google Maps' : 'Google Maps'}</span>
                            <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Couple Login Credentials */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{lang === 'km' ? 'គណនីចូលគ្រប់គ្រង (Login Account)' : 'Couple Login Account'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDetailCouple(null);
                        setEditingCouple(c);
                      }}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
                    >
                      {lang === 'km' ? 'កែប្រែ Password' : 'Edit Password'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="p-2 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-gray-400 block font-medium">Username</span>
                      <span className="text-xs font-semibold text-gray-900 font-mono select-all">
                        {c.manageUsername || <span className="text-gray-400 font-normal italic font-sans">{lang === 'km' ? 'មិនមាន' : 'None'}</span>}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-amber-200">
                      <span className="text-[10px] text-gray-400 block font-medium">Password</span>
                      <span className="text-xs font-semibold text-amber-900 font-mono select-all">
                        {c.managePassword || <span className="text-gray-400 font-normal italic font-sans">{lang === 'km' ? 'មិនមាន' : 'None'}</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Template & Package */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#EAE6E1]">
                    <span className="text-[10px] uppercase text-gray-400 font-medium block">
                      {lang === 'km' ? 'ម៉ូត Templet' : 'Template'}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: assignedTemplate.primaryColor }}></span>
                      <span className="font-medium text-amber-900 truncate">{assignedTemplate.code}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F6] border border-[#EAE6E1]">
                    <span className="text-[10px] uppercase text-gray-400 font-medium block">
                      {lang === 'km' ? 'កញ្ចប់សេវា' : 'Package'}
                    </span>
                    <p className="font-medium text-purple-700 mt-1">{c.packageType}</p>
                  </div>
                </div>

                {/* Guest Stats */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-emerald-700 font-medium block">
                      {lang === 'km' ? 'ភ្ញៀវសរុប' : 'Total Guests'}
                    </span>
                    <p className="font-medium text-emerald-900 mt-0.5">{guestsCount} {lang === 'km' ? 'នាក់' : 'invited'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-emerald-700 font-medium block">
                      {lang === 'km' ? 'ឆ្លើយតបចូលរួម' : 'Confirmed RSVP'}
                    </span>
                    <p className="font-medium text-emerald-700 mt-0.5">{rsvpCount} {lang === 'km' ? 'នាក់' : 'confirmed'}</p>
                  </div>
                </div>

                {/* Photo Gallery Preview */}
                <div className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE6E1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>{lang === 'km' ? 'កម្រងរូបភាពវិចិត្រសាល' : 'Photo Gallery'}</span>
                    </span>
                    <span className="text-[10px] text-purple-700 font-medium px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200">
                      {(c.galleryPhotos || []).length} {lang === 'km' ? 'រូបភាព' : 'photos'}
                    </span>
                  </div>

                  {(c.galleryPhotos && c.galleryPhotos.length > 0) ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {c.galleryPhotos.slice(0, 4).map((photo, pIdx) => (
                        <div 
                          key={pIdx} 
                          onClick={() => setAdminGalleryLightbox(photo)}
                          className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer group hover:border-[#D4AF37] transition-all"
                        >
                          <img src={photo} alt={`Gallery ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {pIdx === 3 && c.galleryPhotos.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                              +{c.galleryPhotos.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 py-2 font-battambang">
                      {lang === 'km' ? 'មិនទាន់មានរូបភាពក្នុងវិចិត្រសាលនៅឡើយទេ។' : 'No gallery photos added yet.'}
                    </p>
                  )}
                </div>

                {/* Music Track Info Badge */}
                <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const track = musicTracks.find(t => t.titleKh === c.customTheme?.musicTrack || t.titleEn === c.customTheme?.musicTrack);
                        const trackId = track?.id || `couple_${c.id}`;
                        handleTogglePlayMusic(trackId, c.customTheme?.musicUrl || track?.audioUrl);
                      }}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        playingTrackId === (musicTracks.find(t => t.titleKh === c.customTheme?.musicTrack || t.titleEn === c.customTheme?.musicTrack)?.id || `couple_${c.id}`)
                          ? 'bg-[#D4AF37] text-white animate-pulse'
                          : 'bg-white text-[#8C6D1F] border border-amber-300 hover:bg-amber-100'
                      }`}
                      title="Play/Pause Melody Preview"
                    >
                      {playingTrackId === (musicTracks.find(t => t.titleKh === c.customTheme?.musicTrack || t.titleEn === c.customTheme?.musicTrack)?.id || `couple_${c.id}`) ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase text-amber-800 font-medium block">
                        {lang === 'km' ? 'បទភ្លេងការ' : 'Music Track'}
                      </span>
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {c.customTheme?.musicTrack || 'Nevermind Wedding Melody'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.customTheme?.enableMusic !== false 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.customTheme?.enableMusic !== false ? (lang === 'km' ? 'បើកភ្លេង' : 'Auto Play') : (lang === 'km' ? 'បិទភ្លេង' : 'Muted')}
                  </span>
                </div>

                {/* Actions Grid */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedDetailCouple(null);
                      setEditingCouple(c);
                    }}
                    className="w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{lang === 'km' ? 'កែប្រែព័ត៌មានលម្អិតមង្គលការ' : 'Edit Wedding Details'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(couplePortalUrl, `modal_couple_${c.id}`)}
                    className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-[#8C6D1F] border border-amber-200 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer"
                  >
                    {copiedId === `modal_couple_${c.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{lang === 'km' ? 'ចម្លង Link ផ្ញើឱ្យកូនកម្លោះក្រមុំ' : 'Copy Couple Portal Link'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyLink(guestInvitationUrl, `modal_guest_${c.id}`)}
                    className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer"
                  >
                    {copiedId === `modal_guest_${c.id}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{lang === 'km' ? 'ចម្លង Link សំបុត្រអញ្ជើញភ្ញៀវ' : 'Copy Guest Invitation Link'}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedDetailCouple(null);
                        onSelectCouple(c.id);
                      }}
                      className="py-2.5 px-3 bg-[#1A1A1A] hover:bg-black text-white rounded-xl flex items-center justify-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'គ្រប់គ្រង Portal' : 'Manage Portal'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDetailCouple(null);
                        requestAppFullscreen();
                        onPreviewCouple(c.id);
                      }}
                      className="py-2.5 px-3 bg-[#D4AF37] hover:bg-[#B8962D] text-white rounded-xl flex items-center justify-center gap-1.5 font-medium cursor-pointer shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{lang === 'km' ? 'មើលធៀប' : 'Preview Live'}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

      {/* Fullscreen Modal for Editing Wedding Details with Tabs */}
      {editingCouple && (
        <AdminCoupleEditorModal
          editingCouple={editingCouple}
          setEditingCouple={setEditingCouple}
          onSave={(updated) => {
            if (updated.cardBackgroundImage?.startsWith('data:')) {
              storeMedia(`cardBg_${updated.id}`, updated.cardBackgroundImage);
            }
            setCouples(prev => prev.map(c => c.id === updated.id ? updated : c));
            setSaveToastMsg(lang === 'km' ? '✓ រក្សាទុកការផ្លាស់ប្តូរបានជោគជ័យ!' : '✓ Changes saved successfully!');
            setTimeout(() => setSaveToastMsg(null), 3000);
            setEditingCouple(null);
          }}
          onPreviewCouple={onPreviewCouple}
          musicTracks={musicTracks}
          allCouples={couples}
          lang={lang}
        />
      )}

      {/* Share / Public Link Guide Modal */}
      <ShareGuideModal
        isOpen={showShareGuide}
        onClose={() => setShowShareGuide(false)}
        lang={lang}
      />

      {/* Delete Couple Confirmation Modal */}
      {coupleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#EAE6E1] shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 font-khmer-title">
                  {lang === 'km' ? 'តើអ្នកពិតជាចង់លុបគូស្នេហ៍នេះ?' : 'Delete This Wedding Couple?'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'km' 
                    ? `កម្មវិធីអាពាហ៍ពិពាហ៍ «${coupleToDelete.groomNameKh} & ${coupleToDelete.brideNameKh}» និងបញ្ជីភ្ញៀវទាំងអស់នឹងត្រូវលុបចេញពីប្រព័ន្ធ។` 
                    : `This wedding and all associated guests/RSVPs will be permanently removed.`}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              ⚠️ {lang === 'km' ? 'សម្គាល់៖ ការលុបនេះមិនអាចត្រឡប់វិញបានទេ!' : 'Note: This action cannot be undone!'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCoupleToDelete(null)}
                className="px-4 py-2.5 text-xs font-normal text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
              >
                {lang === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteCouple(coupleToDelete)}
                className="px-5 py-2.5 text-xs font-normal bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'km' ? 'បាទ/ចាស លុបចេញ' : 'Yes, Delete Couple'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Gallery Photo in Admin Detail */}
      {adminGalleryLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setAdminGalleryLightbox(null)}
        >
          <button 
            type="button"
            className="absolute top-4 right-4 text-white p-2.5 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer"
            onClick={() => setAdminGalleryLightbox(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={adminGalleryLightbox} 
            alt="Enlarged gallery photo" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
};

