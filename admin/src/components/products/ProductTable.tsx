import type { Product } from '../../types';
import { paiseToRupees } from '../../types';

interface Props {
  products: Product[];
  canEdit:  boolean;
  onView:         (p: Product) => void;
  onEdit:         (p: Product) => void;
  onToggleStatus: (p: Product) => void;
  onDelete:       (p: Product) => void;
}

export default function ProductTable({ products, canEdit, onView, onEdit, onToggleStatus, onDelete }: Props) {
  return (
    <div className="bg-white border border-[#ede5d4] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="px-5 py-3.5 text-left font-semibold w-16">Image</th>
              <th className="px-5 py-3.5 text-left font-semibold">Product</th>
              <th className="px-5 py-3.5 text-left font-semibold hidden md:table-cell">Category</th>
              <th className="px-5 py-3.5 text-left font-semibold hidden lg:table-cell">Dimensions</th>
              <th className="px-5 py-3.5 text-right font-semibold">Price</th>
              <th className="px-5 py-3.5 text-left font-semibold hidden sm:table-cell">Unit</th>
              <th className="px-5 py-3.5 text-left font-semibold">Status</th>
              <th className="px-5 py-3.5 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                  No products match your filters.
                </td>
              </tr>
            ) : products.map(p => {
              const isActive = p.status === 'active';
              const firstImg = p.images?.[0];
              return (
                <tr
                  key={p.id}
                  className={`border-b border-[#f0ece4] hover:bg-[#fdf8ee] cursor-pointer
                    ${!isActive ? 'opacity-60' : ''}`}
                  onClick={() => onView(p)}
                >
                  {/* Thumbnail */}
                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <div className="w-12 h-10 rounded-lg bg-amber-50 border border-amber-100 overflow-hidden flex items-center justify-center">
                      {firstImg
                        ? <img src={firstImg.downloadUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-lg">🪔</span>
                      }
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-5 py-3">
                    <div className="font-semibold text-gray-800 max-w-xs truncate">{p.name}</div>
                    {p.description && (
                      <div className="text-xs text-gray-400 truncate max-w-xs">{p.description}</div>
                    )}
                  </td>

                  <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{p.category}</td>

                  <td className="px-5 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {p.dimensions ?? '—'}
                    {p.thickness ? ` · ${p.thickness}mm` : ''}
                  </td>

                  <td className="px-5 py-3 text-right font-bold text-amber-700">
                    {paiseToRupees(p.pricePaise)}
                  </td>

                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">{p.unit}</td>

                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
                      ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2 text-xs">
                      <button onClick={() => onView(p)} className="text-amber-700 hover:underline font-medium">
                        View
                      </button>
                      {canEdit && (
                        <>
                          <span className="text-gray-300">|</span>
                          <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline font-medium">
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
