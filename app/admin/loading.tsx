export default function AdminLoading() {
  return (
    <main className="loading-screen admin-loading-screen" aria-label="Loading admin dashboard" aria-busy="true">
      <div className="loader-glow-field" />
      <div className="loader-particles">{Array.from({ length: 8 }, (_, index) => <span key={index} />)}</div>
      <div className="loading-content">
        <div className="loading-logo-wrap">
          <div className="loader-ring-wrap">
            <svg className="loader-ring-svg" viewBox="0 0 200 200" aria-hidden="true">
              <circle className="loader-ring-track" cx="100" cy="100" r="88" />
              <circle className="loader-ring-fill" cx="100" cy="100" r="88" />
            </svg>
          </div>
          <img
            src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
            alt="Microsoft Student Community"
            className="loading-logo-img"
          />
        </div>
        <div className="loader-text-group">
          <span className="loader-brand-line">Microsoft Student Community</span>
          <span className="loader-chapter-line">Loading Operations Workspace</span>
        </div>
      </div>
    </main>
  );
}
