import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import profileService from "../services/profileService";
import { Target, Flame, Zap, Dna, Beef, Droplets, Wheat } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setProfileNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
          <p className="text-sm text-[var(--cx-text-muted)]">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  // ── Case 1: Profile has not been set up yet ────────────────────────
  if (profileNotFound) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="cx-card text-center relative overflow-hidden p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-accent-400/10 blur-3xl" />

          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-400 mb-6">
            <Target size={32} />
          </span>
          <h1 className="text-3xl font-bold tracking-tight">
            Complete Your Profile Setup
          </h1>
          <p className="mt-4 mx-auto max-w-md text-base text-[var(--cx-text-muted)]">
            To start using CaloriX, we need a few metrics to calculate your Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and daily macro target distribution.
          </p>
          <div className="mt-8">
            <Link to="/profile" className="cx-btn-primary !px-8">
              Set Up Profile
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // ── Case 2: Full dashboard displaying calculations ────────────────
  const proteinKcal = profile.protein_target_g * 4;
  const fatKcal = profile.fat_target_g * 9;
  const carbKcal = profile.carb_target_g * 4;
  const totalMacroKcal = proteinKcal + fatKcal + carbKcal;

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100) || 0;
  const fatPct = Math.round((fatKcal / totalMacroKcal) * 100) || 0;
  const carbPct = Math.round((carbKcal / totalMacroKcal) * 100) || 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      {/* ── Welcome Header ────────────────────────────────────────── */}
      <div className="cx-card relative overflow-hidden mb-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-accent-400/10 blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative">
          <div>
            <p className="text-sm font-medium text-primary-400">Nutritional Dashboard</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                {user?.username}
              </span>
            </h1>
            <p className="mt-2 text-[var(--cx-text-muted)]">
              Your physical metrics show you are calculated for the <span className="font-semibold text-primary-400">{profile.goal}</span> track.
            </p>
          </div>
          <div>
            <Link to="/profile" className="cx-btn-ghost text-sm !px-4 !py-2.5">
              Update Profile Metrics
            </Link>
          </div>
        </div>
      </div>

      {/* ── Top Level Calculations grid ─────────────────────────── */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Calories Card */}
        <div className="cx-card border-primary-500/20 bg-gradient-to-br from-[var(--cx-surface)] to-primary-500/5">
          <div className="flex items-center gap-2 text-primary-400 mb-3">
            <Flame size={20} />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cx-text-muted)]">
              Daily Target Calories
            </h3>
          </div>
          <p className="text-3xl font-extrabold text-[var(--cx-text)]">
            {profile.daily_calorie_target.toLocaleString()} <span className="text-sm font-normal text-[var(--cx-text-muted)]">kcal</span>
          </p>
          <p className="mt-2 text-xs text-[var(--cx-text-muted)]">
            Calculated based on your {profile.goal} goal.
          </p>
        </div>

        {/* TDEE Card */}
        <div className="cx-card">
          <div className="flex items-center gap-2 text-blue-400 mb-3">
            <Zap size={20} />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cx-text-muted)]">
              Your TDEE
            </h3>
          </div>
          <p className="text-3xl font-extrabold text-[var(--cx-text)]">
            {profile.tdee.toLocaleString()} <span className="text-sm font-normal text-[var(--cx-text-muted)]">kcal</span>
          </p>
          <p className="mt-2 text-xs text-[var(--cx-text-muted)]">
            Total Daily Energy Expenditure (Active Metabolic Rate).
          </p>
        </div>

        {/* BMR Card */}
        <div className="cx-card">
          <div className="flex items-center gap-2 text-purple-400 mb-3">
            <Dna size={20} />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--cx-text-muted)]">
              Your BMR
            </h3>
          </div>
          <p className="text-3xl font-extrabold text-[var(--cx-text)]">
            {profile.bmr.toLocaleString()} <span className="text-sm font-normal text-[var(--cx-text-muted)]">kcal</span>
          </p>
          <p className="mt-2 text-xs text-[var(--cx-text-muted)]">
            Basal Metabolic Rate (Energy needed at rest).
          </p>
        </div>
      </div>

      {/* ── Main content layout grid ────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Macro targets summary column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="cx-card">
            <h2 className="text-xl font-bold tracking-tight">Macro target distribution</h2>
            <p className="text-sm text-[var(--cx-text-muted)] mt-1">
              Your calories split calculated optimally for your weight and activity level.
            </p>

            <div className="mt-8 space-y-6">
              {/* Protein */}
              <div>
                <div className="flex items-center justify-between text-sm font-medium mb-2">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-wider text-xs">
                    <Beef size={16} className="text-emerald-500" />
                    Protein
                  </span>
                  <span className="text-[var(--cx-text-muted)]">
                    {profile.protein_target_g}g <span className="text-xs">({proteinPct}%)</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--cx-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${proteinPct}%` }}
                  />
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-wider text-xs">
                    <Droplets size={16} className="text-amber-500" />
                    Fats
                  </span>
                  <span className="text-[var(--cx-text-muted)]">
                    {profile.fat_target_g}g <span className="text-xs">({fatPct}%)</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--cx-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${fatPct}%` }}
                  />
                </div>
              </div>

              {/* Carbohydrates */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="flex items-center gap-2 font-semibold uppercase tracking-wider text-xs">
                    <Wheat size={16} className="text-blue-500" />
                    Carbohydrates
                  </span>
                  <span className="text-[var(--cx-text-muted)]">
                    {profile.carb_target_g}g <span className="text-xs">({carbPct}%)</span>
                  </span>
                </div>
                <div className="h-3 w-full bg-[var(--cx-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${carbPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Micro details bar */}
            <div className="mt-8 pt-6 border-t border-[var(--cx-border)] flex items-center justify-between text-xs text-[var(--cx-text-muted)]">
              <span>Protein = 4 kcal/g</span>
              <span>Fats = 9 kcal/g</span>
              <span>Carbohydrates = 4 kcal/g</span>
            </div>
          </div>
        </div>

        {/* Profile physical attributes detail card */}
        <div>
          <div className="cx-card">
            <h2 className="text-lg font-bold">Physical Attributes</h2>
            <p className="text-xs text-[var(--cx-text-muted)] mt-1">Calculated variables profile</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Goal</span>
                <span className="text-sm font-semibold text-primary-400">{profile.goal}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Gender</span>
                <span className="text-sm font-medium">{profile.gender}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Age</span>
                <span className="text-sm font-medium">{profile.age} yrs</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Height</span>
                <span className="text-sm font-medium">{profile.height_cm} cm</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Weight</span>
                <span className="text-sm font-medium">{profile.weight_kg} kg</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[var(--cx-surface-elevated)] px-4 py-3">
                <span className="text-sm text-[var(--cx-text-muted)]">Activity Level</span>
                <span className="text-xs font-medium text-right max-w-[150px] truncate">{profile.activity_level}</span>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={logout}
              className="mt-8 w-full cx-btn-ghost text-red-400 border-red-500/20 hover:border-red-500/40 hover:text-red-300 !py-2.5 text-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
