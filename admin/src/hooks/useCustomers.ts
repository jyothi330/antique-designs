import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Customer } from '../types';

export interface CustomerFilters {
  search: string;
}

export function useCustomers(filters: CustomerFilters = { search: '' }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setCustomers(snap.docs.map(d => ({ ...(d.data() as Omit<Customer,'id'>), id: d.id } as Customer)));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  const term = filters.search.toLowerCase();
  const filtered = term
    ? customers.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.place.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        (c.email || '').toLowerCase().includes(term)
      )
    : customers;

  return { customers: filtered, allCustomers: customers, loading, error };
}
