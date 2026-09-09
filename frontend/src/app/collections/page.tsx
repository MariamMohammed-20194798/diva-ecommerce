'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Heart,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutGrid,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

import {
  addProductToCart,
  formatPriceEgp,
  addProductToWishlist,
  getCategories,
  getProducts,
  type Product,
} from '@/lib/products';

const sortOptions = [
  { name: 'Newest', value: 'newest' },
  { name: 'Price: Low to High', value: 'price-asc' },
  { name: 'Price: High to Low', value: 'price-desc' },
  { name: 'Best Selling', value: 'best-selling' },
];

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProductAction, setActiveProductAction] = useState<
    string | null
  >(null);
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await getProducts();
        setProducts(data);
      } catch {
        setError(
          'We could not load products right now. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const categories = useMemo(() => getCategories(products), [products]);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter(
          (product) =>
            product.category.toLowerCase() === selectedCategory,
        );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;

      case 'price-desc':
        return b.price - a.price;

      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);

      default:
        return 0;
    }
  });

  const selectedSort =
    sortOptions.find((option) => option.value === sortBy)?.name ?? 'Newest';

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleMobileCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-background">

      <section className="sticky top-16 mb-20 z-40 border-y border-border/70 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[64px] items-center justify-between gap-4">
            {/* Left side */}
            <div className="flex min-w-0 items-center gap-5">
              {/* Filter button */}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`group flex shrink-0 items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors ${
                  showFilters
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal
                  className="h-4 w-4 stroke-[1.5]"
                />

                <span className="hidden sm:inline">Filters</span>
              </button>

              <span className="hidden h-5 w-px bg-border sm:block" />

              {/* Desktop category navigation */}
              <nav className="hidden min-w-0 items-center gap-6 md:flex">
               

                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`relative whitespace-nowrap py-5 text-xs uppercase tracking-[0.12em] transition-colors ${
                      selectedCategory === category.slug
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {category.name}

                    <span
                      className={`absolute bottom-0 left-0 h-px bg-foreground transition-all duration-300 ${
                        selectedCategory === category.slug
                          ? 'w-full'
                          : 'w-0'
                      }`}
                    />
                  </button>
                ))}
              </nav>

              {/* Mobile filter label */}
              <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground md:hidden">
                Collection
              </span>
            </div>

            {/* Right side */}
            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              {/* Product count */}
              <span className="hidden text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                {isLoading
                  ? 'Loading'
                  : `${sortedProducts.length} ${
                      sortedProducts.length === 1 ? 'Item' : 'Items'
                    }`}
              </span>

              <span className="hidden h-5 w-px bg-border sm:block" />

              {/* Sort */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                  aria-expanded={showSort}
                >
                  <span className="hidden sm:inline">Sort</span>
                  <span className="sm:hidden">Sort by</span>

                </button>

                {showSort && (
                  <>
                    {/* Click-away area */}
                    <button
                      type="button"
                      aria-label="Close sort menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setShowSort(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full z-50 mt-4 w-56 border border-border bg-background p-2 shadow-[0_15px_40px_rgba(0,0,0,0.08)]">
                      <div className="border-b border-border px-3 py-2.5">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                          Sort by
                        </p>
                      </div>

                      <div className="pt-1">
                        {sortOptions.map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                              setSortBy(option.value);
                              setShowSort(false);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors hover:bg-muted/60"
                          >
                            <span
                              className={
                                sortBy === option.value
                                  ? 'font-medium text-foreground'
                                  : 'text-muted-foreground'
                              }
                            >
                              {option.name}
                            </span>

                            {sortBy === option.value && (
                              <Check className="h-3.5 w-3.5 stroke-[1.5]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Grid controls */}
              <div className="hidden items-center gap-1 border-l border-border pl-5 lg:flex">
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 transition-colors ${
                    gridCols === 3
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="3 column grid"
                  aria-pressed={gridCols === 3}
                >
                  <LayoutGrid className="h-4 w-4 stroke-[1.5]" />
                </button>

                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 transition-colors ${
                    gridCols === 4
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-label="4 column grid"
                  aria-pressed={gridCols === 4}
                >
                  <Grid3X3 className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Mobile Filter Drawer                                           */}
      {/* ------------------------------------------------------------- */}

      {showFilters && (
        <div className="fixed inset-0 z-[60] md:hidden">
       

          {/* Drawer */}
          <aside className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-background">
            {/* Drawer header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-5 py-5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                  Refine
                </p>

                <h2 className="mt-1 text-lg font-light tracking-wide">
                  Filters
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                aria-label="Close filters"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Drawer content */}
            <div className="px-5 py-3">
              <div>

                <div className="divide-y divide-border">

                  {/* Categories */}
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category.slug}
                      onClick={() =>
                        handleMobileCategoryChange(category.slug)
                      }
                      className="flex w-full items-center justify-between py-4 text-left"
                    >
                      <span
                        className={`text-sm transition-colors ${
                          selectedCategory === category.slug
                            ? 'font-medium text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {category.name}
                      </span>

                      {selectedCategory === category.slug && (
                        <Check className="h-4 w-4 stroke-[1.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile selection summary */}
              <div className="mt-8 border border-border p-5">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  Current selection
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">
                    {selectedCategory === 'all'
                      ? 'All pieces'
                      : categories.find(
                          (category) =>
                            category.slug === selectedCategory,
                        )?.name ?? 'All pieces'}
                  </span>

                  <span className="text-xs text-muted-foreground">
                    {sortedProducts.length}{' '}
                    {sortedProducts.length === 1
                      ? 'piece'
                      : 'pieces'}
                  </span>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="mt-6 flex h-12 w-full items-center justify-center bg-foreground text-xs font-medium uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90"
              >
                View Collection
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Products                                                       */}
      {/* ------------------------------------------------------------- */}

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        {/* Error */}
        {error && (
          <div className="mb-8 border border-border p-4 text-sm text-muted-foreground">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-20 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Loading collection
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sortedProducts.length === 0 && !error && (
          <div className="py-24 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              No pieces found
            </p>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-4 border-b border-foreground pb-1 text-sm text-foreground"
            >
              View all pieces
            </button>
          </div>
        )}

        {/* Product grid */}
        {!isLoading && sortedProducts.length > 0 && (
          <div
            className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8 lg:gap-y-12 ${
              gridCols === 3
                ? 'lg:grid-cols-3'
                : 'lg:grid-cols-4'
            }`}
          >
            {sortedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group cursor-pointer"
              >
                {/* Product image */}
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-muted">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    loading="eager"
                  />

                  {/* Badges */}
                  <div className="absolute left-3 top-3 flex flex-col gap-2">
                    {product.isSale && (
                      <span className="bg-background/95 px-2.5 py-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-foreground">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Wishlist */}
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full bg-background/90 shadow-none backdrop-blur-sm hover:bg-background"
                      aria-label="Add to wishlist"
                      onClick={async (event) => {
                        event.preventDefault();

                        setActiveProductAction(
                          `${product.id}:wishlist`,
                        );

                        try {
                          await addProductToWishlist(product);
                          toast.success('Added to wishlist');
                        } catch {
                          toast.error(
                            'Please login to add items to your wishlist',
                          );
                        } finally {
                          setActiveProductAction(null);
                        }
                      }}
                      disabled={
                        activeProductAction ===
                        `${product.id}:wishlist`
                      }
                    >
                      <Heart className="h-4 w-4 stroke-[1.5]" />
                    </Button>
                  </div>

                  {/* Quick add */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-500 ease-out group-hover:translate-y-0 sm:p-4">
                    <Button
                      className="h-11 w-full rounded-none bg-background text-xs font-medium uppercase tracking-[0.14em] text-foreground shadow-none hover:bg-foreground hover:text-background"
                      onClick={async (event) => {
                        event.preventDefault();

                        setActiveProductAction(
                          `${product.id}:cart`,
                        );

                        try {
                          await addProductToCart(product, 1);
                          toast.success('Added to cart');
                        } catch {
                          toast.error(
                            'Could not add this product to cart',
                          );
                        } finally {
                          setActiveProductAction(null);
                        }
                      }}
                      disabled={
                        activeProductAction ===
                          `${product.id}:cart` ||
                        !product.inStock
                      }
                    >
                      {product.inStock ? 'Quick Add' : 'Out of Stock'}
                    </Button>
                  </div>
                </div>

                {/* Product information */}
                <div className="text-center">
                  <p className="mb-1.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    {product.category}
                  </p>

                  <h3 className="text-sm font-normal tracking-wide text-foreground transition-colors group-hover:text-foreground/70">
                    {product.name}
                  </h3>

                  <div className="mt-1.5 flex items-center justify-center gap-2">
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPriceEgp(product.originalPrice)}
                      </span>
                    )}

                    <span
                      className={`text-sm ${
                        product.isSale
                          ? 'text-accent'
                          : 'text-foreground/70'
                      }`}
                    >
                      {formatPriceEgp(product.price)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}