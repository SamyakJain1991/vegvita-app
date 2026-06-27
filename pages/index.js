// pages/index.js — Healthy Veg Diet AI Agent
// Stack: Next.js + Tailwind CSS

import { useState } from "react";
import Head from "next/head";

// ─── Icons (inline SVG, no extra deps) ──────────────────────────────────────
const LeafIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C19 4 19 8 17 8z" />
  </svg>
);
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
  </svg>
);
const FireIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0 0 10 0c0-4.5-5-9-5-9zm0 14a3 3 0 0 1-3-3c0-2 2-4.5 3-6 1 1.5 3 4 3 6a3 3 0 0 1-3 3z" />
  </svg>
);
const ChefIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.5 3A3.5 3.5 0 0 0 15.14 6H8.86A3.5 3.5 0 1 0 5.5 10c.17 0 .33-.01.5-.03V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9.03c.17.02.33.03.5.03A3.5 3.5 0 0 0 18.5 3z" />
  </svg>
);
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const DropIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2C6 10 6 13 6 14a6 6 0 0 0 12 0c0-1 0-4-6-12z" />
  </svg>
);

// ─── Meal color themes ───────────────────────────────────────────────────────
const mealTheme = {
  breakfast:      { emoji: "🌅", color: "from-amber-50 to-orange-50",   border: "border-amber-300", dot: "bg-amber-400",   badge: "bg-amber-100 text-amber-800" },
  midMorningSnack:{ emoji: "🍎", color: "from-green-50 to-emerald-50",  border: "border-emerald-300", dot: "bg-emerald-400", badge: "bg-emerald-100 text-emerald-800" },
  lunch:          { emoji: "☀️",  color: "from-sky-50 to-blue-50",      border: "border-sky-300",   dot: "bg-sky-400",     badge: "bg-sky-100 text-sky-800" },
  eveningSnack:   { emoji: "🌿", color: "from-violet-50 to-purple-50",  border: "border-violet-300", dot: "bg-violet-400", badge: "bg-violet-100 text-violet-800" },
  dinner:         { emoji: "🌙", color: "from-indigo-50 to-slate-50",   border: "border-indigo-300", dot: "bg-indigo-500",  badge: "bg-indigo-100 text-indigo-900" },
};

const mealOrder = ["breakfast", "midMorningSnack", "lunch", "eveningSnack", "dinner"];

// ─── Meal Card ───────────────────────────────────────────────────────────────
function MealCard({ mealKey, meal, index }) {
  const [open, setOpen] = useState(index < 2);
  const theme = mealTheme[mealKey] || mealTheme.lunch;

  return (
    <div className="relative flex gap-4">
      {/* Timeline stem */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${theme.dot} flex items-center justify-center text-white text-lg shadow-md z-10 flex-shrink-0`}>
          {theme.emoji}
        </div>
        {index < mealOrder.length - 1 && (
          <div className="w-0.5 bg-gradient-to-b from-green-300 to-green-100 flex-1 mt-1 min-h-[32px]" />
        )}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-6 rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.color} shadow-sm overflow-hidden`}>
        {/* Header */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-5 py-4 text-left"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800 text-base">{meal.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme.badge}`}>
                {meal.totalCalories} kcal
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ClockIcon />{meal.time}</span>
              <span className="flex items-center gap-1"><ChefIcon />{meal.prepTime}</span>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </button>

        {/* Expandable body */}
        {open && (
          <div className="px-5 pb-5 space-y-3">
            {/* Food items */}
            <div className="space-y-2">
              {meal.items.map((item, i) => (
                <div key={i} className="bg-white/70 rounded-xl p-3 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.quantity}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-0.5">{item.benefit}</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-bold flex-shrink-0">
                    <FireIcon />{item.calories}
                  </div>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="flex items-start gap-2 bg-white/60 rounded-xl px-4 py-3">
              <span className="text-green-600 mt-0.5 flex-shrink-0">💡</span>
              <p className="text-xs text-gray-600 italic">{meal.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Macro Pill ──────────────────────────────────────────────────────────────
function MacroPill({ label, value, color }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-2xl ${color}`}>
      <span className="text-lg font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition placeholder-gray-400";
const selectCls = inputCls;

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Home() {
  const [form, setForm] = useState({
    age: "", gender: "", goal: "", weight: "", height: "",
    activityLevel: "moderate", preferences: "",
  });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    if (!form.age || !form.gender || !form.goal) {
      setError("Please fill in Age, Gender, and Goal to continue.");
      return;
    }
    setError("");
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("/api/generate-diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
      } else if (data.error === "parse_failed") {
        setError("AI returned an unexpected format. Please try again.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setPlan(null); setError(""); setForm({ age: "", gender: "", goal: "", weight: "", height: "", activityLevel: "moderate", preferences: "" }); };

  return (
    <>
      <Head>
        <title>VegVita — Healthy Veg Diet AI Agent</title>
        <meta name="description" content="AI-powered personalized vegetarian diet planner for all ages" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        body { font-family: 'Inter', sans-serif; background: #F0FFF4; }
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-leaf { 0%,100% { transform: scale(1) rotate(-5deg); } 50% { transform: scale(1.15) rotate(5deg); } }
        .animate-fade-up { animation: fadeUp 0.5s ease forwards; }
        .animate-leaf { animation: pulse-leaf 1.5s ease-in-out infinite; }
        .vine-dot { animation: fadeUp 0.4s ease forwards; }
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-[#F0FFF4] via-[#FAFFF6] to-[#EEF9F4]">

        {/* ── Header ── */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-green-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white animate-leaf">
                <LeafIcon />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-green-800 text-lg leading-none">VegVita</h1>
                <p className="text-xs text-green-600">AI Diet Agent • 100% Vegetarian</p>
              </div>
            </div>
            {plan && (
              <button onClick={handleReset}
                className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold transition border border-green-200">
                ← New Plan
              </button>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* ── Hero ── */}
          {!plan && (
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full">
                <SparkleIcon /> AI-Powered • Personalized • Free
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight mt-3">
                Your Perfect<br />
                <span className="text-green-600">Veg Diet Plan</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Tell us about yourself. Our AI Agent crafts a full daily meal routine — tailored to your age, gender & goal.
              </p>
            </div>
          )}

          {/* ── Form ── */}
          {!plan && (
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 space-y-5 animate-fade-up">
              <h3 className="font-display font-bold text-gray-800 text-lg">Your Profile</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Age *">
                  <input type="number" min="1" max="70" placeholder="e.g. 28"
                    className={inputCls} value={form.age}
                    onChange={e => update("age", e.target.value)} />
                </Field>

                <Field label="Gender *">
                  <select className={selectCls} value={form.gender} onChange={e => update("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child (Boy)">Child (Boy)</option>
                    <option value="Child (Girl)">Child (Girl)</option>
                  </select>
                </Field>

                <Field label="Goal *">
                  <select className={selectCls} value={form.goal} onChange={e => update("goal", e.target.value)}>
                    <option value="">Select</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Gym / Muscle Building">Gym / Muscle Building</option>
                    <option value="Maintain Health">Maintain Health</option>
                    <option value="Manage Diabetes">Manage Diabetes</option>
                    <option value="Heart Health">Heart Health</option>
                  </select>
                </Field>

                <Field label="Weight (kg)">
                  <input type="number" placeholder="e.g. 65" className={inputCls}
                    value={form.weight} onChange={e => update("weight", e.target.value)} />
                </Field>

                <Field label="Height (cm)">
                  <input type="number" placeholder="e.g. 170" className={inputCls}
                    value={form.height} onChange={e => update("height", e.target.value)} />
                </Field>

                <Field label="Activity Level">
                  <select className={selectCls} value={form.activityLevel} onChange={e => update("activityLevel", e.target.value)}>
                    <option value="sedentary">Sedentary (desk job)</option>
                    <option value="light">Light (walk/yoga)</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active (daily gym)</option>
                    <option value="very active">Very Active (athlete)</option>
                  </select>
                </Field>
              </div>

              <Field label="Allergies / Preferences (optional)">
                <input type="text" placeholder="e.g. No onion garlic, lactose intolerant, gluten-free..."
                  className={inputCls} value={form.preferences}
                  onChange={e => update("preferences", e.target.value)} />
              </Field>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-display font-bold rounded-2xl text-base transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is preparing your plan…
                  </>
                ) : (
                  <><SparkleIcon /> Generate My Diet Plan</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">100% Vegetarian • Powered by Groq LLaMA 3.3 • Free Forever</p>
            </div>
          )}

          {/* ── Results Dashboard ── */}
          {plan && (
            <div className="space-y-6 animate-fade-up">

              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🥗</div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl">Your Plan is Ready!</h3>
                    <p className="text-green-100 text-sm mt-1">{plan.summary}</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  <MacroPill label="Calories/day" value={`${plan.dailyCalories} kcal`} color="bg-white/20 text-white" />
                  <MacroPill label="Protein" value={plan.macros?.protein} color="bg-white/20 text-white" />
                  <MacroPill label="Carbs" value={plan.macros?.carbs} color="bg-white/20 text-white" />
                  <MacroPill label="Fats" value={plan.macros?.fats} color="bg-white/20 text-white" />
                </div>

                {/* Hydration */}
                <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-4 py-2.5">
                  <DropIcon />
                  <span className="text-sm font-medium">{plan.hydration}</span>
                </div>
              </div>

              {/* Meal Timeline */}
              <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6">
                <h3 className="font-display font-bold text-gray-800 text-lg mb-6">
                  Daily Meal Timeline
                </h3>
                <div>
                  {mealOrder.map((key, i) => {
                    const meal = plan.meals?.[key];
                    if (!meal) return null;
                    return (
                      <div key={key} style={{ animationDelay: `${i * 80}ms` }} className="vine-dot">
                        <MealCard mealKey={key} meal={meal} index={i} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Avoid List + Weekly Tips side by side */}
              <div className="grid sm:grid-cols-2 gap-4">
                {plan.avoidList?.length > 0 && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-red-700 mb-3 flex items-center gap-2">
                      🚫 Avoid These
                    </h4>
                    <ul className="space-y-2">
                      {plan.avoidList.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                          <span className="mt-0.5 flex-shrink-0">✕</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {plan.weeklyTips?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-amber-700 mb-3 flex items-center gap-2">
                      💡 Weekly Tips
                    </h4>
                    <ul className="space-y-2">
                      {plan.weeklyTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                          <span className="mt-0.5 flex-shrink-0">→</span>{tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="text-center space-y-3 pb-6">
                <button onClick={handleReset}
                  className="bg-green-600 hover:bg-green-700 text-white font-display font-bold px-8 py-3 rounded-2xl transition shadow-md">
                  ← Generate a New Plan
                </button>
                <p className="text-xs text-gray-400">
                  Consult a certified nutritionist before making major dietary changes.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
