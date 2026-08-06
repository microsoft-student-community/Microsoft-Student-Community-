"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#0f0f14",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              padding: "2rem",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                margin: "0 0 1rem 0",
                color: "#e74c3c",
              }}
            >
              Critical Application Error
            </h1>
            <p style={{ margin: "0 0 2rem 0", color: "rgba(255,255,255,0.7)" }}>
              The application encountered a fatal error and could not recover.
              Our engineering team has been notified.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "0.8rem 1.5rem",
                borderRadius: "8px",
                background: "#0078d4",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Attempt Recovery
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
