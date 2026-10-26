import {
  doc, getDoc, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AppSettings } from '../types';

const DOC_REF = () => doc(db, 'appSettings', 'main');

export async function getSettings(): Promise<AppSettings | null> {
  const snap = await getDoc(DOC_REF());
  if (!snap.exists()) return null;
  return snap.data() as AppSettings;
}

export async function saveSettings(
  data: Omit<AppSettings, 'updatedAt'>,
  uid: string,
): Promise<void> {
  await setDoc(DOC_REF(), {
    ...data,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
}
