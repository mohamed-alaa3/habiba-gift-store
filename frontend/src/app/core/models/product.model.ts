import { LocalizedText, ObjectId } from './api-response.model';
import { Category } from './category.model';

/**
 * A single choice within an option group (e.g. "Midnight Jasmine").
 * No price/stock in V1 — reserved for future extension.
 */
export interface ProductOptionValue {
  name: LocalizedText;
}

/**
 * A group of choices (e.g. "Scent", "Size").
 * Embedded in the product, no separate model.
 */
export interface ProductOption {
  name: LocalizedText;
  values: ProductOptionValue[];
}

/**
 * A category reference when a product is populated.
 * Backend returns just a few fields on populate.
 */
export type ProductCategoryRef = Pick<Category, '_id' | 'name' | 'slug'>;

export interface Product {
  _id: ObjectId;
  name: LocalizedText;
  slug: string;
  description: LocalizedText;
  shortDescription: LocalizedText;
  price: number;
  discountPrice: number | null;
  category: ProductCategoryRef | ObjectId;
  images: string[];
  imageUrls: string[];
  stock: number;
  sku: string;
  options: ProductOption[];
  isFeatured: boolean;
  isActive: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query params supported by GET /api/products.
 */
export interface ProductQuery {
  q?: string;
  category?: ObjectId;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating-desc' | 'featured';
  page?: number;
  limit?: number;
  includeInactive?: boolean;
}

/**
 * Payload for create/update — sent as multipart/form-data.
 * `images` is a list of File objects handled by the service.
 */
export interface ProductPayload {
  name: LocalizedText;
  description: LocalizedText;
  shortDescription?: LocalizedText;
  price: number;
  discountPrice?: number | null;
  category: ObjectId;
  stock?: number;
  sku?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  options?: ProductOption[];
}