import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─────────────────────────────────────────────
      //  DIVA COLOR PALETTE
      //  Cream & Rose Gold — soft, feminine, elevated
      // ─────────────────────────────────────────────
      colors: {
        // Cream family — base backgrounds
        cream: {
          DEFAULT: "#FAF6F0",  // page background
          light: "#FDFAF6",  // lightest surface
          mid: "#F0E9DF",  // secondary bg (marquee, sections)
          dark: "#E5D9CC",  // borders, dividers
        },

        // Rose Gold family — primary brand accent
        "rose-gold": {
          DEFAULT: "#C8956C",  // main accent
          pale: "#F5E8DC",  // tinted backgrounds
          light: "#E8C4A8",  // hover tints, borders
          mid: "#D4A88A",  // mid-tone fills
          deep: "#A0614A",  // hover darken, active states
          darker: "#7A4535",  // deepest use — text on light
        },

        // Charcoal — primary text, dark sections
        charcoal: {
          DEFAULT: "#2A2018",  // body text, dark bg
          soft: "#3D3025",  // slightly lighter dark
          light: "#574838",  // muted dark surfaces
        },

        // Warm Gray — secondary text, muted elements
        "warm-gray": {
          DEFAULT: "#8A7968",  // body copy
          light: "#B5A898",  // placeholder, captions
          dark: "#6A5A4A",  // slightly darker secondary
        },

        // Ivory — card surfaces, overlays
        ivory: {
          DEFAULT: "#FFFDF9",  // pure card white
          warm: "#F8F2EA",  // warm white alternative
        },

        // Blush — soft highlight accent
        blush: {
          DEFAULT: "#F2D4C2",  // blush tint
          light: "#FAE8DC",  // very light blush
          deep: "#D4A090",  // deeper blush
        },
      },

      // ─────────────────────────────────────────────
      //  TYPOGRAPHY
      // ─────────────────────────────────────────────
      fontFamily: {
        cormorant: ["'Cormorant Garamond'", "Georgia", "serif"],
        jost: ["'Jost'", "system-ui", "sans-serif"],
      },

      fontSize: {
        "2xs": ["0.6rem", { lineHeight: "1rem", letterSpacing: "0.05em" }],
        "xs": ["0.7rem", { lineHeight: "1.2rem" }],
        "sm": ["0.825rem", { lineHeight: "1.6rem" }],
        "base": ["1rem", { lineHeight: "1.7rem" }],
        "display-sm": ["2rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-md": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-xl": ["6rem", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
      },

      letterSpacing: {
        widest2: "0.3em",
        widest3: "0.4em",
      },

      // ─────────────────────────────────────────────
      //  SPACING & SIZING
      // ─────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "36": "9rem",
        "42": "10.5rem",
        "50": "12.5rem",
        "72": "18rem",
        "80": "20rem",
        "96": "24rem",
        "128": "32rem",
      },

      // ─────────────────────────────────────────────
      //  ANIMATIONS
      // ─────────────────────────────────────────────
      animation: {
        "fade-up": "fadeUp 0.9s ease forwards",
        "fade-in": "fadeIn 1s ease forwards",
        "marquee": "marquee 22s linear infinite",
        "pulse-soft": "pulseSoft 6s ease-in-out infinite",
        "float": "float 5s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        pulseSoft: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(1.06)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },

      // ─────────────────────────────────────────────
      //  BORDERS & SHADOWS
      // ─────────────────────────────────────────────
      borderWidth: {
        "0.5": "0.5px",
      },

      boxShadow: {
        "soft": "0 4px 24px rgba(42, 32, 24, 0.06)",
        "card": "0 8px 40px rgba(42, 32, 24, 0.08)",
        "float": "0 16px 60px rgba(42, 32, 24, 0.12)",
      },

      // ─────────────────────────────────────────────
      //  ASPECT RATIOS
      // ─────────────────────────────────────────────
      aspectRatio: {
        "3/4": "3 / 4",
        "2/3": "2 / 3",
        "4/5": "4 / 5",
        "9/16": "9 / 16",
      },
    },
  },
  plugins: [],
};

export default config;
