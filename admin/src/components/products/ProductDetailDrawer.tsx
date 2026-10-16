import { paiseToRupees } from '../../types';
import type { Product } from '../../types';

interface Props {
  product: Product;
  canEdit: boolean;
  onClose:        () => void;
  onEdit:         (p: Product) => void;
  onToggleStatus: (p: Product) => void;
}

export default function ProductDetailDrawer({ product: p, canEdit, onClose, onEdit, onToggleStatus }: Props) {
  const isActive = p.status === 'active';

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-800">Product Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Images */}
          {p.images && p.images.length > 0 ? (
            <div className={`grid ${p.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
              {p.images.map((img, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden bg-amber-50 border border-amber-100">
                  <img
                    src={img.downloadUrl}
                    alt={`${p.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-100 flex items-center justify-center text-6xl">
              🪔
            </div>
          )}

          {/* Name & status */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-gray-900 text-lg leading-snug">{p.name}</h4>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0
                ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-amber-700 font-bold mt-1">{p.category}</p>
          </div>

          {/* Description */}
          {p.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
            </div>
          )}

          {/* Specs grid */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
            <Spec label="Unit Price" value={paiseToRupees(p.pricePaise)} highlight />
            <Spec label="Unit" value={p.unit} />
            {p.dimensions  && <Spec label="Dimensions"  value={p.dimensions} />}
            {p.thickness   && <Spec label="Thickness"   value={`${p.thickness} mm`} />}
            {p.hsnCode     && <Spec label="HSN Code"    value={p.hsnCode} />}
            <Spec label="Quotation" value={p.activeForQuotations ? 'Available' : 'Excluded'} />
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400 space-y-1">
            <p>ID: <span className="font-mono">{p.id}</span></p>
            <p>Created by: {p.createdBy}</p>
          </div>
        </div>

        {/* Footer actions */}
        {canEdit && (
          <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => onEdit(p)}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90"
            >
              Edit Product
            </button>
            <button
              onClick={() => onToggleStatus(p)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-colors
                ${isActive
                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                  : 'border-green-400 text-green-700 hover:bg-green-50'
                }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Spec({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-amber-700' : 'text-gray-800'}`}>{value}</p>
    </div>
  );
}
