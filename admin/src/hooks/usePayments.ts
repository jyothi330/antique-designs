import { useState, useEffect } from 'react';
import { subscribePayments } from '../lib/payments';
import type { Payment } from '../types';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error]                 = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribePayments(
      (data) => { setPayments(data); setLoading(false); },
    );
    return unsub;
  }, []);

  return { payments, loading, error };
}
