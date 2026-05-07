"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
    useEffect(() => {
        const els = document.querySelectorAll(".reveal");
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.12 }
        );
        els.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return null;
}
