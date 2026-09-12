import Image from 'next/image';
import { getProductBySlug } from '@/lib/products';
import FeaturedProductActions from './FeaturedProductActions';

export default async function FeaturedProduct() {
  const product = await getProductBySlug('the-soleil-draped-gown');

  if (!product) return null;

  const specs = [
    { label: 'Fabric', value: '100% Silk Crepe' },
    { label: 'Origin', value: 'Florence, Italy' },
    { label: 'Sizes', value: product.sizes.join(' — ') || 'XS — XL' },
    { label: 'Delivery', value: '2–4 weeks' },
  ];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:gap-12 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-32 lg:px-16 lg:py-36">
      {/* Visual */}
      <div className="relative reveal">
        {/* Main image placeholder */}
        <div className="w-full aspect-[4/5] bg-gradient-to-br from-rose-gold-pale to-rose-gold-light relative overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 40vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Accent border */}
        <div className="absolute -bottom-4 -right-4 -z-10 hidden h-32 w-32 border border-rose-gold-light sm:block sm:-bottom-8 sm:-right-8 sm:h-48 sm:w-48" />

        {/* Side badge */}
        <div
          className="absolute right-2 top-4 bg-rose-gold px-2 py-3 text-2xs uppercase tracking-[0.2em] text-ivory sm:-right-6 sm:top-8 sm:px-3 sm:py-4 sm:tracking-[0.25em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          New Season
        </div>
      </div>

      {/* Content */}
      <div className="reveal" style={{ transitionDelay: '0.15s' }}>
        <span className="mb-6 inline-block border border-rose-gold-light px-4 py-1.5 text-2xs uppercase tracking-[0.2em] text-rose-gold sm:mb-8 sm:tracking-[0.25em]">
          Editor&apos;s Pick
        </span>

        <h2 className="mb-6 font-cormorant text-[clamp(2rem,6vw,3rem)] font-light leading-tight text-charcoal">
          {product.name.split(' ').map((word, i) => (
            <span key={i}>
              {word.toLowerCase() === 'soleil' ? (
                <em className="italic text-rose-gold" style={{ fontStyle: 'italic' }}>
                  {word}
                </em>
              ) : (
                word
              )}
              {i < product.name.split(' ').length - 1 ? ' ' : ''}
              {i === 1 ? <br /> : ''}
            </span>
          ))}
        </h2>

        <p className="mb-8 max-w-sm text-sm leading-loose text-warm-gray sm:mb-10">
          {product.description}
        </p>

        {/* Specs grid */}
        <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-cream-dark pt-6 sm:mb-10 sm:gap-6 sm:pt-8">
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
