'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useInView, AnimatePresence, Variants } from 'framer-motion';

import api from '@/lib/api';

type CategoryNode = {
  id?: string;
  name: string;
  description: string;
  images: string[];
  slug?: string;
  children?: CategoryNode[];
};

type CategoryCard = {
  key: string;
  name: string;
  description: string;
  image: string;
  href: string;
  slug: string;
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '-');
}

function flattenSubcategories(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => {
    if (node.children?.length) {
      return node.children;
    }
    return [];
  });
}

export default function Categories() {
  const [categoriesTree, setCategoriesTree] = useState<CategoryNode[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await api.get<CategoryNode[]>('/categories/tree');
        if (!isMounted) return;
        setCategoriesTree(response.data);
      } catch (error) {
        console.error('Failed to load categories section:', error);
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCards = useMemo<CategoryCard[]>(() => {
    const subcategories = flattenSubcategories(categoriesTree);
    const sourceCategories = subcategories.length ? subcategories : categoriesTree;

    return sourceCategories.slice(0, 10).map((category, index) => {
      const slug = category.slug || normalizeKey(category.name);
      return {
        key: category.id ?? `${slug}-${index}`,
        name: category.name,
        description: category.description,
        image: category.images[0],
        href: `/category/${slug}`,
        slug: slug,
      };
    });
  }, [categoriesTree]);

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
    const distance = Math.max(element.clientWidth * 0.75, 240);
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [categoryCards.length]);

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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.21, 0.45, 0.32, 0.9] as const,
      },
    },
  };

  return (
    <section ref={sectionRef} className="bg-muted py-24 overflow-hidden" id="collections">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Explore
          </p>
          <h2 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Shop by Category
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
            {categoryCards.map((category) => (
              <motion.div
                key={category.key}
                variants={cardVariants}
                className="group/card relative aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden rounded-[28px] sm:w-[46%] lg:w-[31%]"
                whileHover={{ y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <Link href={category.href} className="absolute inset-0 z-20" />

                {category.image && (
                  <motion.div
                    className="absolute inset-0 z-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.7 }}
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 30vw"
                      className="object-cover"
                      loading="eager"
                    />
                  </motion.div>
                )}

                <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover/card:bg-black/40 z-1" />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white z-10 text-center">
                  <motion.h3
                    className="mb-2 text-xl font-light tracking-wider sm:text-2xl"
                    initial={{ opacity: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {category.name}
                  </motion.h3>
                  <p className="mb-6 line-clamp-2 text-sm text-white/80 max-w-[240px]">
                    {category.description}
                  </p>
                  <motion.div
                    className="inline-flex items-center text-xs uppercase tracking-[0.2em] bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
                    whileHover={{
                      scale: 1.05,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Shop Now
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </motion.div>
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
                aria-label="Scroll categories left"
                className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-white z-30 md:flex"
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
                aria-label="Scroll categories right"
                className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-white z-30 md:flex"
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
              aria-label="Previous categories"
              disabled={!canScrollLeft}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-white/50 text-foreground disabled:opacity-30"
              suppressHydrationWarning
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              aria-label="Next categories"
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
