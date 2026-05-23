# 🛠️ Backend — DIVA Shop API
 
> NestJS REST API with PostgreSQL, Prisma ORM, Stripe, and Redis.
 
---

## Tech Stack
 
| Tool | Purpose |
|---|---|
| **NestJS** | Modular TypeScript framework (runs on Express) |
| **PostgreSQL 16** | Primary database |
| **Prisma ORM** | Type-safe queries and migrations |
| **Redis** | Caching, rate limiting, BullMQ queues |
| **Stripe** | Payment processing + webhooks |
| **Passport.js + JWT** | Authentication |
| **Swagger** | Generating and Testing backend API |

---

## Database ERD
 
```mermaid
erDiagram
  USERS {
    uuid id PK
    string email
    string password_hash
    enum role
    timestamp email_verified_at
    timestamp created_at
  }
 
  ADDRESSES {
    uuid id PK
    uuid user_id FK
    string line1
    string city
    string country
    string postal_code
    boolean is_default
  }
 
  CATEGORIES {
    uuid id PK
    uuid parent_id FK
    string name
    string slug
  }
 
  PRODUCTS {
    uuid id PK
    uuid category_id FK
    string name
    string slug
    decimal base_price
    boolean is_active
    json metadata
  }
 
  PRODUCT_VARIANTS {
    uuid id PK
    uuid product_id FK
    string sku
    string size
    string color
    decimal price_override
    int stock_quantity
    string[] images
  }
 
  CARTS {
    uuid id PK
    uuid user_id FK
    string session_id
    timestamp expires_at
  }
 
  CART_ITEMS {
    uuid id PK
    uuid cart_id FK
    uuid variant_id FK
    int quantity
    json customization
  }
 
  ORDERS {
    uuid id PK
    uuid user_id FK
    uuid address_id FK
    enum status
    decimal total_amount
    string stripe_payment_id
  }
 
  ORDER_ITEMS {
    uuid id PK
    uuid order_id FK
    uuid variant_id FK
    int quantity
    decimal unit_price
    json customization
  }
 
  PAYMENTS {
    uuid id PK
    uuid order_id FK
    string stripe_payment_id
    enum status
    decimal amount
    timestamp paid_at
  }
 
  REVIEWS {
    uuid id PK
    uuid product_id FK
    uuid user_id FK
    int rating
    text body
    boolean verified_purchase
  }
 
  WISHLISTS {
    uuid id PK
    uuid user_id FK
    uuid variant_id FK
    timestamp created_at
  }
 
  USERS ||--o{ ADDRESSES : "has"
  USERS ||--o| CARTS : "owns"
  USERS ||--o{ ORDERS : "places"
  USERS ||--o{ REVIEWS : "writes"
  USERS ||--o{ WISHLISTS : "saves"
  CATEGORIES ||--o{ CATEGORIES : "parent of"
  CATEGORIES ||--o{ PRODUCTS : "contains"
  PRODUCTS ||--o{ PRODUCT_VARIANTS : "has"
  PRODUCTS ||--o{ REVIEWS : "receives"
  PRODUCT_VARIANTS ||--o{ CART_ITEMS : "added to"
  PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "sold as"
  PRODUCT_VARIANTS ||--o{ WISHLISTS : "wishlisted as"
  CARTS ||--o{ CART_ITEMS : "contains"
  ORDERS ||--o{ ORDER_ITEMS : "includes"
  ORDERS ||--|| PAYMENTS : "paid via"
  ORDERS }o--|| ADDRESSES : "ships to"
```
 
---

## Setup
 
### Prerequisites
 
```bash
node --version   # v20+
psql --version   # PostgreSQL 15+
```
 
### Install
 
```bash
cd backend
pnpm install
cp .env.example .env    # fill in your values
```

### Database
 
```bash
# Run migrations + generate client
npx prisma migrate dev --name init
npx prisma generate

# Enable full-text search indexes
psql $DATABASE_URL -f prisma/search-indexes.sql
```

```bash
pnpm run start:dev    # http://localhost:3001/api
```
Swagger docs → `http://localhost:3001/api/docs`
 
---