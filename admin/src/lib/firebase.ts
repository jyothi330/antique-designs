import { initializeApp, getApps } from 'firebase/app';
import { getAuth }      from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage }   from 'firebase/storage';

// ─────────────────────────────────────────────────────────────────────────────
// Firebase configuration — values come from .env.local (never committed).
// All keys are prefixed with VITE_ so Vite embeds them in the client bundle.
// These are NOT secret — they are the public Firebase project identifiers.
// Access control is enforced by Firebase Security Rules, not by hiding keys.
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/** True when all required env vars are present and non-empty */
export const firebaseConfigured: boolean = REQUIRED_VARS.every(
  k => !!(import.meta.env as Record<string, string>)[k],
);

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              as string,
};

// Only initialise when config is present — prevents crash when .env.local is missing
const app = firebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth    = app ? getAuth(app)      : (null as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db      = app ? getFirestore(app) : (null as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const storage = app ? getStorage(app)   : (null as any);

export default app;
