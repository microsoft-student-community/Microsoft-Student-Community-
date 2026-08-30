import Link from "next/link";
import ParticleBackground from "@/components/ParticleBackground";
import FuzzyText from "@/components/FuzzyText";

export default function NotFound() {
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
        <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
          <FuzzyText 
            baseIntensity={0.2} 
            hoverIntensity={0.5} 
            enableHover={true}
            fontSize="5rem"
            fontWeight={800}
            fontFamily="Syne, sans-serif"
            color="#0078d4"
          >
            404
          </FuzzyText>
        </div>
        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "1.5rem",
            marginBottom: "1rem",
          }}
        >
          Page Not Found
        </h1>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "8px",
              background: "#0078d4",
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
