import { Template, CoupleEvent, UserAccount, MusicTrack, AgendaItem } from '../types';
import weddingArtwork368 from '../assets/images/frome1.jpg';
import weddingArtworkClassic from '../assets/images/frome.jpg';
import loveArtwork from '../assets/images/love.png';
import ponleuLogo from '../assets/images/ponleu_logo.svg';

export const INITIAL_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-dropbox-1',
    titleKh: 'បទភ្លេងខ្មែរ - Nevermind (Dropbox Audio)',
    titleEn: 'Nevermind Wedding Melody (Dropbox MP3)',
    category: 'Acoustic Pop',
    audioUrl: 'https://www.dropbox.com/scl/fi/3oalpe6pzgdv6b06wsdkp/Nevermind_.mp3?rlkey=kq8y5ost2drgdedwb1wu00sbm&st=cmuq3ccb&dl=0',
    duration: '3:45',
    isPopular: true
  },
  {
    id: 'track-1',
    titleKh: 'ភ្លេងការខ្មែរ - បង្កក់សិរី (Khmer Classical Chimes)',
    titleEn: 'Khmer Classical Chimes - Bongkok Serei',
    category: 'ភ្លេងការបុរាណ',
    duration: '4:15',
    isPopular: true
  },
  {
    id: 'track-2',
    titleKh: 'ភ្លេងការខ្មែរ - របាំបក់ផ្សែង (Royal Lavender Chimes)',
    titleEn: 'Royal Lavender Chimes - Robam Bok Phsaeng',
    category: 'ភ្លេងការបុរាណ',
    duration: '3:50',
    isPopular: true
  },
  {
    id: 'track-3',
    titleKh: 'ភ្លេងការសម័យ - កម្រងផ្កាកុលាប (Blush Rose Piano)',
    titleEn: 'Blush Rose Piano Melody',
    category: 'ភ្លេងការសម័យ',
    duration: '3:30',
    isPopular: true
  },
  {
    id: 'track-4',
    titleKh: 'ភ្លេងពិណពាទ្យ - មង្គលសិរី (Royal Pinpeat Orchestra)',
    titleEn: 'Royal Pinpeat Wedding Symphony',
    category: 'ភ្លេងពិណពាទ្យ',
    duration: '5:10'
  },
  {
    id: 'track-5',
    titleKh: 'ភ្លេង Acoustic - ក្តីស្រឡាញ់ដ៏ស្មោះ (Acoustic Guitar Romance)',
    titleEn: 'Acoustic Guitar Romance',
    category: 'Acoustic Pop',
    duration: '3:15'
  }
];

// Whitelist of template codes and IDs supported by components in src/components/Guest/templates/
export const SUPPORTED_TEMPLATE_IDS = [
  'tpl_gold_01',
  'tpl_02',
  'tpl_new_custom',
] as const;

export const isTemplateSupported = (t?: { id?: string; code?: string } | null): boolean => {
  if (!t) return false;
  const id = t.id || '';
  const code = t.code || '';
  return (
    id === 'tpl_gold_01' || code === 'T01' || code === 'T001' ||
    id === 'tpl_02' || code === 'T02' ||
    id === 'tpl_new_custom' || code === 'T_CUSTOM'
  );
};

export const INITIAL_TEMPLATES: Template[] = [
  {
    id: 'tpl_gold_01',
    code: 'T01',
    nameKh: 'រំដួល ០០១ (Classic Gold)',
    nameEn: 'T01_Classic Khmer Royal Gold',
    style: 'traditional-gold',
    badge: 'ពេញនិយមបំផុត',
    coverImage: weddingArtworkClassic,
    previewImage: weddingArtworkClassic,
    primaryColor: '#D4AF37',
    accentColor: '#8C6D1F',
    bgGradient: 'from-[#FCF8EE] via-[#FDFCFB] to-[#F5EBD0]',
    fontFamily: 'Moul',
    descriptionKh: 'រចនាប័ទ្មបែបប្រពៃណីខ្មែរ រំលេចដោយក្បូរក្បាច់មាសលឿងទុំ និងស៊ុមរាជវាំងដ៏ឧត្តុង្គឧត្តម។',
    descriptionEn: 'Timeless traditional Cambodian royal theme with regal golden flourishes and intricate borders.',
    musicTrackTitle: 'ភ្លេងការខ្មែរ - បង្កក់សិរី',
    usageCount: 148,
    tags: ['ប្រពៃណីខ្មែរ', 'ក្បូរក្បាច់មាស', 'ពេញនិយម'],
    isPopular: true,
  },
  {
    id: 'tpl_02',
    code: 'T02',
    nameKh: 'រំដួល ០០២ (Classic Gold V2)',
    nameEn: 'T02_Classic Khmer Royal Gold V2',
    style: 'traditional-gold',
    badge: 'ថ្មី',
    coverImage: weddingArtworkClassic,
    previewImage: weddingArtworkClassic,
    primaryColor: '#D4AF37',
    accentColor: '#8C6D1F',
    bgGradient: 'from-[#FCF8EE] via-[#FDFCFB] to-[#F5EBD0]',
    fontFamily: 'Moul',
    descriptionKh: 'រចនាប័ទ្មបែបប្រពៃណីខ្មែរ ជំនាន់ទី២ ដែលមានការរចនាឈ្មោះភ្ញៀវកាន់តែស្រស់ស្អាត។',
    descriptionEn: 'Traditional Cambodian theme version 2 with enhanced guest name display.',
    musicTrackTitle: 'ភ្លេងការខ្មែរ - បង្កក់សិរី',
    usageCount: 0,
    tags: ['ប្រពៃណីខ្មែរ', 'ក្បូរក្បាច់មាស', 'ជំនាន់ថ្មី'],
  },
  {
    id: 'tpl_new_custom',
    code: 'T_CUSTOM',
    nameKh: 'រំដួល ០០៣ (Custom)',
    nameEn: 'T_Custom_Minimal',
    style: 'modern-ivory',
    coverImage: weddingArtworkClassic,
    previewImage: weddingArtworkClassic,
    primaryColor: '#8C6D1F',
    accentColor: '#D4AF37',
    bgGradient: 'from-[#F9F7F2] to-[#FFFFFF]',
    fontFamily: 'Kantumruy',
    descriptionKh: 'រចនាប័ទ្មបែបសាមញ្ញ ស្រស់ស្អាត និងមានភាពទាក់ទាញខ្លាំង។',
    descriptionEn: 'Minimalist and clean modern design with subtle ivory and gold tones.',
    musicTrackTitle: 'Acoustic Guitar Romance',
    usageCount: 62,
    tags: ['សាមញ្ញ', 'ស្រស់ស្អាត'],
  }
];

export const DEFAULT_WEDDING_AGENDAS: AgendaItem[] = [
  // កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦
  {
    id: 'ag_d1_1',
    day: 1,
    time: 'ម៉ោង ០២:០០ រសៀល',
    titleKh: 'ពិធីសែនក្រុងពាលី',
    titleEn: 'Krong Pali Blessing Ceremony',
    icon: 'clock'
  },
  {
    id: 'ag_d1_2',
    day: 1,
    time: 'ម៉ោង ០៣:០០ រសៀល',
    titleKh: 'ពិធីកាត់សក់បង្កក់សិរី កូនប្រុស-កូនស្រី',
    titleEn: 'Hair Cutting & Cleansing Ceremony',
    icon: 'scissors'
  },
  {
    id: 'ag_d1_3',
    day: 1,
    time: 'ម៉ោង ០៥:០០ រសៀល',
    titleKh: 'ពិធីសូត្រមន្តចម្រើនព្រះបរិត្ត',
    titleEn: 'Buddhist Monks Chanting Ceremony',
    icon: 'heart'
  },
  {
    id: 'ag_d1_4',
    day: 1,
    time: 'ម៉ោង ០៦:០០ ល្ងាច',
    titleKh: 'អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារពេលល្ងាច',
    titleEn: 'Evening Welcome Dinner for Guests',
    icon: 'utensils'
  },

  // កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦
  {
    id: 'ag_d2_1',
    day: 2,
    time: 'ម៉ោង ០៦:៣០ ព្រឹក',
    titleKh: 'ជួបជុំភ្ញៀវកិត្តិយសរៀបចំពិធីហែជំនូន',
    titleEn: 'Morning Gathering for Procession',
    icon: 'sun'
  },
  {
    id: 'ag_d2_2',
    day: 2,
    time: 'ម៉ោង ០៧:០០ ព្រឹក',
    titleKh: 'ពិធីហែជំនូន (កំណត់) ជូនផ្កាស្លា',
    titleEn: 'Traditional Gift Procession & Areca Offering',
    icon: 'heart'
  },
  {
    id: 'ag_d2_3',
    day: 2,
    time: 'ម៉ោង ០៧:៣០ ព្រឹក',
    titleKh: 'អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារពេលព្រឹក',
    titleEn: 'Breakfast Feast for Honorable Guests',
    icon: 'utensils'
  },
  {
    id: 'ag_d2_4',
    day: 2,
    time: 'ម៉ោង ០៨:០០ ព្រឹក',
    titleKh: 'ពិធីពិសាស្លាកំណត់',
    titleEn: 'Pisa Sla Kamnot Ceremony',
    icon: 'heart'
  },
  {
    id: 'ag_d2_5',
    day: 2,
    time: 'ម៉ោង ០៨:៣០ ព្រឹក',
    titleKh: 'ពិធីបំពាក់ចិញ្ចៀន',
    titleEn: 'Ring Exchange Ceremony',
    icon: 'heart'
  },
  {
    id: 'ag_d2_6',
    day: 2,
    time: 'ម៉ោង ១០:០០ ព្រឹក',
    titleKh: 'ពិធីសែនផ្ទឹម ពិធីចងដៃ បង្វិលពពិល',
    titleEn: 'Popil Rotating, Knot Tying & Blessing Ceremony',
    icon: 'heart'
  },
  {
    id: 'ag_d2_7',
    day: 2,
    time: 'ម៉ោង ១១:០០ ថ្ងៃត្រង់',
    titleKh: 'ទទួលភ្ញៀវកិត្តិយសពិសាអាហារ',
    titleEn: 'Wedding Reception Feast',
    icon: 'utensils'
  }
];

export const DEFAULT_ADMIN_PROMO_FOOTER = {
  adminPromo: {
    enabled: true,
    textKh: 'រៀបចំដោយ ពន្លឺ-បោះពុម្ភ / ទំនាក់ទំនង៖ 097 370 7998',
    imageUrl: ponleuLogo
  },
  contactFacebook: 'https://facebook.com/',
  contactTelegram: 'https://t.me/username',
  contactPhone: '097 370 7998',
  contactLocation: 'https://maps.google.com/?q=Siem+Reap+Cambodia',
  contactLocationName: 'ទីតាំងហាងទី១',
  contactLocation2: '',
  contactLocationName2: 'ទីតាំងហាងទី២'
};

export const INITIAL_COUPLES: CoupleEvent[] = [
  {
    id: 'couple_368',
    slug: 'vibol-socheata',
    groomNameKh: 'រ័ត្ន វិបុល',
    groomNameEn: 'Rath Vibol',
    brideNameKh: 'អ៊ុក សុជាតា',
    brideNameEn: 'Ouk Socheata',
    groomNickKh: 'វិបុល',
    brideNickKh: 'សុជាតា',

    groomFatherKh: 'លោក រ័ត្ន សុផល',
    groomMotherKh: 'លោកស្រី ម៉ៅ សារី',
    brideFatherKh: 'លោក អ៊ុក សារឿន',
    brideMotherKh: 'លោកស្រី ឃិន ចន្ថា',
    groomFatherEn: 'Mr. Rath Sophal',
    groomMotherEn: 'Mrs. Mao Sary',
    brideFatherEn: 'Mr. Ouk Saroeun',
    brideMotherEn: 'Mrs. Khin Chantha',

    weddingDate: 'ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    weddingDateKh: 'ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    weddingTimeKh: 'វេលាម៉ោង ១១:០០ ថ្ងៃត្រង់',
    weddingTimeEn: 'From 11:00 AM onwards',
    auspiciousTextKh: 'ត្រូវនឹងថ្ងៃ ៤រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០',

    venueNameKh: 'កេហដ្ឋានខាងស្រី',
    venueNameEn: 'Bride Residence',
    venueAddressKh: 'ភូមិរំដេង ឃុំខ្នារពោធិ ស្រុកសូទ្រនិគ ខេត្តសៀមរាប។',
    venueAddressEn: 'Romdeng Village, Khnar Pou Commune, Sotnikum District, Siem Reap Province',
    venueMapUrl: 'https://maps.google.com/?q=Siem+Reap+Cambodia',
    venueMapImage: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124376.12648792036!2d103.7844054!3d13.3617852!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3110168b9be57667%3A0xf63989c4457636e0!2sSiem%20Reap!5e0!3m2!1sen!2skh!4v1700000000000',

    templateId: 'tpl_gold_01',
    customTheme: {
      primaryColor: '#D4AF37',
      accentColor: '#8C6D1F',
      enablePetals: true,
      enableMusic: true,
      musicTrack: 'Khmer Classical Chimes',
      envelopeStyle: 'classic-gold',
      fontFamilyKhmer: 'moul'
    },

    coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    secondaryPhoto: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop',
    ],

    loveStoryKh: '«ក្ដីស្រលាញ់ដែលចាប់ផ្ដើមពីការយល់ចិត្ត ការគោរពគ្នា និងការកសាងអនាគតដ៏ស្រស់បំព្រងជាមួយគ្នា»',
    loveStoryEn: '"Two souls with but a single thought, two hearts that beat as one."',
    weddingQuoteKh: 'វត្តមានដ៏ខ្ពង់ខ្ពស់របស់ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា គឺជាកិត្តិយសដ៏ធំធេង និងជាសិរីមង្គលដ៏ឧត្តុង្គឧត្តមសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។',

    weddingProgramDay1TitleKh: 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    weddingProgramDay2TitleKh: 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    agendas: DEFAULT_WEDDING_AGENDAS,

    bankAccounts: [
      {
        id: 'ba_368_1',
        bankName: 'ABA Bank (KHQR)',
        accountName: 'RATH VIBOL & OUK SOCHEATA',
        accountNumber: '003 688 888 (USD)',
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ABA_PAY_VIBOL_SOCHEATA_USD',
        currency: 'USD'
      }
    ],

    guests: [
      {
        id: 'gst_368_01',
        code: 'VIP888',
        fullNameKh: 'ឯកឧត្តម ជា សុវណ្ណ និងលោកជំទាវ',
        fullNameEn: 'H.E. Chea Sovann & Madam',
        titleKh: 'ឯកឧត្តម',
        titleEn: 'H.E.',
        phone: '012 333 444',
        side: 'mutual',
        category: 'VIP',
        paxExpected: 2,
        tableNumber: 'VIP 01',
        rsvpStatus: 'attending',
        attendeesCount: 2,
        wishMessage: 'សូមជូនពរឱ្យគូស្វាមីភរិយាថ្មី ជួបតែសុភមង្គល ស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង រកស៊ីមានបាន ត្រជាក់ត្រជុំជានិច្ច!',
        rsvpDate: '2026-08-20'
      },
      {
        id: 'gst_368_02',
        code: 'G368',
        fullNameKh: 'លោក សេង វណ្ណា និងភរិយា',
        fullNameEn: 'Mr. Seng Vanna & Wife',
        titleKh: 'លោក',
        titleEn: 'Mr.',
        phone: '098 777 888',
        side: 'groom',
        category: 'Friend',
        paxExpected: 2,
        tableNumber: 'A-05',
        rsvpStatus: 'pending'
      }
    ],

    wishes: [
      {
        id: 'wsh_368_01',
        guestName: 'ឯកឧត្តម ជា សុវណ្ណ និងលោកជំទាវ',
        guestTitle: 'ឯកឧត្តម',
        message: 'សូមជូនពរឱ្យគូស្វាមីភរិយាថ្មី ជួបតែសុភមង្គល ស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង រកស៊ីមានបាន ត្រជាក់ត្រជុំជានិច្ច!',
        date: '2026-08-20',
        attendees: 2,
        isAttending: true,
        side: 'mutual'
      }
    ],

    createdDate: '2026-08-15',
    status: 'active',
    packageType: 'VIP Gold',
    ...DEFAULT_ADMIN_PROMO_FOOTER
  },
  {
    id: 'couple_01',
    slug: 'vireak-sokha',
    groomNameKh: 'ស៊ុន វីរៈ',
    groomNameEn: 'Sun Vireak',
    brideNameKh: 'ជា សុខា',
    brideNameEn: 'Chea Sokha',
    groomNickKh: 'វីរៈ',
    brideNickKh: 'សុខា',

    groomFatherKh: 'លោក ស៊ុន សុខុម',
    groomMotherKh: 'លោកស្រី ង៉ែត សុភាព',
    brideFatherKh: 'លោក ជា វណ្ណៈ',
    brideMotherKh: 'លោកស្រី ម៉ៅ សោភា',

    groomFatherEn: 'Mr. Sun Sokhom',
    groomMotherEn: 'Mrs. Nget Sopheap',
    brideFatherEn: 'Mr. Chea Vannak',
    brideMotherEn: 'Mrs. Mao Sophea',

    weddingDate: '2026-11-28',
    weddingDateKh: 'ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    weddingTimeKh: 'វេលាម៉ោង ១១:០០នាទីថ្ងៃត្រង់ ស្ថិតនៅកេហដ្ឋានខាងស្រី',
    weddingTimeEn: '11:00 AM',
    auspiciousTextKh: 'ត្រូវនឹងថ្ងៃ ៤រោច ខែកត្តិក ឆ្នាំមមី អដ្ឋស័ក ព.ស. ២៥៧០',

    venueNameKh: 'កេហដ្ឋានខាងស្រី',
    venueNameEn: "Bride's Residence",
    venueAddressKh: 'ភូមិរំដេង ឃុំខ្នារពោធិ ស្រុកសូទ្រនិគ ខេត្តសៀមរាប។',
    venueAddressEn: 'Romdeng Village, Khnar Pou Commune, Soutr Nikom District, Siem Reap Province.',
    venueMapUrl: 'https://maps.google.com/?q=Soutr+Nikom+Siem+Reap',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d124376.1554904587!2d104.0534!3d13.2505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3110291e0a2d2165%3A0xc07c3906329486c!2sSoutr%20Nikom%20District!5e0!3m2!1sen!2skh!4v1700000000000',

    templateId: 'tpl_gold_01',
    customTheme: {
      primaryColor: '#D4AF37',
      accentColor: '#8C6D1F',
      enablePetals: true,
      enableMusic: true,
      musicTrack: 'Khmer Classical Chimes',
      envelopeStyle: 'classic-gold',
      fontFamilyKhmer: 'battambang'
    },

    coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop',
    secondaryPhoto: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1000&auto=format&fit=crop',
    galleryPhotos: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop',
    ],

    loveStoryKh: '«ក្ដីស្រលាញ់ដែលចាប់ផ្ដើមពីការយល់ចិត្ត ការគោរពគ្នា និងការកសាងអនាគតដ៏ស្រស់បំព្រងជាមួយគ្នា»',
    loveStoryEn: '"Two souls with but a single thought, two hearts that beat as one."',
    weddingQuoteKh: 'វត្តមានដ៏ខ្ពង់ខ្ពស់របស់ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា គឺជាកិត្តិយសដ៏ធំធេង និងជាសិរីមង្គលដ៏ឧត្តុង្គឧត្តមសម្រាប់គ្រួសារយើងខ្ញុំទាំងពីរ។',

    weddingProgramDay1TitleKh: 'កម្មវិធីទី១ ថ្ងៃសៅរ៍ ទី២៨ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    weddingProgramDay2TitleKh: 'កម្មវិធីទី២ ថ្ងៃអាទិត្យ ទី២៩ ខែវិច្ឆិកា ឆ្នាំ២០២៦',
    agendas: DEFAULT_WEDDING_AGENDAS,

    bankAccounts: [
      {
        id: 'ba_1',
        bankName: 'ABA Bank (KHQR Scan)',
        accountName: 'SUN VIREAK & CHEA SOKHA',
        accountNumber: '001 234 567 (USD)',
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ABA_PAY_SUN_VIREAK_001234567_USD',
        currency: 'USD'
      },
      {
        id: 'ba_2',
        bankName: 'Bakong / ACLEDA',
        accountName: 'SUN VIREAK (ចងដៃជាប្រាក់រៀល)',
        accountNumber: '098 765 432 (KHR)',
        qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=BAKONG_KHQR_SUN_VIREAK_098765432_KHR',
        currency: 'KHR'
      }
    ],

    guests: [
      {
        id: 'gst_01',
        code: 'vip-001',
        titleKh: 'ឯកឧត្តម',
        titleEn: 'H.E.',
        fullNameKh: 'សេង ប៊ុនធឿន និងលោកជំទាវ',
        fullNameEn: 'Seng Bunthoeun & Spouse',
        phone: '012 888 999',
        side: 'groom',
        category: 'VIP',
        paxExpected: 2,
        tableNumber: 'VIP-01',
        rsvpStatus: 'attending',
        attendeesCount: 2,
        wishMessage: 'សូមជូនពរឱ្យក្មួយទាំងពីរទទួលបានសុភមង្គល ស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង និងជោគជ័យគ្រប់ភារកិច្ច!',
        rsvpDate: '2026-10-15',
      },
      {
        id: 'gst_02',
        code: 'fam-002',
        titleKh: 'លោកពូ',
        titleEn: 'Uncle',
        fullNameKh: 'ជា សុវណ្ណ និងអ្នកមីង',
        fullNameEn: 'Chea Sovann & Aunt',
        phone: '017 555 444',
        side: 'bride',
        category: 'Family',
        paxExpected: 4,
        tableNumber: 'A-02',
        rsvpStatus: 'attending',
        attendeesCount: 4,
        wishMessage: 'ពូមីងសូមជូនពរក្មួយស្រីសុខា និងក្មួយប្រុសវីរៈ មានតែសេចក្តីសុខ សេចក្តីចម្រើន រកស៊ីមានបាន!',
        rsvpDate: '2026-10-18',
      },
      {
        id: 'gst_03',
        code: 'frd-003',
        titleKh: 'លោក',
        titleEn: 'Mr.',
        fullNameKh: 'រតនា ចាន់ឌី',
        fullNameEn: 'Rathana Chandy',
        phone: '093 222 333',
        side: 'groom',
        category: 'Friend',
        paxExpected: 2,
        tableNumber: 'B-05',
        rsvpStatus: 'attending',
        attendeesCount: 2,
        wishMessage: 'Congratulations my best brother! Wish you two endless love and happy family.',
        rsvpDate: '2026-10-20',
      },
      {
        id: 'gst_04',
        code: 'col-004',
        titleKh: 'កញ្ញា',
        titleEn: 'Ms.',
        fullNameKh: 'លីណា សុភ័ក្រ្ត',
        fullNameEn: 'Lina Sopheak',
        phone: '070 111 222',
        side: 'bride',
        category: 'Colleague',
        paxExpected: 1,
        tableNumber: 'C-08',
        rsvpStatus: 'pending'
      },
      {
        id: 'gst_05',
        code: 'vip-005',
        titleKh: 'លោកជំទាវ',
        titleEn: 'Lok Chumteav',
        fullNameKh: 'កែវ ពិសី',
        fullNameEn: 'Keo Pisey',
        phone: '011 777 666',
        side: 'mutual',
        category: 'VIP',
        paxExpected: 2,
        tableNumber: 'VIP-02',
        rsvpStatus: 'pending'
      }
    ],

    wishes: [
      {
        id: 'wsh_01',
        guestName: 'ឯកឧត្តម សេង ប៊ុនធឿន និងលោកជំទាវ',
        guestTitle: 'ឯកឧត្តម',
        message: 'សូមជូនពរឱ្យក្មួយទាំងពីរទទួលបានសុភមង្គល ស្រឡាញ់គ្នារហូតដល់ចាស់កោងខ្នង និងជោគជ័យគ្រប់ភារកិច្ច!',
        date: '១៥ តុលា ២០២៦',
        attendees: 2,
        isAttending: true,
        side: 'groom'
      },
      {
        id: 'wsh_02',
        guestName: 'លោកពូ ជា សុវណ្ណ និងអ្នកមីង',
        guestTitle: 'លោកពូ',
        message: 'ពូមីងសូមជូនពរក្មួយស្រីសុខា និងក្មួយប្រុសវីរៈ មានតែសេចក្តីសុខ សេចក្តីចម្រើន រកស៊ីមានបាន!',
        date: '១៨ តុលា ២០២៦',
        attendees: 4,
        isAttending: true,
        side: 'bride'
      },
      {
        id: 'wsh_03',
        guestName: 'រតនា ចាន់ឌី (មិត្តភក្តិ)',
        guestTitle: 'លោក',
        message: 'Congratulations brother Vireak & Sokha! Wish you endless blessings and cute babies soon! 🍾✨',
        date: '២០ តុលា ២០២៦',
        attendees: 2,
        isAttending: true,
        side: 'groom'
      }
    ],

    createdDate: '2026-08-01',
    status: 'active',
    packageType: 'VIP Gold',
    adminNotes: 'កញ្ចប់សេវា VIP Gold រួមបញ្ចូល QR Code ចងដៃ និងបទភ្លេងកែសម្រួលតាមចិត្ត',
    ...DEFAULT_ADMIN_PROMO_FOOTER
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'Admin E-Theap Pro',
    role: 'admin',
    email: 'admin@e-invitation.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'usr_couple_01',
    username: 'vireak.sokha',
    name: 'សុខា & វីរៈ',
    role: 'couple',
    coupleId: 'couple_01',
    email: 'vireak.sokha@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200&auto=format&fit=crop'
  }
];
