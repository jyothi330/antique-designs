import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useQuotations } from '../hooks/useQuotations';
import { addPayment } from '../lib/payments';
import { useAuth } from '../contexts/AuthContext';
import type { Quotation, QuotationStatus, PaymentMode, PaymentType } from '../types';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Toast from '../components/ui/Toast';
import { printQuotation } from '../lib/quotationPdf';

const STATUS_FILTERS = ['All', 'pending', 'approved', 'draft', 'rejected'] as const;

const STATUS_CLASSES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending:  'bg-amber-100 text-amber-800',
  draft:    'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-800',
};

function fmtDate(ts: Quotation['date'] | undefined): string {
  if (!ts) return '--';
  return ts.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtINR(n: number): string {
  return '\u20B9' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

// -- Record Payment modal props -----------------------------------------------
interface PaymentModalProps {
  quotation: Quotation;
  onClose: () => void;
  onSaved: () => void;
  uid: string;
}

function RecordPaymentModal({ quotation, onClose, onSaved, uid }: PaymentModalProps) {
  const [amount,  setAmount]  = useState(String(Math.round(quotation.grandTotal * 0.75)));
  const [mode,    setMode]    = useState<PaymentMode>('upi');
  const [type,    setType]    = useState<PaymentType>('advance_75');
  const [refNo,   setRefNo]   = useState('');
  const [notes,   setNotes]   = useState('');
  const [saving,  setSaving]  = useState(false);

  async function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { alert('Enter a valid amount.'); return; }
    setSaving(true);
    try {
      const payload: Parameters<typeof addPayment>[0] = {
        orderId:      quotation.quotationNo,
        customerId:   quotation.customerId,
        customerName: quotation.customerName,
        amount:       amt,
        type,
        mode,
        status:       'received',
        date:         Timestamp.fromDate(new Date()),
        createdBy:    uid,
      };
      if (refNo.trim())   payload.referenceNo = refNo.trim();
      if (notes.trim())   payload.notes       = notes.trim();
      await addPayment(payload);
      onSaved();
    } catch (e) {
      alert('Failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setSaving(false); }
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800">Record Payment</h3>
            <p className="text-xs text-gray-400 mt-0.5">{quotation.customerName} &middot; {quotation.quotationNo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="bg-amber-50 rounded-lg px-4 py-2 text-sm flex justify-between">
            <span className="text-gray-500">Grand Total</span>
            <span className="font-bold text-amber-700">{fmtINR(quotation.grandTotal)}</span>
          </div>
          <div>
            <label className={lbl}>Amount Received (&#8377;) *</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className={inp} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Payment Type</label>
              <select value={type} onChange={e => setType(e.target.value as PaymentType)} className={inp}>
                <option value="advance_75">Advance (75%)</option>
                <option value="balance_25">Balance (25%)</option>
                <option value="full">Full Payment</option>
                <option value="partial">Partial</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value as PaymentMode)} className={inp}>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Reference / Transaction No.</label>
            <input type="text" value={refNo} onChange={e => setRefNo(e.target.value)} placeholder="Optional" className={inp} />
          </div>
          <div>
            <label className={lbl}>Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional" className={inp} />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Record Payment'}
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Main page ----------------------------------------------------------------

export default function QuotationsPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { quotations, loading, error } = useQuotations();
  const [toast,         setToast]       = useState('');
  const [confirmId,     setConfirmId]   = useState<string | null>(null);
  const [confirmNo,     setConfirmNo]   = useState('');
  const [paymentFor,    setPaymentFor]  = useState<Quotation | null>(null);

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteDoc(doc(db, 'quotations', confirmId));
      setToast('Quotation deleted');
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setConfirmId(null); }
  }

  async function changeStatus(q: Quotation, status: QuotationStatus) {
    try {
      await updateDoc(doc(db, 'quotations', q.id), { status, updatedAt: serverTimestamp() });
      setToast(`Quotation ${status}`);
    } catch (e) {
      alert('Update failed: ' + (e instanceof Error ? e.message : String(e)));
    }
  }

  const rows = quotations.filter(q => {
    const matchFilter = filter === 'All' || q.status === filter;
    const matchSearch = !search
      || q.customerName.toLowerCase().includes(search.toLowerCase())
      || q.quotationNo.toLowerCase().includes(search.toLowerCase())
      || q.customerPlace.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Quotations</h2>
          <p className="text-xs text-gray-400 mt-0.5">{quotations.length} total</p>
        </div>
        <button onClick={() => navigate('/quotations/new')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
          + New Quotation
        </button>
      </div>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize
                ${filter === f ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500 ml-auto">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm w-36 outline-none" />
        </div>
        <span className="text-xs text-gray-400">{rows.length} result{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
      )}

      <div className="bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-4 py-3.5 text-left font-semibold">Quot. No.</th>
                <th className="px-4 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-4 py-3.5 text-left font-semibold hidden md:table-cell">Date</th>
                <th className="px-4 py-3.5 text-left font-semibold hidden md:table-cell">Valid Until</th>
                <th className="px-4 py-3.5 text-right font-semibold">Amount</th>
                <th className="px-4 py-3.5 text-left font-semibold">Status</th>
                <th className="px-4 py-3.5 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Loading...</td></tr>
              ) : rows.length ? rows.map((r, idx) => (
                <tr key={r.id} className={'border-b border-[#f0ece4] hover:bg-[#fdf8ee]' + (idx === rows.length - 1 ? ' border-b-0' : '')}>
                  <td className="px-4 py-3.5 font-mono text-xs text-amber-700 font-semibold">{r.quotationNo}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-gray-800">{r.customerName}</div>
                    <div className="text-xs text-gray-400">{r.customerPlace}</div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">{fmtDate(r.date)}</td>
                  <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">{fmtDate(r.validUntil)}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 text-right">{fmtINR(r.grandTotal)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_CLASSES[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">

                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/quotations/${r.id}/edit`)}
                        className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors">
                        Edit
                      </button>

                      {/* Approve */}
                      {r.status !== 'approved' && (
                        <button
                          onClick={() => changeStatus(r, 'approved')}
                          className="px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 transition-colors">
                          Approve
                        </button>
                      )}

                      {/* Reject */}
                      {r.status !== 'rejected' && (
                        <button
                          onClick={() => changeStatus(r, 'rejected')}
                          className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                          Reject
                        </button>
                      )}

                      {/* Create Order */}
                      {r.status === 'approved' && (
                        <button
                          onClick={() => navigate('/orders', {
                            state: {
                              fromQuotation: true,
                              quotationId:   r.id,
                              quotationNo:   r.quotationNo,
                              customerId:    r.customerId,
                              customerName:  r.customerName,
                              amount:        r.grandTotal,
                              productSummary: r.items.map(i => i.name).join(', '),
                            }
                          })}
                          className="px-2 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors">
                          Create Order
                        </button>
                      )}

                      {/* Record Payment */}
                      {r.status === 'approved' && (
                        <button
                          onClick={() => setPaymentFor(r)}
                          className="px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors">
                          Payment
                        </button>
                      )}

                      {/* Print PDF */}
                      <button
                        onClick={() => printQuotation(r)}
                        className="px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 transition-colors">
                        Print
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => { setConfirmId(r.id); setConfirmNo(r.quotationNo); }}
                        className="px-2 py-1 rounded border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        Delete
                      </button>

                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {search || filter !== 'All' ? 'No quotations match your search.' : 'No quotations yet. Create your first one!'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} &middot; live from Firestore
        </div>
      </div>

      {/* Delete confirm */}
      {confirmId && (
        <ConfirmDialog
          title="Delete Quotation"
          message={`Delete quotation "${confirmNo}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Record Payment modal */}
      {paymentFor && (
        <RecordPaymentModal
          quotation={paymentFor}
          uid={firebaseUser?.uid ?? ''}
          onClose={() => setPaymentFor(null)}
          onSaved={() => { setPaymentFor(null); setToast('Payment recorded'); }}
        />
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
