import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Flame, BarChart3, Target, Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative mx-auto flex max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
        <div className="h-[500px] w-[800px] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute -left-40 top-40">
        <div className="h-[300px] w-[300px] rounded-full bg-accent-400/5 blur-[100px]" />
      </div>

      {/* Badge */}
      <div className="relative mb-6 inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-1.5 text-sm font-medium text-primary-400">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
        </span>
        Now in beta
      </div>

      {/* Heading */}
      <h1 className="relative text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-7xl">
        Track smarter.{" "}
        <span className="bg-gradient-to-r from-primary-400 via-emerald-400 to-accent-400 bg-clip-text text-transparent">
          Live healthier.
        </span>
      </h1>

      {/* Subheading */}
      <p className="relative mt-6 max-w-2xl text-lg leading-relaxed text-[var(--cx-text-muted)] md:text-xl">
        CaloriX helps you understand your nutrition with effortless calorie
        tracking, insightful analytics, and personalised goals.
      </p>

      {/* CTA buttons */}
      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
        {isAuthenticated ? (
          <Link to="/dashboard" className="cx-btn-primary">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link to="/register" className="cx-btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="cx-btn-ghost">
              Sign in
            </Link>
          </>
        )}
      </div>

      {/* Feature pills */}
      <div className="relative mt-16 flex flex-wrap items-center justify-center gap-3">
        {[
          { label: "Calorie Tracking", Icon: Flame },
          { label: "Smart Analytics", Icon: BarChart3 },
          { label: "Custom Goals", Icon: Target },
          { label: "Secure & Private", Icon: Lock },
        ].map(({ label, Icon }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-[var(--cx-border)] bg-[var(--cx-surface)] px-4 py-2 text-sm text-[var(--cx-text-muted)] transition-colors hover:border-primary-500/30 hover:text-primary-400"
          >
            <Icon size={16} /> {label}
          </span>
        ))}
      </div>
    </section>
  );
}
