import type { Product } from '../../types';
import { paiseToRupees } from '../../types';

interface Props {
  product: Product;
  canEdit: boolean;
  onView:         (p: Product) => void;
  onEdit:         (p: Product) => void;
  onToggleStatus: (p: Product) => void;
  onDelete:       (p: Product) => void;
}

export default function ProductCard({ product: p, canEdit, onView, onEdit, onToggleStatus, onDelete }: Props) {
  const isActive = p.status === 'active';
  const firstImg = p.images?.[0];

  return (
    <div
      className={`bg-white border rounded-xl p-4 hover:shadow-md transition-all group cursor-pointer
        ${isActive ? 'border-[#ede5d4]' : 'border-gray-200 opacity-60'}`}
      onClick={() => onView(p)}
    >
      {/* Image */}
      <div className="w-full h-36 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg mb-3 flex items-center justify-center border border-amber-100 overflow-hidden relative">
        {firstImg ? (
          <img
            src={firstImg.downloadUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="text-4xl">🪔</span>
        )}
        {!isActive && (
          <div className="absolute inset-0 bg-gray-200/60 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-500 bg-white rounded-full px-2 py-0.5 border">Inactive</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="font-semibold text-gray-800 text-sm leading-snug mb-1 group-hover:text-amber-700 transition-colors line-clamp-2">
        {p.name}
      </div>
      <div className="text-xs text-gray-400 mb-2">{p.category}</div>

      {p.dimensions && <div className="text-xs text-gray-500 mb-1">📐 {p.dimensions}{p.thickness ? ` · ${p.thickness}mm thick` : ''}</div>}

      <div className="flex items-center justify-between mt-2">
        <div>
          <span className="text-amber-700 font-bold text-sm">{paiseToRupees(p.pricePaise)}</span>
          <span className="text-xs text-gray-400 ml-1">{p.unit}</span>
        </div>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
          ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Actions */}
      <div
        className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs"
        onClick={e => e.stopPropagation()}
      >
        <span className="text-gray-400 font-mono truncate max-w-[80px]">{p.id.slice(0, 8)}…</span>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <button onClick={() => onEdit(p)} className="text-amber-700 hover:underline font-medium">
                Edit
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => onToggleStatus(p)}
                className={`font-medium ${isActive ? 'text-gray-500 hover:text-orange-600' : 'text-green-700 hover:underline'}`}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
              <span className="text-gray-300">|</span>
              <button onClick={() => onDelete(p)} className="text-red-400 hover:text-red-600 font-medium">
                Delete
              </button>
            </>
          )}
          {!canEdit && (
            <button onClick={() => onView(p)} className="text-amber-700 hover:underline font-medium">View</button>
          )}
        </div>
      </div>
    </div>
  );
}
