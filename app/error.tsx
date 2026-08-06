"use client";

import { useEffect } from "react";
import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f0f14",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <ParticleBackground particleColor="rgba(0, 120, 212, 0.4)" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "2rem",
          background: "rgba(15, 15, 20, 0.6)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <div
          style={{ fontSize: "3rem", marginBottom: "1rem", color: "#0078d4" }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "2rem",
            marginBottom: "1rem",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          We encountered an unexpected error while processing your request. Our
          team has been notified.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "8px",
              background: "#0078d4",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fa-solid fa-rotate-right"></i> Try Again
          </button>
          <Link
            href="/"
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <i className="fa-solid fa-home"></i> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
