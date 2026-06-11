import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const initAdmin = () => {
  if (getApps().length > 0) return true;
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
    console.warn('Firebase Admin Private Key is missing or invalid. Admin SDK will not be initialized.');
    return false;
  }

  try {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle newlines in the private key when loaded from env
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    return true;
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    return false;
  }
};

const isInitialized = initAdmin();

// Export getter functions so they throw errors only at runtime if called, not at build time
export const getAdminDb = () => {
  if (!isInitialized) throw new Error('Firebase Admin not initialized');
  return getFirestore();
};

export const getAdminAuth = () => {
  if (!isInitialized) throw new Error('Firebase Admin not initialized');
  return getAuth();
};
