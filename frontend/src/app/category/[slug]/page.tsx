"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, ChevronDown, Grid3X3, LayoutGrid } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import {
  getProducts,
  formatPriceEgp,
  addProductToCart,
  addProductToWishlist,
  type Product
} from "@/lib/products"

const sortOptions = [
  { name: "Newest", value: "newest" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
  { name: "Best Selling", value: "best-selling" },
]

export default function Categories() {
  const params = useParams()
  const slug = params.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [gridCols, setGridCols] = useState<3 | 4>(4)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeProductAction, setActiveProductAction] = useState<string | null>(null)

  // Derived category name from slug (e.g., "skin-care" -> "Skin Care")
  const categoryName = useMemo(() => {
    return slug
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }, [slug])

  // Derive the category hero image from the first product in the category, or use a fallback
  const categoryHeroImage = useMemo(() => {
    if (products.length > 0 && products[0].image) {
      return products[0].image
    }
    // Fallback to the slug-based image or a generic hero
    return `/images/categories/${slug}.jpg`
  }, [products, slug])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // We fetch all products and filter by category slug
        // In a real app, the API would support slug-based filtering
        const allProducts = await getProducts()
        const filtered = allProducts.filter(p =>
          p.category.toLowerCase().replace(/\s+/g, "-") === slug ||
          p.category.toLowerCase() === slug.replace(/-/g, " ")
        )
        setProducts(filtered)
      } catch (err) {
        console.error(err)
        setError("We could not load products for this category. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      void loadProducts()
    }
  }, [slug])

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "newest":
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
        default:
          return 0
      }
    })
  }, [products, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */}

      {/* Category Hero */}
      {/* <section className="relative h-[50vh] min-h-[400px] mt-16 overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={categoryHeroImage}
            alt={categoryName}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              // Fallback to a default collection image if category specific doesn't exist
              const target = e.target as HTMLImageElement
              target.src = "/images/collection-hero.jpg"
            }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </motion.div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm uppercase tracking-[0.4em] mb-4 text-white/80"
          >
            Category
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-7xl font-light tracking-tight text-center"
          >
            {categoryName}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="w-24 h-[1px] bg-white/50 mt-8"
          />
        </div>
      </section> */}

      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border mt-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/collections" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                All Collections
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-medium">{categoryName}</span>
            </div>

            <div className="flex items-center gap-6">
              {/* Sort dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  Sort
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 rounded-xl overflow-hidden">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`block w-full text-left px-5 py-3 text-sm hover:bg-muted transition-colors ${sortBy === option.value ? "bg-muted text-foreground font-semibold" : "text-muted-foreground"
                        }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid toggle */}
              <div className="hidden md:flex items-center gap-1 border-l border-border pl-6">
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded-lg transition-colors ${gridCols === 3 ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={`p-2 rounded-lg transition-colors ${gridCols === 4 ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="text-center py-20 border border-dashed rounded-3xl">
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 4, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-muted animate-pulse rounded-2xl" />
                <div className="h-4 bg-muted animate-pulse w-2/3 rounded" />
                <div className="h-4 bg-muted animate-pulse w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <h3 className="text-2xl font-light mb-4">No products found</h3>
            <p className="text-muted-foreground mb-8">We couldn&apos;t find any products in the {categoryName} category.</p>
            <Button asChild className="rounded-full px-8">
              <Link href="/collections">Browse All Products</Link>
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid grid-cols-2 gap-x-6 gap-y-12 sm:gap-x-8 lg:gap-y-16 ${gridCols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
              }`}
          >
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] mb-6 rounded-2xl overflow-hidden bg-muted">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.6 }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    </motion.div>

                    {product.isSale && (
                      <span className="absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-medium z-10">
                        Sale
                      </span>
                    )}

                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full h-10 w-10 bg-white/90 hover:bg-white shadow-xl backdrop-blur-sm"
                        onClick={async (e: React.MouseEvent) => {
                          e.preventDefault()
                          setActiveProductAction(`${product.id}:wishlist`)
                          try {
                            await addProductToWishlist(product)
                            toast.success("Added to wishlist")
                          } catch {
                            toast.error("Please login to add items to your wishlist")
                          } finally {
                            setActiveProductAction(null)
                          }
                        }}
                      >
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <Button
                        className="w-full h-12 rounded-full bg-white text-foreground hover:bg-foreground hover:text-white shadow-2xl transition-all font-medium"
                        onClick={async (e: React.MouseEvent) => {
                          e.preventDefault()
                          setActiveProductAction(`${product.id}:cart`)
                          try {
                            await addProductToCart(product, 1)
                            toast.success("Added to cart")
                          } catch {
                            toast.error("Could not add to cart")
                          } finally {
                            setActiveProductAction(null)
                          }
                        }}
                        disabled={!product.inStock}
                      >
                        Add to Bag
                      </Button>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {product.subcategory || product.category}
                    </p>
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="pt-1 flex items-center justify-center gap-3">
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through opacity-50">
                          {formatPriceEgp(product.originalPrice)}
                        </span>
                      )}
                      <span className={`text-sm font-medium ${product.isSale ? "text-accent" : "text-foreground"}`}>
                        {formatPriceEgp(product.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  )
}
