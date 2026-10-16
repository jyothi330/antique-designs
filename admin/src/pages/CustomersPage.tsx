import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomers } from '../hooks/useCustomers';
import CustomerForm from '../components/customers/CustomerForm';
import { deleteCustomer } from '../lib/customers';
import type { Customer } from '../types';
import Toast from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';

// A customer enriched with its Firestore document ID (for updates/deletes)
type CustomerDoc = Customer & { docId: string };

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch]         = useState('');
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<CustomerDoc | null>(null);
  const [toast, setToast]           = useState('');
  const [confirmId, setConfirmId]   = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');

  const { customers, allCustomers, loading, error } = useCustomers({ search });

  function handleAdd() { setEditing(null); setShowForm(true); }
  function handleEdit(c: CustomerDoc) { setEditing(c); setShowForm(true); }
  function handleClose() { setShowForm(false); setEditing(null); }
  function handleSaved(msg: string) { setToast(msg); }

  function askDelete(c: CustomerDoc) {
    setConfirmId(c.docId);
    setConfirmName(c.name);
  }

  async function handleDelete() {
    if (!confirmId) return;
    try {
      await deleteCustomer(confirmId);
      setToast('Customer deleted');
    } catch (e) {
      alert('Delete failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setConfirmId(null);
    }
  }

  const initials = (name: string) =>
    name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Customers</h2>
          <p className="text-xs text-gray-400 mt-0.5">{allCustomers.length} total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm text-gray-500">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none text-sm w-36 outline-none" />
          </div>
          <button onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
            + Add Customer
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                <th className="px-5 py-3.5 text-left font-semibold">Customer</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden sm:table-cell">Phone</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">Email</th>
                <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Address</th>
                <th className="px-5 py-3.5 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Loading customers…
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                    {search ? 'No customers match your search.' : 'No customers yet. Add your first one!'}
                  </td>
                </tr>
              ) : (
                customers.map((c, idx) => {
                  // Firestore onSnapshot gives us docs — we need the doc ID.
                  // We stored it as c.id which may be the sequential 'C-001' or the Firestore docId.
                  // useCustomers sets id: d.id (Firestore docId). So c.id is docId here.
                  const cDoc: CustomerDoc = { ...c, docId: c.id };
                  return (
                    <tr key={c.id} className={'border-b border-[#f0ece4] hover:bg-[#fdf8ee]' + (idx === customers.length - 1 ? ' border-b-0' : '')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(c.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.place}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{c.phone}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs hidden lg:table-cell">{c.email || '—'}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs hidden md:table-cell truncate max-w-xs">{c.address || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-xs">
                          <button onClick={() => navigate('/quotations/new', { state: { customerId: c.id, customerName: c.name, customerPlace: c.place } })}
                            className="text-amber-700 hover:underline font-medium">New Quote</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => handleEdit(cDoc)} className="text-gray-500 hover:underline">Edit</button>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => askDelete(cDoc)} className="text-red-400 hover:text-red-600">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          {allCustomers.length} customer{allCustomers.length !== 1 ? 's' : ''} · live from Firestore
        </div>
      </div>

      {/* ── Modals & overlays ── */}
      {showForm && (
        <CustomerForm
          customer={editing ?? undefined}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}

      {confirmId && (
        <ConfirmDialog
          title="Delete Customer"
          message={`Are you sure you want to delete "${confirmName}"? This cannot be undone.`}
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
