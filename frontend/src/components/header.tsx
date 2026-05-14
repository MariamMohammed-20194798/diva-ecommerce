"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Search, ShoppingBag, User, Menu, X, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchCart, subscribeToCartUpdates } from "@/lib/cart"
import { getWishlistProductIds, subscribeToWishlistUpdates } from "@/lib/products"
import { motion } from "framer-motion"

const navigation = [
  { name: "Home", href: "/" },
  // { name: "New Arrivals", href: "/collection" },
  { name: "Collections", href: "/collections" },
  // { name: "Size Guide", href: "/size-guide" },
  { name: "Our Story", href: "/our-story" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistedProductIds, setWishlistedProductIds] = useState<string[]>([])
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountHref, setAccountHref] = useState("/auth");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAccountHref(window.localStorage.getItem("accessToken") ? "/account" : "/auth");
    }
  }, [pathname]);


  useEffect(() => {
    const syncWishlist = async () => {
      try {
        const ids = await getWishlistProductIds()
        setWishlistedProductIds(ids)
      } catch {
        setWishlistedProductIds([])
      }
    }

    void syncWishlist()
    window.addEventListener("focus", syncWishlist)
    const unsubscribe = subscribeToWishlistUpdates(() => {
      void syncWishlist()
    })

    return () => {
      window.removeEventListener("focus", syncWishlist)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const syncCart = async () => {
      try {
        const cart = await fetchCart()
        setCartItemCount(cart.itemCount ?? 0)
      } catch {
        setCartItemCount(0)
      }
    }

    void syncCart()
    window.addEventListener("focus", syncCart)
    const unsubscribe = subscribeToCartUpdates(() => {
      void syncCart()
    })

    return () => {
      window.removeEventListener("focus", syncCart)
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/auth" || pathname === "/verify-email" || pathname === "/account") {
    return null
  }


  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "bg-background/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
          }`}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>

            {/* Logo */}
            <div className="flex lg:flex-1">
              <Link href="/" className="text-2xl font-light tracking-[0.3em] text-foreground">
                DIVA
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex flex-1 items-center justify-end gap-2">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/wishlist" className="hidden sm:block">
                <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistedProductIds.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-accent-foreground flex items-center justify-center">
                    {wishlistedProductIds.length}
                  </span>}
                </Button>
              </Link>
              <Link href={accountHref}>
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative" aria-label="Shopping bag">
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium text-accent-foreground">
                    {cartItemCount}
                  </span>}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </motion.header>
    </>)
}

