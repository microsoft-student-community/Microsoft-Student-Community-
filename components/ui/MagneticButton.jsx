"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./MagneticButton.css";
import { lerp, getMousePos, distance } from "./magneticUtils";

export default function MagneticButton({
  children,
  className = "",
  href,
  onClick,
  ...props
}) {
  const buttonRef = useRef(null);
  const textRef = useRef(null);
  const textInnerRef = useRef(null);
  const rafRef = useRef(null);

  const state = useRef({ hover: false });
  const renderedStyles = useRef({
    tx: { previous: 0, current: 0, amt: 0.1 },
    ty: { previous: 0, current: 0, amt: 0.1 },
  });

  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (ev) => {
      mousePos.current = getMousePos(ev);
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    let rect = el.getBoundingClientRect();
    let distanceToTrigger = rect.width * 0.7;

    const onResize = () => {
      rect = el.getBoundingClientRect();
      distanceToTrigger = rect.width * 0.7;
    };
    window.addEventListener("resize", onResize);

    const render = () => {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      const distanceMouseButton = distance(
        mousePos.current.x + scrollX,
        mousePos.current.y + scrollY,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );

      let x = 0;
      let y = 0;

      if (distanceMouseButton < distanceToTrigger) {
        if (!state.current.hover) {
          enter();
        }
        x =
          (mousePos.current.x + scrollX - (rect.left + rect.width / 2)) * 0.3;
        y =
          (mousePos.current.y + scrollY - (rect.top + rect.height / 2)) * 0.3;
      } else if (state.current.hover) {
        leave();
      }

      renderedStyles.current.tx.current = x;
      renderedStyles.current.ty.current = y;

      for (const key in renderedStyles.current) {
        renderedStyles.current[key].previous = lerp(
          renderedStyles.current[key].previous,
          renderedStyles.current[key].current,
          renderedStyles.current[key].amt
        );
      }

      gsap.set(el, {
        x: renderedStyles.current.tx.previous,
        y: renderedStyles.current.ty.previous,
      });

      if (textRef.current) {
        gsap.set(textRef.current, {
          x: -renderedStyles.current.tx.previous * 0.6,
          y: -renderedStyles.current.ty.previous * 0.6,
        });
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    const enter = () => {
      state.current.hover = true;
      el.classList.add("button--hover");

      if (textInnerRef.current) {
        gsap.killTweensOf(textInnerRef.current);
        gsap
          .timeline()
          .to(textInnerRef.current, {
            duration: 0.15,
            ease: "power2.in",
            opacity: 0,
            y: "-20%",
          })
          .to(textInnerRef.current, {
            duration: 0.2,
            ease: "expo.out",
            opacity: 1,
            startAt: { y: "100%" },
            y: "0%",
          });
      }
    };

    const leave = () => {
      state.current.hover = false;
      el.classList.remove("button--hover");

      if (textInnerRef.current) {
        gsap.killTweensOf(textInnerRef.current);
        gsap
          .timeline()
          .to(textInnerRef.current, {
            duration: 0.15,
            ease: "power2.in",
            opacity: 0,
            y: "20%",
          })
          .to(textInnerRef.current, {
            duration: 0.2,
            ease: "expo.out",
            opacity: 1,
            startAt: { y: "-100%" },
            y: "0%",
          });
      }
    };

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const innerContent = (
    <>
      <span ref={textRef} className="button__text">
        <span ref={textInnerRef} className="button__text-inner">
          {children}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        ref={buttonRef}
        href={href}
        className={`magnetic-button ${className}`}
        onClick={onClick}
        {...props}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onClick={onClick}
      {...props}
    >
      {innerContent}
    </button>
  );
}
