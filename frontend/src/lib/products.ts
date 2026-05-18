import api from '@/lib/api';
import { addCartItem } from '@/lib/cart';
import {
  fetchWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  checkWishlistStatus,
  WISHLIST_UPDATED_EVENT,
  subscribeToWishlistUpdates as apiSubscribeToWishlistUpdates,
  notifyWishlistUpdated,
} from '@/lib/wishlist';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  description: string;
  details: string[];
  sizes: string[];
  colors: { name: string; hex: string }[];
  variants: {
    id: string;
    size: string | null;
    color: string | null;
    images: string[];
    stockQuantity: number;
  }[];
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
  variantIds: string[];
}

type WishlistProduct = Pick<Product, 'id'>;

type ApiProductVariant = {
  id: string;
  size: string | null;
  color: string | null;
  stockQuantity: number;
  images: string[] | null;
};

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: number;
  images: string[] | null;
  createdAt?: string;
  category?: {
    name?: string;
  };
  variants?: ApiProductVariant[];
  metadata?: {
    details?: string[];
    subcategory?: string;
    originalPriceCents?: number;
  } | null;
};

type ProductsResponse = {
  data?: ApiProduct[];
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'best-selling';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  body?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
}

export interface ReviewsResponse {
  data: Review[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    averageRating: number;
    totalReviews: number;
  };
}

const FALLBACK_IMAGE = '/images/placeholder-product.jpg';

export const subscribeToWishlistUpdates = apiSubscribeToWishlistUpdates;

const toColorHex = (colorName: string) => {
  const normalized = colorName.trim().toLowerCase();
  const map: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    navy: '#1e3a5f',
    blue: '#2563eb',
    brown: '#8b5e3c',
    camel: '#c4a77d',
    grey: '#9e9e9e',
    gray: '#9e9e9e',
    red: '#b91c1c',
    green: '#166534',
    pink: '#ec4899',
    cream: '#f5f5dc',
    tiger: '#e08d3c',
    naviblue: '#000080',
    beige: '#EDE8D0',
  };

  return map[normalized] ?? '#888888';
};

const mapSort = (sort: SortOption) => {
  switch (sort) {
    case 'price-asc':
      return 'price_asc';
    case 'price-desc':
      return 'price_desc';
    case 'best-selling':
      return 'popular';
    default:
      return 'newest';
  }
};

const dedupe = (values: string[]) => [...new Set(values.filter(Boolean))];

const normalizeVariantValue = (value: string | null | undefined) =>
  (value ?? '').trim().toLowerCase();

const mapApiProductToProduct = (product: ApiProduct): Product => {
  const variants = product.variants ?? [];
  const productImages = product.images ?? [];
  const variantImages = variants.flatMap((variant) => variant.images ?? []);
  const images = dedupe([...productImages, ...variantImages]);
  const colorNames = dedupe(
    variants
      .map((variant) => variant.color ?? '')
      .filter((color) => color.trim().length > 0),
  );
  const sizes = dedupe(
    variants
      .map((variant) => variant.size ?? '')
      .filter((size) => size.trim().length > 0),
  );
  const variantIds = variants.map((variant) => variant.id);
  const originalPrice = product.metadata?.originalPriceCents
    ? product.metadata.originalPriceCents
    : undefined;
  const createdAtMs = product.createdAt ? new Date(product.createdAt).getTime() : 0;
  const daysSinceCreated = createdAtMs
    ? (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24)
    : 999;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.basePrice,
    originalPrice,
    image: images[0] ?? FALLBACK_IMAGE,
    images: images.length > 0 ? images : [FALLBACK_IMAGE],
    category: product.category?.name ?? 'Uncategorized',
    subcategory: product.metadata?.subcategory ?? '',
    description: product.description ?? 'No description available.',
    details: product.metadata?.details ?? [],
    sizes,
    colors: colorNames.map((name) => ({ name, hex: toColorHex(name) })),
    variants: variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      images: variant.images ?? [],
      stockQuantity: variant.stockQuantity,
    })),
    inStock: variants.some((variant) => variant.stockQuantity > 0),
    isNew: daysSinceCreated <= 30,
    isSale: typeof originalPrice === 'number' && originalPrice > product.basePrice,
    variantIds,
  };
};

export async function getProducts(input?: {
  category?: string;
  sort?: SortOption;
  limit?: number;
}): Promise<Product[]> {
  const response = await api.get<ProductsResponse>('/products', {
    params: {
      category: input?.category && input.category !== 'all' ? input.category : undefined,
      sort: mapSort(input?.sort ?? 'newest'),
      limit: input?.limit,
    },
  });

  return (response.data?.data ?? []).map(mapApiProductToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await api.get<ApiProduct>(`/products/${slug}`);
    return mapApiProductToProduct(response.data);
  } catch {
    return null;
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return getProducts({ category });
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const sameCategory = await getProducts({
    category: product.category.toLowerCase(),
    limit: 20,
  });
  return sameCategory.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function addProductToCart(
  product: Product,
  quantity = 1,
  variantId?: string | null,
): Promise<void> {
  const targetVariantId = variantId ?? product.variantIds[0];
  if (!targetVariantId) {
    throw new Error('No product variant available for cart action.');
  }

  await addCartItem(targetVariantId, quantity);
}

export async function getWishlistProductIds(): Promise<string[]> {
  try {
    const items = await fetchWishlist();
    return items.map((item) => item.variant.product.id);
  } catch {
    return [];
  }
}

export async function isProductWishlisted(productId: string): Promise<boolean> {
  const ids = await getWishlistProductIds();
  return ids.includes(productId);
}

export async function addProductToWishlist(product: WishlistProduct): Promise<void> {
  // We need a variant ID. Use the first one or a default if available.
  // The product passed here might not have variants if it's the simplified WishlistProduct.
  // If it's a full Product, we use product.variantIds[0].

  let variantId: string | undefined;

  if ('variantIds' in product) {
    variantId = (product as Product).variantIds[0];
  } else {
    // If we only have product ID, we might need to fetch the product first to get a variant
    const fullProduct = await getProductBySlug(
      (product as any).slug || (product as any).id,
    );
    variantId = fullProduct?.variantIds[0];
  }

  if (!variantId) {
    throw new Error('No variant available to wishlist');
  }

  // Use the provided image if available (WishlistProduct might have it, or Product has it as 'image')
  const image = (product as any).image || (product as any).images?.[0];

  await apiAddToWishlist(variantId, image);
}

export async function removeProductFromWishlist(productId: string): Promise<void> {
  // The backend remove endpoint takes variantId.
  // If we only have productId, we need to find which variant is wishlisted.
  const wishlist = await fetchWishlist();
  const item = wishlist.find((i) => i.variant.product.id === productId);

  if (item) {
    await apiRemoveFromWishlist(item.variantId);
  }
}

export async function toggleProductInWishlist(product: Product): Promise<boolean> {
  const wishlist = await fetchWishlist();
  const isWishlisted = wishlist.some((i) => i.variant.product.id === product.id);

  if (isWishlisted) {
    const item = wishlist.find((i) => i.variant.product.id === product.id);
    if (item) await apiRemoveFromWishlist(item.variantId);
    return false;
  }

  const variantId = product.variantIds[0];
  if (variantId) {
    await apiAddToWishlist(variantId, product.image);
    return true;
  }

  return false;
}

export function getMatchingVariantId(
  product: Product,
  input?: { size?: string; color?: string },
): string | null {
  const desiredSize = normalizeVariantValue(input?.size);
  const desiredColor = normalizeVariantValue(input?.color);

  const inStockVariants = product.variants.filter((variant) => variant.stockQuantity > 0);
  const allVariants = inStockVariants.length > 0 ? inStockVariants : product.variants;

  const bySizeAndColor = allVariants.find(
    (variant) =>
      normalizeVariantValue(variant.size) === desiredSize &&
      normalizeVariantValue(variant.color) === desiredColor,
  );
  if (bySizeAndColor) {
    return bySizeAndColor.id;
  }

  const bySizeOnly = allVariants.find(
    (variant) => normalizeVariantValue(variant.size) === desiredSize,
  );
  if (bySizeOnly) {
    return bySizeOnly.id;
  }

  const byColorOnly = allVariants.find(
    (variant) => normalizeVariantValue(variant.color) === desiredColor,
  );
  if (byColorOnly) {
    return byColorOnly.id;
  }

  return allVariants[0]?.id ?? product.variantIds[0] ?? null;
}

export function getImagesForProductColor(product: Product, colorName?: string): string[] {
  const desiredColor = normalizeVariantValue(colorName);
  if (!desiredColor) {
    return product.images;
  }

  const colorImages = dedupe(
    product.variants
      .filter((variant) => normalizeVariantValue(variant.color) === desiredColor)
      .flatMap((variant) => variant.images),
  );

  return colorImages.length > 0 ? colorImages : product.images;
}

export function formatPriceEgp(value: number): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: value % 5 === 0 ? 0 : 2,
    maximumFractionDigits: 5,
  }).format(value);
}

export const getCategories = (products: Product[]) => [
  { name: 'All', slug: 'all' },
  ...Array.from(new Set(products.map((product) => product.category)))
    .sort((a, b) => a.localeCompare(b))
    .map((category) => ({
      name: category,
      slug: category.toLowerCase(),
    })),
];

export async function getProductReviews(
  productId: string,
): Promise<ReviewsResponse | null> {
  try {
    const response = await api.get<ReviewsResponse>(`/products/${productId}/reviews`);
    return response.data;
  } catch {
    return null;
  }
}

export async function createProductReview(
  productId: string,
  rating: number,
  body?: string,
): Promise<Review> {
  const response = await api.post<Review>('/reviews', {
    productId,
    rating,
    body,
  });
  return response.data;
}
