# 🎨 Frontend — DIVA Shop
 
> Next.js 14 storefront with App Router, TypeScript, Tailwind CSS, and Stripe Elements.
 
---

## Tech Stack
 
| Tool | Purpose |
|---|---|
| **Next.js 14** (App Router) | SSR, SSG, ISR, React Server Components, streaming |
| **TypeScript** | Strict type safety |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible, unstyled component library |
| **Zustand** | Client-side state (cart, UI) |
| **TanStack Query** | Server state, caching, background sync |
| **React Hook Form + Zod** | Form validation with shared schemas |
| **Axios** | HTTP client with credential support |
| **Stripe Elements** | Secure card payment UI |
| **Lucide React** | Icon set |
 
---
---
 
## Setup
 
### Prerequisites
 
```bash
node --version   # v20+
```
 
### Install
 
```bash
cd frontend
pnpm install
cp .env.example .env.local    # fill in your values
```
 
### Start
 
```bash
pnpm run dev    # http://localhost:3000
```
 
---

## Stripe Checkout Flow
 
```
1. User clicks "Pay Now"
       ↓
2. POST /checkout/intent  →  NestJS validates cart + calculates total
       ↓
3. NestJS creates Stripe PaymentIntent → returns clientSecret
       ↓
4. Frontend passes clientSecret to <Elements> provider
       ↓
5. User fills card details in Stripe Elements iframe
       ↓
6. stripe.confirmPayment() sends payment directly to Stripe
       ↓
7. Stripe calls POST /checkout/webhook (payment_intent.succeeded)
       ↓
8. NestJS creates order atomically → clears cart → sends email
       ↓
9. User redirected to /account/orders
```
 
---

## Build for Production
 
```bash
pnpm run build      # type-check + build
pnpm run start      # run production server locally
```
 
Deploy to **Vercel** — push to `main` branch, Vercel picks it up automatically with zero config.