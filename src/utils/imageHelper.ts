/**
 * Formats and converts image URLs from Google Drive, Dropbox, and other cloud providers
 * into direct, raw image URLs that load reliably inside <img> elements.
 */
export const formatImageUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  let cleanUrl = url.trim();

  // 1. Google Drive URLs
  // Patterns:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://drive.google.com/uc?export=view&id=FILE_ID
  if (cleanUrl.includes('drive.google.com')) {
    const fileIdMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                        cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // Google User Content CDN (lh3.googleusercontent.com/d/ID) is the standard high-speed direct CDN
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 2. Dropbox links (change dl=0 to raw=1 for direct image stream)
  if (cleanUrl.includes('dropbox.com')) {
    if (cleanUrl.includes('dl=0')) {
      return cleanUrl.replace('dl=0', 'raw=1');
    }
    if (!cleanUrl.includes('raw=1') && !cleanUrl.includes('dl=1')) {
      return cleanUrl.includes('?') ? `${cleanUrl}&raw=1` : `${cleanUrl}?raw=1`;
    }
  }

  // 3. OneDrive links
  if (cleanUrl.includes('1drv.ms') || cleanUrl.includes('onedrive.live.com')) {
    if (cleanUrl.includes('redir?')) {
      return cleanUrl.replace('redir?', 'download?');
    }
  }

  return cleanUrl;
};

/**
 * Robust error fallback for Google Drive images and broken URLs
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop'
) => {
  const target = e.target as HTMLImageElement;
  const currentSrc = target.src;
  if (currentSrc.includes('lh3.googleusercontent.com/d/')) {
    const fileId = currentSrc.split('/d/')[1]?.split('=')[0]?.split('?')[0];
    if (fileId) {
      target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
      return;
    }
  }
  if (currentSrc.includes('drive.google.com/thumbnail?id=')) {
    const fileIdMatch = currentSrc.match(/id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      target.src = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      return;
    }
  }
  if (fallbackSrc) {
    target.src = fallbackSrc;
  }
};

/**
 * Compresses an image file directly in the browser to optimize speed,
 * performance, and minimize storage size to the smallest footprint (<60KB-80KB)
 * while keeping crystal-clear visual clarity for mobile e-wedding invitations.
 */
export const compressImageFile = (
  file: File, 
  maxWidth = 960, 
  maxHeight = 960, 
  quality = 0.72
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('Invalid image file'));
    }

    const isGif = file.type === 'image/gif' || 
                  file.name.toLowerCase().endsWith('.gif') || 
                  file.type.includes('gif');

    if (!file.type.startsWith('image/') && !isGif) {
      return reject(new Error('Invalid image file'));
    }

    // ALWAYS preserve animated GIFs without canvas conversion so animation is never lost
    if (isGif) {
      const gifReader = new FileReader();
      gifReader.onerror = () => reject(new Error('Failed to read GIF file'));
      gifReader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          resolve(e.target.result);
        } else {
          reject(new Error('Failed to parse GIF content'));
        }
      };
      gifReader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let currentWidth = img.width;
        let currentHeight = img.height;

        if (currentWidth > maxWidth || currentHeight > maxHeight) {
          if (currentWidth / currentHeight > maxWidth / maxHeight) {
            currentHeight = Math.round((currentHeight * maxWidth) / currentWidth);
            currentWidth = maxWidth;
          } else {
            currentWidth = Math.round((currentWidth * maxHeight) / currentHeight);
            currentHeight = maxHeight;
          }
        }

        const renderCanvas = (w: number, h: number, q: number): string => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return '';

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          // WebP format produces 30-50% smaller payloads than JPEG with identical visual quality
          try {
            const webpData = canvas.toDataURL('image/webp', q);
            if (webpData && webpData.startsWith('data:image/webp')) {
              return webpData;
            }
          } catch {
            // Ignore
          }

          return canvas.toDataURL('image/jpeg', q);
        };

        // First pass compression
        let result = renderCanvas(currentWidth, currentHeight, quality);

        // Aggressive multi-tier auto-compression to ensure the smallest footprint (<75KB)
        // for instant loading on mobile devices, fast uploads, and zero Firestore quota issues
        if (result && result.length > 100000) {
          const targetW = Math.round(currentWidth * 0.85);
          const targetH = Math.round(currentHeight * 0.85);
          const secondPass = renderCanvas(targetW, targetH, Math.max(0.62, quality - 0.10));
          if (secondPass && secondPass.length < result.length) {
            result = secondPass;
          }
        }

        if (result && result.length > 85000) {
          const maxDim = 680;
          let w3 = currentWidth;
          let h3 = currentHeight;
          if (w3 > maxDim || h3 > maxDim) {
            if (w3 > h3) {
              h3 = Math.round((h3 * maxDim) / w3);
              w3 = maxDim;
            } else {
              w3 = Math.round((w3 * maxDim) / h3);
              h3 = maxDim;
            }
          }
          const thirdPass = renderCanvas(w3, h3, 0.58);
          if (thirdPass && thirdPass.length < result.length) {
            result = thirdPass;
          }
        }

        resolve(result || (e.target?.result as string));
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
};
