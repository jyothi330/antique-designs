import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getSettings, saveSettings } from '../lib/settings';
import {
  listUsers, inviteStaff, activateUser, deactivateUser, removeUser,
} from '../lib/users';
import type { UserProfile } from '../types';

// ── defaults (used on first launch before any Firestore doc exists) ────────────
const DEFAULTS = {
  companyName:           'ANTIQUE DESIGNS',
  gstNumber:             '29ABTFA2399G1ZT',
  address:               '#39/1 CHANNENAHALLI, KADABAGERE POST, MAGADI MAIN ROAD, BANGALORE SOUTH - 562130',
  email:                 'hello@antique-designs.com',
  website:               'www.antiquedesigns.in',
  phones:                '',   // comma-separated string in UI → array on save
  bankName:              'UNION BANK OF INDIA',
  bankAccount:           '317225140000004',
  bankIfsc:              'UBIN0931721',
  bankBranch:            'CHANNENAHALLI',
  defaultHsnCode:        '74199930',
  defaultGstPercent:     '5',
  defaultValidityDays:   '30',
  defaultPackingCharge:  '1000',
  advancePercent:        '75',
  deliveryLeadDays:      '45',
};

type FormState = typeof DEFAULTS;

export default function SettingsPage() {
  const { profile, firebaseUser } = useAuth();
  const isOwner = profile?.role === 'owner';

  const [form,    setForm]    = useState<FormState>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');
  const [dirty,   setDirty]   = useState(false);

  // ── load from Firestore on mount ─────────────────────────────────────────────
  useEffect(() => {
    getSettings().then(s => {
      if (s) {
        setForm({
          companyName:          s.companyName          ?? DEFAULTS.companyName,
          gstNumber:            s.gstNumber            ?? DEFAULTS.gstNumber,
          address:              s.address              ?? DEFAULTS.address,
          email:                s.email                ?? DEFAULTS.email,
          website:              s.website              ?? DEFAULTS.website,
          phones:               (s.phones ?? []).join(', '),
          bankName:             s.bankName             ?? DEFAULTS.bankName,
          bankAccount:          s.bankAccount          ?? DEFAULTS.bankAccount,
          bankIfsc:             s.bankIfsc             ?? DEFAULTS.bankIfsc,
          bankBranch:           s.bankBranch           ?? DEFAULTS.bankBranch,
          defaultHsnCode:       s.defaultHsnCode       ?? DEFAULTS.defaultHsnCode,
          defaultGstPercent:    String(s.defaultGstPercent    ?? DEFAULTS.defaultGstPercent),
          defaultValidityDays:  String(s.defaultValidityDays  ?? DEFAULTS.defaultValidityDays),
          defaultPackingCharge: String(s.defaultPackingCharge ?? DEFAULTS.defaultPackingCharge),
          advancePercent:       String(s.advancePercent       ?? DEFAULTS.advancePercent),
          deliveryLeadDays:     String(s.deliveryLeadDays     ?? DEFAULTS.deliveryLeadDays),
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function set(key: keyof FormState, value: string) {
    setForm(p => ({ ...p, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings({
        companyName:          form.companyName.trim(),
        gstNumber:            form.gstNumber.trim(),
        address:              form.address.trim(),
        email:                form.email.trim(),
        website:              form.website.trim(),
        phones:               form.phones.split(',').map(p => p.trim()).filter(Boolean),
        bankName:             form.bankName.trim(),
        bankAccount:          form.bankAccount.trim(),
        bankIfsc:             form.bankIfsc.trim(),
        bankBranch:           form.bankBranch.trim(),
        defaultHsnCode:       form.defaultHsnCode.trim(),
        defaultGstPercent:    parseFloat(form.defaultGstPercent)    || 5,
        defaultValidityDays:  parseInt(form.defaultValidityDays)    || 30,
        defaultPackingCharge: parseFloat(form.defaultPackingCharge) || 1000,
        advancePercent:       parseFloat(form.advancePercent)       || 75,
        deliveryLeadDays:     parseInt(form.deliveryLeadDays)       || 45,
        updatedBy:            firebaseUser?.uid ?? '',
      }, firebaseUser?.uid ?? '');
      setDirty(false);
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (e) {
      alert('Save failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    // Re-load from Firestore (discard unsaved changes)
    setLoading(true);
    getSettings().then(s => {
      if (s) {
        setForm({
          companyName:          s.companyName          ?? DEFAULTS.companyName,
          gstNumber:            s.gstNumber            ?? DEFAULTS.gstNumber,
          address:              s.address              ?? DEFAULTS.address,
          email:                s.email                ?? DEFAULTS.email,
          website:              s.website              ?? DEFAULTS.website,
          phones:               (s.phones ?? []).join(', '),
          bankName:             s.bankName             ?? DEFAULTS.bankName,
          bankAccount:          s.bankAccount          ?? DEFAULTS.bankAccount,
          bankIfsc:             s.bankIfsc             ?? DEFAULTS.bankIfsc,
          bankBranch:           s.bankBranch           ?? DEFAULTS.bankBranch,
          defaultHsnCode:       s.defaultHsnCode       ?? DEFAULTS.defaultHsnCode,
          defaultGstPercent:    String(s.defaultGstPercent    ?? DEFAULTS.defaultGstPercent),
          defaultValidityDays:  String(s.defaultValidityDays  ?? DEFAULTS.defaultValidityDays),
          defaultPackingCharge: String(s.defaultPackingCharge ?? DEFAULTS.defaultPackingCharge),
          advancePercent:       String(s.advancePercent       ?? DEFAULTS.advancePercent),
          deliveryLeadDays:     String(s.deliveryLeadDays     ?? DEFAULTS.deliveryLeadDays),
        });
      } else {
        setForm(DEFAULTS);
      }
      setDirty(false);
    }).finally(() => setLoading(false));
  }

  const inp = (disabled: boolean) =>
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500' +
    (disabled ? ' opacity-60 cursor-not-allowed' : '');
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Settings</h2>
        <div className="text-center py-20 text-gray-400 text-sm">Loading settings&hellip;</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          {dirty && <p className="text-xs text-amber-600 mt-0.5 font-medium">You have unsaved changes</p>}
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <button onClick={handleReset} disabled={saving || !dirty}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving || !dirty}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? 'Saving\u2026' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      {!isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 font-medium mb-5">
          &#9888;&#65039; You have read-only access. Only the <strong>owner</strong> can modify these values.
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium mb-5 flex items-center justify-between">
          <span>&#10003; {toast}</span>
          <button onClick={() => setToast('')} className="text-green-500 hover:text-green-700 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Company Info */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Company Information</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Company Name</label>
              <input type="text" value={form.companyName} disabled={!isOwner}
                onChange={e => set('companyName', e.target.value)} className={inp(!isOwner)} />
            </div>
            <div>
              <label className={lbl}>GST Number</label>
              <input type="text" value={form.gstNumber} disabled={!isOwner}
                onChange={e => set('gstNumber', e.target.value)} className={inp(!isOwner)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Address</label>
            <textarea rows={2} value={form.address} disabled={!isOwner}
              onChange={e => set('address', e.target.value)}
              className={'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 resize-none focus:outline-none focus:border-amber-500' +
                (!isOwner ? ' opacity-60 cursor-not-allowed' : '')} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Email</label>
              <input type="email" value={form.email} disabled={!isOwner}
                onChange={e => set('email', e.target.value)} className={inp(!isOwner)} />
            </div>
            <div>
              <label className={lbl}>Website</label>
              <input type="text" value={form.website} disabled={!isOwner}
                onChange={e => set('website', e.target.value)} className={inp(!isOwner)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Phone Numbers <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input type="text" value={form.phones} disabled={!isOwner}
              onChange={e => set('phones', e.target.value)}
              placeholder="e.g. +91 98765 43210, +91 80 1234 5678"
              className={inp(!isOwner)} />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Bank Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Bank Name</label>
            <input type="text" value={form.bankName} disabled={!isOwner}
              onChange={e => set('bankName', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Account Number</label>
            <input type="text" value={form.bankAccount} disabled={!isOwner}
              onChange={e => set('bankAccount', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>IFSC Code</label>
            <input type="text" value={form.bankIfsc} disabled={!isOwner}
              onChange={e => set('bankIfsc', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Branch</label>
            <input type="text" value={form.bankBranch} disabled={!isOwner}
              onChange={e => set('bankBranch', e.target.value)} className={inp(!isOwner)} />
          </div>
        </div>
      </div>

      {/* Quotation Defaults */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Quotation Defaults</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>HSN Code</label>
            <input type="text" value={form.defaultHsnCode} disabled={!isOwner}
              onChange={e => set('defaultHsnCode', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Default GST (%)</label>
            <input type="number" value={form.defaultGstPercent} disabled={!isOwner}
              onChange={e => set('defaultGstPercent', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Validity (days)</label>
            <input type="number" value={form.defaultValidityDays} disabled={!isOwner}
              onChange={e => set('defaultValidityDays', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Packing Charge (&#8377;)</label>
            <input type="number" value={form.defaultPackingCharge} disabled={!isOwner}
              onChange={e => set('defaultPackingCharge', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Advance Required (%)</label>
            <input type="number" value={form.advancePercent} disabled={!isOwner}
              onChange={e => set('advancePercent', e.target.value)} className={inp(!isOwner)} />
          </div>
          <div>
            <label className={lbl}>Delivery Lead Days</label>
            <input type="number" value={form.deliveryLeadDays} disabled={!isOwner}
              onChange={e => set('deliveryLeadDays', e.target.value)} className={inp(!isOwner)} />
          </div>
        </div>
      </div>

      {/* Team — owner only */}
      {isOwner && <TeamSection uid={firebaseUser?.uid ?? ''} />}

      {/* Bottom save bar */}
      {isOwner && (
        <div className={`sticky bottom-4 flex justify-end gap-3 transition-opacity ${dirty ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="bg-white border border-[#ede5d4] rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-amber-700 font-medium">Unsaved changes</span>
            <button onClick={handleReset} disabled={saving}
              className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Discard
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-1.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? 'Saving\u2026' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Invite Staff Modal ────────────────────────────────────────────────────────
function InviteModal({ uid, onClose, onDone }: { uid: string; onClose: () => void; onDone: () => void }) {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [role,    setRole]    = useState<'staff' | 'owner'>('staff');
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');

  async function submit() {
    if (!name.trim() || !email.trim()) { setErr('Name and email are required.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr('Enter a valid email address.'); return; }
    setSaving(true);
    setErr('');
    try {
      await inviteStaff({ name: name.trim(), email: email.trim(), role }, uid);
      onDone();
      onClose();
    } catch (e) {
      setErr('Failed: ' + (e instanceof Error ? e.message : String(e)));
    } finally { setSaving(false); }
  }

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500';
  const lbl = 'block text-xs font-semibold text-gray-500 mb-1.5';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Invite Staff Member</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <strong>How it works:</strong><br />
              1. Create the account in <strong>Firebase Console &rarr; Authentication</strong> first.<br />
              2. Then fill this form &mdash; a Firestore profile is created and a password-reset email is sent.<br />
              3. Click <strong>Activate</strong> after the staff member has signed in.
            </div>
            {err && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{err}</div>}
            <div>
              <label className={lbl}>Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className={inp} />
            </div>
            <div>
              <label className={lbl}>Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@example.com" className={inp} />
            </div>
            <div>
              <label className={lbl}>Role</label>
              <select value={role} onChange={e => setRole(e.target.value as 'staff' | 'owner')} className={inp}>
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-50">
              {saving ? 'Inviting\u2026' : 'Invite & Send Email'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Team Section ──────────────────────────────────────────────────────────────
function TeamSection({ uid }: { uid: string }) {
  const [users,       setUsers]       = useState<UserProfile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showInvite,  setShowInvite]  = useState(false);
  const [actionId,    setActionId]    = useState<string | null>(null); // which row is busy
  const [toast,       setToast]       = useState('');

  function reload() {
    setLoading(true);
    listUsers()
      .then(u => setUsers(u.sort((a, b) => (a.role === 'owner' ? -1 : 1) - (b.role === 'owner' ? -1 : 1))))
      .finally(() => setLoading(false));
  }

  useEffect(() => { reload(); }, []);

  async function handleActivate(u: UserProfile) {
    setActionId(u.uid);
    try { await activateUser(u.uid); setToast(`${u.name} activated`); reload(); }
    catch (e) { alert('Failed: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setActionId(null); }
  }

  async function handleDeactivate(u: UserProfile) {
    if (!confirm(`Deactivate ${u.name}? They will lose access immediately.`)) return;
    setActionId(u.uid);
    try { await deactivateUser(u.uid); setToast(`${u.name} deactivated`); reload(); }
    catch (e) { alert('Failed: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setActionId(null); }
  }

  async function handleRemove(u: UserProfile) {
    if (!confirm(`Permanently remove ${u.name} (${u.email})?\n\nThis deletes their Firestore profile. The Firebase Auth account must be removed separately in the console.`)) return;
    setActionId(u.uid);
    try { await removeUser(u.uid); setToast(`${u.name} removed`); reload(); }
    catch (e) { alert('Failed: ' + (e instanceof Error ? e.message : String(e))); }
    finally { setActionId(null); }
  }

  return (
    <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm">Team Members</h3>
        <button onClick={() => setShowInvite(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
          + Invite Staff
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center justify-between">
          <span>&#10003; {toast}</span>
          <button onClick={() => setToast('')} className="ml-2 text-green-500 hover:text-green-700">&times;</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6 text-gray-400 text-sm">Loading team&hellip;</div>
      ) : users.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">No team members found.</div>
      ) : (
        <div className="space-y-2">
          {users.map(m => {
            const isSelf  = m.uid === uid;
            const busy    = actionId === m.uid;
            const isOwner = m.role === 'owner';
            return (
              <div key={m.uid} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {m.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {m.name}
                      {isSelf && <span className="ml-1.5 text-xs text-amber-600 font-normal">(you)</span>}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Role badge */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${isOwner ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {m.role}
                  </span>
                  {/* Active badge */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                    ${m.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.active ? 'Active' : 'Inactive'}
                  </span>
                  {/* Actions — never on self, never on sole owner */}
                  {!isSelf && (
                    <>
                      {m.active ? (
                        <button onClick={() => handleDeactivate(m)} disabled={busy}
                          className="text-xs text-amber-600 hover:text-amber-800 border border-amber-200 rounded px-2 py-0.5 hover:bg-amber-50 disabled:opacity-40 transition-colors">
                          {busy ? '\u2026' : 'Deactivate'}
                        </button>
                      ) : (
                        <button onClick={() => handleActivate(m)} disabled={busy}
                          className="text-xs text-green-600 hover:text-green-800 border border-green-200 rounded px-2 py-0.5 hover:bg-green-50 disabled:opacity-40 transition-colors">
                          {busy ? '\u2026' : 'Activate'}
                        </button>
                      )}
                      <button onClick={() => handleRemove(m)} disabled={busy}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-0.5 hover:bg-red-50 disabled:opacity-40 transition-colors">
                        {busy ? '\u2026' : 'Remove'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        * Create the Firebase Auth account in the <strong>Firebase Console &rarr; Authentication</strong> first,
        then invite here. Set the Firestore doc ID to the real UID after first sign-in.
      </p>

      {showInvite && (
        <InviteModal
          uid={uid}
          onClose={() => setShowInvite(false)}
          onDone={() => { reload(); }}
        />
      )}
    </div>
  );
}
