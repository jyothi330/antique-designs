import { useState } from 'react';
import type { Customer } from '../../types';
import { addCustomer, updateCustomer } from '../../lib/customers';
import { useAuth } from '../../contexts/AuthContext';

// Extend context value locally — firebaseUser holds the uid we need

interface Props {
  customer?: Customer & { docId: string }; // docId = Firestore document ID
  onClose: () => void;
  onSaved: (msg: string) => void;
}

interface FormState {
  name: string; place: string; phone: string;
  email: string; address: string; notes: string;
}

interface Errors { name?: string; place?: string; phone?: string; }

const EMPTY: FormState = { name: '', place: '', phone: '', email: '', address: '', notes: '' };

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim())  e.name  = 'Name is required';
  if (!f.place.trim()) e.place = 'Place is required';
  if (!f.phone.trim()) e.phone = 'Phone is required';
  return e;
}

export default function CustomerForm({ customer, onClose, onSaved }: Props) {
  const { firebaseUser } = useAuth();
  const isEdit = !!customer;

  const [form, setForm] = useState<FormState>(
    isEdit
      ? { name: customer.name, place: customer.place, phone: customer.phone,
          email: customer.email || '', address: customer.address || '', notes: customer.notes || '' }
      : EMPTY,
  );
  const [errors, setErrors]   = useState<Errors>({});
  const [saving, setSaving]   = useState(false);

  function set(field: keyof FormState, v: string) {
    setForm(p => ({ ...p, [field]: v }));
    if (errors[field as keyof Errors]) setErrors(p => ({ ...p, [field]: undefined }));
  }

  async function submit() {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const payload: Parameters<typeof updateCustomer>[1] = {
          name:  form.name.trim(),
          place: form.place.trim(),
          phone: form.phone.trim(),
        };
        if (form.email.trim())   payload.email   = form.email.trim();
        if (form.address.trim()) payload.address = form.address.trim();
        if (form.notes.trim())   payload.notes   = form.notes.trim();
        await updateCustomer(customer.docId, payload);
        onSaved('Customer updated');
      } else {
        const payload: Parameters<typeof addCustomer>[0] = {
          name:  form.name.trim(),
          place: form.place.trim(),
          phone: form.phone.trim(),
          createdBy: firebaseUser!.uid,
        };
        if (form.email.trim())   payload.email   = form.email.trim();
        if (form.address.trim()) payload.address = form.address.trim();
        if (form.notes.trim())   payload.notes   = form.notes.trim();
        await addCustomer(payload);
        onSaved('Customer added');
      }
      onClose();
    } catch (err) {
      alert('Save failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  const inp = 'w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';
  const err = 'text-xs text-red-500 mt-1';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-800">
              {isEdit ? 'Edit Customer' : 'Add Customer'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Name *</label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Mahadeva A S"
                  className={inp + (errors.name ? ' border-red-400' : ' border-gray-200')} />
                {errors.name && <p className={err}>{errors.name}</p>}
              </div>
              <div>
                <label className={lbl}>Place / City *</label>
                <input type="text" value={form.place} onChange={e => set('place', e.target.value)}
                  placeholder="e.g. Mysore"
                  className={inp + (errors.place ? ' border-red-400' : ' border-gray-200')} />
                {errors.place && <p className={err}>{errors.place}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Phone *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inp + (errors.phone ? ' border-red-400' : ' border-gray-200')} />
                {errors.phone && <p className={err}>{errors.phone}</p>}
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="customer@email.com"
                  className={inp + ' border-gray-200'} />
              </div>
            </div>

            <div>
              <label className={lbl}>Address</label>
              <textarea value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Full address…" rows={2}
                className={inp + ' border-gray-200 resize-none'} />
            </div>

            <div>
              <label className={lbl}>Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                placeholder="Any internal notes…" rows={2}
                className={inp + ' border-gray-200 resize-none'} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
