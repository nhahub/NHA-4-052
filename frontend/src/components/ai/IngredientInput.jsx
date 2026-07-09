import { useState, useRef } from "react";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Low-carb",
  "High-protein",
  "Gluten-free",
  "Dairy-free",
  "Keto",
];

export default function IngredientInput({ onSubmit, loading }) {
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [mealType, setMealType] = useState("");
  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [maxCalories, setMaxCalories] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef(null);

  const addIngredient = (raw) => {
    const cleaned = raw.trim().toLowerCase();
    if (cleaned && !ingredients.includes(cleaned)) {
      setIngredients((prev) => [...prev, cleaned]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && ingredients.length) {
      setIngredients((prev) => prev.slice(0, -1));
    }
  };

  const removeIngredient = (ing) => {
    setIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const toggleDietary = (pref) => {
    setDietaryPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = () => {
    if (!ingredients.length) return;
    onSubmit({
      ingredients,
      meal_type: mealType || undefined,
      dietary_preferences: dietaryPrefs.length ? dietaryPrefs : undefined,
      max_calories: maxCalories ? parseInt(maxCalories, 10) : undefined,
    });
  };

  return (
    <div className="space-y-5">
      {/* ── Ingredient chips + input ────────────────────────────── */}
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--cx-text-muted)]">
          Ingredients
        </label>
        <div
          className="flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-[var(--cx-border)] bg-[var(--cx-surface-elevated)] px-3 py-2 transition-all duration-200 focus-within:border-primary-500/60 focus-within:ring-2 focus-within:ring-primary-500/20 cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {ingredients.map((ing) => (
            <span
              key={ing}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/15 px-3 py-1 text-sm font-medium text-primary-400 animate-in"
            >
              {ing}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeIngredient(ing);
                }}
                className="ml-0.5 rounded-full p-0.5 text-primary-400/60 transition-colors hover:bg-primary-500/20 hover:text-primary-300"
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => inputValue.trim() && addIngredient(inputValue)}
            placeholder={
              ingredients.length
                ? "Add more…"
                : "Type an ingredient and press Enter"
            }
            className="min-w-[140px] flex-1 border-none bg-transparent py-1 text-sm text-[var(--cx-text)] outline-none placeholder:text-[var(--cx-text-muted)]/50"
          />
        </div>
        <p className="mt-1.5 text-xs text-[var(--cx-text-muted)]/60">
          Press <kbd className="rounded bg-[var(--cx-surface-elevated)] px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd> or <kbd className="rounded bg-[var(--cx-surface-elevated)] px-1.5 py-0.5 font-mono text-[10px]">,</kbd> to add
        </p>
      </div>

      {/* ── Advanced options toggle ─────────────────────────────── */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-medium text-[var(--cx-text-muted)] transition-colors hover:text-primary-400"
      >
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-4 rounded-xl border border-[var(--cx-border)] bg-[var(--cx-surface-elevated)]/50 p-4 animate-in">
          {/* Meal type */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--cx-text-muted)]">
              Meal Type
            </label>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt}
                  type="button"
                  onClick={() => setMealType(mealType === mt ? "" : mt)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    mealType === mt
                      ? "border-primary-500/50 bg-primary-500/15 text-primary-400"
                      : "border-[var(--cx-border)] text-[var(--cx-text-muted)] hover:border-primary-500/30 hover:text-primary-400"
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary preferences */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--cx-text-muted)]">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => toggleDietary(pref)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                    dietaryPrefs.includes(pref)
                      ? "border-accent-400/50 bg-accent-400/15 text-accent-400"
                      : "border-[var(--cx-border)] text-[var(--cx-text-muted)] hover:border-accent-400/30 hover:text-accent-400"
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          {/* Max calories */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--cx-text-muted)]">
              Max Calories Per Meal
            </label>
            <input
              type="number"
              value={maxCalories}
              onChange={(e) => setMaxCalories(e.target.value)}
              placeholder="e.g. 500"
              min="50"
              max="2000"
              className="cx-input !py-2 !text-sm max-w-[200px]"
            />
          </div>
        </div>
      )}

      {/* ── Submit button ──────────────────────────────────────── */}
      <button
        onClick={handleSubmit}
        disabled={loading || !ingredients.length}
        className="cx-btn-primary w-full gap-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating suggestions…
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Generate Suggestions
          </>
        )}
      </button>
    </div>
  );
}
