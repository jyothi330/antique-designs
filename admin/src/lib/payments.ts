import {
  collection, doc, addDoc, updateDoc,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Payment } from '../types';

const COL = 'payments';

export async function addPayment(
  data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePaymentStatus(
  docId: string,
  status: Payment['status'],
): Promise<void> {
  await updateDoc(doc(db, COL, docId), { status, updatedAt: serverTimestamp() });
}

export function subscribePayments(cb: (payments: Payment[]) => void) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ ...(d.data() as Omit<Payment, 'id'>), id: d.id } as Payment)))
  );
}
