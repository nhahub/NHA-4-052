import { useState, useEffect } from "react";
import {
    Flame,
    Target,
    TrendingUp,
    Activity,
    Calendar,
    Beef,
    Wheat,
    Droplets,
    Award,
    Clock,
} from "lucide-react";
import metricsService from "../services/metricsService";

export default function Metrics() {
    const [range, setRange] = useState("7D");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await metricsService.getMetrics(range);
                setData(response);
            } catch (err) {
                setError(err.response?.data?.detail || "Failed to load metrics");
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, [range]);

    // Map icons for cards
    const getCardIcon = (title) => {
        if (title.includes("Calories")) return Flame;
        if (title.includes("Goal")) return Target;
        if (title.includes("Streak")) return TrendingUp;
        return Activity;
    };

    const getCardColor = (title) => {
        if (title.includes("Calories")) return "text-orange-400";
        if (title.includes("Goal")) return "text-emerald-400";
        if (title.includes("Streak")) return "text-blue-400";
        return "text-purple-400";
    };

    // Map icons for macros
    const getMacroIcon = (name) => {
        if (name === "Protein") return Beef;
        if (name === "Carbohydrates") return Wheat;
        return Droplets;
    };

    const getMacroColor = (name) => {
        if (name === "Protein") return "bg-emerald-500";
        if (name === "Carbohydrates") return "bg-blue-500";
        return "bg-amber-500";
    };

    const getInsightColor = (type) => {
        if (type === "success") return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
        if (type === "warning") return "bg-amber-500/10 border-amber-500/20 text-amber-400";
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
    };

    return (
        <section className="mx-auto max-w-7xl px-6 py-10">

            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Nutrition Metrics
                    </h1>
                    <p className="mt-2 text-[var(--cx-text-muted)]">
                        Track your nutrition performance, calorie consistency and macro balance.
                    </p>
                </div>

                <div className="flex overflow-hidden rounded-xl border border-[var(--cx-border)]">
                    {["7D", "30D", "90D"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setRange(item)}
                            className={`px-5 py-2 text-sm transition ${range === item
                                    ? "bg-primary-500 text-black font-semibold"
                                    : "hover:bg-[var(--cx-surface-elevated)] text-[var(--cx-text-muted)] hover:text-white"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="mt-20 flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--cx-surface-elevated)] border-t-primary-500" />
                </div>
            ) : error ? (
                <div className="mt-10 rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
                    <p>{error}</p>
                </div>
            ) : data && (
                <>
                    {/* KPI Cards */}
                    <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                        {data.cards.map((card) => {
                            const Icon = getCardIcon(card.title);
                            const colorClass = getCardColor(card.title);

                            return (
                                <div key={card.title} className="cx-card">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.18em] text-[var(--cx-text-muted)]">
                                                {card.title}
                                            </p>
                                            <h2 className="mt-4 text-5xl font-bold">
                                                {card.value}
                                                <span className="ml-2 text-base font-normal text-[var(--cx-text-muted)]">
                                                    {card.unit}
                                                </span>
                                            </h2>
                                        </div>
                                        <div className={`rounded-2xl bg-[var(--cx-surface-elevated)] p-4 ${colorClass}`}>
                                            <Icon size={24} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Weekly Overview */}
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {/* Weekly Calories */}
                        <div className="cx-card lg:col-span-2">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Weekly Calorie Intake
                                    </h2>
                                    <p className="mt-1 text-sm text-[var(--cx-text-muted)]">
                                        Calories consumed versus your daily target.
                                    </p>
                                </div>
                                <Calendar size={18} className="text-primary-400" />
                            </div>
                            <div className="space-y-5">
                                {data.weekly_calories.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="mb-2 flex justify-between text-sm">
                                            <span>{item.day}</span>
                                            <span className="text-[var(--cx-text-muted)]">
                                                {item.calories} kcal
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[var(--cx-surface-elevated)]">
                                            <div className="relative h-full w-full">
                                                <div
                                                    className="absolute left-0 top-0 h-full rounded-full bg-primary-500"
                                                    style={{ width: `${Math.min((item.calories / 2500) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Macro Split */}
                        <div className="cx-card">
                            <h2 className="text-xl font-semibold">
                                Macro Distribution
                            </h2>
                            <p className="mt-1 text-sm text-[var(--cx-text-muted)]">
                                Average nutrient balance.
                            </p>
                            <div className="mt-8 space-y-7">
                                {data.macros.map((macro) => {
                                    const Icon = getMacroIcon(macro.name);
                                    const bgColor = getMacroColor(macro.name);

                                    return (
                                        <div key={macro.name}>
                                            <div className="mb-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Icon size={16} className="text-[var(--cx-text-muted)]" />
                                                    <span className="font-medium">{macro.name}</span>
                                                </div>
                                                <span className="text-sm text-[var(--cx-text-muted)]">
                                                    {macro.grams} g
                                                </span>
                                            </div>
                                            <div className="h-2 rounded-full bg-[var(--cx-surface-elevated)]">
                                                <div
                                                    className={`h-full rounded-full ${bgColor}`}
                                                    style={{ width: `${macro.percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-10 grid gap-6 lg:grid-cols-3">
                        {/* Goal Progress */}
                        <div className="cx-card">
                            <div className="flex items-center gap-2">
                                <Target className="text-primary-400" size={20} />
                                <h2 className="text-lg font-semibold">Goal Progress</h2>
                            </div>
                            <div className="mt-8">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-[var(--cx-text-muted)]">Weight Goal</span>
                                    <span className="font-semibold">{data.goal_progress.progress_pct}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-[var(--cx-surface-elevated)]">
                                    <div
                                        className="h-full rounded-full bg-primary-500"
                                        style={{ width: `${data.goal_progress.progress_pct}%` }}
                                    />
                                </div>
                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--cx-text-muted)]">Current Weight</span>
                                        <strong>{data.goal_progress.current_weight ? `${data.goal_progress.current_weight} kg` : "-"}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--cx-text-muted)]">Target Weight</span>
                                        <strong>{data.goal_progress.target_weight ? `${data.goal_progress.target_weight} kg` : "-"}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--cx-text-muted)]">Estimated Time</span>
                                        <strong>{data.goal_progress.estimated_time}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Insights */}
                        <div className="cx-card">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={20} className="text-emerald-400" />
                                <h2 className="text-lg font-semibold">Weekly Insights</h2>
                            </div>
                            <div className="mt-8 space-y-4">
                                {data.insights.length > 0 ? data.insights.map((insight, idx) => (
                                    <div key={idx} className={`rounded-xl border p-4 ${getInsightColor(insight.type)}`}>
                                        <p className="font-medium">{insight.title}</p>
                                        <p className="text-sm text-[var(--cx-text-muted)] mt-1 opacity-80 text-white">
                                            {insight.description}
                                        </p>
                                    </div>
                                )) : (
                                    <div className="text-sm text-[var(--cx-text-muted)]">No insights for this period.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="cx-card">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-primary-400" />
                                <h2 className="text-lg font-semibold">Recent Activity</h2>
                            </div>
                            <div className="mt-8 space-y-5">
                                {data.recent_activity.length > 0 ? data.recent_activity.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between border-b border-[var(--cx-border)] pb-3 last:border-none"
                                    >
                                        <div>
                                            <p className="font-medium">{item.title}</p>
                                            <p className="text-xs text-[var(--cx-text-muted)]">{item.time_label}</p>
                                        </div>
                                        <span className="font-semibold text-primary-400">
                                            +{item.calories} kcal
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-sm text-[var(--cx-text-muted)]">No recent activity.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}