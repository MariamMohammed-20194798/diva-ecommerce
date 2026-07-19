"use client"

const pillars = [
    {
        num: "01",
        title: "Ethical Sourcing",
        desc: "Every fabric is traced to its origin. We partner exclusively with certified mills that honour the earth and its artisans.",
        delay: 0.1,
    },
    {
        num: "02",
        title: "Hand-Finished",
        desc: "Each garment passes through twelve pairs of skilled hands before it reaches you. Perfection is never rushed.",
        delay: 0.22,
    },
    {
        num: "03",
        title: "Made to Last",
        desc: "We design against the rhythm of trends — for a wardrobe that deepens in beauty with every year you wear it.",
        delay: 0.1,
    },
    {
        num: "04",
        title: "Limited Editions",
        desc: "Our collections are produced in small, intentional runs. Exclusivity is not a strategy — it is a commitment to quality.",
        delay: 0.22,
    },
];

export default function Philosophy() {
    return (
        <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-24 lg:px-16 lg:py-28">
            {/* Left */}
            <div className="reveal">
                <span className="text-2xs tracking-[0.3em] uppercase text-rose-gold block mb-4">
                    Our Philosophy
                </span>
                <h2 className="font-cormorant text-[clamp(2rem,6vw,3rem)] font-light leading-tight text-foreground">
                    Craft that
                    <br />
                    <em className="italic text-rose-gold" style={{ fontStyle: "italic" }}>
                        speaks
                    </em>
                    <br />
                    softly
                </h2>
            </div>

            {/* Right — 2×2 grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:gap-12">
                {pillars.map((p) => (
                    <div
                        key={p.num}
                        className="reveal"
                        style={{ transitionDelay: `${p.delay}s` }}
                    >
                        <div className="font-cormorant text-5xl font-light text-rose-gold opacity-40 leading-none mb-4">
                            {p.num}
                        </div>
                        <div className="text-2xs tracking-[0.2em] uppercase text-foreground mb-3">
                            {p.title}
                        </div>
                        <p className="text-sm leading-loose text-foreground/40">{p.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
