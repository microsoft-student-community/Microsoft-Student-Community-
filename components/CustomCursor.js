"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function CustomCursor() {
  const cDotRef = useRef(null);
  const cRingRef = useRef(null);
  const requestRef = useRef();
  const curPos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const pathname = usePathname(); // Re-bind hover targets on route change

  useEffect(() => {
    const cDot = cDotRef.current;
    const cRing = cRingRef.current;

    if (cDot && cRing) {
      document.body.classList.add("has-custom-cursor");

      const moveCursor = (e) => {
        curPos.current.x = e.clientX;
        curPos.current.y = e.clientY;
        cDot.style.left = `${curPos.current.x}px`;
        cDot.style.top = `${curPos.current.y}px`;
      };

      window.addEventListener("mousemove", moveCursor);

      const ringLoop = () => {
        ringPos.current.x += (curPos.current.x - ringPos.current.x) * 0.15;
        ringPos.current.y += (curPos.current.y - ringPos.current.y) * 0.15;
        cRing.style.left = `${ringPos.current.x}px`;
        cRing.style.top = `${ringPos.current.y}px`;
        requestRef.current = requestAnimationFrame(ringLoop);
      };

      requestRef.current = requestAnimationFrame(ringLoop);

      return () => {
        window.removeEventListener("mousemove", moveCursor);
        cancelAnimationFrame(requestRef.current);
        document.body.classList.remove("has-custom-cursor");
      };
    }
  }, []);

  // Re-bind hover targets when pathname changes (simulating page navigation)
  useEffect(() => {
    const cDot = cDotRef.current;
    const cRing = cRingRef.current;

    // Timeout ensures elements are mounted before querySelectorAll runs
    const timer = setTimeout(() => {
      const hoverTargets = document.querySelectorAll(
        "a, button, .nav-link, .event-cassette, .hero-btn-primary, .hero-btn-secondary, .featured-cta-btn, .filter-btn, .bento-feature-card, .footer-social a, .team-card",
      );

      const onEnter = () => {
        cDot?.classList.add("h");
        cRing?.classList.add("h");
      };

      const onLeave = () => {
        cDot?.classList.remove("h");
        cRing?.classList.remove("h");
      };

      hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });

      return () => {
        hoverTargets.forEach((el) => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div className="c-dot" id="cDot" ref={cDotRef}></div>
      <div className="c-ring" id="cRing" ref={cRingRef}></div>
    </>
  );
}
