"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

import { createClient } from "@/utils/supabase/client";

type BlobData = {
  size: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();

  const [blobsData, setBlobsData] = useState<BlobData[]>([]);

  useEffect(() => {
    setBlobsData(Array.from({ length: 6 }).map(() => ({
      size: Math.random() * 200 + 150,
      left: Math.random() * 80 + 10,
      top: Math.random() * 80 + 10,
      animationDelay: Math.random() * -20,
      animationDuration: Math.random() * 15 + 15,
    })));
  }, []);

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;

      blobRefs.current.forEach((blob, index) => {
        if (!blob) {
          return;
        }

        const speed = (index + 1) * 20;
        blob.style.marginLeft = `${x * speed}px`;
        blob.style.marginTop = `${y * speed}px`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
      } else if (authData.user) {
        // Fetch role to determine redirect
        const { data: profile } = await supabase
          .from('member_profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
          
        if (profile?.role === 'admin' || profile?.role === 'core_member' || profile?.role === 'coremember') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/event-portal";
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const new_password = formData.get("new_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    if (new_password !== confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password }),
      });
      
      const data = await res.json();
        
      if (!res.ok) {
        setError(data.error || "Failed to request password reset.");
        return;
      }

      setSuccess(
        "Reset request sent. An administrator must approve it before you can sign in.",
      );
      setShowResetForm(false);
    } finally {
      setLoading(false);
    }
  }

  const inputClassName =
    "mercury-input w-full rounded-none bg-transparent px-0 py-3 text-[18px] text-white outline-none placeholder:text-white/35 focus-visible:outline-none";
  const passwordInputClassName = `${inputClassName} pr-11`;

  return (
    <main className="mercury-shell">
      <style>{`
        .mercury-shell {
          position: relative;
          display: grid;
          min-height: 100dvh;
          place-items: center;
          overflow: hidden;
          padding: 24px;
          background: #050505;
          color: #fff;
          font-family: Inter, sans-serif;
        }

        .mercury-shell * {
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
        }

        .stage {
          position: absolute;
          inset: 0;
          z-index: 0;
          filter: url('#gooey');
          opacity: 0.6;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f0f0, #777);
          filter: blur(20px);
          animation: float 20s infinite alternate ease-in-out;
          box-shadow: inset -10px -10px 20px rgba(0, 0, 0, 0.5), 10px 10px 30px rgba(255, 255, 255, 0.16);
          transition: margin 0.1s ease-out;
          will-change: transform, margin;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 20vh) scale(1.2); }
          66% { transform: translate(-5vw, 10vh) scale(0.8); }
          100% { transform: translate(5vw, -10vh) scale(1.1); }
        }

        .auth-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        .mercury-card {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 30px;
          background: rgba(18, 18, 24, 0.72);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 30px 100px rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(24px) saturate(150%);
        }

        .mercury-intro {
          display: flex;
          min-height: 620px;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
          padding: clamp(24px, 4vw, 40px);
          background:
            linear-gradient(145deg, rgba(0, 120, 212, 0.2), rgba(13, 15, 22, 0.08) 56%, rgba(0, 0, 0, 0.18)),
            radial-gradient(circle at 22% 18%, rgba(111, 208, 255, 0.22), transparent 24%);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .top-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .logo-link {
          display: grid;
          width: 56px;
          height: 56px;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 16px;
          background: rgba(4, 13, 22, 0.45);
          box-shadow: 0 12px 35px rgba(0, 120, 212, 0.18);
        }

        .logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: center / contain no-repeat url('https://lkbwunzswqbnoygxtilm.supabase.co/storage/v1/object/public/webpage/MSC%20Logo.png');
          filter: drop-shadow(0 0 8px rgba(74, 174, 255, 0.35));
        }

        .top-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.88rem;
          text-decoration: none;
        }

        .brand-id {
          display: block;
          margin-bottom: 8px;
          font-family: DM Mono, monospace;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
        }

        .intro-index {
          margin-bottom: 18px;
          font-family: DM Mono, monospace;
          font-size: 11px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
        }

        .mercury-intro h1 {
          margin: 0;
          font-family: Syne, sans-serif;
          font-size: clamp(2.8rem, 6vw, 5rem);
          line-height: 0.9;
          letter-spacing: -0.08em;
          color: #fff;
        }

        .mercury-intro h1 span {
          display: block;
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          font-style: italic;
          letter-spacing: -0.03em;
          color: #d8efff;
        }

        .intro-copy {
          max-width: 430px;
        }

        .description {
          margin-top: 20px;
          max-width: 420px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.98rem;
          line-height: 1.75;
        }

        .status-row {
          display: flex;
          flex-wrap: wrap;
          gap: 18px;
          align-items: center;
          margin-top: 28px;
          font-family: DM Mono, monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.46);
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #52d69b;
          box-shadow: 0 0 12px #52d69b;
        }

        .signal-group {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .signal-group i {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #9edaff;
          display: inline-block;
        }

        .auth-form-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(24px, 4vw, 40px);
        }

        .form-kicker {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
          font-family: DM Mono, monospace;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(158, 218, 255, 0.9);
        }

        .auth-heading {
          margin: 0;
          font-family: Syne, sans-serif;
          font-size: clamp(2rem, 4vw, 3rem);
          line-height: 1.02;
          letter-spacing: -0.06em;
          color: #fff;
        }

        .auth-subcopy {
          margin-top: 10px;
          max-width: 430px;
          color: rgba(255, 255, 255, 0.54);
          font-size: 0.96rem;
          line-height: 1.7;
        }

        .auth-form {
          display: grid;
          gap: 20px;
          margin-top: 30px;
        }

        .form-group {
          position: relative;
        }

        .form-group label {
          display: block;
          margin-bottom: 12px;
          font-family: DM Mono, monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
        }

        .field-shell {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          transition: transform 0.4s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .form-group:focus-within .field-shell {
          transform: translateX(4px);
        }

        .field-shell--icon {
          padding-left: 28px;
        }

        .field-icon {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.28);
          pointer-events: none;
        }

        .mercury-input {
          width: 100%;
          min-width: 0;
          flex: 1;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          background: transparent;
          color: #fff;
          caret-color: #fff;
          transition: border-color 0.4s, padding-left 0.2s;
        }

        .mercury-input:-webkit-autofill,
        .mercury-input:-webkit-autofill:hover,
        .mercury-input:-webkit-autofill:focus,
        .mercury-input:-webkit-autofill:active {
          -webkit-text-fill-color: #fff;
          -webkit-box-shadow: 0 0 0 1000px rgba(5, 5, 5, 0) inset;
          box-shadow: 0 0 0 1000px rgba(5, 5, 5, 0) inset;
          transition: background-color 9999s ease-out 0s;
        }

        .mercury-input:focus {
          border-bottom-color: rgba(255, 255, 255, 0.7);
        }

        .input-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #e0e0e0;
          transition: width 0.6s cubic-bezier(0.2, 1, 0.3, 1);
          box-shadow: 0 0 15px #e0e0e0;
        }

        .mercury-input:focus + .input-glow {
          width: 100%;
        }

        .password-shell {
          position: relative;
        }

        .password-toggle {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.42);
          cursor: pointer;
        }

        .submit-wrap {
          margin-top: 18px;
          position: relative;
          filter: url('#gooey');
        }

        .mercury-drop {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          background: #f0f0f0;
          transform: translate(0, 0);
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .submit-wrap:hover .mercury-drop {
          transform: scale(1.03, 1.08);
          filter: brightness(1.1);
        }

        .btn-base {
          position: relative;
          z-index: 2;
          width: 100%;
          border: none;
          border-radius: 18px;
          background: #ffffff;
          color: #000;
          cursor: pointer;
          padding: 18px 24px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          transition: letter-spacing 0.3s;
        }

        .btn-base:hover {
          letter-spacing: 4px;
        }

        .secondary-action {
          margin-top: 16px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.65);
          cursor: pointer;
          padding: 15px 18px;
          font-size: 0.92rem;
          font-weight: 600;
          transition: background 0.2s, color 0.2s, transform 0.2s;
        }

        .secondary-action:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
        }

        .feedback {
          border-radius: 16px;
          padding: 12px 14px;
          font-size: 0.92rem;
          line-height: 1.5;
        }

        .feedback--error {
          border: 1px solid rgba(248, 113, 113, 0.2);
          background: rgba(239, 68, 68, 0.1);
          color: #fca5a5;
        }

        .feedback--success {
          border: 1px solid rgba(52, 211, 153, 0.2);
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
        }

        .security-note {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 22px;
          font-family: DM Mono, monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
        }

        .svg-filter-hidden {
          position: absolute;
          width: 0;
          height: 0;
        }

        @media (max-width: 960px) {
          .mercury-card {
            grid-template-columns: 1fr;
          }

          .mercury-intro {
            min-height: auto;
            gap: 24px;
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .auth-form-panel {
            padding: 28px 24px 30px;
          }
        }

        @media (max-width: 640px) {
          .mercury-shell {
            padding: 12px;
          }

          .mercury-card {
            border-radius: 22px;
          }

          .mercury-intro,
          .auth-form-panel {
            padding: 20px;
          }

          .mercury-intro h1 {
            font-size: clamp(2.2rem, 14vw, 3rem);
          }

          .top-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .top-home {
            width: 100%;
            justify-content: center;
          }

          .form-kicker {
            flex-wrap: wrap;
            gap: 8px;
            line-height: 1.4;
          }

          .auth-form {
            margin-top: 24px;
            gap: 16px;
          }

          .field-shell {
            padding-left: 22px;
          }

          .form-group:focus-within .field-shell {
            transform: none;
          }

          .field-shell--icon {
            padding-left: 24px;
          }
        }
      `}</style>

      <svg className="svg-filter-hidden" aria-hidden="true" focusable="false">
        <defs>
          <filter id="gooey">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="12"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="stage">
        {blobsData.map((data, index) => (
          <div
            key={index}
            ref={(element) => {
              blobRefs.current[index] = element;
            }}
            className="blob"
            style={{
              width: `${data.size}px`,
              height: `${data.size}px`,
              left: `${data.left}%`,
              top: `${data.top}%`,
              animationDelay: `${data.animationDelay}s`,
              animationDuration: `${data.animationDuration}s`,
            }}
          />
        ))}
      </div>

      <section className="auth-container">
        <div className="mercury-card" aria-labelledby="login-heading">
          <div className="mercury-intro">
            <div className="top-row">
              <Link
                className="logo-link"
                href="/"
                aria-label="Return to MSC home"
              >
                <span className="logo-mark" aria-hidden="true" />
              </Link>

              <Link className="top-home" href="/">
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                Home
              </Link>
            </div>

            <div className="intro-copy">
              <span className="brand-id">
                MICROSOFT STUDENT COMMUNITY · SRM AP
              </span>
              <div className="intro-index">System Node: 0x992</div>
              <h1>
                NEURAL
                <span>ACCESS</span>
              </h1>
              <p className="description">
                One focused workspace for the people designing events, building
                teams, and moving the chapter forward.
              </p>
            </div>

            <div className="status-row">
              <div className="flex items-center gap-2">
                <span className="status-dot" />
                System status: operational
              </div>
              <div
                className="signal-group"
                aria-label="Chapter activity: 3 active signals"
              >
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>

          <div className="auth-form-panel">
            {/* Event Participant Redirect Banner */}
            <div className="absolute top-[clamp(24px,4vw,40px)] right-[clamp(24px,4vw,40px)] p-3 rounded-2xl bg-[#0078d4]/10 border border-[#0078d4]/30 flex items-center gap-4 text-xs backdrop-blur-md">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-ticket text-[#0078d4]" />
                <span className="text-slate-300 font-medium">
                  Attending an event?
                </span>
              </div>
              <Link
                href="/events"
                className="text-[#a4d8ff] font-semibold hover:text-white hover:underline flex items-center gap-1 transition-colors"
              >
                Browse Events{" "}
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </Link>
            </div>

            <div className="form-kicker">
              <span>Secure access</span>
              <span aria-hidden="true">·</span>
              <span>Core Member Portal</span>
            </div>

            <h2 id="login-heading" className="auth-heading">
              {showResetForm ? "Request access help" : "Welcome back"}
            </h2>
            <p className="auth-subcopy">
              {showResetForm
                ? "An administrator will review your reset request."
                : "Sign in to access your community workspace."}
            </p>

            {showResetForm ? (
              <form onSubmit={handleResetSubmit} className="auth-form">
                <FormField
                  label="Email address"
                  htmlFor="reset-email"
                  icon="fa-envelope"
                >
                  <input
                    type="email"
                    id="reset-email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="student@srmap.edu.in"
                    className={inputClassName}
                  />
                </FormField>

                <PasswordField
                  id="new_password"
                  label="New password"
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  className={passwordInputClassName}
                />

                <PasswordField
                  id="confirm_password"
                  label="Confirm new password"
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  className={passwordInputClassName}
                />

                <Feedback error={error} success={success} />

                <div>
                  <div className="submit-wrap">
                    <div className="mercury-drop" aria-hidden="true" />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-base"
                    >
                      {loading ? "Submitting…" : "Submit request"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={loading}
                    className="secondary-action"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="auth-form">
                <FormField
                  label="Email address"
                  htmlFor="email"
                  icon="fa-envelope"
                >
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="student@srmap.edu.in"
                    className={inputClassName}
                  />
                </FormField>

                <PasswordField
                  id="password"
                  label="Password"
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  className={passwordInputClassName}
                />

                <Feedback error={error} success={success} />

                <div>
                  <div className="submit-wrap">
                    <div className="mercury-drop" aria-hidden="true" />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-base"
                    >
                      {loading ? "Signing in…" : "Initialize Stream"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(true);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={loading}
                    className="secondary-action"
                  >
                    Core member? Request a password reset
                  </button>
                </div>
              </form>
            )}

            <p className="security-note">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              Protected member access
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function FormField({
  label,
  htmlFor,
  icon,
  children,
}: {
  label: string;
  htmlFor: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <div className="form-group">
      <label htmlFor={htmlFor}>{label}</label>
      <div className={`field-shell ${icon ? "field-shell--icon" : ""}`}>
        {icon ? (
          <i className={`fa-solid ${icon} field-icon`} aria-hidden="true" />
        ) : null}
        {children}
        <div className="input-glow" />
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  showPassword,
  setShowPassword,
  className,
}: {
  id: string;
  label: string;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  className: string;
}) {
  return (
    <FormField label={label} htmlFor={id} icon="fa-lock">
      <div className="password-shell">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={id}
          required
          autoComplete={id === "password" ? "current-password" : "new-password"}
          placeholder="••••••••"
          className={className}
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((value) => !value)}
          className="password-toggle"
        >
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
        </button>
        <div className="input-glow" />
      </div>
    </FormField>
  );
}

function Feedback({
  error,
  success,
}: {
  error: string | null;
  success: string | null;
}) {
  if (error) {
    return (
      <p role="alert" className="feedback feedback--error">
        {error}
      </p>
    );
  }

  if (success) {
    return (
      <p role="status" className="feedback feedback--success">
        {success}
      </p>
    );
  }

  return null;
}
