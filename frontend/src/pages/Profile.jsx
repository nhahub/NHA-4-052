import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    age: "",
    gender: "Male",
    height_cm: "",
    weight_kg: "",
    activity_level: "Sedentary",
    goal: "Maintenance",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profileService.getProfile();
        setForm({
          age: data.age,
          gender: data.gender,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg,
          activity_level: data.activity_level,
          goal: data.goal,
        });
      } catch (err) {
        // 404 is expected if profile hasn't been set up yet
        if (err.response?.status !== 404) {
          setError("Failed to load profile. Please try refreshing.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "age" || name === "height_cm" || name === "weight_kg"
        ? value === "" ? "" : Number(value)
        : value,
    }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    // Client-side checks
    if (!form.age || form.age < 1 || form.age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      setSubmitting(false);
      return;
    }
    if (!form.height_cm || form.height_cm < 30 || form.height_cm > 300) {
      setError("Please enter a valid height in cm.");
      setSubmitting(false);
      return;
    }
    if (!form.weight_kg || form.weight_kg < 10 || form.weight_kg > 500) {
      setError("Please enter a valid weight in kg.");
      setSubmitting(false);
      return;
    }

    try {
      await profileService.saveProfile(form);
      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to save profile. Please check inputs."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500" />
          <p className="text-sm text-[var(--cx-text-muted)]">Loading profile details…</p>
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-12">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Calculate Your Targets
        </h1>
        <p className="mt-2 text-[var(--cx-text-muted)]">
          Complete your profile parameters to set accurate BMR, TDEE, and macros goals.
        </p>
      </div>

      {/* ── Card ───────────────────────────────────────────────── */}
      <div className="cx-card relative overflow-hidden">
        {/* Design details */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary-500/5 blur-2xl" />

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gender & Age */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="cx-input bg-[var(--cx-surface-elevated)]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                required
                placeholder="25"
                value={form.age}
                onChange={handleChange}
                className="cx-input"
              />
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
                Height (cm)
              </label>
              <input
                type="number"
                name="height_cm"
                required
                placeholder="175"
                value={form.height_cm}
                onChange={handleChange}
                className="cx-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight_kg"
                required
                placeholder="70"
                step="0.1"
                value={form.weight_kg}
                onChange={handleChange}
                className="cx-input"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
              Activity Level
            </label>
            <select
              name="activity_level"
              value={form.activity_level}
              onChange={handleChange}
              className="cx-input bg-[var(--cx-surface-elevated)]"
            >
              <option value="Sedentary">Sedentary (Little/no exercise)</option>
              <option value="Lightly Active">Lightly Active (1-3 days/week)</option>
              <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
              <option value="Very Active">Very Active (6-7 days/week)</option>
              <option value="Extra Active">Extra Active (Hard physical labor/daily training)</option>
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--cx-text-muted)]">
              Fitness Goal
            </label>
            <select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              className="cx-input bg-[var(--cx-surface-elevated)]"
            >
              <option value="Weight Loss">Weight Loss (Caloric deficit)</option>
              <option value="Maintenance">Maintenance (TDEE balance)</option>
              <option value="Muscle Gain">Muscle Gain (Caloric surplus)</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="cx-btn-ghost !py-2.5 !px-5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cx-btn-primary !py-2.5 !px-5 disabled:opacity-50"
            >
              {submitting ? "Calculating targets…" : "Save & Calculate"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
