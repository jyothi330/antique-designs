import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db }    from './firebase';
import type { UserProfile } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Sign in with email + password
// Throws FirebaseError — let the caller handle and display the message.
// ─────────────────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sign out the current user
// ─────────────────────────────────────────────────────────────────────────────
export async function logOut() {
  return signOut(auth);
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a password-reset email
// ─────────────────────────────────────────────────────────────────────────────
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch the Firestore user profile for a given Firebase Auth user.
// Returns null if the document does not exist (unprovisioned account).
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscribe to Firebase Auth state changes.
// Returns the unsubscribe function.
// ─────────────────────────────────────────────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────────────────────────────────────
// Map Firebase error codes to human-readable messages
// ─────────────────────────────────────────────────────────────────────────────
export function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-credential':      'Invalid email or password. Please try again.',
    'auth/user-not-found':          'No account found with this email.',
    'auth/wrong-password':          'Incorrect password. Please try again.',
    'auth/invalid-email':           'Please enter a valid email address.',
    'auth/user-disabled':           'This account has been disabled. Contact the owner.',
    'auth/too-many-requests':       'Too many failed attempts. Please wait a few minutes.',
    'auth/network-request-failed':  'Network error. Check your internet connection.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}
