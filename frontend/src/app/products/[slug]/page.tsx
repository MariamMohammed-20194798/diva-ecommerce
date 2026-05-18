'use client';

import { use, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { WriteReviewModal } from '@/components/write-review-modal';
import { StarRating } from '@/components/star-rating';
import {
  addProductToCart,
  formatPriceEgp,
  getImagesForProductColor,
  getMatchingVariantId,
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
  isProductWishlisted,
  toggleProductInWishlist,
  type Product,
  type Review,
  type ReviewsResponse,
} from '@/lib/products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function ProductDetails({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const hasSizes = product.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState<string>(
    hasSizes ? (product.sizes[0] ?? '') : '',
  );
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] ?? { name: 'Default', hex: '#888888' },
  );
  const [galleryImages, setGalleryImages] = useState<string[]>(
    getImagesForProductColor(product, product.colors[0]?.name),
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'shipping'>(
    'description',
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isWriteReviewModalOpen, setIsWriteReviewModalOpen] = useState(false);
  const [canScrollReviewsLeft, setCanScrollReviewsLeft] = useState(false);
  const [canScrollReviewsRight, setCanScrollReviewsRight] = useState(false);
  const [isReviewsHovered, setIsReviewsHovered] = useState(false);
  const reviewsScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextImages = getImagesForProductColor(product, selectedColor.name);
    setGalleryImages(nextImages);
    setSelectedImageIndex(0);
  }, [product, selectedColor.name]);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await isProductWishlisted(product.id);
      setIsWishlisted(status);
    };
    void checkStatus();
  }, [product.id]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const reviewsResponse = await getProductReviews(product.id);
        if (reviewsResponse) {
          setReviewsData(reviewsResponse);
          setReviews(reviewsResponse.data);
        }
      } catch {
        // Handle error silently, show empty reviews
        setReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    void loadReviews();
  }, [product.id]);

  const handleToggleWishlist = async () => {
    setIsAddingToWishlist(true);
    try {
      const nextValue = await toggleProductInWishlist(product);
      setIsWishlisted(nextValue);
      toast.success(nextValue ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Please login to add items to your wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const updateReviewsScrollState = () => {
    const element = reviewsScrollerRef.current;
    if (!element) {
      return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    setCanScrollReviewsLeft(element.scrollLeft > 0);
    setCanScrollReviewsRight(element.scrollLeft < maxScrollLeft - 1);
  };

  const scrollReviewsByAmount = (direction: 'left' | 'right') => {
    const element = reviewsScrollerRef.current;
    if (!element) {
      return;
    }

    const distance = Math.max(element.clientWidth * 0.8, 300);
    element.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    updateReviewsScrollState();
    window.addEventListener('resize', updateReviewsScrollState);
    return () => window.removeEventListener('resize', updateReviewsScrollState);
  }, [reviews.length]);

  const canNavigateGallery = galleryImages.length > 1;
  const activeImage = galleryImages[selectedImageIndex] ?? product.image;
  const requiresSizeSelection = hasSizes && !selectedSize;
  const colorPreviewImages = product.colors.map((color) => ({
    color,
    image: getImagesForProductColor(product, color.name)[0] ?? product.image,
  }));

  const showNextImage = () => {
    if (!canNavigateGallery) {
      return;
    }

    setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const showPreviousImage = () => {
    if (!canNavigateGallery) {
      return;
    }

    setSelectedImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}

      <main className="pt-20">
        {/* Breadcrumb */}
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link
                href="/collections"
                className="hover:text-foreground transition-colors"
              >
                Collections
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li>
              <Link
                href={`/collections?category=${product.category.toLowerCase()}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category}
              </Link>
            </li>
            <ChevronRight className="h-4 w-4" />
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>

        {/* Product section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product images */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] bg-muted overflow-hidden">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw,
                       (max-width: 1200px) 50vw,
                        50vw"
                  className="object-cover"
                  priority
                />
                <button
                  type="button"
                  onClick={showNextImage}
                  onWheel={(event) => {
                    if (!canNavigateGallery) {
                      return;
                    }

                    if (event.deltaY > 0) {
                      showNextImage();
                    } else if (event.deltaY < 0) {
                      showPreviousImage();
                    }
                  }}
                  className="absolute inset-0 z-10"
                  aria-label="Change product image"
                />
                {product.isNew && (
                  <span className="absolute top-4 left-4 bg-foreground text-background text-xs uppercase tracking-wider px-3 py-1.5">
                    New
                  </span>
                )}
                {product.isSale && (
                  <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-xs uppercase tracking-wider px-3 py-1.5">
                    Sale
                  </span>
                )}
              </div>
              {/* Thumbnail gallery placeholder */}
              {colorPreviewImages.length > 1 && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {colorPreviewImages.map(({ color, image }) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-16 aspect-square bg-muted overflow-hidden border-2 transition-colors ${
                        selectedColor.name === color.name
                          ? 'border-foreground'
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                      aria-label={`Switch to ${color.name} color`}
                      title={color.name}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${color.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw,
                                (max-width: 1200px) 50vw,
                                50vw"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  {product.category}
                </p>
                <h1 className="text-3xl lg:text-4xl font-light text-foreground tracking-tight mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  {product.originalPrice && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPriceEgp(product.originalPrice)}
                    </span>
                  )}
                  <span
                    className={`text-xl ${product.isSale ? 'text-accent' : 'text-foreground/70'}`}
                  >
                    {formatPriceEgp(product.price)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Color selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Color</span>
                  <span className="text-sm text-muted-foreground">
                    {selectedColor.name}
                  </span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? 'border-foreground scale-110'
                          : 'border-transparent hover:border-muted-foreground'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size selection */}
              {hasSizes && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Size</span>
                    <button className="text-sm text-muted-foreground underline hover:text-foreground transition-colors">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-4 py-2.5 text-sm border transition-colors ${
                          selectedSize === size
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:border-foreground'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity and add to bag */}
              <div className="flex gap-2 mb-6">
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  className="flex-1 rounded-full bg-foreground text-background hover:bg-foreground/90 h-auto py-3 text-sm uppercase tracking-wider"
                  disabled={requiresSizeSelection}
                  onClick={async () => {
                    setIsAddingToCart(true);
                    try {
                      const variantId = getMatchingVariantId(product, {
                        size: selectedSize,
                        color: selectedColor.name,
                      });
                      await addProductToCart(product, quantity, variantId);
                      toast.success('Added to cart');
                    } catch {
                      toast.error('Could not add this product to cart');
                    } finally {
                      setIsAddingToCart(false);
                    }
                  }}
                >
                  {requiresSizeSelection
                    ? 'Select a Size'
                    : isAddingToCart
                      ? 'Adding...'
                      : 'Add to Bag'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-auto aspect-square border-border"
                  aria-label="Add to wishlist"
                  onClick={handleToggleWishlist}
                  disabled={isAddingToWishlist}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Shipping info */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-5 w-5" />
                  <span>Free shipping on orders over EGP 10,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5" />
                  <span>Secure checkout</span>
                </div>
              </div>

              {/* Product tabs */}
              <div className="border-t border-border mt-8 pt-8">
                <div className="flex border-b border-border">
                  {(['description', 'details', 'shipping'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-[2px] ${
                        activeTab === tab
                          ? 'text-foreground border-foreground'
                          : 'text-muted-foreground border-transparent hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="py-6">
                  {activeTab === 'description' && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  {activeTab === 'details' && (
                    <ul className="space-y-2">
                      {product.details.map((detail, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-foreground">-</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <div className="text-sm text-muted-foreground space-y-4">
                      <p>- Standard shipping: 5-7 business days</p>
                      <p>- Express shipping: 2-3 business days</p>
                      <p>- Free shipping on orders over EGP 10,000</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-semibold text-foreground text-center mb-12">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-x-8">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-muted">
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw,
                              (max-width: 1200px) 50vw,
                              50vw"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {relatedProduct.category}
                      </p>
                      <h3 className="text-sm font-medium text-foreground transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="mt-1 text-sm text-foreground">
                        {formatPriceEgp(relatedProduct.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews section */}
        {reviews.length > 0 && (
          <section className="border-t border-border py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Customer Reviews
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {reviewsData?.meta.totalReviews ?? 0} customer review
                    {(reviewsData?.meta.totalReviews ?? 0) !== 1 ? 's' : ''}
                  </p>
                </div>
                {reviewsData && reviewsData.meta.averageRating > 0 && (
                  <div className="text-right">
                    <StarRating
                      rating={reviewsData.meta.averageRating}
                      showValue={true}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {reviewsData.meta.totalReviews} review
                      {reviewsData.meta.totalReviews !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              <div
                className="group relative"
                onMouseEnter={() => setIsReviewsHovered(true)}
                onMouseLeave={() => setIsReviewsHovered(false)}
              >
                <div
                  ref={reviewsScrollerRef}
                  onScroll={updateReviewsScrollState}
                  className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {reviews.map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="w-[85%] shrink-0 snap-start sm:w-[50%] lg:w-[33.333%]"
                    >
                      <div className="border border-border rounded-xl p-6 h-full flex flex-col bg-background hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <StarRating rating={review.rating} showValue={false} />
                          </div>
                          <p className="text-xs text-muted-foreground ml-2 shrink-0">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>

                        {review.body && (
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                            &quot;{review.body}&quot;
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          by{' '}
                          <span className="font-medium text-foreground">
                            {review.user.email.split('@')[0]}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {canScrollReviewsLeft && isReviewsHovered && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      type="button"
                      onClick={() => scrollReviewsByAmount('left')}
                      aria-label="Scroll reviews left"
                      className="absolute left-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:scale-110 z-30 md:flex"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {canScrollReviewsRight && isReviewsHovered && (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      type="button"
                      onClick={() => scrollReviewsByAmount('right')}
                      aria-label="Scroll reviews right"
                      className="absolute right-0 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:scale-110 z-30 md:flex"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Write review CTA */}
              <div className="mt-12 border border-border rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Share Your Experience
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Have you purchased this product? Help other customers by sharing your
                  honest review and rating.
                </p>
                <Button
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm uppercase tracking-wider"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Empty reviews state */}
        {!isLoadingReviews && reviews.length === 0 && (
          <section className="border-t border-border py-16">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Customer Reviews
                </h2>
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-12 text-center">
                <p className="text-sm text-muted-foreground mb-6">
                  No reviews yet. Be the first to share your experience!
                </p>
                <Button
                  onClick={() => setIsWriteReviewModalOpen(true)}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full text-sm uppercase tracking-wider"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Write Review Modal */}
        <WriteReviewModal
          isOpen={isWriteReviewModalOpen}
          onClose={() => setIsWriteReviewModalOpen(false)}
          productId={product.id}
          productName={product.name}
          onReviewSubmitted={async () => {
            // Refresh reviews after submission
            const reviewsResponse = await getProductReviews(product.id);
            if (reviewsResponse) {
              setReviewsData(reviewsResponse);
              setReviews(reviewsResponse.data);
            }
          }}
        />
      </main>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedProduct = await getProductBySlug(resolvedParams.slug);
        if (!loadedProduct) {
          setError('This product could not be found.');
          setProduct(null);
          setRelatedProducts([]);
          return;
        }
        setProduct(loadedProduct);
        const related = await getRelatedProducts(loadedProduct, 4);
        setRelatedProducts(related);
      } catch {
        setError('We could not load this product right now. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [resolvedParams.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="pt-24 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">Loading product...</p>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Header /> */}
        <main className="pt-24 pb-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-light text-foreground mb-3">
            Product unavailable
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error ?? 'This product could not be found.'}
          </p>
          <Link href="/collections" className="text-sm underline text-foreground">
            Back to Collections
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProductDetails
      key={product.id}
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
