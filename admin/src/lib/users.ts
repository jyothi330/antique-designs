import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  getDocs, serverTimestamp,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebase';
import type { UserProfile } from '../types';

const COL = 'users';

/** Fetch all user profiles from Firestore */
export async function listUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map(d => ({ ...(d.data() as UserProfile), uid: d.id }));
}

/**
 * Invite a new staff member:
 *  1. Write a Firestore users/{uid-placeholder} doc with active:false
 *     using the email as the doc ID (we don't have the UID yet).
 *  2. Send a password-reset email so they can set their password and log in.
 *
 * On first login, fetchUserProfile looks up users/{uid} — so after the owner
 * creates the Firebase Auth account in the console and sets the doc ID to the
 * real UID, the staff member gains access.
 *
 * Simpler flow: we store a pending doc keyed by email. When they first sign in
 * and their UID doc doesn't exist, the owner must rename it. For now we create
 * the doc with a generated ID and instruct the owner.
 */
export async function inviteStaff(data: {
  name: string;
  email: string;
  role: 'staff' | 'owner';
}, invitedBy: string): Promise<void> {
  // Use a predictable doc ID derived from email so it's easy to find
  const docId = data.email.toLowerCase().replace(/[^a-z0-9]/g, '_');

  await setDoc(doc(db, COL, docId), {
    uid:       docId,        // placeholder — owner must update with real UID after Firebase Console signup
    name:      data.name.trim(),
    email:     data.email.trim().toLowerCase(),
    role:      data.role,
    active:    false,        // stays false until owner activates
    createdBy: invitedBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Send password-reset / invite email via Firebase Auth
  // This will fail if the email isn't yet registered in Firebase Auth — that's OK,
  // owner creates the account in console first, then invites here.
  try {
    await sendPasswordResetEmail(auth, data.email.trim().toLowerCase());
  } catch {
    // Ignore: email may not exist in Auth yet. Profile doc is still created.
  }
}

/** Activate a staff member (set active: true) */
export async function activateUser(docId: string): Promise<void> {
  await updateDoc(doc(db, COL, docId), { active: true, updatedAt: serverTimestamp() });
}

/** Deactivate a staff member (set active: false — blocks login) */
export async function deactivateUser(docId: string): Promise<void> {
  await updateDoc(doc(db, COL, docId), { active: false, updatedAt: serverTimestamp() });
}

/** Permanently remove a user's Firestore profile */
export async function removeUser(docId: string): Promise<void> {
  await deleteDoc(doc(db, COL, docId));
}
