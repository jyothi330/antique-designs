import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp, runTransaction,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Customer } from '../types';

const COL = 'customers';
const COUNTER_DOC = 'counters/customers';

// ── helpers ──────────────────────────────────────────────────────────────────

async function nextCustomerNo(): Promise<string> {
  const ref = doc(db, COUNTER_DOC);
  let value = 1;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) {
      value = (snap.data().value as number) + 1;
      tx.update(ref, { value: increment(1) });
    } else {
      tx.set(ref, { value: 1 });
    }
  });
  return 'C-' + String(value).padStart(3, '0');
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function addCustomer(
  data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const id = await nextCustomerNo();
  await addDoc(collection(db, COL), {
    ...data,
    id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateCustomer(
  docId: string,
  data: Partial<Omit<Customer, 'id' | 'createdAt'>>,
): Promise<void> {
  const ref = doc(db, COL, docId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCustomer(docId: string): Promise<void> {
  await deleteDoc(doc(db, COL, docId));
}

export async function getCustomer(docId: string): Promise<Customer | null> {
  const snap = await getDoc(doc(db, COL, docId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<Customer, 'id'>), id: snap.id } as Customer;
}

export async function listCustomers(): Promise<Customer[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...(d.data() as Omit<Customer, 'id'>), id: d.id } as Customer));
}
