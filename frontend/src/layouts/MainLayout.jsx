import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  User,
  UtensilsCrossed,
  Sparkles,
  LogOut,
  ChartBar,
  ChevronDown,
} from "lucide-react";

export default function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--cx-border)] bg-[var(--cx-surface)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold tracking-tight transition-opacity hover:opacity-80"
          >
            Calori<span className="text-primary-400">X</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>

                <Link
                  to="/meals"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  <UtensilsCrossed size={16} />
                  Meals
                </Link>

                <Link
                  to="/ai-assistant"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  <Sparkles size={16} />
                  AI Vision
                </Link>

                <Link
                  to="/ai-chat"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  <Sparkles size={16} />
                  AI Coach
                </Link>

                <Link
                  to="/metrics"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  <ChartBar size={16} />
                  Metrics
                </Link>

                <div className="mx-1 h-5 w-px bg-[var(--cx-border)]" />

                <details className="relative">
                  <summary className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400 [&::-webkit-details-marker]:hidden">
                    <User size={14} />
                    <span>{user?.username ?? ""}</span>
                    <ChevronDown size={14} />
                  </summary>

                  <div className="absolute right-0 z-20 mt-2 w-40 rounded-2xl border border-[var(--cx-border)] bg-[var(--cx-surface)] shadow-lg">
                    <Link
                      to="/profile"
                      className="flex w-full items-center gap-2 rounded-t-2xl px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-colors hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button
                      id="nav-logout"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-b-2xl px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-colors hover:bg-[var(--cx-surface-elevated)] hover:text-red-400"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--cx-text-muted)] transition-all hover:bg-[var(--cx-surface-elevated)] hover:text-primary-400"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="cx-btn-primary !px-4 !py-2 text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--cx-border)] py-6 text-center text-sm text-[var(--cx-text-muted)]">
        © {new Date().getFullYear()} CaloriX. All rights reserved.
      </footer>
    </div>
  );
}