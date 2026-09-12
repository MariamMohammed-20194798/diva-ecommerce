'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const policyItems = [
  'requests are accepted within 14 days of receiving the order',
  'the process takes up to 14 days',
  'exchange/refunds come with a 80 egp fee',
  'items must be unused and returned in their original packaging',
];

export default function ExchangeRefunds() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="overflow-hidden bg-background py-14 sm:py-20 lg:py-24">
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
          className="mx-auto mt-6 max-w-3xl text-base font-light leading-relaxed text-foreground/80 sm:mt-8 sm:text-lg"
        >
          Our aim is to provide you with a seamless experience from our website to your
          door. If you encounter any issue, feel free to reach out; your feedback helps us
          grow!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6"
        >
          {policyItems.map((item, index) => (
            <motion.div
              key={item}
              whileHover={{ y: -5 }}
              className="flex min-h-24 items-center justify-center rounded-2xl px-4 py-6 text-center text-sm font-medium text-foreground/90 shadow-sm sm:px-8 sm:py-8"
            >
              {item}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <button
            className="btn-primary mt-10 h-12 w-full px-5 hover:bg-foreground hover:text-white transition-all hover:scale-105 active:scale-95 sm:mt-12 sm:w-auto"
            suppressHydrationWarning
          >
            request an exchange/refund
          </button>
        </motion.div>
      </div>
    </section>
  );
}
