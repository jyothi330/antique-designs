import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getCountFromServer, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Quotation } from '../types';

// ── live stats hook ───────────────────────────────────────────────────────────
function useDashboardStats() {
  const [stats, setStats] = useState({
    quotations:   0,
    customers:    0,
    revenue:      0,
    orders:       0,
    activeOrders: 0,
    loading:      true,
  });

  useEffect(() => {
    async function load() {
      try {
        const ACTIVE_STATUSES = ['design_review', 'materials_ordered', 'in_production', 'quality_check', 'ready_to_ship'];
        const [qSnap, cSnap, oSnap, revSnap, activeSnap] = await Promise.all([
          getCountFromServer(collection(db, 'quotations')),
          getCountFromServer(collection(db, 'customers')),
          getCountFromServer(collection(db, 'orders')),
          getDocs(query(collection(db, 'quotations'), where('status', '!=', 'rejected'))),
          getDocs(query(collection(db, 'orders'), where('status', 'in', ACTIVE_STATUSES))),
        ]);

        const revenue = revSnap.docs.reduce((sum, d) => {
          const data = d.data() as Quotation;
          return sum + (data.grandTotal || 0);
        }, 0);

        setStats({
          quotations:   qSnap.data().count,
          customers:    cSnap.data().count,
          orders:       oSnap.data().count,
          activeOrders: activeSnap.size,
          revenue,
          loading:      false,
        });
      } catch {
        setStats(s => ({ ...s, loading: false }));
      }
    }
    load();
  }, []);

  return stats;
}

// ── recent quotations hook ────────────────────────────────────────────────────
function useRecentQuotations() {
  const [rows, setRows] = useState<Quotation[]>([]);
  useEffect(() => {
    getDocs(query(collection(db, 'quotations'), orderBy('createdAt', 'desc'), limit(5)))
      .then(snap => setRows(snap.docs.map(d => ({ ...(d.data() as Quotation), id: d.id }))));
  }, []);
  return rows;
}

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtRevenue(n: number): string {
  if (n >= 10_00_000) return '₹' + (n / 10_00_000).toFixed(1) + 'L';
  if (n >= 1_000)     return '₹' + (n / 1_000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}

function fmtINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const STATUS_CLASSES: Record<string, string> = {
  approved:          'bg-green-100 text-green-800',
  pending:           'bg-amber-100 text-amber-800',
  draft:             'bg-gray-100 text-gray-700',
  rejected:          'bg-red-100 text-red-800',
  'In Production':   'bg-blue-100 text-blue-800',
  'Ready to Ship':   'bg-blue-100 text-blue-800',
  'Materials Ordered':'bg-amber-100 text-amber-800',
};

function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_CLASSES[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

// ── component ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate    = useNavigate();
  const stats       = useDashboardStats();
  const recent      = useRecentQuotations();

  const statCards = [
    { label: 'Total Quotations', value: stats.loading ? '\u2026' : String(stats.quotations), icon: '&#128203;', color: 'text-amber-700', path: '/quotations' },
    { label: 'Total Customers',  value: stats.loading ? '\u2026' : String(stats.customers),  icon: '&#128101;', color: 'text-blue-700',   path: '/customers'  },
    { label: 'Active Orders',    value: stats.loading ? '\u2026' : String(stats.activeOrders) + ' / ' + String(stats.orders), icon: '&#128230;', color: 'text-emerald-700', path: '/orders' },
    { label: 'Revenue (&#8377;)',value: stats.loading ? '\u2026' : fmtRevenue(stats.revenue), icon: '&#128176;', color: 'text-green-700',  path: '/quotations' },
  ];

  return (
    <div>
      {/* Greeting */}
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        Good day, {profile?.name?.split(' ')[0] ?? 'there'} 👋
      </h2>
      <p className="text-sm text-gray-500 mb-5 capitalize">
        Role: <strong>{profile?.role}</strong>
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} onClick={() => navigate(s.path)}
            className="bg-white border border-[#ede5d4] rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl" dangerouslySetInnerHTML={{ __html: s.icon }} />
              <span className="text-xs text-gray-400 font-medium">Live</span>
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5" dangerouslySetInnerHTML={{ __html: s.label }} />
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid lg:grid-cols-5 gap-5">

        {/* Recent Quotations */}
        <div className="lg:col-span-3 bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 text-sm">Recent Quotations</h3>
            <button onClick={() => navigate('/quotations')} className="text-xs text-amber-700 hover:underline font-medium">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            {recent.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                No quotations yet. <button onClick={() => navigate('/quotations/new')} className="text-amber-700 hover:underline">Create one →</button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-semibold">No.</th>
                    <th className="px-5 py-3 text-left font-semibold">Customer</th>
                    <th className="px-5 py-3 text-right font-semibold hidden sm:table-cell">Amount</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((q, idx) => (
                    <tr key={q.id} className={'border-b border-[#f0ece4] hover:bg-[#fdf8ee] cursor-pointer' + (idx === recent.length - 1 ? ' border-b-0' : '')}
                      onClick={() => navigate('/quotations')}>
                      <td className="px-5 py-3 font-mono text-xs text-amber-700 font-semibold">{q.quotationNo}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">
                        {q.customerName}
                        <div className="text-xs text-gray-400">{q.customerPlace}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-700 hidden sm:table-cell text-right">{fmtINR(q.grandTotal)}</td>
                      <td className="px-5 py-3"><Badge status={q.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: 'New Quotation', path: '/quotations/new', color: 'bg-amber-600',   emoji: '📋' },
              { label: 'Add Product',   path: '/products',       color: 'bg-emerald-600', emoji: '🪔' },
              { label: 'Add Customer',  path: '/customers',      color: 'bg-blue-600',    emoji: '👤' },
              { label: 'Quotations',    path: '/quotations',     color: 'bg-purple-600',  emoji: '📄' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`${a.color} text-white rounded-xl p-4 text-left hover:opacity-90 transition-opacity`}>
                <div className="text-xl mb-2">{a.emoji}</div>
                <div className="text-xs font-semibold">{a.label}</div>
              </button>
            ))}
          </div>

          {/* Revenue breakdown */}
          <div className="px-5 pb-5">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Revenue Summary</div>
              <div className="text-2xl font-bold text-amber-800">
                {stats.loading ? '…' : fmtRevenue(stats.revenue)}
              </div>
              <div className="text-xs text-amber-600 mt-1">Across {stats.quotations} quotation{stats.quotations !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
