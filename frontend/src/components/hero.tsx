'use client';

// import Image from "next/image"
// import { motion } from "framer-motion"
// import { ArrowRight } from "lucide-react"
// import { useRouter } from "next/navigation"

// export function Hero() {
//   const router = useRouter()

//   return (
//     <section className="relative min-h-screen flex items-center overflow-hidden">
//       {/* Background Image */}
//       <div className="absolute inset-0 z-0">
//         <Image
//           src="/images/hero-fashion.jpg"
//           alt="Fashion model in elegant attire"
//           fill
//           className="object-cover object-center"
//           priority
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
//       </div>

//       {/* Content */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-20">
//         <div className="max-w-2xl">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <span className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
//               Spring/Summer 2026
//             </span>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 40 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.4 }}
//             className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-[0.95] mt-6 text-balance"
//           >
//             Timeless elegance
//             <br />
//             <span className="italic font-normal">redefined</span>
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.6 }}
//             className="text-md md:text-lg text-muted-foreground mt-8 max-w-md leading-relaxed"
//           >
//             Discover our curated collection of contemporary silhouettes crafted
//             for the modern woman.
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.8 }}
//             className="flex flex-col sm:flex-row gap-4 mt-10"
//           >
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="group rounded-md flex items-center justify-center gap-3 bg-primary text-primary-foreground px-4 py-3 text-sm tracking-widest uppercase transition-all duration-300"
//               onClick={() => router.push("/collections")}
//               suppressHydrationWarning
//             >
//               Explore Collection
//               <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="flex items-center justify-center gap-3 border border-foreground/20 px-4 py-4 rounded-md text-sm tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
//               onClick={() => router.push("/lookbook")}
//               suppressHydrationWarning
//             >
//               View Lookbook
//             </motion.button>
//           </motion.div>
//         </div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 1, delay: 1.2 }}
//         className="absolute bottom-10 left-1/2 -translate-x-1/2"
//       >
//         <motion.div
//           animate={{ y: [0, 10, 0] }}
//           transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//           className="flex flex-col items-center gap-2"
//         >
//           <span className="text-xs tracking-[0.3em] uppercase text-muted-foreground">
//             Scroll
//           </span>
//           <div className="w-px h-12 bg-foreground/30 relative overflow-hidden">
//             <motion.div
//               animate={{ y: [-48, 48] }}
//               transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
//               className="absolute w-full h-1/2 bg-foreground"
//             />
//           </div>
//         </motion.div>
//       </motion.div>
//     </section>
//   );
// }

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="min-h-screen grid grid-cols-2 relative overflow-hidden">
      {/* ── LEFT ── */}
      <div className="flex flex-col justify-center px-16 pt-40 pb-24 relative z-10">
        <p
          className="section-label opacity-0"
          style={{ animation: 'fadeUp 0.9s ease 0.3s forwards' }}
        >
          SS 2026 Collection
        </p>

        <h1
          className="font-cormorant text-display-xl font-light leading-none text-charcoal mb-12 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.5s forwards' }}
        >
          Dressed
          <br />
          in{' '}
          <em
            className="italic text-rose-gold not-italic"
            style={{ fontStyle: 'italic' }}
          >
            Pure
          </em>
          <br />
          Intention
        </h1>

        <p
          className="text-sm leading-relaxed text-warm-gray max-w-xs mb-14 opacity-0"
          style={{ animation: 'fadeUp 1s ease 0.75s forwards' }}
        >
          Each piece in our collection is a meditation on femininity — crafted for the
          woman who moves through the world with quiet, unshakeable confidence.
        </p>

        <div
          className="flex items-center gap-10 opacity-0"
          style={{ animation: 'fadeUp 1s ease 1s forwards' }}
        >
          <Link href="/collections" className="btn-primary">
            Explore Collection
          </Link>
        </div>
      </div>

      {/* ── RIGHT — abstract art panel ── */}
      <div className="relative bg-rose-gold-pale overflow-hidden">
        {/* Pulsing circles */}
        <div
          className="absolute w-96 h-96 rounded-full bg-rose-gold-light opacity-50"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full bg-rose-gold opacity-20"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite 1s',
          }}
        />
        <div
          className="absolute w-36 h-36 rounded-full bg-rose-gold-deep opacity-15"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite 2s',
          }}
        />

        {/* Silhouette line art */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 500 700"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <path
            d="M250,80 C250,80 200,120 190,180 C180,240 195,260 200,310 C205,360 185,400 180,450 C175,500 190,560 250,600 C310,560 325,500 320,450 C315,400 295,360 300,310 C305,260 320,240 310,180 C300,120 250,80 250,80Z"
            fill="none"
            stroke="#C8956C"
            strokeWidth="1.5"
          />
          <ellipse
            cx="250"
            cy="68"
            rx="28"
            ry="35"
            fill="none"
            stroke="#C8956C"
            strokeWidth="1.5"
          />
          <line
            x1="200"
            y1="310"
            x2="160"
            y2="500"
            stroke="#C8956C"
            strokeWidth="1"
            opacity="0.6"
          />
          <line
            x1="300"
            y1="310"
            x2="340"
            y2="500"
            stroke="#C8956C"
            strokeWidth="1"
            opacity="0.6"
          />
          <path
            d="M175,200 Q250,235 325,200"
            fill="none"
            stroke="#C8956C"
            strokeWidth="0.8"
            opacity="0.4"
          />
        </svg>

        {/* Floating info tags */}
        <div
          className="floating-tag bottom-1/4 -left-2"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="text-2xs tracking-[0.2em] uppercase text-rose-gold mb-1">
            New Arrival
          </div>
          <div className="font-cormorant text-lg text-charcoal">The Soleil Dress</div>
        </div>

        <div className="floating-tag top-1/4 right-8" style={{ animationDelay: '2s' }}>
          <div className="text-2xs tracking-[0.2em] uppercase text-rose-gold mb-1">
            Starting from
          </div>
          <div className="font-cormorant text-lg text-charcoal">EGP 500</div>
        </div>
      </div>

      {/* Vertical text */}
      <p
        className="absolute right-0 top-1/2 z-10 text-2xs tracking-[0.35em] uppercase text-warm-gray opacity-0"
        style={{
          transform: 'translateY(-50%) rotate(90deg)',
          transformOrigin: 'center',
          animation: 'fadeIn 1.5s ease 1s forwards',
        }}
      >
        DIVA — Luxury Fashion House
      </p>
    </section>
  );
}
