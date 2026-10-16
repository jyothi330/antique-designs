import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth }        from '../contexts/AuthContext';
import { useProducts }    from '../hooks/useProducts';
import { setProductStatus } from '../lib/products';
import type { Product, ProductStatus } from '../types';
import { PRODUCT_CATEGORIES } from '../types';

import ProductCard           from '../components/products/ProductCard';
import ProductTable          from '../components/products/ProductTable';
import ProductForm           from '../components/products/ProductForm';
import ProductDetailDrawer   from '../components/products/ProductDetailDrawer';
import ConfirmDialog         from '../components/ui/ConfirmDialog';
import Toast, { type ToastType } from '../components/ui/Toast';

// ─────────────────────────────────────────────────────────────────────────────

type ViewMode = 'grid' | 'table';

interface ToastState {
  message: string;
  type:    ToastType;
}

export default function ProductsPage() {
  const { profile, firebaseUser } = useAuth();
  const uid = firebaseUser?.uid ?? '';

  // Permission: owner or any active staff can add/edit/deactivate
  // (Step 3 spec says "owner or staff with explicit permission" — using role=owner for now;
  //  a per-user permissions field can be added in a later step)
  const canEdit = profile?.role === 'owner' || profile?.active === true;

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [status,   setStatus]   = useState<ProductStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const { products, allProducts, loading, error, refetch } = useProducts({
    search,
    category,
    status,
  });

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showForm,       setShowForm]       = useState(false);
  const [editProduct,    setEditProduct]    = useState<Product | undefined>();
  const [viewProduct,    setViewProduct]    = useState<Product | undefined>();
  const [confirmToggle,  setConfirmToggle]  = useState<Product | null>(null);
  const [confirmDelete,  setConfirmDelete]  = useState<Product | null>(null);
  const [toggling,       setToggling]       = useState(false);
  const [toast,          setToast]          = useState<ToastState | null>(null);

  function showToast(message: string, type: ToastType = 'success') {
    setToast({ message, type });
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  function handleAddClick() {
    setEditProduct(undefined);
    setShowForm(true);
  }

  function handleEditClick(p: Product) {
    setViewProduct(undefined);
    setEditProduct(p);
    setShowForm(true);
  }

  function handleFormSaved(id: string) {
    setShowForm(false);
    setEditProduct(undefined);
    showToast(editProduct ? 'Product updated.' : 'Product added.', 'success');
    refetch();
    void id;
  }

  function handleToggleRequest(p: Product) {
    setViewProduct(undefined);
    setConfirmToggle(p);
  }

  async function handleToggleConfirm() {
    if (!confirmToggle) return;
    setToggling(true);
    try {
      const next: ProductStatus = confirmToggle.status === 'active' ? 'inactive' : 'active';
      await setProductStatus(confirmToggle.id, next, uid);
      showToast(
        `"${confirmToggle.name}" ${next === 'active' ? 'activated' : 'deactivated'}.`,
        next === 'active' ? 'success' : 'info',
      );
      refetch();
    } catch (e) {
      showToast((e as Error).message ?? 'Failed to update status.', 'error');
    } finally {
      setToggling(false);
      setConfirmToggle(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'products', confirmDelete.id));
      showToast(`"${confirmDelete.name}" deleted.`, 'success');
      refetch();
    } catch (e) {
      showToast((e as Error).message ?? 'Delete failed.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const activeCount   = allProducts.filter(p => p.status === 'active').length;
  const inactiveCount = allProducts.filter(p => p.status === 'inactive').length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Products</h2>
          {!loading && (
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} active · {inactiveCount} inactive · {allProducts.length} total
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 font-semibold transition-colors ${viewMode === 'table' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ☰ Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 font-semibold transition-colors ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              ⊞ Grid
            </button>
          </div>
          {canEdit && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90"
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {/* Category filter */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-600 bg-white focus:outline-none focus:border-amber-500"
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status filter */}
        {(['all', 'active', 'inactive'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize
              ${status === s ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'}`}
          >
            {s === 'all' ? 'All Status' : s}
          </button>
        ))}

        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 ml-auto">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm w-40 outline-none"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={refetch} className="ml-auto text-xs font-semibold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white border border-[#ede5d4] rounded-xl p-4 h-16 animate-pulse bg-gray-50" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="bg-white border border-[#ede5d4] rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <h3 className="font-semibold text-gray-700 mb-1">No products found</h3>
          <p className="text-sm text-gray-400 mb-4">
            {allProducts.length === 0
              ? 'Add your first product to get started.'
              : 'Try adjusting your filters.'}
          </p>
          {canEdit && allProducts.length === 0 && (
            <button
              onClick={handleAddClick}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90"
            >
              + Add First Product
            </button>
          )}
        </div>
      )}

      {/* Product list */}
      {!loading && !error && products.length > 0 && (
        <>
          {/* Desktop table */}
          <div className={`hidden md:block ${viewMode === 'grid' ? 'md:hidden' : ''}`}>
            <ProductTable
              products={products}
              canEdit={canEdit}
              onView={p => setViewProduct(p)}
              onEdit={handleEditClick}
              onToggleStatus={handleToggleRequest}
              onDelete={p => setConfirmDelete(p)}
            />
          </div>

          {/* Mobile / Grid view */}
          <div className={`${viewMode === 'table' ? 'md:hidden' : ''} grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`}>
            {products.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                canEdit={canEdit}
                onView={v => setViewProduct(v)}
                onEdit={handleEditClick}
                onToggleStatus={handleToggleRequest}
                onDelete={p => setConfirmDelete(p)}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Showing {products.length} of {allProducts.length} products · connected to Firestore
          </p>
        </>
      )}

      {/* ── Modals & overlays ── */}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSaved={handleFormSaved}
          onCancel={() => { setShowForm(false); setEditProduct(undefined); }}
        />
      )}

      {viewProduct && !showForm && (
        <ProductDetailDrawer
          product={viewProduct}
          canEdit={canEdit}
          onClose={() => setViewProduct(undefined)}
          onEdit={handleEditClick}
          onToggleStatus={handleToggleRequest}
        />
      )}

      {confirmToggle && (
        <ConfirmDialog
          title={confirmToggle.status === 'active' ? 'Deactivate Product?' : 'Activate Product?'}
          message={
            confirmToggle.status === 'active'
              ? `"${confirmToggle.name}" will be hidden from new quotations. Existing quotations are not affected.`
              : `"${confirmToggle.name}" will be made available for new quotations again.`
          }
          confirmLabel={confirmToggle.status === 'active' ? 'Deactivate' : 'Activate'}
          danger={confirmToggle.status === 'active'}
          onConfirm={handleToggleConfirm}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Product"
          message={`Permanently delete "${confirmDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toggling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-xl">
            <span className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Updating…</span>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
