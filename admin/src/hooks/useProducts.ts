import { useEffect, useState, useCallback } from 'react';
import { subscribeToProducts } from '../lib/products';
import type { Product, ProductStatus } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// useProducts
//
// Subscribes to the Firestore products collection in real time.
// Provides client-side filtering by category, status, and search text.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductFilters {
  search:   string;
  category: string;   // '' = all
  status:   ProductStatus | 'all';
}

export interface UseProductsResult {
  products: Product[];        // filtered
  allProducts: Product[];     // unfiltered — for stats
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

export function useProducts(filters: ProductFilters): UseProductsResult {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [version,     setVersion]     = useState(0); // bump to re-subscribe

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = subscribeToProducts(
      (docs) => {
        setAllProducts(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return unsub;
  }, [version]);

  // Client-side filter — avoids extra Firestore indexes for now
  const products = allProducts.filter(p => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.category && p.category !== filters.category)      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q)         ||
        p.category.toLowerCase().includes(q)     ||
        (p.description ?? '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return { products, allProducts, loading, error, refetch };
}
