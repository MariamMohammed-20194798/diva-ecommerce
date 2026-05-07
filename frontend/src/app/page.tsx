
import { Hero } from "@/components/hero"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import ExchangeRefunds from "@/components/ExchangeRefunds"
import Newsletter from "@/components/NewLetter"

export default function Home() {
  return (
    <main className="w-full">
      <Hero />
      <FeaturedProducts />
      <Categories />
      <ExchangeRefunds />
      <Newsletter />
    </main>
  )
}

