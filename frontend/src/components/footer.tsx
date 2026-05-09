import { Mail, Phone } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  shop: [
    { name: "New Arrivals", href: "#" },
    { name: "Best Sellers", href: "#" },
    { name: "Dresses", href: "#" },
    { name: "Accessories", href: "#" },
    { name: "Sale", href: "#" },
  ],
  touch: [
    { name: "info@divaegypt.com", href: "#", icon: <Mail className="h-4 w-4" /> },
    { name: "+201096666666", href: "#", icon: <Phone className="h-4 w-4" /> },
  ],
  about: [
    { name: "Our Story", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ],
}

export function Footer() {
  // return (
  //   <footer className="bg-background/80 border-t border-border">
  //     <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //       {/* Main footer content */}
  //       <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
  //         {/* Brand column */}
  //         <div className="lg:col-span-2">
  //           <Link href="/" className="text-2xl font-light tracking-[0.3em] text-foreground">
  //             DIVA
  //           </Link>
  //           <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
  //             Curating timeless elegance for the modern woman. Our collections blend classic sophistication with contemporary design.
  //           </p>
  //           {/* Social links */}
  //           <div className="mt-6 flex gap-4">
  //             <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
  //               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
  //                 <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  //               </svg>
  //             </a>
  //             <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Pinterest">
  //               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
  //                 <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  //               </svg>
  //             </a>
  //             <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
  //               <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
  //                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  //               </svg>
  //             </a>
  //           </div>
  //         </div>

  //         {/* Links columns */}
  //         <div>
  //           <h3 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
  //             Shop
  //           </h3>
  //           <ul className="space-y-3">
  //             {footerLinks.shop.map((link) => (
  //               <li key={link.name}>
  //                 <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
  //                   {link.name}
  //                 </Link>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>

  //         <div>
  //           <h3 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
  //             Get in touch
  //           </h3>
  //           <ul className="space-y-3"> {footerLinks.touch.map((link) => (<li key={link.name}> <Link href={link.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" > <span className="flex items-center">{link.icon}</span> <span>{link.name}</span> </Link> </li>))} </ul>
  //         </div>

  //         <div>
  //           <h3 className="text-sm font-medium text-foreground uppercase tracking-wider mb-4">
  //             About
  //           </h3>
  //           <ul className="space-y-3">
  //             {footerLinks.about.map((link) => (
  //               <li key={link.name}>
  //                 <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
  //                   {link.name}
  //                 </Link>
  //               </li>
  //             ))}
  //           </ul>
  //         </div>
  //       </div>

  //       {/* Bottom bar */}
  //       <div className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
  //         <p className="text-xs text-muted-foreground">
  //           © 2026 Diva. All rights reserved.
  //         </p>
  //         <div className="flex gap-6">
  //           <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  //             Privacy Policy
  //           </Link>
  //           <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  //             Terms of Service
  //           </Link>
  //           <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
  //             Cookie Settings
  //           </Link>
  //         </div>
  //       </div>
  //     </div>
  //   </footer>
  // )

  return (
    <footer className="bg-charcoal px-16 pt-20 pb-12">
      {/* Top grid */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-16 pb-16 border-b border-white/10">
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
      <div className="flex justify-between items-center">
        <p className="text-2xs text-white/20 tracking-wide">
          © 2026 DIVA. All rights reserved.
        </p>
        <div className="flex gap-6">
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
