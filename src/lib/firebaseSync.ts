import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firebaseUtils';
import { storeMedia, getMedia } from '../utils/mediaStorage';

const writeTimeouts = new Map<string, NodeJS.Timeout>();

const checkQuotaStatus = (): boolean => {
  try {
    return sessionStorage.getItem('firestore_quota_exceeded') === 'true';
  } catch {
    return false;
  }
};

const markQuotaExceeded = () => {
  try {
    sessionStorage.setItem('firestore_quota_exceeded', 'true');
  } catch {
    // Ignore storage issues
  }
  // Clear any pending queued writes
  writeTimeouts.forEach(timeout => clearTimeout(timeout));
  writeTimeouts.clear();
};

export function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  prev: T[],
  next: T[]
) {
  // Store large media in IndexedDB to prevent localStorage & Firestore quota crashes
  if (collectionName === 'couples') {
    next.forEach((item: any) => {
      if (item.cardBackgroundImage && typeof item.cardBackgroundImage === 'string' && item.cardBackgroundImage.startsWith('data:')) {
        storeMedia(`cardBg_${item.id}`, item.cardBackgroundImage);
      }
      if (item.coverPhoto && typeof item.coverPhoto === 'string' && item.coverPhoto.startsWith('data:') && item.coverPhoto.length > 300000) {
        storeMedia(`coverPhoto_${item.id}`, item.coverPhoto);
      }
    });
  }

  // Always save to localStorage for instant offline-first persistence
  try {
    localStorage.setItem(`e_invitation_${collectionName}_cache`, JSON.stringify(next));
  } catch {
    // If localStorage quota is reached, trim huge data URLs from localStorage copy (safely stored in IndexedDB)
    try {
      const sanitized = next.map((item: any) => {
        if (item.cardBackgroundImage?.length > 100000) {
          return { ...item, cardBackgroundImage: '' };
        }
        return item;
      });
      localStorage.setItem(`e_invitation_${collectionName}_cache`, JSON.stringify(sanitized));
    } catch {
      // Ignore if still full
    }
  }

  // If quota was already exceeded today, avoid triggering repeated failing writes
  if (checkQuotaStatus()) {
    return;
  }

  // Find added or updated items
  for (const item of next) {
    const prevItem = prev.find(p => p.id === item.id);
    if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
      const docPath = `${collectionName}/${item.id}`;
      
      if (writeTimeouts.has(docPath)) {
        clearTimeout(writeTimeouts.get(docPath)!);
      }
      
      const timeout = setTimeout(() => {
        if (checkQuotaStatus()) return;

        // Prevent Firestore 1MB document rejection if item has large base64 GIF/media
        let itemToSync: any = { ...item };
        const jsonLength = JSON.stringify(itemToSync).length;
        if (jsonLength > 750000) {
          if (itemToSync.cardBackgroundImage?.startsWith('data:') && itemToSync.cardBackgroundImage.length > 300000) {
            itemToSync.cardBackgroundImage = '';
          }
          if (itemToSync.coverPhoto?.startsWith('data:') && itemToSync.coverPhoto.length > 300000) {
            itemToSync.coverPhoto = '';
          }
        }

        setDoc(doc(db, collectionName, item.id), itemToSync).catch(err => {
          const msg = err?.message || String(err);
          if (msg.includes('Quota exceeded') || (err as any)?.code === 'resource-exhausted') {
            markQuotaExceeded();
            console.warn(`[Firestore Quota Notice] Free daily write quota reached for ${collectionName}. Using local browser storage until quota reset.`);
          } else if (msg.toLowerCase().includes('permission') || (err as any)?.code === 'permission-denied') {
            handleFirestoreError(err, OperationType.WRITE, docPath);
          } else {
            console.warn(`Firestore write deferred for ${docPath}:`, msg);
          }
        });
        writeTimeouts.delete(docPath);
      }, 2500);
      
      writeTimeouts.set(docPath, timeout);
    }
  }

  // Find removed items
  for (const prevItem of prev) {
    if (!next.find(n => n.id === prevItem.id)) {
      const docPath = `${collectionName}/${prevItem.id}`;
      if (writeTimeouts.has(docPath)) {
        clearTimeout(writeTimeouts.get(docPath)!);
        writeTimeouts.delete(docPath);
      }

      if (checkQuotaStatus()) return;

      deleteDoc(doc(db, collectionName, prevItem.id)).catch(err => {
        const msg = err?.message || String(err);
        if (msg.includes('Quota exceeded') || (err as any)?.code === 'resource-exhausted') {
          markQuotaExceeded();
          console.warn(`[Firestore Quota Notice] Free daily write quota reached.`);
        } else if (msg.toLowerCase().includes('permission') || (err as any)?.code === 'permission-denied') {
          handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${prevItem.id}`);
        } else {
          console.warn(`Firestore delete deferred for ${collectionName}/${prevItem.id}:`, msg);
        }
      });
    }
  }
}

/**
 * Direct document deletion from Firestore with error handling
 */
export async function deleteDocumentFromFirestore(collectionName: string, id: string): Promise<void> {
  const docPath = `${collectionName}/${id}`;
  if (writeTimeouts.has(docPath)) {
    clearTimeout(writeTimeouts.get(docPath)!);
    writeTimeouts.delete(docPath);
  }

  // Record in deleted tracking in localStorage
  try {
    if (collectionName === 'couples') {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_couple_ids') || '[]');
      if (!deletedIds.includes(id)) {
        localStorage.setItem('deleted_couple_ids', JSON.stringify([...deletedIds, id]));
      }
    } else if (collectionName === 'templates') {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
      if (!deletedIds.includes(id)) {
        localStorage.setItem('deleted_template_ids', JSON.stringify([...deletedIds, id]));
      }
    } else if (collectionName === 'musicTracks') {
      const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_music_track_ids') || '[]');
      if (!deletedIds.includes(id)) {
        localStorage.setItem('deleted_music_track_ids', JSON.stringify([...deletedIds, id]));
      }
    }
  } catch {}

  // Remove from local cache immediately
  try {
    const cached = localStorage.getItem(`e_invitation_${collectionName}_cache`);
    if (cached) {
      const list = JSON.parse(cached);
      if (Array.isArray(list)) {
        const updated = list.filter((item: any) => item.id !== id);
        localStorage.setItem(`e_invitation_${collectionName}_cache`, JSON.stringify(updated));
      }
    }
  } catch {}

  // Delete from Firestore
  try {
    if (!checkQuotaStatus()) {
      await deleteDoc(doc(db, collectionName, id));
    }
  } catch (err) {
    console.warn(`Firestore direct delete failed for ${collectionName}/${id}:`, err);
  }
}

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onData: (data: T[]) => void
) {
  // Read from local cache first if available
  try {
    const cached = localStorage.getItem(`e_invitation_${collectionName}_cache`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let deletedIds: string[] = [];
        try {
          if (collectionName === 'couples') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_couple_ids') || '[]');
          } else if (collectionName === 'templates') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
          } else if (collectionName === 'musicTracks') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_music_track_ids') || '[]');
          }
        } catch {}
        const filtered = parsed.filter(item => !deletedIds.includes(item.id));
        if (filtered.length > 0) {
          onData(filtered);
        }
      }
    }
  } catch {
    // Ignore cache parse error
  }

  // If quota is known to be exhausted, return noop unsubscribe
  if (checkQuotaStatus()) {
    return () => {};
  }

  try {
    return onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });

        // Filter out any explicitly deleted IDs
        let deletedIds: string[] = [];
        try {
          if (collectionName === 'couples') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_couple_ids') || '[]');
          } else if (collectionName === 'templates') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_template_ids') || '[]');
          } else if (collectionName === 'musicTracks') {
            deletedIds = JSON.parse(localStorage.getItem('deleted_music_track_ids') || '[]');
          }
        } catch {}

        let finalData = items.filter(item => !deletedIds.includes(item.id));

        // Merge large media fields for items that ACTUALLY exist in Firestore
        // (CRITICAL: Do NOT resurrect deleted items that are absent in Firestore!)
        try {
          const cached = localStorage.getItem(`e_invitation_${collectionName}_cache`);
          if (cached) {
            const cachedItems: T[] = JSON.parse(cached);
            if (Array.isArray(cachedItems) && cachedItems.length > 0) {
              const map = new Map<string, T>();
              finalData.forEach(i => map.set(i.id, i));
              cachedItems.forEach(c => {
                const remote = map.get(c.id);
                if (remote && !deletedIds.includes(c.id)) {
                  if (JSON.stringify(c).length > JSON.stringify(remote).length) {
                    map.set(c.id, { ...remote, ...c });
                  }
                }
              });
              finalData = Array.from(map.values()).filter(i => !deletedIds.includes(i.id));
            }
          }
        } catch {
          // Ignore merge errors
        }

        if (finalData.length > 0) {
          try {
            localStorage.setItem(`e_invitation_${collectionName}_cache`, JSON.stringify(finalData));
          } catch {
            // Ignore storage full
          }

          if (collectionName === 'couples') {
            Promise.all(
              finalData.map(async (c: any) => {
                if (!c.cardBackgroundImage || c.cardBackgroundImage.length < 50) {
                  const storedCardBg = await getMedia(`cardBg_${c.id}`);
                  if (storedCardBg) {
                    return { ...c, cardBackgroundImage: storedCardBg };
                  }
                }
                return c;
              })
            ).then(enriched => {
              onData(enriched as T[]);
            }).catch(() => {
              onData(finalData);
            });
          } else {
            onData(finalData);
          }
        }
      },
      (error) => {
        const msg = error?.message || String(error);
        if (msg.includes('Quota exceeded') || (error as any)?.code === 'resource-exhausted') {
          markQuotaExceeded();
          console.warn(`[Firestore Quota Notice] Free daily read quota reached for ${collectionName}. Serving data from local cache.`);
        } else {
          try {
            handleFirestoreError(error, OperationType.GET, collectionName);
          } catch (e) {
            console.warn(`Firestore sync note for ${collectionName} (falling back to initial data):`, msg);
          }
        }
      }
    );
  } catch (err) {
    console.warn(`Firestore onSnapshot could not attach for ${collectionName}:`, err);
    return () => {};
  }
}
