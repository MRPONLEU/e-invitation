// Centralized URL Helper for E-Invitation and Couple Portals
// Prevents Google 403 Forbidden errors when sharing links from development sandbox

const STORAGE_CUSTOM_URL_KEY = 'wedding_custom_public_url_v1';
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(STORAGE_CUSTOM_URL_KEY);
    if (stored && (stored.includes('run.app') || stored.includes('ais-pre-') || stored.includes('ais-dev-'))) {
      localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    }
  } catch {}
}
export const DEFAULT_SHARED_APP_URL = 'https://ponleu-e-invitation.vercel.app';

/**
 * Check if the current origin or URL is a private developer sandbox that requires Google account authentication
 */
export function isPrivateDevEnvironment(url?: string): boolean {
  try {
    const target = url || (typeof window !== 'undefined' ? window.location.origin : '');
    return (
      target.includes('ais-dev-') || 
      target.includes('aistudio.google.com') || 
      target.includes('localhost') || 
      target.includes('127.0.0.1')
    );
  } catch {
    return false;
  }
}

/**
 * Get user configured public domain or default public URL
 */
export function getStoredCustomBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_CUSTOM_URL_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCustomBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed) {
      localStorage.setItem(STORAGE_CUSTOM_URL_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_CUSTOM_URL_KEY);
    }
  } catch (err) {
    console.warn('Failed to save custom base url', err);
  }
}

/**
 * Get the best public-accessible Base URL for guests and couples
 */
export function getAppBaseUrl(): string {
  if (typeof window === 'undefined') return 'https://ponleu-e-invitation.vercel.app';
  
  // 1. If user specified a custom domain (excluding run.app)
  const custom = getStoredCustomBaseUrl();
  if (custom && !custom.includes('run.app')) return custom;

  // 2. Always use the official production domain for guest sharing
  return 'https://ponleu-e-invitation.vercel.app';
}

/**
 * Generate full guest invitation link using unique Couple ID (or slug)
 */
export function getGuestInvitationUrl(coupleIdOrSlug: string, guestCode?: string): string {
  const base = getAppBaseUrl();
  const cleanId = encodeURIComponent((coupleIdOrSlug || '').trim());
  if (guestCode) {
    return `${base}/?c=${cleanId}&guest=${encodeURIComponent(guestCode.trim())}`;
  }
  return `${base}/?c=${cleanId}`;
}

/**
 * Generate full couple portal management link using unique Couple ID (or slug)
 */
export function getCouplePortalUrl(coupleIdOrSlug: string): string {
  const base = getAppBaseUrl();
  const cleanId = encodeURIComponent((coupleIdOrSlug || '').trim());
  return `${base}/#manage/${cleanId}`;
}

/**
 * Format video URL for direct HTML5 video playback
 * Supports Dropbox links (converts dl=0 to raw=1) and Google Drive video stream
 */
export function formatVideoUrl(url?: string): string {
  if (!url) return '';
  let clean = url.trim();

  // 1. Dropbox link conversion
  if (clean.includes('dropbox.com')) {
    if (clean.includes('dl=0')) {
      return clean.replace('dl=0', 'raw=1');
    }
    if (!clean.includes('raw=1')) {
      return clean.includes('?') ? `${clean}&raw=1` : `${clean}?raw=1`;
    }
  }

  // 2. Google Drive video conversion via proxy to bypass CORS and Cross-Origin-Resource-Policy restrictions
  if (clean.includes('drive.google.com') || clean.includes('drive.usercontent.google.com')) {
    const fileIdMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `/api/video-proxy?id=${fileIdMatch[1]}`;
    }
  }

  return clean;
}
