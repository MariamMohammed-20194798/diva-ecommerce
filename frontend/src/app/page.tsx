
import { Hero } from "@/components/hero"
import Categories from "@/components/Categories"
import FeaturedProducts from "@/components/FeaturedProducts"
import ExchangeRefunds from "@/components/ExchangeRefunds"
import Newsletter from "@/components/NewLetter"
import ScrollReveal from "@/components/ScrollReveal"
import CustomCursor from "@/components/CustomCursor"
import Marquee from "@/components/Marquee"

export default function Home() {
  return (
    <>
      <CustomCursor />
      <ScrollReveal />
      <main className="w-full">
        <Hero />
        <Marquee />
        <FeaturedProducts />
        <Categories />
        <ExchangeRefunds />
        <Newsletter />
      </main>
    </>
  )
}

