import { useState, useEffect } from 'react';
import { subscribeOrders } from '../lib/orders';
import type { Order } from '../types';

export function useOrders() {
  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error]               = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeOrders(
      (data) => { setOrders(data); setLoading(false); },
    );
    return unsub;
  }, []);

  return { orders, loading, error };
}
