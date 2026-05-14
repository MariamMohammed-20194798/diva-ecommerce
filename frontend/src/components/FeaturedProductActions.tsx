"use client";

import { useState } from "react";
import { Product, addProductToCart, addProductToWishlist } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, Heart, ShoppingBag } from "lucide-react";

interface FeaturedProductActionsProps {
    product: Product;
}

export default function FeaturedProductActions({ product }: FeaturedProductActionsProps) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            await addProductToCart(product);
            toast.success(`${product.name} added to cart`);
        } catch (error) {
            toast.error("Failed to add to cart");
            console.error(error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        try {
            setIsAddingToWishlist(true);
            await addProductToWishlist(product);
            toast.success(`${product.name} added to wishlist`);
        } catch (error) {
            toast.error("Failed to add to wishlist");
            console.error(error);
        } finally {
            setIsAddingToWishlist(false);
        }
    };

    return (
        <div className="flex gap-4 items-center">
            <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="btn-primary flex items-center justify-center gap-2 min-w-[200px]"
                suppressHydrationWarning
            >
                {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        Add to Cart
                    </>
                )}
            </button>
            <button
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
                className="btn-ghost flex items-center gap-2"
                suppressHydrationWarning
            >
                {isAddingToWishlist ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <>
                        Save to Wishlist
                    </>
                )}
            </button>
        </div>
    );
}
