'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, Heart, ShoppingBag } from 'lucide-react';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  addProductToWishlist,
  formatPriceEgp,
  getProducts,
  addProductToCart,
  getWishlistProductIds,
  type Product,
} from '@/lib/products';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistedProductIds, setWishlistedProductIds] = useState<string[]>([]);
  const [activeWishlistProductId, setActiveWishlistProductId] = useState<string | null>(
    null,
  );
  const [activeCartProductId, setActiveCartProductId] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const wishlistedProductIdSet = useMemo(
    () => new Set(wishlistedProductIds),
    [wishlistedProductIds],
  );

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const nextProducts = await getProducts({ sort: 'newest' });
        setProducts(nextProducts);

        const wishlistIds = await getWishlistProductIds();
        setWishlistedProductIds(wishlistIds);
      } catch (error) {
        console.error('Failed to load new arrivals:', error);
      }
    };

    void fetchNewArrivals();
  }, []);

  const updateScrollState = () => {
    const element = scrollerRef.current;
    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    const element = scrollerRef.current;
    if (!element) {
      return;
    }

    const distance = Math.max(element.clientWidth * 0.8, 260);
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [products.length]);

  const handleAddToWishlist = async (product: Product) => {
    if (wishlistedProductIdSet.has(product.id)) {
      toast.info('Already in wishlist');
      return;
    }

    setActiveWishlistProductId(product.id);
    try {
      await addProductToWishlist(product);
      setWishlistedProductIds((current) => [...current, product.id]);
      toast.success('Added to wishlist');
    } catch {
      toast.error('Please login to add items to your wishlist');
    } finally {
      setActiveWishlistProductId(null);
    }
  };

  const handleAddToCart = async (product: Product) => {
    setActiveCartProductId(product.id);
    try {
      await addProductToCart(product, 1);
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add this product to cart');
    } finally {
      setActiveCartProductId(null);
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section ref={sectionRef} className="py-24 bg-background overflow-hidden" id="new">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Curated Selection
          </p>
          <h2 className="text-3xl sm:text-4xl font-light text-foreground tracking-tight">
            New Arrivals
          </h2>
        </motion.div>

        <div
          className="group relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            ref={scrollerRef}
            onScroll={updateScrollState}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group/card w-[72%] shrink-0 snap-start cursor-pointer sm:w-[45%] lg:w-[24%]"
              >
                <div className="relative group/image mb-4 aspect-[3/4] overflow-hidden rounded-[24px] bg-muted">
                  <Link
                    href={`/products/${product.slug}`}
                    className="absolute inset-0 z-10"
                  />

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="relative h-full w-full"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 24vw"
                      className="object-cover"
                      loading="eager"
                    />
                  </motion.div>

                  <div className="absolute right-3 top-3 flex flex-col gap-2 z-20 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      aria-label="Add to wishlist"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-foreground shadow-md transition-colors hover:bg-white"
                      onClick={(event) => {
                        event.preventDefault();
                        handleAddToWishlist(product);
                      }}
                      disabled={activeWishlistProductId === product.id}
                      suppressHydrationWarning
                    >
                      <Heart
                        className={`h-4 w-4 ${wishlistedProductIdSet.has(product.id) ? 'fill-current text-red-500' : ''}`}
                      />
                    </motion.button>
                  </div>

                  {/* Mobile micro-interactions */}
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/92 px-3 py-2 shadow-sm md:hidden z-20">
                    <button
                      type="button"
                      aria-label="Quick add"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={activeCartProductId === product.id || !product.inStock}
                      suppressHydrationWarning
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>

                  {/* Desktop Quick Add */}
                  <div className="absolute bottom-4 left-4 right-4 hidden translate-y-full opacity-0 transition-all duration-300 md:block md:group-hover/image:translate-y-0 md:group-hover/image:opacity-100 z-20">
                    <Button
                      className="w-full h-12 rounded-full bg-white/90 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-white border-none shadow-xl transition-all"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      disabled={activeCartProductId === product.id || !product.inStock}
                      suppressHydrationWarning
                    >
                      Quick Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="inline-block group-hover/card:text-primary transition-colors"
                  >
                    <h3 className="text-lg font-light tracking-wide">{product.name}</h3>
                  </Link>
                  <p className="text-md font-medium text-foreground/70">
                    {formatPriceEgp(product.price)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <AnimatePresence>
            {canScrollLeft && isHovered && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                type="button"
                onClick={() => scrollByAmount('left')}
                aria-label="Scroll new arrivals left"
                className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-white z-30 md:flex"
                suppressHydrationWarning
              >
                <ChevronLeft className="h-6 w-6" />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && isHovered && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                type="button"
                onClick={() => scrollByAmount('right')}
                aria-label="Scroll new arrivals right"
                className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-white z-30 md:flex"
                suppressHydrationWarning
              >
                <ChevronRight className="h-6 w-6" />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              aria-label="Previous new arrivals"
              disabled={!canScrollLeft}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white/50 text-foreground disabled:opacity-30"
              suppressHydrationWarning
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              aria-label="Next new arrivals"
              disabled={!canScrollRight}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white/50 text-foreground disabled:opacity-30"
              suppressHydrationWarning
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
