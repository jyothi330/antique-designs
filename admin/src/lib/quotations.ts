import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, orderBy, serverTimestamp, runTransaction, increment,
  where, limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Quotation } from '../types';

const COL = 'quotations';

// ── sequential quotation number ───────────────────────────────────────────────

async function nextQuotationNo(): Promise<string> {
  const ref = doc(db, 'counters/quotations');
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
  const year = new Date().getFullYear();
  const yy   = String(year).slice(-2);
  const yy1  = String(year + 1).slice(-2);
  return `${String(value).padStart(3, '0')}_${yy}-${yy1}`;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function createQuotation(
  data: Omit<Quotation, 'id' | 'quotationNo' | 'createdAt' | 'updatedAt'>,
): Promise<{ docId: string; quotationNo: string }> {
  const quotationNo = await nextQuotationNo();
  const ref = await addDoc(collection(db, COL), {
    ...data,
    quotationNo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { docId: ref.id, quotationNo };
}

export async function updateQuotation(
  docId: string,
  data: Partial<Omit<Quotation, 'id' | 'quotationNo' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COL, docId), { ...data, updatedAt: serverTimestamp() });
}

export async function getQuotation(docId: string): Promise<Quotation | null> {
  const snap = await getDoc(doc(db, COL, docId));
  if (!snap.exists()) return null;
  return { ...(snap.data() as Omit<Quotation, 'id'>), id: snap.id } as Quotation;
}

export async function listQuotations(limitN = 100): Promise<Quotation[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...(d.data() as Omit<Quotation, 'id'>), id: d.id } as Quotation));
}

export async function listQuotationsByCustomer(customerId: string): Promise<Quotation[]> {
  const q = query(
    collection(db, COL),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ ...(d.data() as Omit<Quotation, 'id'>), id: d.id } as Quotation));
}
