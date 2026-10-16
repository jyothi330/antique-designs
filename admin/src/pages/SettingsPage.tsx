import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'owner';

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Settings</h2>

      {!isOwner && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 font-medium mb-5">
          ⚠️ You have read-only access to settings. Only the <strong>owner</strong> can modify these values.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-700 font-medium mb-5">
        ℹ️ Settings persistence will be connected to Firestore in Step 3.
      </div>

      {/* Company Info */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Company Information</h3>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Company Name"  value="ANTIQUE DESIGNS"   disabled={!isOwner} />
            <Field label="GST Number"    value="29ABTFA2399G1ZT"   disabled={!isOwner} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Address</label>
            <textarea rows={2} disabled={!isOwner}
              defaultValue="#39/1 CHANNENAHALLI, KADABAGERE POST, MAGADI MAIN ROAD, BANGALORE SOUTH - 562130"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 resize-none focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email"    value="hello@antique-designs.com" disabled={!isOwner} />
            <Field label="Website"  value="www.antiquedesigns.in"      disabled={!isOwner} />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Bank Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Bank Name"      value="UNION BANK OF INDIA" disabled={!isOwner} />
          <Field label="Account Number" value="317225140000004"      disabled={!isOwner} />
          <Field label="IFSC Code"      value="UBIN0931721"          disabled={!isOwner} />
          <Field label="Branch"         value="CHANNENAHALLI"        disabled={!isOwner} />
        </div>
      </div>

      {/* Quotation Defaults */}
      <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
        <h3 className="font-semibold text-gray-800 text-sm mb-4 pb-3 border-b border-gray-100">Quotation Defaults</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="HSN Code"             value="74199930" type="text"   disabled={!isOwner} />
          <Field label="Default GST (%)"      value="5"        type="number" disabled={!isOwner} />
          <Field label="Validity (days)"      value="30"       type="number" disabled={!isOwner} />
          <Field label="Packing Charge (₹)"   value="1000"     type="number" disabled={!isOwner} />
          <Field label="Advance Required (%)" value="75"       type="number" disabled={!isOwner} />
          <Field label="Delivery Lead Days"   value="45"       type="number" disabled={!isOwner} />
        </div>
      </div>

      {/* Team — owner only */}
      {isOwner && (
        <div className="bg-white border border-[#ede5d4] rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Team Members</h3>
            <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
              + Invite Staff
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name:'Abhishek', role:'owner', email:'antiquedesigns123@gmail.com', active:true },
              { name:'Sales Team',role:'staff', email:'sales@antique-designs.com',  active:true },
            ].map(m => (
              <div key={m.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                    {m.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize
                    ${m.role === 'owner' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {m.role}
                  </span>
                  {m.role !== 'owner' && (
                    <button className="text-xs text-gray-400 hover:text-red-500">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * Staff accounts must be created in the Firebase Console, then their Firestore profile set here.
          </p>
        </div>
      )}

      {isOwner && (
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90">
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, type = 'text', disabled }: {
  label: string; value: string; type?: string; disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input type={type} defaultValue={value} disabled={disabled}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed" />
    </div>
  );
}
