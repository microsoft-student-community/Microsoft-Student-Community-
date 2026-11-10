"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      const overlay = document.querySelector(".background-overlay");
      if (overlay) {
        const overlayOpacity =
          0.68 + 0.18 * Math.min(window.scrollY / window.innerHeight, 1);
        overlay.style.setProperty("--home-overlay-opacity", overlayOpacity.toFixed(2));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // init

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        navRef.current &&
        !navRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    document.body.style.overflow = "";
  }, [pathname]);

  useEffect(() => () => {
    document.body.style.overflow = "";
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    const nextOpen = !isMenuOpen;
    setIsMenuOpen(nextOpen);
    document.body.style.overflow = nextOpen ? "hidden" : "";
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/team", label: "Team" },
  ];

  const navbarStyle = scrolled
    ? {
      background: "rgba(15, 15, 20, 0.75)",
      backdropFilter: "blur(25px) saturate(150%)",
      boxShadow:
        "0 4px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    }
    : {};

  return (
    <nav className="navbar liquid-glass" style={navbarStyle} aria-label="Main navigation">
      <div className="nav-container">
        <Link href="/" className="nav-logo-link" onClick={closeMenu}>
          <img
            src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
            alt="MSC"
            className="nav-logo-img"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width={130}
            height={40}
          />
        </Link>
        <ul id="primary-navigation" className={`nav-menu ${isMenuOpen ? "active" : ""}`} ref={navRef}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
                aria-current={pathname === link.href ? "page" : undefined}
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            </li>
          ))}

          <li>
            <Link
              href="/login"
              className="nav-login-btn"
              title="Sign In"
              onClick={closeMenu}
            >
              <span>Login</span>
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </Link>
          </li>
        </ul>
        <button
          type="button"
          className={`hamburger ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          ref={hamburgerRef}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
