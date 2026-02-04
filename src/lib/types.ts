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
  discount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartItem = {
  id: string; // Corresponds to Product['id']
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
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
