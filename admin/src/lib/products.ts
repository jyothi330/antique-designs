import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type QuerySnapshot,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { db, storage } from './firebase';
import type { Product, ProductImage } from '../types';
import { rupeesToPaise } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS_COL = 'products';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME   = ['image/jpeg', 'image/png', 'image/webp'];

// ─────────────────────────────────────────────────────────────────────────────
// Validation helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationErrors {
  name?:       string;
  category?:   string;
  unit?:       string;
  pricePaise?: string;
}

export interface ProductFormData {
  name:       string;
  category:   string;
  description:string;
  dimensions: string;
  thickness:  string;
  unit:       string;
  priceRupees:string; // raw string from input
  hsnCode:    string;
}

export function validateProductForm(data: ProductFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.name.trim())
    errors.name = 'Product name is required.';

  if (!data.category.trim())
    errors.category = 'Category is required.';

  if (!data.unit.trim())
    errors.unit = 'Unit of measurement is required.';

  const rupees = parseFloat(data.priceRupees);
  if (!data.priceRupees.trim())
    errors.pricePaise = 'Unit price is required.';
  else if (isNaN(rupees) || rupees < 0)
    errors.pricePaise = 'Enter a valid price (0 or more).';
  else if (rupees > 10_000_000)
    errors.pricePaise = 'Price cannot exceed ₹1,00,00,000.';

  return errors;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type))
    return 'Only JPG, PNG, or WebP images are allowed.';
  if (file.size > MAX_IMAGE_BYTES)
    return `File must be smaller than 5 MB (this file is ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Real-time listener
// ─────────────────────────────────────────────────────────────────────────────

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  onError:  (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, PRODUCTS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap: QuerySnapshot<DocumentData>) => {
      const products = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
      callback(products);
    },
    onError,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// One-shot fetch (for search / offline fallback)
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllProducts(): Promise<Product[]> {
  const snap = await getDocs(
    query(collection(db, PRODUCTS_COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product);
}

// ─────────────────────────────────────────────────────────────────────────────
// Image upload — returns ProductImage metadata on success.
// Calls onProgress(0–100) during upload.
// Throws if the upload fails; does NOT write to Firestore.
// ─────────────────────────────────────────────────────────────────────────────

export function uploadProductImage(
  productId: string,
  file: File,
  uid: string,
  onProgress?: (pct: number) => void,
): { task: UploadTask; promise: Promise<ProductImage> } {
  const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path     = `products/${productId}/${filename}`;
  const storageRef = ref(storage, path);

  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: { uploadedBy: uid },
  });

  const promise = new Promise<ProductImage>((resolve, reject) => {
    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      reject,
      async () => {
        try {
          const downloadUrl = await getDownloadURL(task.snapshot.ref);
          resolve({
            storagePath: path,
            downloadUrl,
            filename,
            // Timestamps are set server-side in the Firestore document
            uploadedAt:  null as unknown as import('firebase/firestore').Timestamp,
            uploadedBy:  uid,
          });
        } catch (e) {
          reject(e);
        }
      },
    );
  });

  return { task, promise };
}

// ─────────────────────────────────────────────────────────────────────────────
// Remove a single image from Storage.
// Does NOT update the Firestore document — do that in the same batch as needed.
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteProductImage(storagePath: string): Promise<void> {
  await deleteObject(ref(storage, storagePath));
}

// ─────────────────────────────────────────────────────────────────────────────
// Create product — adds Firestore doc, returns the new ID.
// Images should already be uploaded; pass the resulting ProductImage array.
// ─────────────────────────────────────────────────────────────────────────────

export async function createProduct(
  data: ProductFormData,
  images: ProductImage[],
  uid:   string,
): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCTS_COL), {
    name:               data.name.trim(),
    category:           data.category,
    description:        data.description.trim(),
    dimensions:         data.dimensions.trim(),
    thickness:          data.thickness.trim(),
    unit:               data.unit.trim(),
    pricePaise:         rupeesToPaise(parseFloat(data.priceRupees)),
    hsnCode:            data.hsnCode.trim(),
    images:             images.map(img => ({
      ...img,
      uploadedAt: serverTimestamp(),
    })),
    status:             'active',
    activeForQuotations: true,
    createdBy:          uid,
    createdAt:          serverTimestamp(),
    updatedAt:          serverTimestamp(),
  });
  return docRef.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// Update an existing product.
// Pass the full updated images array (existing + any new ones added).
// ─────────────────────────────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  data:      ProductFormData,
  images:    ProductImage[],
  uid:       string,
): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COL, productId), {
    name:               data.name.trim(),
    category:           data.category,
    description:        data.description.trim(),
    dimensions:         data.dimensions.trim(),
    thickness:          data.thickness.trim(),
    unit:               data.unit.trim(),
    pricePaise:         rupeesToPaise(parseFloat(data.priceRupees)),
    hsnCode:            data.hsnCode.trim(),
    images,
    updatedAt:          serverTimestamp(),
    lastEditedBy:       uid,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle active / inactive.
// Products are never hard-deleted — deactivated ones stay for history.
// ─────────────────────────────────────────────────────────────────────────────

export async function setProductStatus(
  productId: string,
  status: 'active' | 'inactive',
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COL, productId), {
    status,
    activeForQuotations: status === 'active',
    updatedAt:           serverTimestamp(),
    lastEditedBy:        uid,
  });
}
