import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useQuotations } from '../hooks/useQuotations';
import type { Quotation } from '../types';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Toast from '../components/ui/Toast';

const STATUS_FILTERS = ['All', 'pending', 'approved', 'draft', 'rejected'] as const;

const STATUS_CLASSES: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending:  'bg-amber-100 text-amber-800',
  draft:    'bg-gray-100 text-gray-700',
  rejected: 'bg-red-100 text-red-800',
};

function fmtDate(ts: Quotation['date'] | undefined): string {
  if (!ts) return '—';
  const d = ts.toDate();
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { quotations, loading, error } = useQuotations();
  const [toast,       setToast]        = useState('');
  const [confirmId,   setConfirmId]    = useState<string | null>(null);
  const [confirmNo,   setConfirmNo]    = useState('');

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteDoc(doc(db, 'quotations', confirmId));
      setToast('Quotation deleted');
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setConfirmId(null); }
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
          <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
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
                <th className="px-5 py-3.5 text-left font-semibold">Quot. No.</th>
                <th className="px-5 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Date</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Valid Until</th>
                <th className="px-5 py-3.5 text-right font-semibold">Amount</th>
                <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                <th className="px-5 py-3.5 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">Loading…</td></tr>
              ) : rows.length ? rows.map((r, idx) => (
                <tr key={r.id} className={'border-b border-[#f0ece4] hover:bg-[#fdf8ee]' + (idx === rows.length - 1 ? ' border-b-0' : '')}>
                  <td className="px-5 py-3.5 font-mono text-xs text-amber-700 font-semibold">{r.quotationNo}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-gray-800">{r.customerName}</div>
                    <div className="text-xs text-gray-400">{r.customerPlace}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{fmtDate(r.date)}</td>
                  <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">{fmtDate(r.validUntil)}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-800 text-right">{fmtINR(r.grandTotal)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_CLASSES[r.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 text-xs">
                      <button className="text-gray-500 hover:underline">Print PDF</button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => { setConfirmId(r.id); setConfirmNo(r.quotationNo); }}
                        className="text-red-400 hover:text-red-600 font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                  {search || filter !== 'All' ? 'No quotations match your search.' : 'No quotations yet. Create your first one!'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          {quotations.length} quotation{quotations.length !== 1 ? 's' : ''} · live from Firestore
        </div>
      </div>

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

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
