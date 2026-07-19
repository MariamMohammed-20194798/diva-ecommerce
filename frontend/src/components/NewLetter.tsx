"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) setJoined(true);
  };

  return (
    <section className="relative overflow-hidden bg-rose-gold-pale px-4 py-16 text-center sm:px-8 sm:py-20 lg:px-16 lg:py-24">
      {/* Watermark */}
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 select-none whitespace-nowrap font-cormorant font-semibold text-rose-gold"
        style={{
          fontSize: "clamp(6rem, 28vw, 18rem)",
          opacity: 0.05,
          transform: "translate(-50%, -50%)",
          letterSpacing: "0.1em",
        }}
        aria-hidden="true"
      >
        DIVA
      </span>

      <span className="section-label relative">For the Inner Circle</span>

      <h2 className="relative mb-4 font-cormorant text-[clamp(2rem,6vw,3rem)] font-light text-charcoal">
        The Art of{" "}
        <em className="italic text-rose-gold" style={{ fontStyle: "italic" }}>
          Being First
        </em>
      </h2>

      <p className="relative mb-10 text-sm text-warm-gray sm:mb-12">
        Private previews, early access & curated inspiration — for those who
        refuse to follow.
      </p>

      {joined ? (
        <p className="relative font-cormorant text-lg text-charcoal sm:text-xl">
          Welcome to the inner circle. ✦
        </p>
      ) : (
        <div className="relative mx-auto flex w-full max-w-md flex-col sm:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="min-h-11 flex-1 border-none bg-ivory px-4 py-3 font-jost text-sm text-charcoal outline-none placeholder:text-warm-gray-light focus-visible:ring-2 focus-visible:ring-rose-gold/40 sm:px-6 sm:py-4"
            suppressHydrationWarning
          />
          <button
            onClick={handleSubmit}
            className="min-h-11 px-6 py-3 font-jost text-2xs uppercase tracking-[0.2em] text-ivory transition-colors duration-300 bg-charcoal hover:bg-rose-gold-deep sm:px-8 sm:py-4"
            suppressHydrationWarning
          >
            Join
          </button>
        </div>
      )}
    </section>
  );
}
