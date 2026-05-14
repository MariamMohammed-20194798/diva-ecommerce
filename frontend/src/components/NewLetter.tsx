"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) setJoined(true);
  };

  return (
    <section className="relative px-16 py-24 text-center overflow-hidden bg-rose-gold-pale">
      {/* Watermark */}
      <span
        className="absolute top-1/2 left-1/2 font-cormorant font-semibold text-rose-gold pointer-events-none select-none whitespace-nowrap"
        style={{
          fontSize: "18rem",
          opacity: 0.05,
          transform: "translate(-50%, -50%)",
          letterSpacing: "0.1em",
        }}
        aria-hidden="true"
      >
        DIVA
      </span>

      <span className="section-label relative">For the Inner Circle</span>

      <h2 className="font-cormorant text-display-md font-light text-charcoal mb-4 relative">
        The Art of{" "}
        <em className="italic text-rose-gold" style={{ fontStyle: "italic" }}>
          Being First
        </em>
      </h2>

      <p className="text-sm text-warm-gray mb-12 relative">
        Private previews, early access & curated inspiration — for those who
        refuse to follow.
      </p>

      {joined ? (
        <p className="font-cormorant text-xl text-charcoal relative">
          Welcome to the inner circle. ✦
        </p>
      ) : (
        <div className="flex max-w-md mx-auto relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-6 py-4 bg-ivory text-charcoal text-sm outline-none border-none placeholder:text-warm-gray-light font-jost"
            suppressHydrationWarning
          />
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-charcoal text-ivory text-2xs tracking-[0.2em] uppercase font-jost transition-colors duration-300 hover:bg-rose-gold-deep"
            suppressHydrationWarning
          >
            Join
          </button>
        </div>
      )}
    </section>
  );
}
