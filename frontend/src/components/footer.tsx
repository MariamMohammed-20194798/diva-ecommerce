import { Mail, Phone } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  shop: [
    { name: "Collections", href: "/collections" },
    { name: "New Arrivals", href: "/collections" },
    { name: "Wishlist", href: "/wishlist" },
  ],
  touch: [
    { name: "info@divaegypt.com", href: "mailto:info@divaegypt.com", icon: <Mail className="h-4 w-4" /> },
    { name: "+201116209888", href: "tel:+201116209888", icon: <Phone className="h-4 w-4" /> },
  ],
  about: [
    { name: "Our Story", href: "/our-story" },
    { name: "Size Guide", href: "/size-guide" },
    { name: "Account", href: "/account" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-charcoal px-4 pb-10 pt-16 sm:px-8 sm:pb-12 sm:pt-20 lg:px-16">
      {/* Top grid */}
      <div className="mb-12 grid grid-cols-1 gap-10 border-b border-white/10 pb-12 sm:grid-cols-2 sm:gap-12 lg:mb-16 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-16 lg:pb-16">
        {/* Brand */}
        <div>
          <Link
            href="/"
            className="font-cormorant text-4xl font-light tracking-widest2 text-ivory block mb-6 no-underline"
          >
            DIVA
          </Link>
          <p className="text-sm leading-loose text-white/35 max-w-xs">
            A luxury fashion house for women who dress with intention.
            Handcrafted in Europe. Delivered worldwide.
          </p>
        </div>

        <div>
          <div className="text-2xs tracking-[0.3em] uppercase text-rose-gold mb-6">
            Shop
          </div>
          <ul className="list-none space-y-3">
            {footerLinks.shop.map((link) => (
              <li key={link.name}>
                <Link href={link.href}
                  className="text-sm text-white/40 no-underline transition-colors duration-300 hover:text-rose-gold-light">                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-2xs tracking-[0.3em] uppercase text-rose-gold mb-6">
            Get in touch
          </div>

          <ul className="list-none space-y-3"> {footerLinks.touch.map((link) => (<li key={link.name}> <Link href={link.href}
            className="flex items-center gap-2 text-sm text-white/40 no-underline transition-colors duration-300 hover:text-rose-gold-light" > <span className="flex items-center">{link.icon}</span> <span>{link.name}</span> </Link> </li>))} </ul>
        </div>

        <div>
          <div className="text-2xs tracking-[0.3em] uppercase text-rose-gold mb-6">
            About
          </div>
          <ul className="list-none space-y-3">
            {footerLinks.about.map((link) => (
              <li key={link.name}>
                <Link href={link.href}
                  className="text-sm text-white/40 no-underline transition-colors duration-300 hover:text-rose-gold-light">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom */}
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <p className="text-2xs tracking-wide text-white/20">
          © 2026 DIVA. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {["Instagram", "Pinterest", "TikTok"].map((s) => (
            <Link
              key={s}
              href="#"
              className="text-2xs tracking-[0.2em] uppercase text-white/30 no-underline transition-colors duration-300 hover:text-rose-gold"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );

}
