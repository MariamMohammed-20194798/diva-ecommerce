"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    setEmail("")
  }

  return (
    <section ref={ref} className="py-24 bg-muted overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              stay connected
            </p>
            <h2 className="text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              Join Our World
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-foreground/70 mt-6 mb-10 leading-relaxed font-light"
          >
            Subscribe to receive exclusive access to new collections, special offers, and styling inspiration.
          </motion.p>

          <motion.form
            suppressHydrationWarning
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 flex-1 rounded-2xl bg-white/50 border-foreground/10 text-foreground placeholder:text-foreground/40 focus:border-foreground/30 focus:bg-white transition-all shadow-sm"
              required
              suppressHydrationWarning
            />
            <Button
              type="submit"
              className="h-14 rounded-2xl bg-foreground text-background hover:bg-foreground/90 px-10 font-medium transition-all active:scale-95 shadow-lg"
              suppressHydrationWarning
            >
              Subscribe
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 text-xs text-foreground/40"
          >
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
