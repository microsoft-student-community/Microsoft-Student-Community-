export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-left">
            <div className="footer-logo">
              <img
                src="https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png"
                alt="Microsoft Student Community Logo"
                className="footer-logo-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="footer-connect">
              <p>Connect with us</p>
              <div className="footer-social">
                <a
                  href="https://linkedin.com/company/microsoft-student-community-srm-university/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
                <a
                  href="mailto:msc.community@srmap.edu.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-envelope"></i>
                </a>
                <a
                  href="https://www.instagram.com/msc.srmap/?igsh=YmEwdnlteHUwNjVs#/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="https://discord.com/invite/wZ55nBhWtJ/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="footer-right">
            <p>
              © 2026 Microsoft Student Community — SRM University AP. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
