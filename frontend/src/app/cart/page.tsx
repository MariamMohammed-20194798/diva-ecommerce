'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  confirmCheckoutPayment,
  createCheckoutIntent,
  fetchAddresses,
  fetchCart,
  getCartShipping,
  getCartTotal,
  removeCartItem,
  toCurrencyNumber,
  updateCartItemQuantity,
  type Address,
  type CartItem,
  type CartResponse,
} from '@/lib/cart';
import { formatPriceEgp } from '@/lib/products';

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<{
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
  } | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const subtotal = cart?.subtotal ?? 0;
  const shipping = getCartShipping(subtotal);
  const total = getCartTotal(subtotal);
  const hasCartItems = (cart?.items.length ?? 0) > 0;
  const isAuthenticated =
    typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken'));

  const loadPageData = async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      const nextCart = await fetchCart();
      setCart(nextCart);

      if (typeof window !== 'undefined' && window.localStorage.getItem('accessToken')) {
        const nextAddresses = await fetchAddresses();
        setAddresses(nextAddresses);
        const defaultAddress =
          nextAddresses.find((address) => address.isDefault) ?? nextAddresses[0];
        setSelectedAddressId((current) => current || defaultAddress?.id || '');
      } else {
        setAddresses([]);
        setSelectedAddressId('');
      }
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Failed to load your cart.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPageData();
  }, []);

  const mutateQuantity = async (item: CartItem, nextQuantity: number) => {
    setPendingItemId(item.id);
    setPageError(null);
    setPaymentState(null);

    try {
      if (nextQuantity <= 0) {
        await removeCartItem(item.id);
      } else {
        await updateCartItemQuantity(item.id, nextQuantity);
      }

      await loadPageData();
      setClientSecret(null);
      setPaymentIntentId(null);
      setCheckoutSummary(null);
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to update this cart item.'));
    } finally {
      setPendingItemId(null);
    }
  };

  const startCheckout = async () => {
    if (!hasCartItems) {
      setPageError('Your cart is empty.');
      return;
    }

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!selectedAddressId) {
      setPageError('Select a shipping address before checkout.');
      return;
    }

    if (!stripePromise) {
      setPageError(
        'Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.',
      );
      return;
    }

    setIsCreatingIntent(true);
    setPageError(null);
    setPaymentState(null);

    try {
      const response = await createCheckoutIntent({
        addressId: selectedAddressId,
        discountCode: discountCode.trim() || undefined,
      });

      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setCheckoutSummary({
        subtotal: response.subtotal,
        shipping: response.shipping,
        discount: response.discount,
        total: response.total,
      });
      toast.success('Checkout is ready. Complete your test payment below.');
    } catch (error) {
      setPageError(getApiErrorMessage(error, 'Unable to start checkout.'));
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const onPaymentSuccess = async (orderId?: string) => {
    setPaymentState({
      type: 'success',
      message: orderId
        ? `Payment succeeded. Order #${orderId.slice(0, 8)} has been created.`
        : 'Payment succeeded and your order was created.',
    });
    setClientSecret(null);
    setPaymentIntentId(null);
    setCheckoutSummary(null);
    setDiscountCode('');
    await loadPageData();
    toast.success('Payment successful');
  };

  const onPaymentFailure = (message: string) => {
    setPaymentState({ type: 'error', message });
    toast.error(message);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
              Shopping bag
            </p>
            <h1 className="mt-2 text-3xl font-light text-foreground">Your cart</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {cart?.itemCount ?? 0} item{(cart?.itemCount ?? 0) === 1 ? '' : 's'}
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading cart...</p>
        ) : !hasCartItems ? (
          <section className="rounded-3xl border border-border bg-card/70 px-6 py-12 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <div className="rounded-full bg-muted p-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-light">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground">
                Add products to your bag to review quantities, shipping, and checkout.
              </p>
              <Link href="/collections">
                <Button className="mt-2 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">
                  Continue shopping
                </Button>
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-4">
              {cart?.items.map((item) => {
                const unitPrice = toCurrencyNumber(
                  item.variant.priceOverride ?? item.variant.product.basePrice,
                );
                const lineTotal = unitPrice * item.quantity;
                const previewImage =
                  item.variant.images[0] ??
                  item.variant.product.images?.[0] ??
                  '/images/placeholder-product.jpg';

                return (
                  <article
                    key={item.id}
                    className="grid gap-4 rounded-3xl border border-border bg-card/70 p-4 sm:grid-cols-[120px_minmax(0,1fr)]"
                  >
                    <Link
                      href={`/products/${item.variant.product.slug}`}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
                    >
                      <Image
                        src={previewImage}
                        alt={item.variant.product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/products/${item.variant.product.slug}`}
                            className="text-lg font-medium text-foreground"
                          >
                            {item.variant.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {item.variant.color
                              ? `Color: ${item.variant.color}`
                              : 'Default color'}
                            {item.variant.size ? ` • Size: ${item.variant.size}` : ''}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Unit price: {formatPriceEgp(unitPrice)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatPriceEgp(lineTotal)}</p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center rounded-full border border-border">
                          <button
                            type="button"
                            className="p-3"
                            aria-label="Decrease quantity"
                            disabled={pendingItemId === item.id}
                            onClick={() => void mutateQuantity(item, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-10 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="p-3"
                            aria-label="Increase quantity"
                            disabled={pendingItemId === item.id}
                            onClick={() => void mutateQuantity(item, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                          disabled={pendingItemId === item.id}
                          onClick={() => void mutateQuantity(item, 0)}
                        >
                          {pendingItemId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="space-y-5">
              <section className="rounded-3xl border border-border bg-card/70 p-5">
                <h2 className="text-lg font-medium">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPriceEgp(checkoutSummary?.subtotal ?? subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>
                      {(checkoutSummary?.shipping ?? shipping) === 0
                        ? 'Free'
                        : formatPriceEgp(checkoutSummary?.shipping ?? shipping)}
                    </span>
                  </div>
                  {checkoutSummary?.discount ? (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Discount</span>
                      <span>-{formatPriceEgp(checkoutSummary.discount)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-border pt-3 text-base font-medium">
                    <span>Total</span>
                    <span>{formatPriceEgp(checkoutSummary?.total ?? total)}</span>
                  </div>
                </div>

                <p className="mt-4 text-xs text-muted-foreground">
                  Shipping is free on orders over {formatPriceEgp(10000)}. Test card
                  example: `4242 4242 4242 4242`.
                </p>
              </section>

              <section className="rounded-3xl border border-border bg-card/70 p-5">
                <h2 className="text-lg font-medium">Checkout</h2>
                <div className="mt-4 space-y-3">
                  {!isAuthenticated ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Sign in to select a shipping address and complete payment.
                      </p>
                      <Button
                        className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => router.push('/auth')}
                      >
                        Sign in to checkout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Ready to checkout? Proceed to the secure checkout flow.
                      </p>
                      <Button
                        className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => router.push('/checkout')}
                      >
                        Proceed to checkout
                      </Button>
                    </div>
                  )}
                </div>
              </section>

              {paymentState ? (
                <section
                  className={`rounded-3xl border p-4 text-sm ${
                    paymentState.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {paymentState.message}
                </section>
              ) : null}

              {pageError ? (
                <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {pageError}
                </section>
              ) : null}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
