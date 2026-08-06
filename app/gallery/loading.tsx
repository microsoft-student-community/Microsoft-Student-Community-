export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f0f14",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "3px solid rgba(0, 120, 212, 0.2)",
            borderTopColor: "#0078d4",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <span
          style={{
            fontFamily: "DM Mono, monospace",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.9rem",
          }}
        >
          FETCHING_GALLERY...
        </span>
      </div>
    </div>
  );
}
