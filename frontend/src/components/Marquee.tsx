const items = [
    "Refined Femininity",
    "Handcrafted Excellence",
    "Timeless Silhouettes",
    "Limited Edition Pieces",
    "Ethical Luxury",
    "Curated Craft",
];

// Duplicate for seamless loop
const allItems = [...items, ...items];

export default function Marquee() {
    return (
        <div className="overflow-hidden border-t border-b border-rose-gold-light py-5 bg-cream-mid">
            <div className="marquee-track">
                {allItems.map((item, i) => (
                    <span
                        key={i}
                        className="font-cormorant text-base italic text-warm-gray px-12"
                    >
                        {item}{" "}
                        <span className="text-rose-gold not-italic" style={{ fontStyle: "normal" }}>
                            ◆
                        </span>
                    </span>
                ))}
            </div>
        </div>
    );
}
