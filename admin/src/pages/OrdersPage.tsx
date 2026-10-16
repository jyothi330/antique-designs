import { useState } from 'react';
import { Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useOrders } from '../hooks/useOrders';
import { updateOrderStatus, addOrder } from '../lib/orders';
import { useAuth } from '../contexts/AuthContext';
import type { Order, OrderStatus } from '../types';
import Toast from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const STATUS_STEPS: OrderStatus[] = [
  'design_review', 'materials_ordered', 'in_production',
  'quality_check', 'ready_to_ship', 'delivered',
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  design_review:     'Design Review',
  materials_ordered: 'Materials Ordered',
  in_production:     'In Production',
  quality_check:     'Quality Check',
  ready_to_ship:     'Ready to Ship',
  delivered:         'Delivered',
  cancelled:         'Cancelled',
};

const STATUS_CLASSES: Record<string, string> = {
  design_review:     'bg-amber-100 text-amber-800',
  materials_ordered: 'bg-yellow-100 text-yellow-800',
  in_production:     'bg-blue-100 text-blue-800',
  quality_check:     'bg-indigo-100 text-indigo-800',
  ready_to_ship:     'bg-purple-100 text-purple-800',
  delivered:         'bg-green-100 text-green-800',
  cancelled:         'bg-red-100 text-red-800',
};

const STATUS_FILTERS = ['All', ...STATUS_STEPS] as const;

function fmtINR(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtTs(ts: Order['createdAt'] | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Add Order Modal ───────────────────────────────────────────────────────────
interface AddOrderModalProps { onClose: () => void; onSaved: () => void; }

function AddOrderModal({ onClose, onSaved }: AddOrderModalProps) {
  const { firebaseUser } = useAuth();
  const [form, setForm] = useState({
    customerName: '', quotationNo: '', productSummary: '',
    amount: '', status: 'design_review' as OrderStatus,
    expectedDelivery: '',
  });
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!form.customerName.trim() || !form.productSummary.trim()) {
      alert('Customer name and product summary are required.'); return;
    }
    setSaving(true);
    try {
      await addOrder({
        quotationId:     '',
        quotationNo:     form.quotationNo.trim(),
        customerId:      '',
        customerName:    form.customerName.trim(),
        productSummary:  form.productSummary.trim(),
        amount:          parseFloat(form.amount) || 0,
        status:          form.status,
        expectedDelivery: form.expectedDelivery
          ? Timestamp.fromDate(new Date(form.expectedDelivery))
          : Timestamp.fromDate(new Date()),
        createdBy: firebaseUser!.uid,
      });
      onSaved();
      onClose();
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">Add Order</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Customer Name *</label>
                <input type="text" value={form.customerName}
                  onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                  placeholder="e.g. Mahadeva A S" className={inp} />
              </div>
              <div>
                <label className={lbl}>Quotation No.</label>
                <input type="text" value={form.quotationNo}
                  onChange={e => setForm(p => ({ ...p, quotationNo: e.target.value }))}
                  placeholder="e.g. 001_26-27" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Product Summary *</label>
              <input type="text" value={form.productSummary}
                onChange={e => setForm(p => ({ ...p, productSummary: e.target.value }))}
                placeholder="e.g. Main Door — Brass casting" className={inp} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Order Amount (₹)</label>
                <input type="number" value={form.amount}
                  onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="115574" className={inp} />
              </div>
              <div>
                <label className={lbl}>Expected Delivery</label>
                <input type="date" value={form.expectedDelivery}
                  onChange={e => setForm(p => ({ ...p, expectedDelivery: e.target.value }))}
                  className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Status</label>
              <select value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value as OrderStatus }))}
                className={inp}>
                {STATUS_STEPS.map(s => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Add Order'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Status updater dropdown ───────────────────────────────────────────────────
function StatusPicker({ orderId, current, onDone }: { orderId: string; current: OrderStatus; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function pick(s: OrderStatus) {
    setSaving(true);
    try { await updateOrderStatus(orderId, s); onDone(); }
    finally { setSaving(false); setOpen(false); }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)} disabled={saving}
        className="border border-amber-500 text-amber-700 rounded-lg px-3 py-1 text-xs font-semibold hover:bg-amber-50 transition-colors disabled:opacity-50">
        {saving ? 'Saving…' : 'Update Status'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-xl py-1 w-48">
            {[...STATUS_STEPS, 'cancelled' as OrderStatus].map(s => (
              <button key={s} onClick={() => pick(s)}
                className={'w-full text-left px-4 py-2 text-xs hover:bg-amber-50 ' + (s === current ? 'font-bold text-amber-700' : 'text-gray-700')}>
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { orders, loading, error } = useOrders();
  const [filter,    setFilter]    = useState<string>('All');
  const [search,    setSearch]    = useState('');
  const [showAdd,   setShowAdd]   = useState(false);
  const [toast,     setToast]     = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteDoc(doc(db, 'orders', confirmId));
      setToast('Order deleted');
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setConfirmId(null); }
  }

  const rows = orders.filter(o => {
    const matchFilter = filter === 'All' || o.status === filter;
    const term = search.toLowerCase();
    const matchSearch = !term
      || o.customerName.toLowerCase().includes(term)
      || o.quotationNo.toLowerCase().includes(term)
      || o.productSummary.toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Orders</h2>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} total · live from Firestore</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-sm w-32 outline-none" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
            + Add Order
          </button>
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {STATUS_FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
              ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'}`}>
            {f === 'All' ? 'All' : STATUS_LABEL[f as OrderStatus]}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading orders…</div>
      ) : rows.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500 text-sm font-medium">
            {search || filter !== 'All' ? 'No orders match your filters.' : 'No orders yet. Add your first one!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(o => (
            <div key={o.id} className="bg-white border border-[#ede5d4] rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">📦</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-gray-400">{o.id.slice(0, 8)}</span>
                      {o.quotationNo && <>
                        <span className="text-gray-300">·</span>
                        <span className="font-mono text-xs text-amber-700">{o.quotationNo}</span>
                      </>}
                    </div>
                    <div className="font-bold text-gray-800 mt-0.5">{o.customerName}</div>
                    <div className="text-sm text-gray-500 mt-0.5">{o.productSummary}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_CLASSES[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                  {o.amount > 0 && (
                    <span className="text-amber-700 font-bold">{fmtINR(o.amount)}</span>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                <span>📅 Ordered: <strong>{fmtTs(o.createdAt)}</strong></span>
                <span>🚚 Delivery: <strong>{fmtTs(o.expectedDelivery)}</strong></span>
                <div className="ml-auto flex items-center gap-2">
                  <StatusPicker orderId={o.id} current={o.status} onDone={() => setToast('Status updated')} />
                  <button onClick={() => { setConfirmId(o.id); setConfirmName(o.customerName); }}
                    className="text-red-400 hover:text-red-600 text-xs font-semibold border border-red-300 rounded-lg px-3 py-1 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddOrderModal onClose={() => setShowAdd(false)} onSaved={() => setToast('Order added')} />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Order"
          message={`Delete order for "${confirmName}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
