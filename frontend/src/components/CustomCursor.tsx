"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const ringPos = useRef({ x: 0, y: 0 });
    const mousePos = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const dot = dotRef.current!;
        const ring = ringRef.current!;

        const onMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            dot.style.left = e.clientX + "px";
            dot.style.top = e.clientY + "px";
        };

        const animate = () => {
            ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
            ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
            ring.style.left = ringPos.current.x + "px";
            ring.style.top = ringPos.current.y + "px";
            rafRef.current = requestAnimationFrame(animate);
        };
        rafRef.current = requestAnimationFrame(animate);

        const onEnter = () => {
            dot.classList.add("is-hovered");
            ring.classList.add("is-hovered");
        };
        const onLeave = () => {
            dot.classList.remove("is-hovered");
            ring.classList.remove("is-hovered");
        };

        document.addEventListener("mousemove", onMove);

        const hoverEls = document.querySelectorAll("a, button, .collection-card");
        hoverEls.forEach((el) => {
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
        });

        return () => {
            document.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(rafRef.current);
            hoverEls.forEach((el) => {
                el.removeEventListener("mouseenter", onEnter);
                el.removeEventListener("mouseleave", onLeave);
            });
        };
    }, []);

    return (
        <>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
            <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
        </>
    );
}
