import { useState } from "react";
import IngredientInput from "../components/ai/IngredientInput";
import MealSuggestionCard from "../components/ai/MealSuggestionCard";
import ImageAnalyzerCard from "../components/ai/ImageAnalyzerCard";
import aiService from "../services/aiService";
import mealService from "../services/mealService";
import { ChefHat, Camera } from "lucide-react";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("ingredients"); // "ingredients" or "vision"
  
  // State for ingredients tab
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestError, setSuggestError] = useState(null);
  const [addingMeals, setAddingMeals] = useState(new Set()); // track which meals are being added

  // State for vision tab
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [addingVisionMeal, setAddingVisionMeal] = useState(false);

  // Success notifications
  const [notification, setNotification] = useState(null);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSuggestMeals = async (params) => {
    setLoadingSuggestions(true);
    setSuggestError(null);
    setSuggestions([]);
    
    try {
      const data = await aiService.suggestMeals(params);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setSuggestError(
        err.response?.data?.detail || "Failed to generate suggestions. Please try again."
      );
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAnalyzeImage = async (file, mealType) => {
    setLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const data = await aiService.analyzeImage(file, mealType);
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(
        err.response?.data?.detail || "Failed to analyze image. Please try again."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleAddMeal = async (mealData) => {
    const mealId = mealData.name;
    setAddingMeals((prev) => new Set(prev).add(mealId));
    
    try {
      // Map AI response to meal creation payload
      const payload = {
        food_name: mealData.name,
        meal_type: mealData.meal_type || "Snack",
        calories: mealData.estimated_calories || 0,
        protein: mealData.estimated_protein_g || 0,
        carbs: mealData.estimated_carbs_g || 0,
        fat: mealData.estimated_fat_g || 0,
        meal_date: new Date().toISOString().split("T")[0],
      };
      
      await mealService.addMeal(payload);
      showNotification(`Added ${mealData.name} to today's meals!`);
    } catch (err) {
      alert("Failed to add meal. " + (err.response?.data?.detail || ""));
    } finally {
      setAddingMeals((prev) => {
        const next = new Set(prev);
        next.delete(mealId);
        return next;
      });
    }
  };

  const handleAddVisionMeal = async () => {
    if (!analysisResult) return;
    setAddingVisionMeal(true);
    try {
      const category = ["Breakfast", "Lunch", "Dinner", "Snack"].includes(
        analysisResult.predicted_meal_category
      )
        ? analysisResult.predicted_meal_category
        : "Snack";

      const payload = {
        food_name:
          analysisResult.detected_food_items?.[0] || "Analyzed Meal",
        meal_type: category,
        calories: analysisResult.estimated_calories || 0,
        protein: analysisResult.estimated_protein_g || 0,
        carbs: analysisResult.estimated_carbs_g || 0,
        fat: analysisResult.estimated_fat_g || 0,
        meal_date: new Date().toISOString().split("T")[0],
      };
      
      await mealService.addMeal(payload);
      showNotification(`Added ${payload.food_name} to today's meals!`);
    } catch (err) {
      alert("Failed to add meal. " + (err.response?.data?.detail || ""));
    } finally {
      setAddingVisionMeal(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Notification toast ────────────────────────────── */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/90 px-4 py-3 text-sm font-medium text-white shadow-xl backdrop-blur-md">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {notification}
          </div>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="mt-2 text-[var(--cx-text-muted)]">
          Let AI help you figure out what to eat and track your meals effortlessly.
        </p>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div className="mb-6 flex border-b border-[var(--cx-border)]">
        <button
          onClick={() => setActiveTab("ingredients")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "ingredients"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-[var(--cx-text-muted)] hover:border-[var(--cx-border-hover)] hover:text-[var(--cx-text)]"
          }`}
        >
          <ChefHat size={20} />
          Pantry Chef
        </button>
        <button
          onClick={() => setActiveTab("vision")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "vision"
              ? "border-primary-500 text-primary-400"
              : "border-transparent text-[var(--cx-text-muted)] hover:border-[var(--cx-border-hover)] hover:text-[var(--cx-text)]"
          }`}
        >
          <Camera size={20} />
          Food Vision
        </button>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-12">
        {activeTab === "ingredients" ? (
          <>
            <div className="lg:col-span-4">
              <div className="cx-card sticky top-24">
                <h2 className="mb-4 text-lg font-semibold tracking-tight">
                  What's in your kitchen?
                </h2>
                <p className="mb-6 text-sm text-[var(--cx-text-muted)]">
                  Enter ingredients you have on hand, and AI will suggest healthy meals you can make.
                </p>
                <IngredientInput onSubmit={handleSuggestMeals} loading={loadingSuggestions} />
              </div>
            </div>

            <div className="lg:col-span-8">
              {loadingSuggestions ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="cx-card animate-pulse">
                      <div className="flex gap-4">
                        <div className="h-6 w-1/3 rounded bg-[var(--cx-surface-elevated)]" />
                        <div className="h-6 w-16 rounded bg-[var(--cx-surface-elevated)]" />
                      </div>
                      <div className="mt-4 h-4 w-2/3 rounded bg-[var(--cx-surface-elevated)]" />
                      <div className="mt-6 grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-16 rounded-lg bg-[var(--cx-surface-elevated)]" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : suggestError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                  <svg className="mx-auto mb-2 h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{suggestError}</p>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-6">
                  {suggestions.map((suggestion, idx) => (
                    <MealSuggestionCard
                      key={idx}
                      suggestion={suggestion}
                      onAddMeal={handleAddMeal}
                      adding={addingMeals.has(suggestion.name)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--cx-border)] p-12 text-center text-[var(--cx-text-muted)]">
                  <div className="mb-4 rounded-full bg-[var(--cx-surface-elevated)] p-4">
                    <svg className="h-8 w-8 text-primary-400/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-[var(--cx-text)]">
                    Ready to cook?
                  </h3>
                  <p className="max-w-sm text-sm">
                    Enter your ingredients on the left to get personalized meal suggestions tailored to your goals.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="lg:col-span-5">
              <div className="cx-card sticky top-24">
                <h2 className="mb-4 text-lg font-semibold tracking-tight">
                  Analyze Food Image
                </h2>
                <p className="mb-6 text-sm text-[var(--cx-text-muted)]">
                  Snap a photo of your meal and let AI estimate its calories and macros for you.
                </p>
                <ImageAnalyzerCard onAnalyze={handleAnalyzeImage} loading={loadingAnalysis} />
              </div>
            </div>

            <div className="lg:col-span-7">
              {loadingAnalysis ? (
                <div className="cx-card animate-pulse">
                  <div className="mb-6 h-6 w-1/3 rounded bg-[var(--cx-surface-elevated)]" />
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-[var(--cx-surface-elevated)]" />
                    ))}
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-full rounded bg-[var(--cx-surface-elevated)]" />
                    <div className="h-4 w-5/6 rounded bg-[var(--cx-surface-elevated)]" />
                    <div className="h-4 w-4/6 rounded bg-[var(--cx-surface-elevated)]" />
                  </div>
                </div>
              ) : analysisError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                  <svg className="mx-auto mb-2 h-8 w-8 opacity-80" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>{analysisError}</p>
                </div>
              ) : analysisResult ? (
                <div className="cx-card overflow-hidden">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-[var(--cx-text)]">
                        {analysisResult.food_name || "Analyzed Meal"}
                      </h3>
                      {analysisResult.confidence_score && (
                        <p className="text-sm text-[var(--cx-text-muted)]">
                          AI Confidence: {Math.round(analysisResult.confidence_score * 100)}%
                        </p>
                      )}
                    </div>
                    {analysisResult.meal_type && (
                      <span className="rounded-md bg-primary-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-400">
                        {analysisResult.meal_type}
                      </span>
                    )}
                  </div>

                  <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Calories", value: analysisResult.estimated_calories, unit: "kcal", color: "text-orange-400", bg: "bg-orange-500/10" },
                      { label: "Protein", value: analysisResult.estimated_protein_g, unit: "g", color: "text-blue-400", bg: "bg-blue-500/10" },
                      { label: "Carbs", value: analysisResult.estimated_carbs_g, unit: "g", color: "text-amber-400", bg: "bg-amber-500/10" },
                      { label: "Fat", value: analysisResult.estimated_fat_g, unit: "g", color: "text-rose-400", bg: "bg-rose-500/10" },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className={`flex flex-col items-center justify-center rounded-xl p-4 ${m.bg}`}
                      >
                        <span className={`text-2xl font-bold tabular-nums ${m.color}`}>
                          {typeof m.value === "number" ? Math.round(m.value) : m.value || 0}
                        </span>
                        <span className={`mt-1 text-[10px] font-semibold uppercase tracking-wider ${m.color} opacity-80`}>
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {analysisResult.reasoning && (
                    <div className="mb-8 rounded-xl border border-[var(--cx-border)] bg-[var(--cx-surface-elevated)]/50 p-4">
                      <h4 className="mb-2 text-sm font-medium text-[var(--cx-text)]">
                        AI Reasoning
                      </h4>
                      <p className="text-sm leading-relaxed text-[var(--cx-text-muted)]">
                        {analysisResult.reasoning}
                      </p>
                    </div>
                  )}

                  {analysisResult.detected_ingredients?.length > 0 && (
                    <div className="mb-8">
                      <h4 className="mb-3 text-sm font-medium text-[var(--cx-text)]">
                        Detected Ingredients
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.detected_ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="rounded-lg border border-[var(--cx-border)] bg-[var(--cx-surface-elevated)] px-3 py-1.5 text-xs text-[var(--cx-text-muted)]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddVisionMeal}
                    disabled={addingVisionMeal}
                    className="cx-btn-primary w-full gap-2 !py-3 text-base disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingVisionMeal ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Adding…
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add to Meal Tracker
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--cx-border)] p-12 text-center text-[var(--cx-text-muted)] h-[400px]">
                  <div className="mb-4 rounded-full bg-[var(--cx-surface-elevated)] p-4">
                    <svg className="h-8 w-8 text-primary-400/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-[var(--cx-text)]">
                    Upload a food image
                  </h3>
                  <p className="max-w-sm text-sm">
                    The AI will analyze your meal and extract calories, macros, and ingredients automatically.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
