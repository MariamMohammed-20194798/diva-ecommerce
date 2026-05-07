"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"

const policyItems = [
  "requests are accepted within 14 days of receiving the order",
  "the process takes up to 14 days",
  "exchange/refunds come with a 250 egp fee",
]

export default function ExchangeRefunds() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl font-light tracking-tight text-foreground sm:text-4xl"
        >
          Exchange & Refunds
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-foreground/80 font-light"
        >
          Our aim is to provide you with a seamless experience from our website to your door. If you
          encounter any issue, feel free to reach out; your feedback helps us grow!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {policyItems.slice(0, 2).map((item, index) => (
            <motion.div
              key={item}
              whileHover={{ y: -5 }}
              className="rounded-2xl bg-muted px-8 py-8 text-sm text-foreground/90 font-medium flex items-center justify-center text-center shadow-sm"
            >
              {item}
            </motion.div>
          ))}
          <div className="sm:col-span-2 sm:flex sm:justify-center">
            <motion.div
              whileHover={{ y: -5 }}
              className="rounded-2xl bg-muted px-8 py-8 text-sm text-foreground/90 font-medium flex items-center justify-center text-center shadow-sm sm:w-[calc(50%-0.75rem)]"
            >
              {policyItems[2]}
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="mt-16 rounded-full border-foreground/30 px-10 h-14 text-base font-normal hover:bg-foreground hover:text-white transition-all hover:scale-105 active:scale-95"
            suppressHydrationWarning
          >
            <Link href="/account">request an exchange/refund</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
