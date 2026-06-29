import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAnalytics } from "../../services/operations/taskAPI";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, AreaChart, Area,
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from "recharts";
import "./Analytics.css";

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const PremiumTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="az-tooltip">
                <p className="az-tooltip-label">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="az-tooltip-value" style={{ color: entry.color }}>
                        {entry.name}: <span>{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Animated Number ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ value, suffix = "" }) => (
    <span className="az-animated-number">{value}{suffix}</span>
);

// ─── Progress Ring ────────────────────────────────────────────────────────────
const ProgressRing = ({ value, max = 100, size = 56, color = "url(#ringGrad)" }) => {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min((value / max) * 100, 100);
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="az-progress-ring">
            <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
            <circle cx={size / 2} cy={size / 2} r={r} className="az-ring-bg" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                className="az-ring-fill"
                stroke={color}
                strokeDasharray={`${dash} ${circ}`}
                strokeDashoffset="0"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
        </svg>
    );
};

// ─── Loading State ────────────────────────────────────────────────────────────
const LoadingState = () => (
    <div className="az-loading-page">
        <div className="az-loading-orb-wrap">
            <div className="az-loading-orb">
                <div className="az-loading-ring az-ring1" />
                <div className="az-loading-ring az-ring2" />
                <div className="az-loading-ring az-ring3" />
                <div className="az-loading-core">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="url(#loadGrad)" strokeWidth="1.5" fill="none" />
                        <circle cx="16" cy="16" r="4" fill="url(#loadGrad)" />
                        <defs>
                            <linearGradient id="loadGrad" x1="4" y1="4" x2="28" y2="28">
                                <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
        <p className="az-loading-text">Generating AI insights…</p>
        <div className="az-skeleton-grid">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="az-skeleton-card"><div className="az-skeleton-shimmer" /></div>
            ))}
        </div>
        <div className="az-skeleton-charts">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="az-skeleton-chart"><div className="az-skeleton-shimmer" /></div>
            ))}
        </div>
    </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
    <div className="az-empty-page">
        <div className="az-empty-card">
            <div className="az-empty-orb">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <path d="M32 8L56 20V44L32 56L8 44V20L32 8Z" stroke="url(#emptyGrad)" strokeWidth="1.5" fill="none" opacity="0.6" />
                    <path d="M32 18L46 25V39L32 46L18 39V25L32 18Z" stroke="url(#emptyGrad)" strokeWidth="1.5" fill="none" opacity="0.4" />
                    <circle cx="32" cy="32" r="6" fill="url(#emptyGrad)" />
                    <defs>
                        <linearGradient id="emptyGrad" x1="8" y1="8" x2="56" y2="56">
                            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            <h2 className="az-empty-title">No insights yet</h2>
            <p className="az-empty-sub">Complete tasks to unlock your AI productivity analytics.</p>
            <div className="az-empty-badge">
                <span className="az-badge-dot" />
                Waiting for data
            </div>
        </div>
    </div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KPICard = ({ icon, label, value, suffix = "", insight, ringMax = 100, color, delay = 0 }) => (
    <div className="az-kpi-card" style={{ animationDelay: `${delay}ms` }}>
        <div className="az-kpi-beam" />
        <div className="az-kpi-top">
            <div className="az-kpi-icon" style={{ "--kpi-color": color }}>{icon}</div>
            <ProgressRing value={Number(value) || 0} max={ringMax} size={52} />
        </div>
        <div className="az-kpi-value">
            <AnimatedNumber value={value} suffix={suffix} />
        </div>
        <div className="az-kpi-label">{label}</div>
        {insight && <div className="az-kpi-insight"><span className="az-insight-dot" />{insight}</div>}
    </div>
);

// ─── Chart Card Shell ─────────────────────────────────────────────────────────
const ChartCard = ({ icon, title, badge = "AI Chart", children, delay = 0 }) => (
    <div className="az-chart-card" style={{ animationDelay: `${delay}ms` }}>
        <div className="az-chart-beam" />
        <div className="az-chart-header">
            <div className="az-chart-title-row">
                <span className="az-chart-icon">{icon}</span>
                <span className="az-chart-title">{title}</span>
            </div>
            <span className="az-mini-badge">
                <span className="az-badge-dot pulse" />
                {badge}
            </span>
        </div>
        <div className="az-chart-body">{children}</div>
    </div>
);

// ─── Pie custom label ─────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#e2e8f0" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// ─── Colour palettes ──────────────────────────────────────────────────────────
const PIE_COLORS = ["#6366f1", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899"];
const BAR_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#10b981", none: "#6366f1" };

// ─── Main Component ───────────────────────────────────────────────────────────
function Analytics() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { analytics, loading } = useSelector((state) => state.task);

    useEffect(() => {
        dispatch(getAnalytics(token));
    }, [dispatch, token]);

    // ── data transforms (memoised, no side-effects) ──
    const weeklyData = useMemo(() => {
        if (!analytics?.weeklyCompletion) return [];
        const raw = analytics.weeklyCompletion;
        if (Array.isArray(raw)) {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            return raw.map((completed, index) => ({
                day: days[index] || `Day ${index + 1}`,
                completed,
            }));
        }
        return Object.entries(raw).map(([day, completed]) => ({ day, completed }));
    }, [analytics]);

    const monthlyData = useMemo(() => {
        if (!analytics?.monthlyCompletion) return [];
        const raw = analytics.monthlyCompletion;
        if (Array.isArray(raw)) {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return raw.map((completed, index) => ({
                month: months[index] || `M${index + 1}`,
                completed,
            }));
        }
        return Object.entries(raw).map(([month, completed]) => ({ month, completed }));
    }, [analytics]);

    const categoryData = useMemo(() => {
        if (!analytics?.categoryStats) return [];
        return Object.entries(analytics.categoryStats).map(([name, value]) => ({ name, value }));
    }, [analytics]);

    const priorityData = useMemo(() => {
        if (!analytics?.priorityStats) return [];
        return Object.entries(analytics.priorityStats).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            fill: BAR_COLORS[name.toLowerCase()] || "#6366f1"
        }));
    }, [analytics]);

    const score = analytics?.productivityScore ?? 0;
    const scoreCircumference = 2 * Math.PI * 54;
    const scoreDash = (Math.min(score, 100) / 100) * scoreCircumference;

    if (loading) return <LoadingState />;
    if (!analytics) return <EmptyState />;

    return (


        <div className="az-page">
            <div className="az-back-wrap">
                <button
                    className="az-back-btn"
                    onClick={() => navigate("/dashboard")}
                >
                    <span className="az-back-arrow">←</span>
                    Dashboard
                </button>
            </div>
            {/* ── Floating particles ── */}
            <div className="az-particles" aria-hidden="true">
                {[...Array(18)].map((_, i) => <div key={i} className="az-particle" style={{ "--i": i }} />)}
            </div>

            {/* ══════════════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════════════ */}
            <header className="az-hero">
                <div className="az-hero-aurora" aria-hidden="true" />
                <div className="az-hero-content">
                    <div className="az-hero-badges">
                        <span className="az-hero-badge az-badge-ai">
                            <span className="az-badge-dot pulse" />
                            AI Powered
                        </span>
                        <span className="az-hero-badge az-badge-gemini">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <circle cx="12" cy="12" r="3" fill="currentColor" />
                            </svg>
                            Gemini Analytics
                        </span>
                    </div>

                    <h1 className="az-hero-title">
                        <span className="az-title-icon">📊</span>
                        Productivity Analytics
                    </h1>
                    <p className="az-hero-sub">
                        AI-powered insights into your productivity, focus, and task completion.
                    </p>
                </div>

                {/* Animated orb */}
                <div className="az-hero-orb" aria-hidden="true">
                    <div className="az-orb-core" />
                    <div className="az-orb-ring az-orb-r1" />
                    <div className="az-orb-ring az-orb-r2" />
                    <div className="az-orb-ring az-orb-r3" />
                    <div className="az-orb-neural">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="az-neural-dot" style={{ "--ni": i }} />
                        ))}
                    </div>
                </div>
            </header>

            {/* ══════════════════════════════════════════════════════════════
                KPI GRID
            ══════════════════════════════════════════════════════════════ */}
            <section className="az-section">
                <div className="az-kpi-grid">
                    <KPICard delay={0} icon="📋" label="Total Tasks" value={analytics.totalTasks} ringMax={analytics.totalTasks || 1} color="#6366f1" insight="All time tasks" />
                    <KPICard delay={60} icon="✅" label="Completed" value={analytics.completedTasks} ringMax={analytics.totalTasks || 1} color="#10b981" insight="Great work!" />
                    <KPICard delay={120} icon="⏳" label="Pending" value={analytics.pendingTasks} ringMax={analytics.totalTasks || 1} color="#f59e0b" insight="In progress" />
                    <KPICard delay={180} icon="🔥" label="Overdue" value={analytics.overdueTasks} ringMax={analytics.totalTasks || 1} color="#ef4444" insight="Needs attention" />
                    <KPICard delay={240} icon="🎯" label="Completion Rate" value={analytics.completionRate} suffix="%" ringMax={100} color="#06b6d4" insight="Completion ratio" />
                    <KPICard delay={300} icon="⚡" label="Productivity Score" value={analytics.productivityScore} ringMax={100} color="#8b5cf6" insight="AI score" />
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                SCORE + AI INSIGHTS ROW
            ══════════════════════════════════════════════════════════════ */}
            <section className="az-section az-insights-row">
                {/* Productivity Score Orb */}
                <div className="az-score-card">
                    <div className="az-chart-beam" />
                    <div className="az-score-header">
                        <span className="az-chart-icon">⚡</span>
                        <span className="az-chart-title">AI Productivity Score</span>
                        <span className="az-mini-badge"><span className="az-badge-dot pulse" />Live</span>
                    </div>
                    <div className="az-score-dial">
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="50%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                            </defs>
                            <circle cx="80" cy="80" r="54" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="12" />
                            <circle
                                cx="80" cy="80" r="54" fill="none"
                                stroke="url(#scoreGrad)" strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${scoreDash} ${scoreCircumference}`}
                                transform="rotate(-90 80 80)"
                                className="az-score-ring"
                            />
                        </svg>
                        <div className="az-score-value-wrap">
                            <span className="az-score-number">{score}</span>
                            <span className="az-score-label">/ 100</span>
                        </div>
                    </div>
                    <p className="az-score-caption">
                        {score >= 80 ? "🔥 Excellent performance" : score >= 60 ? "🎯 Good progress" : "⏳ Keep going!"}
                    </p>
                </div>

                {/* AI Insight Cards */}
                <div className="az-insights-panel">
                    <div className="az-chart-beam" />
                    <div className="az-insights-header">
                        <span className="az-chart-icon">🤖</span>
                        <span className="az-chart-title">AI Analysis</span>
                        <span className="az-mini-badge"><span className="az-badge-dot pulse" />Generated</span>
                    </div>
                    <div className="az-insight-cards">
                        <div className="az-insight-item">
                            <span className="az-insight-ico">🎯</span>
                            <div>
                                <p className="az-insight-key">Main Focus</p>
                                <p className="az-insight-val">{categoryData[0]?.name ?? "—"}</p>
                            </div>
                        </div>
                        <div className="az-insight-item">
                            <span className="az-insight-ico">📅</span>
                            <div>
                                <p className="az-insight-key">Weekly Trend</p>
                                <p className="az-insight-val">
                                    {weeklyData.length > 1
                                        ? weeklyData[weeklyData.length - 1]?.completed > weeklyData[weeklyData.length - 2]?.completed
                                            ? "↑ Improving"
                                            : "↓ Slower pace"
                                        : "Collecting data"}
                                </p>
                            </div>
                        </div>
                        <div className="az-insight-item">
                            <span className="az-insight-ico">⚡</span>
                            <div>
                                <p className="az-insight-key">Performance</p>
                                <p className="az-insight-val">
                                    {analytics.completionRate >= 70 ? "High efficiency" : analytics.completionRate >= 40 ? "Moderate pace" : "Room to grow"}
                                </p>
                            </div>
                        </div>
                        <div className="az-insight-item">
                            <span className="az-insight-ico">🔥</span>
                            <div>
                                <p className="az-insight-key">Top Priority</p>
                                <p className="az-insight-val">{priorityData[0]?.name ?? "—"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CHARTS — ROW 1
            ══════════════════════════════════════════════════════════════ */}
            <section className="az-section az-charts-row">
                {/* Weekly */}
                <ChartCard icon="📈" title="Weekly Productivity" badge="AI Trend" delay={0}>
                    {weeklyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={weeklyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#06b6d4" />
                                    </linearGradient>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="lineGlow">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip />} />
                                <Area type="monotone" dataKey="completed" stroke="none" fill="url(#areaGrad)" />
                                <Line type="monotone" dataKey="completed" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#06b6d4" }} activeDot={{ r: 6, fill: "#06b6d4", filter: "url(#lineGlow)" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="az-chart-placeholder">
                            <span>No weekly data yet</span>
                        </div>
                    )}
                </ChartCard>

                {/* Monthly */}
                <ChartCard icon="📊" title="Monthly Productivity" badge="AI Trend" delay={80}>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip />} />
                                <Area type="monotone" dataKey="completed" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#monthGrad)" dot={false} activeDot={{ r: 5, fill: "#8b5cf6" }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="az-chart-placeholder"><span>No monthly data yet</span></div>
                    )}
                </ChartCard>
            </section>

            {/* ══════════════════════════════════════════════════════════════
                CHARTS — ROW 2
            ══════════════════════════════════════════════════════════════ */}
            <section className="az-section az-charts-row">
                {/* Category Pie */}
                <ChartCard icon="🥧" title="Category Distribution" badge="AI Breakdown" delay={0}>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <defs>
                                    {categoryData.map((_, i) => (
                                        <radialGradient key={i} id={`pieGrad${i}`} cx="50%" cy="50%" r="50%">
                                            <stop offset="0%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={1} />
                                            <stop offset="100%" stopColor={PIE_COLORS[i % PIE_COLORS.length]} stopOpacity={0.7} />
                                        </radialGradient>
                                    ))}
                                </defs>
                                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={36}
                                    dataKey="value" labelLine={false} label={PieLabel}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={`url(#pieGrad${i})`} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                                    ))}
                                </Pie>
                                <Tooltip content={<PremiumTooltip />} />
                                <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="az-chart-placeholder"><span>No category data yet</span></div>
                    )}
                </ChartCard>

                {/* Priority Bar */}
                <ChartCard icon="⚡" title="Priority Distribution" badge="AI Priority" delay={80}>
                    {priorityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={priorityData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }} barSize={32}>
                                <defs>
                                    {priorityData.map((d, i) => (
                                        <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={d.fill} stopOpacity={1} />
                                            <stop offset="100%" stopColor={d.fill} stopOpacity={0.5} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<PremiumTooltip />} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {priorityData.map((_, i) => (
                                        <Cell key={i} fill={`url(#barGrad${i})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="az-chart-placeholder"><span>No priority data yet</span></div>
                    )}
                </ChartCard>
            </section>
        </div>
    );
}

export default Analytics;
