import api from "@/lib/api";
import { notifyWishlistUpdated } from "@/lib/wishlist";

export const CART_UPDATED_EVENT = "cart-updated";
export const CART_FREE_SHIPPING_THRESHOLD = 10000;
export const CART_STANDARD_SHIPPING = 80;

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  basePrice: string | number;
  images?: string[];
};

export type CartVariant = {
  id: string;
  size: string | null;
  color: string | null;
  images: string[];
  priceOverride: string | number | null;
  product: CartProduct;
};

export type CartItem = {
  id: string;
  quantity: number;
  variantId: string;
  customization?: Record<string, unknown> | null;
  variant: CartVariant;
};

export type CartResponse = {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

export type Address = {
  id: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type CreatePaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
};

export type ConfirmPaymentResponse = {
  success: boolean;
  orderId?: string;
  status: string;
};

const cartListeners = new Set<() => void>();

export const toCurrencyNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

export const getCartShipping = (subtotal: number) => {
  if (subtotal <= 0) {
    return 0;
  }

  return subtotal >= CART_FREE_SHIPPING_THRESHOLD ? 0 : CART_STANDARD_SHIPPING;
};

export const getCartTotal = (subtotal: number) => subtotal + getCartShipping(subtotal);

export const notifyCartUpdated = () => {
  for (const listener of cartListeners) {
    listener();
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
};

export const subscribeToCartUpdates = (listener: () => void) => {
  cartListeners.add(listener);

  return () => {
    cartListeners.delete(listener);
  };
};

export async function fetchCart() {
  const response = await api.get<CartResponse>("/cart");
  return response.data;
}

export async function addCartItem(variantId: string, quantity = 1) {
  const response = await api.post("/cart/items", {
    variantId,
    quantity,
  });
  notifyCartUpdated();
  notifyWishlistUpdated();
  return response.data;
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const response = await api.patch(`/cart/items/${itemId}`, { quantity });
  notifyCartUpdated();
  return response.data;
}

export async function removeCartItem(itemId: string) {
  const response = await api.delete(`/cart/items/${itemId}`);
  notifyCartUpdated();
  notifyWishlistUpdated();
  return response.data;
}

export async function fetchAddresses() {
  const response = await api.get<Address[]>("/addresses");
  return response.data;
}

export async function createCheckoutIntent(input: {
  addressId: string;
  discountCode?: string;
}) {
  const response = await api.post<CreatePaymentIntentResponse>("/checkout/intent", input);
  return response.data;
}

export async function confirmCheckoutPayment(paymentIntentId: string) {
  const response = await api.post<ConfirmPaymentResponse>("/checkout/confirm", {
    paymentIntentId,
  });
  notifyCartUpdated();
  return response.data;
}
