# DIVA E-commerce App

A full-stack ecommerce storefront built with a modern Next.js frontend and NestJS backend. The repo includes frontend shop UI, backend API services, and API Reference docmentation.

## Project overview

This repository contains an ecommerce platform with product browsing, collections, wishlist, cart, checkout, user accounts, orders, and review capabilities. The backend is implemented in NestJS with Prisma and Stripe integration. The frontend uses a modern Next.js storefront architecture.

## Features

- Product catalog with categories and collections
- Cart and wishlist support
- Checkout flow with Stripe payment integration
- User authentication and account management
- Order history and order submission
- Product reviews and ratings
- Address management for shipping
- Admin-friendly API surface with Swagger/OpenAPI support
- Documentation site support via the `docs/` folder

## Tech stack

- Frontend: Next.js 16, React 19, Tailwind CSS, Framer Motion, React Query
- Backend: NestJS 11, Prisma ORM, PostgreSQL-compatible databases, Stripe, Resend email
- Dev tools: pnpm, ESLint, Prettier, Jest

## Project structure

- `/backend` — NestJS backend API, Prisma schema, authentication, checkout, orders
- `/frontend` — Next.js storefront, UI components, cart/wishlist logic, Stripe integration
- `/docs` — project documentation written in MDX and Mintlify-ready docs site structure

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

## Environment variables

### Backend

Create a `backend/.env` file with values for:

- `DATABASE_URL` or `DIRECT_URL`
- `FRONTEND_URL` (frontend origin for CORS)
- `PORT` (optional, defaults to `3001`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Frontend

Create a `.env.local` file in `frontend/` with:

- `NEXT_PUBLIC_API_URL` — backend API base URL, e.g. `http://localhost:3001/api`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

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

## Screenshots / preview

![ERD diagram](frontend/public/images/EcommerceSystemERD.png)

## API / docs links

- Backend API root: `/api`
- Docs landing page in the frontend app: `/docs`
- Project documentation folder: `/docs`

## Notes

- The frontend exposes a `/docs` page for quick documentation access inside the app.
- The backend loads environment config from `backend/.env` or root-level `.env` when available.
