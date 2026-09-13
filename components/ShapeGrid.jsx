"use client";

import React, { useRef, useEffect } from "react";
import "./ShapeGrid.css";

/**
 * Monochromatic Interactive Ambient Light & Starlight Dust
 * Minimalist, ultra-refined, non-intrusive backdrop enhancement.
 * - Strictly 100% monochromatic (pure whites, soft silvers, zero color tint).
 * - Smooth cursor-following ambient spotlight with silky physics.
 * - Faint cinematic micro-dust motes drifting in the beam.
 * - Completely transparent & non-blocking: allows the black & white background video
 *   to remain crisp, clear, and unhindered.
 */
const ShapeGrid = ({
  interactiveRadius = 260,
  spotlightOpacity = 0.045,
  particleCount = 35,
  className = "",
}) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Smooth cursor interpolation
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      active: false,
    };

    // Delicate floating monochrome dust particles
    const particles = [];
    const count = Math.min(particleCount, Math.floor((width * height) / 38000));

    class DustMote {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.2 + 0.4;
        this.vy = -(Math.random() * 0.22 + 0.08);
        this.vx = (Math.random() - 0.5) * 0.15;
        this.baseAlpha = Math.random() * 0.2 + 0.06;
        this.alpha = this.baseAlpha;
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        this.phase += 0.015;
        this.x += this.vx + Math.sin(this.phase) * 0.1;
        this.y += this.vy;

        // Subtle repulsion near cursor
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140 && dist > 1) {
            const force = (140 - dist) / 140;
            this.x += (dx / dist) * force * 0.8;
            this.y += (dy / dist) * force * 0.8;
            this.alpha = Math.min(0.45, this.baseAlpha + force * 0.25);
          } else {
            this.alpha += (this.baseAlpha - this.alpha) * 0.02;
          }
        } else {
          this.alpha += (this.baseAlpha - this.alpha) * 0.02;
        }

        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.reset();
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new DustMote());
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const onMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Monochromatic ambient spotlight
      if (mouse.active) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";

        const spotlight = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          interactiveRadius
        );
        spotlight.addColorStop(0, `rgba(255, 255, 255, ${spotlightOpacity})`);
        spotlight.addColorStop(0.4, `rgba(255, 255, 255, ${spotlightOpacity * 0.4})`);
        spotlight.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = spotlight;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, interactiveRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Faint monochrome ambient dust motes
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    let isVisible = true;
    let isPageVisible = !document.hidden;

    const startLoop = () => {
      if (isVisible && isPageVisible && !animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const stopLoop = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      isPageVisible = !document.hidden;
      isPageVisible ? startLoop() : stopLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        isVisible ? startLoop() : stopLoop();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    startLoop();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      stopLoop();
    };
  }, [interactiveRadius, spotlightOpacity, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`shapegrid-canvas ${className}`}
      aria-hidden="true"
    />
  );
};

export default ShapeGrid;
export { ShapeGrid as InteractiveBackground };
