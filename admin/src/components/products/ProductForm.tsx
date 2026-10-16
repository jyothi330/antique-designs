import { useState, useRef, useCallback } from 'react';
import type { Product, ProductImage } from '../../types';
import { PRODUCT_CATEGORIES, paiseToRupees } from '../../types';
import {
  validateProductForm,
  validateImageFile,
  uploadProductImage,
  deleteProductImage,
  createProduct,
  updateProduct,
  type ProductFormData,
  type ValidationErrors,
} from '../../lib/products';
import { useAuth } from '../../contexts/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** Existing product when editing; undefined when adding */
  product?: Product;
  onSaved:  (productId: string) => void;
  onCancel: () => void;
}

interface PendingImage {
  /** Local object URL for preview before upload */
  previewUrl:  string;
  file:        File;
  uploadPct:   number;
  /** Set after successful upload */
  uploaded?:   ProductImage;
  error?:      string;
}

const UNIT_SUGGESTIONS = [
  'per panel', 'per door', 'per set', 'per sqft', 'per rft',
  'per nos', 'per plate', 'per meter',
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid ?? '';
  const isEdit = !!product;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<ProductFormData>({
    name:        product?.name        ?? '',
    category:    product?.category    ?? '',
    description: product?.description ?? '',
    dimensions:  product?.dimensions  ?? '',
    thickness:   product?.thickness   ?? '',
    unit:        product?.unit        ?? '',
    priceRupees: product ? String(product.pricePaise / 100) : '',
    hsnCode:     product?.hsnCode     ?? '',
  });

  const [errors,      setErrors]      = useState<ValidationErrors>({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Image state ─────────────────────────────────────────────────────────────
  /** Existing images already saved to Storage (from edit mode) */
  const [existingImages, setExistingImages] = useState<ProductImage[]>(
    product?.images ?? []
  );
  /** New images the user just picked, not yet saved to Firestore */
  const [pendingImages,  setPendingImages]  = useState<PendingImage[]>([]);
  const [removingPath,   setRemovingPath]   = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  function setField(field: keyof ProductFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field as keyof ValidationErrors]) {
      setErrors(e => ({ ...e, [field]: undefined }));
    }
  }

  // ── Image picking ────────────────────────────────────────────────────────────

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // allow re-picking the same file

    const newPending: PendingImage[] = [];
    for (const file of files) {
      const err = validateImageFile(file);
      newPending.push({
        previewUrl: URL.createObjectURL(file),
        file,
        uploadPct:  0,
        error:      err ?? undefined,
      });
    }
    setPendingImages(p => [...p, ...newPending]);
  }, []);

  function removePending(idx: number) {
    setPendingImages(p => {
      URL.revokeObjectURL(p[idx].previewUrl);
      return p.filter((_, i) => i !== idx);
    });
  }

  async function removeExisting(img: ProductImage) {
    setRemovingPath(img.storagePath);
    try {
      await deleteProductImage(img.storagePath);
      setExistingImages(e => e.filter(i => i.storagePath !== img.storagePath));
    } catch {
      // Storage delete might fail (already gone, rules, etc.) — still remove from list
      setExistingImages(e => e.filter(i => i.storagePath !== img.storagePath));
    } finally {
      setRemovingPath(null);
    }
  }

  // ── Upload all pending images ────────────────────────────────────────────────

  async function uploadPendingImages(productId: string): Promise<ProductImage[]> {
    const uploaded: ProductImage[] = [];
    for (let i = 0; i < pendingImages.length; i++) {
      const pi = pendingImages[i];
      if (pi.error) continue; // skip invalid files silently
      if (pi.uploaded) { uploaded.push(pi.uploaded); continue; }

      const { promise } = uploadProductImage(productId, pi.file, uid, pct => {
        setPendingImages(prev =>
          prev.map((p, idx) => idx === i ? { ...p, uploadPct: pct } : p)
        );
      });

      try {
        const imgMeta = await promise;
        uploaded.push(imgMeta);
        setPendingImages(prev =>
          prev.map((p, idx) => idx === i ? { ...p, uploaded: imgMeta } : p)
        );
      } catch (err) {
        setPendingImages(prev =>
          prev.map((p, idx) => idx === i
            ? { ...p, error: 'Upload failed — image not saved.' }
            : p
          )
        );
        // Don't throw — skip this image; show inline error
      }
    }
    return uploaded;
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    const errs = validateProductForm(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      if (isEdit && product) {
        // Upload any new images first, then update doc
        const newImgs   = await uploadPendingImages(product.id);
        const allImages = [...existingImages, ...newImgs];
        await updateProduct(product.id, form, allImages, uid);
        onSaved(product.id);
      } else {
        // Create doc first (to get an ID for the storage path), then upload
        const docId     = await createProduct(form, [], uid);
        const newImgs   = await uploadPendingImages(docId);
        if (newImgs.length > 0) {
          // Patch the doc with the uploaded image metadata
          await updateProduct(docId, form, newImgs, uid);
        }
        onSaved(docId);
      }
    } catch (err) {
      setSubmitError((err as Error).message ?? 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg">
              {isEdit ? 'Edit Product' : 'Add Product'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {submitError}
                </div>
              )}

              {/* Name */}
              <FormField label="Product Name *" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. Panel Accessory — Brass 10mm"
                  className={inputCls(!!errors.name)}
                />
              </FormField>

              {/* Category */}
              <FormField label="Category *" error={errors.category}>
                <select
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  className={inputCls(!!errors.category)}
                >
                  <option value="">— Select category —</option>
                  {PRODUCT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              {/* Description */}
              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Optional product description…"
                  rows={3}
                  className={inputCls(false) + ' resize-none'}
                />
              </FormField>

              {/* Dimensions + Thickness */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label='Dimensions (e.g. 18"×24")'>
                  <input
                    type="text"
                    value={form.dimensions}
                    onChange={e => setField('dimensions', e.target.value)}
                    placeholder='18" × 24"'
                    className={inputCls(false)}
                  />
                </FormField>
                <FormField label="Thickness (mm)">
                  <input
                    type="text"
                    value={form.thickness}
                    onChange={e => setField('thickness', e.target.value)}
                    placeholder="10"
                    className={inputCls(false)}
                  />
                </FormField>
              </div>

              {/* Unit + Price */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Unit of Measurement *" error={errors.unit}>
                  <input
                    type="text"
                    list="unit-suggestions"
                    value={form.unit}
                    onChange={e => setField('unit', e.target.value)}
                    placeholder="per panel"
                    className={inputCls(!!errors.unit)}
                  />
                  <datalist id="unit-suggestions">
                    {UNIT_SUGGESTIONS.map(u => <option key={u} value={u} />)}
                  </datalist>
                </FormField>
                <FormField label="Unit Price (₹) *" error={errors.pricePaise}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.priceRupees}
                      onChange={e => setField('priceRupees', e.target.value)}
                      placeholder="40500"
                      className={inputCls(!!errors.pricePaise) + ' pl-7'}
                    />
                  </div>
                  {form.priceRupees && !errors.pricePaise && (
                    <p className="text-xs text-gray-400 mt-1">
                      = {paiseToRupees(Math.round(parseFloat(form.priceRupees) * 100))}
                    </p>
                  )}
                </FormField>
              </div>

              {/* HSN Code */}
              <FormField label="HSN Code">
                <input
                  type="text"
                  value={form.hsnCode}
                  onChange={e => setField('hsnCode', e.target.value)}
                  placeholder="74199930"
                  className={inputCls(false)}
                />
              </FormField>

              {/* ── Images ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Product Images (JPG, PNG, WebP · max 5 MB each)
                </label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {existingImages.map(img => (
                      <div key={img.storagePath} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={img.downloadUrl} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            disabled={removingPath === img.storagePath}
                            onClick={() => removeExisting(img)}
                            className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded"
                          >
                            {removingPath === img.storagePath ? '…' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending images */}
                {pendingImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {pendingImages.map((pi, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img src={pi.previewUrl} alt="" className="w-full h-full object-cover" />
                        {/* Upload progress overlay */}
                        {!pi.uploaded && !pi.error && pi.uploadPct > 0 && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs">
                            <div className="w-3/4 bg-white/30 rounded-full h-1.5 mb-1">
                              <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${pi.uploadPct}%` }} />
                            </div>
                            {pi.uploadPct}%
                          </div>
                        )}
                        {pi.uploaded && (
                          <div className="absolute top-1 right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">✓</div>
                        )}
                        {pi.error && (
                          <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center p-1">
                            <p className="text-white text-xs text-center">{pi.error}</p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removePending(idx)}
                          className="absolute top-1 left-1 bg-black/50 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-amber-300 rounded-lg py-4 text-sm text-amber-700 font-medium hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
                >
                  📁 Click to add images
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:opacity-90 disabled:opacity-60 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (isEdit ? 'Save Changes' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none transition-colors
    ${hasError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-amber-500'}`;
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
