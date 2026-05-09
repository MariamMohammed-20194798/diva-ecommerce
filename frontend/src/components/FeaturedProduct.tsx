import Image from "next/image";
import { getProductBySlug } from "@/lib/products";
import FeaturedProductActions from "./FeaturedProductActions";

export default async function FeaturedProduct() {
    const product = await getProductBySlug("the-soleil-draped-gown");

    if (!product) return null;

    const specs = [
        { label: "Fabric", value: "100% Silk Crepe" },
        { label: "Origin", value: "Florence, Italy" },
        { label: "Sizes", value: product.sizes.join(" — ") || "XS — XL" },
        { label: "Delivery", value: "2–4 weeks" },
    ];

    return (
        <section className="px-16 py-36 grid grid-cols-2 gap-32 items-center">
            {/* Visual */}
            <div className="relative reveal">
                {/* Main image placeholder */}
                <div className="w-full aspect-[4/5] bg-gradient-to-br from-rose-gold-pale to-rose-gold-light relative overflow-hidden">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 70vw, (max-width: 1024px) 45vw, 24vw"
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Accent border */}
                <div className="absolute -bottom-8 -right-8 w-48 h-48 border border-rose-gold-light -z-10" />

                {/* Side badge */}
                <div
                    className="absolute top-8 -right-6 bg-rose-gold text-ivory px-3 py-4 text-2xs tracking-[0.25em] uppercase"
                    style={{ writingMode: "vertical-rl" }}
                >
                    New Season
                </div>
            </div>

            {/* Content */}
            <div className="reveal" style={{ transitionDelay: "0.15s" }}>
                <span className="inline-block text-2xs tracking-[0.25em] uppercase text-rose-gold border border-rose-gold-light px-4 py-1.5 mb-8">
                    Editor's Pick
                </span>

                <h2 className="font-cormorant text-display-md font-light leading-tight text-charcoal mb-6">
                    {product.name.split(" ").map((word, i) => (
                        <span key={i}>
                            {word.toLowerCase() === "soleil" ? (
                                <em className="italic text-rose-gold" style={{ fontStyle: "italic" }}>
                                    {word}
                                </em>
                            ) : (
                                word
                            )}
                            {i < product.name.split(" ").length - 1 ? " " : ""}
                            {i === 1 ? <br /> : ""}
                        </span>
                    ))}
                </h2>

                <p className="text-sm leading-loose text-warm-gray mb-10 max-w-sm">
                    {product.description}
                </p>

                {/* Specs grid */}
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-cream-dark mb-10">
                    {specs.map((s) => (
                        <div key={s.label}>
                            <div className="text-2xs tracking-[0.2em] uppercase text-warm-gray mb-1.5">
                                {s.label}
                            </div>
                            <div className="font-cormorant text-base text-charcoal">{s.value}</div>
                        </div>
                    ))}
                </div>

                <div className="font-cormorant text-display-sm text-rose-gold mb-8">
                    EGP {product.price.toLocaleString()}
                </div>

                <FeaturedProductActions product={product} />
            </div>
        </section>
    );
}
