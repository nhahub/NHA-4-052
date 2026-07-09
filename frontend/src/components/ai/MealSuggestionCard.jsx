import { useState } from "react";

export default function MealSuggestionCard({ suggestion, onAddMeal, adding }) {
  const [expanded, setExpanded] = useState(false);

  const {
    name,
    description,
    estimated_calories,
    estimated_protein_g,
    estimated_carbs_g,
    estimated_fat_g,
    prep_time_minutes,
    cook_time_minutes,
    meal_type,
    macro_fit_score,
    ingredients_used = [],
    additional_ingredients = [],
    instructions = [],
  } = suggestion;

  const fitColor =
    macro_fit_score >= 70
      ? "text-emerald-400"
      : macro_fit_score >= 40
      ? "text-amber-400"
      : "text-red-400";

  const fitBg =
    macro_fit_score >= 70
      ? "bg-emerald-500/10"
      : macro_fit_score >= 40
      ? "bg-amber-500/10"
      : "bg-red-500/10";

  return (
    <div className="group cx-card relative overflow-hidden transition-all duration-300 hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5">
      {/* Glow accent */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/5 blur-3xl transition-all duration-500 group-hover:bg-primary-500/10" />

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">{name}</h3>
            <span className="shrink-0 rounded-md bg-primary-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-400">
              {meal_type}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--cx-text-muted)]">
            {description}
          </p>
        </div>

        {/* Macro fit badge */}
        {macro_fit_score != null && (
          <div className={`shrink-0 flex flex-col items-center rounded-xl px-3 py-2 ${fitBg}`}>
            <span className={`text-xl font-bold tabular-nums ${fitColor}`}>
              {Math.round(macro_fit_score)}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-[var(--cx-text-muted)]">
              Fit
            </span>
          </div>
        )}
      </div>

      {/* ── Macros row ──────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[
          { label: "Calories", value: estimated_calories, unit: "kcal", color: "text-orange-400" },
          { label: "Protein", value: estimated_protein_g, unit: "g", color: "text-blue-400" },
          { label: "Carbs", value: estimated_carbs_g, unit: "g", color: "text-amber-400" },
          { label: "Fat", value: estimated_fat_g, unit: "g", color: "text-rose-400" },
        ].map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center rounded-lg bg-[var(--cx-surface-elevated)] px-2 py-2.5"
          >
            <span className={`text-base font-bold tabular-nums ${m.color}`}>
              {typeof m.value === "number" ? Math.round(m.value) : m.value}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--cx-text-muted)]">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Time ────────────────────────────────────────────── */}
      {(prep_time_minutes || cook_time_minutes) && (
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--cx-text-muted)]">
          {prep_time_minutes && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prep: {prep_time_minutes}m
            </span>
          )}
          {cook_time_minutes && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
              Cook: {cook_time_minutes}m
            </span>
          )}
        </div>
      )}

      {/* ── Ingredients ─────────────────────────────────────── */}
      <div className="mt-4 space-y-2">
        {ingredients_used.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cx-text-muted)]">
              Your Ingredients
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients_used.map((ing) => (
                <span
                  key={ing}
                  className="rounded-md bg-primary-500/10 px-2 py-0.5 text-xs font-medium text-primary-400"
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
        {additional_ingredients.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--cx-text-muted)]">
              Also Needed
            </p>
            <div className="flex flex-wrap gap-1.5">
              {additional_ingredients.map((ing) => (
                <span
                  key={ing}
                  className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400"
                >
                  + {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Instructions accordion ──────────────────────────── */}
      {instructions.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between rounded-lg border border-[var(--cx-border)] bg-[var(--cx-surface-elevated)]/50 px-3 py-2 text-xs font-medium text-[var(--cx-text-muted)] transition-colors hover:text-primary-400"
          >
            <span>Cooking Instructions ({instructions.length} steps)</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {expanded && (
            <ol className="mt-2 space-y-2 pl-1 animate-in">
              {instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-[var(--cx-text-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-500/10 text-[11px] font-bold text-primary-400">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* ── Add to tracker button ───────────────────────────── */}
      <button
        onClick={() => onAddMeal(suggestion)}
        disabled={adding}
        className="mt-5 w-full cx-btn-ghost gap-2 !py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        {adding ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-400/30 border-t-primary-400" />
            Adding…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add To Meal Tracker
          </>
        )}
      </button>
    </div>
  );
}
