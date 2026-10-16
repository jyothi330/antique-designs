import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Quotation } from '../types';

export function useQuotations(limitN = 100) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'quotations'), orderBy('createdAt', 'desc'), limit(limitN));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setQuotations(snap.docs.map(d => ({ ...(d.data() as Omit<Quotation,'id'>), id: d.id } as Quotation)));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); },
    );
    return unsub;
  }, [limitN]);

  return { quotations, loading, error };
}
