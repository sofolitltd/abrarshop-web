export type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parentName?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};


export type Product = {
  id: string;
  sku?: number | null;
  barcode?: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  buyPrice?: number | null;
  images: string[];
  stock: number;
  keywords: string[];
  categoryId: string;
  brandId: string;
  category: string; // category name
  categorySlug: string; // category slug
  brand: string; // brand name
  brandSlug: string; // brand slug
  isTrending: boolean;
  isBestSelling: boolean;
  isFeatured: boolean;
  status?: 'draft' | 'published';
  visibleOnline?: boolean;
  discount: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Computed fields (optional)
  rating?: number;
  reviewCount?: number;
};

export type Review = {
  id: string;
  productId: string;
  userId: string | null;
  userName: string;
  rating: number;
  comment: string | null;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
};

export type CartItem = {
  id: string; // Corresponds to Product['id']
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
};

export type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
};

export type HeroSlider = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link?: string | null;
  displayOrder: number;
  isActive: boolean;
  type: 'carousel' | 'promo-top' | 'promo-bottom';
  createdAt?: Date;
  updatedAt?: Date;
};

export type Item = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  mobile: string;
  email: string | null;
  address: string;
  district: string;
  deliveryMethod: string;
  deliveryFee: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  paymentId: string | null;
  trxId: string | null;
  processingAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: Item[];
};

export type Party = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  type: 'payable' | 'receivable';
  currentBalance: string;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type PartyTransaction = {
  id: string;
  partyId: string;
  type: 'due' | 'payment';
  amount: string;
  note?: string | null;
  relatedOrderId?: string | null;
  date: Date;
  createdAt?: Date;
};

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  productId: string;
  productName?: string;
  quantity: number;
  buyPrice: string;
  subtotal: string;
};

export type Purchase = {
  id: string;
  supplierId: string | null;
  supplierName?: string | null;
  invoiceNo?: string | null;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  paymentStatus: 'paid' | 'partial' | 'due';
  note?: string | null;
  date: Date;
  createdAt?: Date;
  items?: PurchaseItem[];
};

export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: string;
  note?: string | null;
  date: Date;
  createdAt?: Date;
};

export type OtherIncome = {
  id: string;
  title: string;
  category: string;
  amount: string;
  note?: string | null;
  date: Date;
  createdAt?: Date;
};

export type CashTransaction = {
  id: string;
  direction: 'in' | 'out';
  amount: string;
  category:
    | 'sale'
    | 'purchase_payment'
    | 'expense'
    | 'payable_payment'
    | 'receivable_collection'
    | 'other_income'
    | 'adjustment';
  relatedPartyId?: string | null;
  relatedPurchaseId?: string | null;
  relatedOrderId?: string | null;
  note?: string | null;
  date: Date;
  createdAt?: Date;
};
