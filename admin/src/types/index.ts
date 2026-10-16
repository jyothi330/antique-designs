import { Timestamp } from 'firebase/firestore';

// ─────────────────────────────────────────────────────────────────────────────
// USER / AUTH
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'staff';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMER
// ─────────────────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  place: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdBy: string;       // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT
// ─────────────────────────────────────────────────────────────────────────────

export type ProductStatus = 'active' | 'inactive';

export const PRODUCT_CATEGORIES = [
  'Main Doors',
  'Panel Accessories',
  'Grill Accessories',
  'Studs',
  'Vaskal Accessories',
  'Other',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export interface ProductImage {
  /** Firebase Storage path — e.g. products/{productId}/{filename} */
  storagePath: string;
  /** Signed / download URL — refreshed at display time */
  downloadUrl: string;
  filename: string;
  uploadedAt: Timestamp;
  uploadedBy: string;   // uid
}

export interface Product {
  id: string;
  /** Human-readable product name — required */
  name: string;
  /** Must match a value from PRODUCT_CATEGORIES */
  category: string;
  description?: string;
  /** Width × Height in mm or inches — e.g. "18\" × 24\"" */
  dimensions?: string;
  /** Thickness in mm — e.g. "10" */
  thickness?: string;
  /** Unit label for quotation lines — e.g. "per panel", "per door", "per sqft" */
  unit: string;
  /**
   * Price stored in paise (integer) to avoid floating-point errors.
   * Display: divide by 100 → format as INR.
   * E.g. ₹40,500 is stored as 4050000.
   */
  pricePaise: number;
  hsnCode?: string;
  images: ProductImage[];
  status: ProductStatus;
  /** Set to false to hide from new quotations without deleting history */
  activeForQuotations: boolean;
  createdBy: string;    // uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ── Price helpers (no floating-point risk) ───────────────────────────────────
/** Convert rupees (number input) → paise integer */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}
/** Convert paise integer → display string e.g. "₹40,500.00" */
export function paiseToRupees(paise: number): string {
  return '₹' + (paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// QUOTATION
// ─────────────────────────────────────────────────────────────────────────────

export type QuotationStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface QuotationSubItem {
  desc: string;
  size?: string;
  unitPrice: number;
  qty: number;
  amount: number;         // unitPrice * qty — denormalised for display
}

export interface QuotationItem {
  name: string;
  subItems: QuotationSubItem[];
}

export interface Quotation {
  id: string;
  quotationNo: string;
  customerId: string;
  customerName: string;   // denormalised for list views
  customerPlace: string;
  hsnCode: string;
  items: QuotationItem[];
  subtotal: number;
  packingCharge: number;
  gstPercent: number;
  gstAmount: number;
  grandTotal: number;
  approvedBy: string;
  approverPhone: string;
  status: QuotationStatus;
  date: Timestamp;
  validUntil: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'design_review'
  | 'materials_ordered'
  | 'in_production'
  | 'quality_check'
  | 'ready_to_ship'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  quotationId: string;
  quotationNo: string;
  customerId: string;
  customerName: string;
  productSummary: string;
  amount: number;
  status: OrderStatus;
  expectedDelivery: Timestamp;
  notes?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentStatus  = 'pending' | 'received' | 'failed' | 'refunded';
export type PaymentMode    = 'cash' | 'cheque' | 'upi' | 'neft' | 'rtgs' | 'other';
export type PaymentType    = 'advance_75' | 'balance_25' | 'full' | 'partial' | 'other';

export interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: PaymentType;
  mode: PaymentMode;
  status: PaymentStatus;
  referenceNo?: string;
  notes?: string;
  date: Timestamp;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSettings {
  companyName: string;
  gstNumber: string;
  address: string;
  email: string;
  website: string;
  phones: string[];
  bankName: string;
  bankAccount: string;
  bankIfsc: string;
  bankBranch: string;
  defaultHsnCode: string;
  defaultGstPercent: number;
  defaultValidityDays: number;
  defaultPackingCharge: number;
  advancePercent: number;
  deliveryLeadDays: number;
  updatedBy: string;
  updatedAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  uid: string;
  userEmail: string;
  action: string;           // e.g. 'quotation.created', 'order.status_changed'
  entityType: string;       // 'quotation' | 'order' | 'payment' | 'user' | etc.
  entityId: string;
  details?: Record<string, unknown>;
  createdAt: Timestamp;
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNTER  (for sequential IDs like Q-001, O-001)
// ─────────────────────────────────────────────────────────────────────────────

export interface Counter {
  name: string;   // 'quotations' | 'orders' | 'customers'
  value: number;
}
