"use client";

import { useEffect, useState } from "react";

interface PreloaderProps {
  message?: string;
  subtext?: string;
  onComplete?: () => void;
  minDuration?: number;
}

export default function Preloader({
  message = "MICROSOFT STUDENT COMMUNITY",
  subtext = "ADMIN WORKSPACE // SRM UNIVERSITY AP",
  onComplete,
  minDuration = 1000,
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minDuration - elapsed);

          setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 450);
          }, remaining);

          return 100;
        }
        return prev + Math.floor(Math.random() * 18 + 8);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [minDuration, onComplete]);

  const circumference = 2 * Math.PI * 88;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`loading-screen fixed inset-0 z-[99999] transition-opacity duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      id="loadingScreen"
    >
      <div className="loader-glow-field" />
      <div className="loader-particles">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className="loading-content">
        <div className="loading-logo-wrap">
          <div className="loader-ring-wrap">
            <svg className="loader-ring-svg" viewBox="0 0 200 200">
              <circle className="loader-ring-track" cx="100" cy="100" r="88" />
              <circle
                className="loader-ring-fill"
                cx="100"
                cy="100"
                r="88"
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
          </div>
          <img
            src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
            alt="MSC Logo"
            className="loading-logo-img"
          />
        </div>

        <div className="loader-text-group text-center">
          <span className="loader-brand-line">{message}</span>
          <span className="loader-chapter-line">{subtext}</span>
        </div>
      </div>
    </div>
  );
}
