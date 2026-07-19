import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2">
      {/* ── LEFT ── */}
      <div className="relative z-10 flex flex-col justify-center px-4 pb-16 pt-28 sm:px-8 sm:pt-32 sm:pb-20 lg:px-16 lg:pt-40 lg:pb-24">
        <p
          className="section-label opacity-0"
          style={{ animation: 'fadeUp 0.9s ease 0.3s forwards' }}
        >
          SS 2026 Collection
        </p>

        <h1
          className="mb-8 font-cormorant text-[clamp(2.5rem,10vw,6rem)] font-light leading-[0.95] text-charcoal opacity-0 sm:mb-10 lg:mb-12"
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
          className="mb-10 max-w-xs text-sm leading-relaxed text-warm-gray opacity-0 sm:mb-12 lg:mb-14"
          style={{ animation: 'fadeUp 1s ease 0.75s forwards' }}
        >
          Each piece in our collection is a meditation on femininity — crafted for the
          woman who moves through the world with quiet, unshakeable confidence.
        </p>

        <div
          className="flex flex-wrap items-center gap-4 opacity-0 sm:gap-10"
          style={{ animation: 'fadeUp 1s ease 1s forwards' }}
        >
          <Link href="/collections" className="btn-primary w-full sm:w-auto">
            Explore Collection
          </Link>
        </div>
      </div>

      {/* ── RIGHT — abstract art panel ── */}
      <div className="relative min-h-[280px] overflow-hidden bg-rose-gold-pale sm:min-h-[360px] lg:min-h-0">
        {/* Pulsing circles */}
        <div
          className="absolute h-48 w-48 rounded-full bg-rose-gold-light opacity-50 sm:h-72 sm:w-72 lg:h-96 lg:w-96"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute h-32 w-32 rounded-full bg-rose-gold opacity-20 sm:h-48 sm:w-48 lg:h-64 lg:w-64"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite 1s',
          }}
        />
        <div
          className="absolute h-20 w-20 rounded-full bg-rose-gold-deep opacity-15 sm:h-28 sm:w-28 lg:h-36 lg:w-36"
          style={{
            top: '50%',
            left: '50%',
            animation: 'pulseSoft 6s ease-in-out infinite 2s',
          }}
        />

        {/* Silhouette line art */}
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
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

        {/* Floating info tags — hidden on very small screens to avoid overlap */}
        <div
          className="floating-tag bottom-1/4 left-2 hidden sm:block sm:-left-2"
          style={{ animationDelay: '1.5s' }}
        >
          <div className="mb-1 text-2xs tracking-[0.2em] uppercase text-rose-gold">
            New Arrival
          </div>
          <div className="font-cormorant text-base text-charcoal sm:text-lg">The Soleil Dress</div>
        </div>

        <div
          className="floating-tag right-4 top-1/4 hidden sm:block sm:right-8"
          style={{ animationDelay: '2s' }}
        >
          <div className="mb-1 text-2xs tracking-[0.2em] uppercase text-rose-gold">
            Starting from
          </div>
          <div className="font-cormorant text-base text-charcoal sm:text-lg">EGP 500</div>
        </div>
      </div>

      {/* Vertical text — desktop only */}
      <p
        className="absolute right-2 top-1/2 z-10 hidden text-2xs tracking-[0.35em] uppercase text-warm-gray opacity-0 xl:block"
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
