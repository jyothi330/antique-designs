import { useState } from 'react';
import { Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { usePayments } from '../hooks/usePayments';
import { addPayment, updatePaymentStatus } from '../lib/payments';
import { useAuth } from '../contexts/AuthContext';
import type { Payment, PaymentStatus, PaymentMode, PaymentType } from '../types';
import Toast from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';

// ── constants ─────────────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<PaymentStatus, string> = {
  received: 'bg-green-100 text-green-800',
  pending:  'bg-amber-100 text-amber-800',
  failed:   'bg-red-100 text-red-800',
  refunded: 'bg-purple-100 text-purple-800',
};

const TYPE_LABEL: Record<PaymentType, string> = {
  advance_75: '75% Advance',
  balance_25: '25% Balance',
  full:       'Full Payment',
  partial:    'Partial',
  other:      'Other',
};

const MODE_LABEL: Record<PaymentMode, string> = {
  cash:   'Cash', cheque: 'Cheque', upi: 'UPI',
  neft:   'NEFT', rtgs:   'RTGS',  other: 'Other',
};

function fmtINR(n: number) {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function fmtTs(ts: Payment['date'] | undefined): string {
  if (!ts) return '—';
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Record Payment Modal ──────────────────────────────────────────────────────
interface ModalProps { onClose: () => void; onSaved: () => void; }

function RecordPaymentModal({ onClose, onSaved }: ModalProps) {
  const { firebaseUser } = useAuth();
  const [form, setForm] = useState({
    customerName: '', orderId: '',
    amount: '', type: 'advance_75' as PaymentType,
    mode: 'neft' as PaymentMode, referenceNo: '',
    notes: '', date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function submit() {
    if (!form.customerName.trim() || !form.amount) {
      alert('Customer name and amount are required.'); return;
    }
    setSaving(true);
    try {
      const payload: Parameters<typeof addPayment>[0] = {
        orderId:      form.orderId.trim(),
        customerId:   '',
        customerName: form.customerName.trim(),
        amount:       parseFloat(form.amount),
        type:         form.type,
        mode:         form.mode,
        status:       'received',
        date:         Timestamp.fromDate(new Date(form.date)),
        createdBy:    firebaseUser!.uid,
      };
      if (form.referenceNo.trim()) payload.referenceNo = form.referenceNo.trim();
      if (form.notes.trim())       payload.notes       = form.notes.trim();
      await addPayment(payload);
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
            <h3 className="text-base font-bold text-gray-800">Record Payment</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Customer Name *</label>
                <input type="text" value={form.customerName} onChange={e => set('customerName', e.target.value)}
                  placeholder="e.g. Mahadeva A S" className={inp} />
              </div>
              <div>
                <label className={lbl}>Order ID / Ref</label>
                <input type="text" value={form.orderId} onChange={e => set('orderId', e.target.value)}
                  placeholder="e.g. O-001" className={inp} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Amount (₹) *</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="86681" className={inp} />
              </div>
              <div>
                <label className={lbl}>Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inp} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Payment Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value as PaymentType)} className={inp}>
                  {(Object.keys(TYPE_LABEL) as PaymentType[]).map(t => (
                    <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl}>Payment Mode</label>
                <select value={form.mode} onChange={e => set('mode', e.target.value as PaymentMode)} className={inp}>
                  {(Object.keys(MODE_LABEL) as PaymentMode[]).map(m => (
                    <option key={m} value={m}>{MODE_LABEL[m]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Reference / Cheque No.</label>
              <input type="text" value={form.referenceNo} onChange={e => set('referenceNo', e.target.value)}
                placeholder="e.g. NEFT123456" className={inp} />
            </div>

            <div>
              <label className={lbl}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                rows={2} placeholder="Optional notes…" className={inp + ' resize-none'} />
            </div>
          </div>

          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { payments, loading, error } = usePayments();
  const [showModal,   setShowModal]   = useState(false);
  const [toast,       setToast]       = useState('');
  const [filter,      setFilter]      = useState<'all' | PaymentStatus>('all');
  const [search,      setSearch]      = useState('');
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteDoc(doc(db, 'payments', confirmId));
      setToast('Payment deleted');
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setConfirmId(null); }
  }

  // live summary stats
  const totalReceived = payments
    .filter(p => p.status === 'received')
    .reduce((s, p) => s + p.amount, 0);
  const totalPending  = payments
    .filter(p => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0);
  const advances      = payments.filter(p => p.type === 'advance_75').length;

  const rows = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const term = search.toLowerCase();
    const matchSearch = !term
      || p.customerName.toLowerCase().includes(term)
      || (p.referenceNo || '').toLowerCase().includes(term);
    return matchFilter && matchSearch;
  });

  async function markStatus(id: string, status: PaymentStatus) {
    try {
      await updatePaymentStatus(id, status);
      setToast('Payment status updated');
    } catch (e) {
      alert('Update failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Payments</h2>
          <p className="text-xs text-gray-400 mt-0.5">{payments.length} transactions · live from Firestore</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-sm w-32 outline-none" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
            + Record Payment
          </button>
        </div>
      </div>

      {/* Live summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Received',  value: loading ? '…' : fmtINR(totalReceived), color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200'  },
          { label: 'Pending Balance', value: loading ? '…' : fmtINR(totalPending),  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
          { label: 'Transactions',    value: loading ? '…' : String(payments.length), color: 'text-blue-700', bg: 'bg-blue-50',   border: 'border-blue-200'   },
          { label: 'Advances Taken',  value: loading ? '…' : String(advances),      color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
            <div className="text-xs text-gray-500 mb-1">{c.label}</div>
            <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {(['all', 'received', 'pending', 'failed', 'refunded'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize
              ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Quotation / Order</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden sm:table-cell">Date</th>
                <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">Type</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Mode</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                  {search || filter !== 'all' ? 'No payments match your filters.' : 'No payments recorded yet.'}
                </td></tr>
              ) : (
                rows.map((p, idx) => (
                  <tr key={p.id} className={'border-b border-[#f0ece4] hover:bg-[#fdf8ee]' + (idx === rows.length - 1 ? ' border-b-0' : '')}>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800">{p.customerName}</div>
                      {p.referenceNo && <div className="text-xs text-gray-400">Ref: {p.referenceNo}</div>}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-amber-700 font-semibold hidden md:table-cell">
                      {p.orderId || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs hidden sm:table-cell">{fmtTs(p.date)}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-800 text-right">{fmtINR(p.amount)}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 hidden lg:table-cell">{TYPE_LABEL[p.type]}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 uppercase">
                        {MODE_LABEL[p.mode]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_CLASSES[p.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">

                        {/* pending → received */}
                        {p.status === 'pending' && (
                          <button onClick={() => markStatus(p.id, 'received')}
                            className="text-xs text-green-700 border border-green-200 rounded px-2 py-1 hover:bg-green-50 font-semibold transition-colors">
                            Received
                          </button>
                        )}

                        {/* pending / received → failed */}
                        {(p.status === 'pending' || p.status === 'received') && (
                          <button onClick={() => markStatus(p.id, 'failed')}
                            className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-50 font-semibold transition-colors">
                            Failed
                          </button>
                        )}

                        {/* received → refunded */}
                        {p.status === 'received' && (
                          <button onClick={() => markStatus(p.id, 'refunded')}
                            className="text-xs text-purple-700 border border-purple-200 rounded px-2 py-1 hover:bg-purple-50 font-semibold transition-colors">
                            Refunded
                          </button>
                        )}

                        {/* failed → received (retry) */}
                        {p.status === 'failed' && (
                          <button onClick={() => markStatus(p.id, 'received')}
                            className="text-xs text-green-700 border border-green-200 rounded px-2 py-1 hover:bg-green-50 font-semibold transition-colors">
                            Retry
                          </button>
                        )}

                        {/* refunded — terminal state */}
                        {p.status === 'refunded' && (
                          <span className="text-xs text-purple-500 font-medium">Refunded</span>
                        )}

                        <button onClick={() => { setConfirmId(p.id); setConfirmName(p.customerName); }}
                          className="text-xs text-red-400 border border-red-100 rounded px-2 py-1 hover:bg-red-50 hover:text-red-600 font-semibold transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          {payments.length} transaction{payments.length !== 1 ? 's' : ''} · live from Firestore
        </div>
      </div>

      {showModal && (
        <RecordPaymentModal onClose={() => setShowModal(false)} onSaved={() => setToast('Payment recorded')} />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Payment"
          message={`Delete payment from "${confirmName}"? This cannot be undone.`}
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
