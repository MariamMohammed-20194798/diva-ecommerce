# DIVA E-commerce App

A full-stack ecommerce storefront built with a modern Next.js frontend and NestJS backend. The repo includes frontend shop UI, backend API services, and API Reference docmentation.


---
 
## Overview
 
DIVA is a real-world e-commerce platform that lets customers browse products. It covers the complete commerce lifecycle — browsing, custom product design, cart, checkout, payment, order management, and user accounts.

**Why this project stands out:**
 
- Clean, modular architecture following NestJS best practices (controllers → services → repositories)
- JWT + refresh token auth with httpOnly cookies
- Stripe integration with server-side total recalculation and webhook-driven order creation
- PostgreSQL full-text search with `pg_trgm` fuzzy matching
- Guest cart support with merge-on-login
- Verified-purchase review system
- Atomic order creation in a single database transaction
---

## Tech Stack
 
### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | SSR, SSG, streaming, React Server Components |
| **TypeScript** | Strict type safety across all components |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Headless, accessible component library |
| **Zustand** | Client-side state (cart, UI) |
| **TanStack Query** | Server state, caching, background sync |
| **React Hook Form + Zod** | Form validation with shared schemas |
| **Stripe Elements** | Secure payment UI |
 
### Backend
| Technology | Purpose |
|---|---|
| **NestJS** | Modular TypeScript framework (runs on Express) |
| **Prisma ORM** | Type-safe DB queries, migrations, introspection |
| **PostgreSQL 16** | Primary database with JSONB, full-text search |
| **Redis (Upstash)** | Session cache, rate limiting, BullMQ queues |
| **Passport.js + JWT** | Authentication strategies |
| **Stripe** | Payment processing and webhook handling |
 
---

## Project structure

- `/backend` — NestJS backend API, Prisma schema, authentication, checkout, orders
- `/frontend` — Next.js storefront, UI components, cart/wishlist logic, Stripe integration
- `/docs` — project documentation written in MDX and Mintlify-ready docs site structure

### Layer Responsibilities
 
Every feature module follows the same three-layer pattern:
 
```
HTTP Request
    ↓
Controller        → routing, guards, validation pipes, Swagger docs
    ↓
Service           → business logic, validation, error throwing
    ↓
Repository        → all Prisma queries, DB transactions
    ↓
PostgreSQL
```
 
Services never call Prisma directly — they go through their repository. This makes every service unit-testable in isolation.
 
---

## Setup and installation

1. Clone the repo:

```bash
git clone <repo-url>
cd ecommerce-app
```

2. Install backend dependencies:

```bash
cd backend
pnpm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
pnpm install
```

4. (Optional) Install docs dependencies or run docs via `pnpm dlx` from the root:

```bash
cd ..
pnpm install
```

## Running the app

### Backend

```bash
cd backend
pnpm run start:dev
```

The backend API listens on `http://localhost:3001` by default.

### Frontend

```bash
cd frontend
pnpm run dev
```

The storefront runs on `http://localhost:3000` by default.

### Docs

From the repo root:

```bash
pnpm run docs:dev
```

Build the docs site with:

```bash
pnpm run docs:build
```