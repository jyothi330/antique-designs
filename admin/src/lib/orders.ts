import {
  collection, doc, addDoc, updateDoc,
  query, orderBy, serverTimestamp, onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order } from '../types';

const COL = 'orders';

export async function addOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateOrderStatus(docId: string, status: Order['status']): Promise<void> {
  await updateDoc(doc(db, COL, docId), { status, updatedAt: serverTimestamp() });
}

export async function updateOrder(
  docId: string,
  data: Partial<Omit<Order, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COL, docId), { ...data, updatedAt: serverTimestamp() });
}

export function subscribeOrders(cb: (orders: Order[]) => void) {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap =>
    cb(snap.docs.map(d => ({ ...(d.data() as Omit<Order, 'id'>), id: d.id } as Order)))
  );
}
