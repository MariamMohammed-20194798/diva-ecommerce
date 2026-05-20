"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  confirmCheckoutPayment,
  createCheckoutIntent,
  fetchAddresses,
  fetchCart,
  getCartShipping,
  getCartTotal,
  toCurrencyNumber,
  type Address,
  type CartItem,
  type CartResponse,
} from "@/lib/cart";
import { formatPriceEgp } from "@/lib/products";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length > 0) {
      return message.join(", ");
    }
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

function CheckoutPaymentForm({
  paymentIntentId,
  onSuccess,
  onFailure,
}: {
  paymentIntentId: string;
  onSuccess: (orderId?: string) => void;
  onFailure: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);

    try {
      const result = await stripe.confirmPayment({ elements, redirect: "if_required" });

      if (result.error) {
        onFailure(result.error.message ?? "Payment failed. Please try again.");
        return;
      }

      const paymentIntent = result.paymentIntent;
      const resolvedPaymentIntentId = paymentIntent?.id ?? paymentIntentId;

      if (!resolvedPaymentIntentId) {
        onFailure("Payment succeeded but confirmation details were missing.");
        return;
      }

      const confirmation = await confirmCheckoutPayment(resolvedPaymentIntentId);
      onSuccess(confirmation.orderId);
    } catch (error) {
      onFailure(getApiErrorMessage(error, "Payment confirmation failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90"
        disabled={!stripe || !elements || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Pay now"}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<{ subtotal: number; shipping: number; discount: number; total: number } | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({ name: "", phone: "", line1: "", city: "", postalCode: "", country: "" });

  const subtotal = cart?.subtotal ?? 0;
  const shipping = getCartShipping(subtotal);
  const total = getCartTotal(subtotal);
  const hasCartItems = (cart?.items.length ?? 0) > 0;

  const elementsOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: { theme: "stripe" as const },
          }
        : undefined,
    [clientSecret],
  );

  const loadPage = async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      const nextCart = await fetchCart();
      setCart(nextCart);

      const nextAddresses = await fetchAddresses();
      setAddresses(nextAddresses);
      const defaultAddress = nextAddresses.find((a) => a.isDefault) ?? nextAddresses[0];
      setSelectedAddressId((cur) => cur || defaultAddress?.id || "");
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to load checkout data."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadPage();
  }, []);

  const onCreateAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageError(null);
    if (!addressForm.line1.trim() || !addressForm.city.trim() || !addressForm.postalCode.trim() || !addressForm.country.trim()) {
      setPageError("Please complete name, phone, address, city, postal code and country.");
      return;
    }

    setIsSavingAddress(true);
    try {
      const payload = {
        line1: addressForm.line1.trim(),
        line2: `${addressForm.name.trim()} ${addressForm.phone.trim()}`,
        city: addressForm.city.trim(),
        postalCode: addressForm.postalCode.trim(),
        country: addressForm.country.trim(),
        isDefault: false,
      };

      const response = await api.post("/addresses", payload);
      await loadPage();
      // select the newest address if available
      if (response.data?.id) setSelectedAddressId(response.data.id);
      setAddressForm({ name: "", phone: "", line1: "", city: "", postalCode: "", country: "" });
      toast.success("Address added");
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Failed to add address."));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const startCheckout = async () => {
    if (!hasCartItems) {
      setPageError("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      setPageError("Select or add a shipping address before checkout.");
      return;
    }

    if (!stripePromise) {
      setPageError("Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to continue.");
      return;
    }

    setIsCreatingIntent(true);
    setPageError(null);
    setPaymentState(null);

    try {
      const response = await createCheckoutIntent({ addressId: selectedAddressId });
      setClientSecret(response.clientSecret);
      setPaymentIntentId(response.paymentIntentId);
      setCheckoutSummary({ subtotal: response.subtotal, shipping: response.shipping, discount: response.discount, total: response.total });
      toast.success("Checkout is ready. Complete your test payment below.");
    } catch (error) {
      setPageError(getApiErrorMessage(error, "Unable to start checkout."));
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const onPaymentSuccess = async (orderId?: string) => {
    setPaymentState({ type: "success", message: orderId ? `Payment succeeded. Order #${orderId.slice(0, 8)} created.` : "Payment succeeded and your order was created." });
    setClientSecret(null);
    setPaymentIntentId(null);
    setCheckoutSummary(null);
    await loadPage();
    toast.success("Payment successful");
    router.push(`/account?tab=orders&orderId=${orderId ?? ""}`);
  };

  const onPaymentFailure = (message: string) => {
    setPaymentState({ type: "error", message });
    toast.error(message);
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Checkout</p>
            <h1 className="mt-2 text-3xl font-light text-foreground">Shipping & payment</h1>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
        ) : !hasCartItems ? (
          <section className="rounded-3xl border border-border bg-card/70 px-6 py-12 text-center">
            <div className="mx-auto flex max-w-md flex-col items-center gap-4">
              <h2 className="text-2xl font-light">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground">Add products to your bag to checkout.</p>
              <Link href="/collections">
                <Button className="mt-2 rounded-full bg-foreground px-6 text-background hover:bg-foreground/90">Continue shopping</Button>
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <h2 className="text-lg font-medium">Shipping address</h2>

                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium">Saved addresses</span>
                    <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none">
                      <option value="">Select an address</option>
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.line1}, {address.city}, {address.country} {address.isDefault ? "(Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>

                  <form onSubmit={onCreateAddress} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Full name" value={addressForm.name} onChange={(e) => setAddressForm((s) => ({ ...s, name: e.target.value }))} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                      <input placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm((s) => ({ ...s, phone: e.target.value }))} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                    </div>
                    <input placeholder="Address (line 1)" value={addressForm.line1} onChange={(e) => setAddressForm((s) => ({ ...s, line1: e.target.value }))} className="h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                    <div className="grid grid-cols-3 gap-2">
                      <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((s) => ({ ...s, city: e.target.value }))} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                      <input placeholder="Postal code" value={addressForm.postalCode} onChange={(e) => setAddressForm((s) => ({ ...s, postalCode: e.target.value }))} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                      <input placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm((s) => ({ ...s, country: e.target.value }))} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm outline-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="h-11 rounded-full bg-foreground text-background hover:bg-foreground/90" disabled={isSavingAddress}>
                        {isSavingAddress ? "Saving..." : "Add address"}
                      </Button>
                      <Button type="button" variant="secondary" className="h-11 rounded-full" onClick={() => setAddressForm({ name: "", phone: "", line1: "", city: "", postalCode: "", country: "" })}>
                        Clear
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card/70 p-5">
                <h2 className="text-lg font-medium">Payment</h2>
                <p className="mt-2 text-sm text-muted-foreground">We use Stripe to process secure payments. Test card: 4242 4242 4242 4242.</p>

                <div className="mt-4">
                  {!clientSecret ? (
                    <Button className="h-11 w-full rounded-full bg-foreground text-background hover:bg-foreground/90" disabled={isCreatingIntent || !selectedAddressId} onClick={() => void startCheckout()}>
                      {isCreatingIntent ? "Preparing checkout..." : "Proceed to payment"}
                    </Button>
                  ) : stripePromise && elementsOptions ? (
                    <Elements stripe={stripePromise} options={elementsOptions}>
                      <CheckoutPaymentForm paymentIntentId={paymentIntentId ?? ""} onSuccess={(orderId) => void onPaymentSuccess(orderId)} onFailure={onPaymentFailure} />
                    </Elements>
                  ) : null}
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-3xl border border-border bg-card/70 p-5">
                <h2 className="text-lg font-medium">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {cart?.items.map((item: CartItem) => {
                    const unitPrice = toCurrencyNumber(item.variant.priceOverride ?? item.variant.product.basePrice);
                    const lineTotal = unitPrice * item.quantity;
                    const previewImage = item.variant.images[0] ?? item.variant.product.images?.[0] ?? "/images/placeholder-product.jpg";

                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-muted">
                          <Image src={previewImage} alt={item.variant.product.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.variant.product.name}</div>
                          <div className="text-xs text-muted-foreground">{item.quantity} × {formatPriceEgp(unitPrice)}</div>
                        </div>
                        <div className="text-sm font-medium">{formatPriceEgp(lineTotal)}</div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPriceEgp(checkoutSummary?.subtotal ?? subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{(checkoutSummary?.shipping ?? shipping) === 0 ? "Free" : formatPriceEgp(checkoutSummary?.shipping ?? shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3 text-base font-medium">
                    <span>Total</span>
                    <span>{formatPriceEgp(checkoutSummary?.total ?? total)}</span>
                  </div>
                </div>
              </section>

              {paymentState ? (
                <section className={`rounded-3xl border p-4 text-sm ${paymentState.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {paymentState.message}
                </section>
              ) : null}

              {pageError ? (
                <section className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{pageError}</section>
              ) : null}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
