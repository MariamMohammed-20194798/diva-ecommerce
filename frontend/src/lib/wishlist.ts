import api from "@/lib/api";

export const WISHLIST_UPDATED_EVENT = "wishlist-updated";

export type WishlistProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: string | number;
  images: string[];
};

export type WishlistVariant = {
  id: string;
  size: string | null;
  color: string | null;
  images: string[];
  priceOverride: string | number | null;
  product: WishlistProduct;
};

export type WishlistItem = {
  id: string;
  userId: string;
  variantId: string;
  image: string | null;
  createdAt: string;
  variant: WishlistVariant;
};

export type WishlistStatusResponse = {
  isWishlisted: boolean;
};

const wishlistListeners = new Set<() => void>();

export const notifyWishlistUpdated = () => {
  for (const listener of wishlistListeners) {
    listener();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT));
  }
};

export const subscribeToWishlistUpdates = (listener: () => void) => {
  wishlistListeners.add(listener);

  return () => {
    wishlistListeners.delete(listener);
  };
};

export async function fetchWishlist() {
  try {
    const response = await api.get<WishlistItem[]>("/wishlist");
    return response.data;
  } catch (error) {
    // If it's a 401 or other error and refresh didn't help, return empty array
    return [];
  }
}

export async function addToWishlist(variantId: string, image?: string) {
  const response = await api.post("/wishlist", { variantId, image });
  notifyWishlistUpdated();
  return response.data;
}

export async function removeFromWishlist(variantId: string) {
  const response = await api.delete(`/wishlist/${variantId}`);
  notifyWishlistUpdated();
  return response.data;
}

export async function checkWishlistStatus(variantId: string) {
  const response = await api.get<WishlistStatusResponse>(`/wishlist/status/${variantId}`);
  return response.data;
}
