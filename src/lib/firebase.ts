import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal Firestore network connection warnings
try {
  setLogLevel('error');
} catch {}

const app = initializeApp(firebaseConfig);

const databaseId = (firebaseConfig as any).firestoreDatabaseId || undefined;

export const db = initializeFirestore(
  app,
  {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  },
  databaseId
);

export const auth = getAuth(app);
