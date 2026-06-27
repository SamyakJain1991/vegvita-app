// pages/index.js — VegVita v3 PWA (7-day + ingredients + notifications)
import { useState, useEffect } from "react";
import Head from "next/head";

const LeafIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C19 4 19 8 17 8z"/></svg>);
const ClockIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
const FireIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2c0 0-5 4.5-5 9a5 5 0 0 0 10 0c0-4.5-5-9-5-9zm0 14a3 3 0 0 1-3-3c0-2 2-4.5 3-6 1 1.5 3 4 3 6a3 3 0 0 1-3 3z"/></svg>);
const ChefIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.5 3A3.5 3.5 0 0 0 15.14 6H8.86A3.5 3.5 0 1 0 5.5 10c.17 0 .33-.01.5-.03V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9.03c.17.02.33.03.5.03A3.5 3.5 0 0 0 18.5 3z"/></svg>);
const SparkleIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>);
const DropIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6 10 6 13 6 14a6 6 0 0 0 12 0c0-1 0-4-6-12z"/></svg>);
const BagIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6z"/></svg>);
const BellIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>);
const PhoneIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-5 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v13z"/></svg>);

const mealTheme = {
  breakfast:       { emoji:"🌅", color:"from-amber-50 to-orange-50",  border:"border-amber-300",  dot:"bg-amber-400",   badge:"bg-amber-100 text-amber-800",   notifTitle:"🌅 Breakfast in 15 mins!" },
  midMorningSnack: { emoji:"🍎", color:"from-green-50 to-emerald-50", border:"border-emerald-300",dot:"bg-emerald-400", badge:"bg-emerald-100 text-emerald-800",notifTitle:"🍎 Morning Snack in 15 mins!" },
  lunch:           { emoji:"☀️", color:"from-sky-50 to-blue-50",      border:"border-sky-300",   dot:"bg-sky-400",     badge:"bg-sky-100 text-sky-800",        notifTitle:"☀️ Lunch time in 15 mins!" },
  eveningSnack:    { emoji:"🌿", color:"from-violet-50 to-purple-50", border:"border-violet-300",dot:"bg-violet-400",  badge:"bg-violet-100 text-violet-800",  notifTitle:"🌿 Evening Snack in 15 mins!" },
  dinner:          { emoji:"🌙", color:"from-indigo-50 to-slate-50",  border:"border-indigo-300",dot:"bg-indigo-500",  badge:"bg-indigo-100 text-indigo-900",  notifTitle:"🌙 Dinner time in 15 mins!" },
};
const mealOrder = ["breakfast","midMorningSnack","lunch","eveningSnack","dinner"];
const dayColors = ["bg-green-600","bg-emerald-600","bg-teal-600","bg-cyan-600","bg-sky-600","bg-blue-600","bg-violet-600"];

// Parse "7:30 AM" → today's Date object minus 15 minutes
function getMealReminderTime(timeStr) {
  const now = new Date();
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  const mealDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  return new Date(mealDate.getTime() - 15 * 60 * 1000); // 15 min before
}

function MealCard({ mealKey, meal, index }) {
  const [open, setOpen] = useState(index === 0);
  const theme = mealTheme[mealKey] || mealTheme.lunch;
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full ${theme.dot} flex items-center justify-center text-white text-base shadow-md z-10 flex-shrink-0`}>{theme.emoji}</div>
        {index < mealOrder.length-1 && <div className="w-0.5 bg-gradient-to-b from-green-300 to-green-100 flex-1 mt-1 min-h-[28px]"/>}
      </div>
      <div className={`flex-1 mb-4 rounded-2xl border ${theme.border} bg-gradient-to-br ${theme.color} shadow-sm overflow-hidden`}>
        <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-800 text-sm">{meal.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${theme.badge}`}>{meal.totalCalories} kcal</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ClockIcon/>{meal.time}</span>
              <span className="flex items-center gap-1"><ChefIcon/>{meal.prepTime}</span>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform duration-200 ${open?"rotate-180":""}`}>▾</span>
        </button>
        {open && (
          <div className="px-4 pb-4 space-y-2">
            {meal.items?.map((item,i)=>(
              <div key={i} className="bg-white/70 rounded-xl p-3 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                    <span className="text-xs text-gray-500">{item.quantity}</span>
                  </div>
                  <p className="text-xs text-green-700 mt-0.5">{item.benefit}</p>
                </div>
                <div className="flex items-center gap-1 text-orange-500 text-xs font-bold flex-shrink-0"><FireIcon/>{item.calories}</div>
              </div>
            ))}
            <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5">
              <span className="text-green-600 mt-0.5 flex-shrink-0">💡</span>
              <p className="text-xs text-gray-600 italic">{meal.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayCard({ dayData, isActive, onClick, colorClass }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${isActive?`${colorClass} text-white shadow-md scale-105`:"bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}>
      <div>{dayData.dayName?.slice(0,3)}</div>
      <div className="text-xs font-normal mt-0.5 opacity-80">{dayData.theme?.split(" ").slice(0,2).join(" ")}</div>
    </button>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition placeholder-gray-400";
const selectCls = inputCls;
function Field({label,children}){return(<div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-700">{label}</label>{children}</div>);}

export default function Home() {
  const [form, setForm] = useState({age:"",gender:"",goal:"",weight:"",height:"",activityLevel:"moderate",preferences:"",availableIngredients:""});
  const [showIngredients, setShowIngredients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDay, setLoadingDay] = useState(0);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState(0);
  const [showShopping, setShowShopping] = useState(false);
  const [notifStatus, setNotifStatus] = useState("idle"); // idle | granted | denied | scheduled
  const [swReady, setSwReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const update = (k,v) => setForm(f=>({...f,[k]:v}));

  // Register Service Worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then((reg) => {
        console.log("SW registered:", reg.scope);
        setSwReady(true);
      }).catch(console.error);
    }
    // PWA Install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    });
  }, []);

  // Handle PWA install
  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setShowInstallBanner(false);
  };

  // Schedule notifications for today's meals
  const scheduleNotifications = async (dayMeals) => {
    if (!("Notification" in window)) { alert("Ye browser notifications support nahi karta."); return; }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") { setNotifStatus("denied"); return; }
    setNotifStatus("granted");

    const now = new Date();
    const scheduledMeals = [];

    mealOrder.forEach((key) => {
      const meal = dayMeals?.[key];
      if (!meal?.time) return;
      const reminderTime = getMealReminderTime(meal.time);
      const delay = reminderTime.getTime() - now.getTime();
      if (delay > 0) {
        scheduledMeals.push({
          title: mealTheme[key]?.notifTitle || "VegVita Reminder",
          body: `${meal.title} — ${meal.totalCalories} kcal ready karein! 🥗`,
          delay,
          tag: key,
        });
      }
    });

    if (scheduledMeals.length === 0) {
      alert("Aaj ke baaki meals ke liye koi reminder nahi bacha. Kal dobara set karo!");
      return;
    }

    // Send to service worker for background scheduling
    if (swReady && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_NOTIFICATIONS",
        meals: scheduledMeals,
      });
    } else {
      // Fallback: setTimeout in main thread (works when tab is open)
      scheduledMeals.forEach(({ title, body, delay }) => {
        setTimeout(() => {
          new Notification(title, {
            body,
            icon: "/icon-192.png",
            tag: `vegvita-${Date.now()}`,
          });
        }, delay);
      });
    }

    setNotifStatus("scheduled");
    alert(`✅ ${scheduledMeals.length} reminders set! Har meal se 15 min pehle notification aayegi.`);
  };

  const handleGenerate = async () => {
    if (!form.age||!form.gender||!form.goal){setError("Please fill in Age, Gender, and Goal.");return;}
    setError(""); setLoading(true); setPlan(null); setActiveDay(0); setLoadingDay(1); setNotifStatus("idle");
    try {
      const res = await fetch("/api/generate-diet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data = await res.json();
      if(data.success&&data.plan){setPlan(data.plan);}
      else{setError(data.error||"Something went wrong. Please try again.");}
    } catch {setError("Network error. Please check your connection.");}
    finally{setLoading(false);setLoadingDay(0);}
  };

  const handleReset = () => {setPlan(null);setError("");setActiveDay(0);setNotifStatus("idle");setForm({age:"",gender:"",goal:"",weight:"",height:"",activityLevel:"moderate",preferences:"",availableIngredients:""});};

  const currentDay = plan?.days?.[activeDay];

  return (
    <>
      <Head>
        <title>VegVita — 7-Day Veg Diet AI</title>
        <meta name="description" content="AI-powered 7-day vegetarian diet planner with meal reminders"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
      </Head>
      <style jsx global>{`
        body{font-family:'Inter',sans-serif;background:#F0FFF4;}
        .font-display{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse-leaf{0%,100%{transform:scale(1) rotate(-5deg);}50%{transform:scale(1.15) rotate(5deg);}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        .animate-fade-up{animation:fadeUp 0.5s ease forwards;}
        .animate-leaf{animation:pulse-leaf 1.5s ease-in-out infinite;}
        .shimmer{background:linear-gradient(90deg,#e8f5e9 25%,#c8e6c9 50%,#e8f5e9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        .day-scroll::-webkit-scrollbar{height:4px;}
        .day-scroll::-webkit-scrollbar-thumb{background:#6ee7b7;border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-[#F0FFF4] via-[#FAFFF6] to-[#EEF9F4]">

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PhoneIcon/>
              <div>
                <p className="font-bold text-sm">VegVita ko Phone pe Install karo!</p>
                <p className="text-xs text-green-200">Background reminders + Offline access milega</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleInstall} className="bg-white text-green-700 font-bold text-xs px-3 py-1.5 rounded-lg">Install</button>
              <button onClick={()=>setShowInstallBanner(false)} className="text-green-200 text-xs px-2">✕</button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-green-100 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white animate-leaf"><LeafIcon/></div>
              <div>
                <h1 className="font-display font-extrabold text-green-800 text-lg leading-none">VegVita</h1>
                <p className="text-xs text-green-600">7-Day AI Diet • Reminders • PWA</p>
              </div>
            </div>
            {plan && <button onClick={handleReset} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold transition border border-green-200">← New Plan</button>}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

          {/* Hero */}
          {!plan && !loading && (
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full">
                <SparkleIcon/> 7-Day Plan • Reminders • Budget Friendly
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight mt-3">
                Your Personal<br/><span className="text-green-600">7-Day Veg Diet</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Har din alag khana + meal se 15 min pehle reminder!</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-10 text-center animate-fade-up">
              <div className="text-5xl mb-4 animate-leaf inline-block">🥗</div>
              <h3 className="font-display font-bold text-gray-800 text-xl mb-2">7-Day Plan Ban Raha Hai...</h3>
              <p className="text-gray-500 text-sm mb-6">AI har din ke liye alag meals choose kar raha hai</p>
              <div className="space-y-2 max-w-xs mx-auto">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d,i)=>(
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 text-right">{d}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${i < loadingDay ? "bg-green-500 w-full" : i === loadingDay ? "shimmer w-1/2" : "w-0"}`}/>
                    </div>
                    <span className="text-xs">{i < loadingDay ? "✅" : i === loadingDay ? "⏳" : "⬜"}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6">~15-20 seconds lagenge — please wait!</p>
            </div>
          )}

          {/* Form */}
          {!plan && !loading && (
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 space-y-5 animate-fade-up">
              <h3 className="font-display font-bold text-gray-800 text-lg">Your Profile</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Age *"><input type="number" min="1" max="70" placeholder="e.g. 28" className={inputCls} value={form.age} onChange={e=>update("age",e.target.value)}/></Field>
                <Field label="Gender *">
                  <select className={selectCls} value={form.gender} onChange={e=>update("gender",e.target.value)}>
                    <option value="">Select</option>
                    <option>Male</option><option>Female</option>
                    <option value="Child (Boy)">Child (Boy)</option>
                    <option value="Child (Girl)">Child (Girl)</option>
                  </select>
                </Field>
                <Field label="Goal *">
                  <select className={selectCls} value={form.goal} onChange={e=>update("goal",e.target.value)}>
                    <option value="">Select</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Weight Gain">Weight Gain</option>
                    <option value="Gym / Muscle Building">Gym / Muscle Building</option>
                    <option value="Maintain Health">Maintain Health</option>
                    <option value="Manage Diabetes">Manage Diabetes</option>
                    <option value="Heart Health">Heart Health</option>
                  </select>
                </Field>
                <Field label="Weight (kg)"><input type="number" placeholder="e.g. 65" className={inputCls} value={form.weight} onChange={e=>update("weight",e.target.value)}/></Field>
                <Field label="Height (cm)"><input type="number" placeholder="e.g. 170" className={inputCls} value={form.height} onChange={e=>update("height",e.target.value)}/></Field>
                <Field label="Activity Level">
                  <select className={selectCls} value={form.activityLevel} onChange={e=>update("activityLevel",e.target.value)}>
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very active">Very Active</option>
                  </select>
                </Field>
              </div>
              <Field label="Allergies / Preferences (optional)">
                <input type="text" placeholder="e.g. No onion garlic, lactose intolerant..." className={inputCls} value={form.preferences} onChange={e=>update("preferences",e.target.value)}/>
              </Field>
              <div className="border border-dashed border-green-300 rounded-2xl p-4 bg-green-50/50">
                <button onClick={()=>setShowIngredients(!showIngredients)} className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧺</span>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Budget-Friendly Mode (Optional)</p>
                      <p className="text-xs text-green-600">Ghar mein jo hai usi se plan banwao!</p>
                    </div>
                  </div>
                  <span className={`text-green-600 font-bold text-lg transition-transform ${showIngredients?"rotate-45":"rotate-0"}`}>+</span>
                </button>
                {showIngredients && (
                  <div className="mt-3">
                    <textarea rows={3} placeholder="e.g. chawal, dal, aloo, pyaz, tamatar, roti, doodh, dahi, besan, poha, banana..." className="w-full px-4 py-3 rounded-xl border border-green-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400 resize-none" value={form.availableIngredients} onChange={e=>update("availableIngredients",e.target.value)}/>
                    <p className="text-xs text-green-600 mt-1">⚡ Sirf inhi ingredients se plan banega!</p>
                  </div>
                )}
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}
              <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-display font-bold rounded-2xl text-base transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <SparkleIcon/>Generate 7-Day Diet Plan
              </button>
              <p className="text-center text-xs text-gray-400">100% Vegetarian • Groq LLaMA • Free Forever</p>
            </div>
          )}

          {/* Results */}
          {plan && !loading && (
            <div className="space-y-6 animate-fade-up">

              {/* Summary */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">🥗</div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl">7-Day Plan Ready!</h3>
                    <p className="text-green-100 text-sm mt-1">{plan.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[{label:"Calories/day",val:`${plan.dailyCalories} kcal`},{label:"Protein",val:plan.macros?.protein},{label:"Carbs",val:plan.macros?.carbs},{label:"Fats",val:plan.macros?.fats}].map((m,i)=>(
                    <div key={i} className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
                      <div className="font-bold text-base">{m.val}</div>
                      <div className="text-xs text-green-100 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-4 py-2.5">
                  <DropIcon/><span className="text-sm font-medium">{plan.hydration}</span>
                </div>
              </div>

              {/* 🔔 Notification Banner */}
              <div className={`rounded-2xl p-5 border ${notifStatus==="scheduled"?"bg-green-50 border-green-200":"bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifStatus==="scheduled"?"bg-green-500":"bg-amber-400"} text-white`}><BellIcon/></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {notifStatus==="scheduled" ? "✅ Reminders Set!" : "🔔 Meal Reminders"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {notifStatus==="scheduled"
                          ? "Har meal se 15 min pehle notification aayegi"
                          : notifStatus==="denied"
                          ? "❌ Permission deny ki — browser settings se enable karo"
                          : "Aaj ke liye har meal se 15 min pehle reminder set karo"}
                      </p>
                    </div>
                  </div>
                  {notifStatus !== "scheduled" && (
                    <button onClick={()=>scheduleNotifications(currentDay?.meals)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 flex-shrink-0">
                      <BellIcon/>Enable Reminders
                    </button>
                  )}
                </div>
                {notifStatus==="scheduled" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mealOrder.map(key=>{
                      const meal = currentDay?.meals?.[key];
                      if(!meal) return null;
                      const rt = getMealReminderTime(meal.time);
                      return(
                        <span key={key} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                          {mealTheme[key]?.emoji} {rt.toLocaleTimeString("hi-IN",{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Day Selector */}
              <div className="bg-white rounded-3xl shadow-md border border-green-100 p-5">
                <h3 className="font-display font-bold text-gray-800 text-lg mb-4">📅 Week at a Glance</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 day-scroll">
                  {plan.days?.map((day,i)=>(
                    <DayCard key={i} dayData={day} isActive={activeDay===i}
                      onClick={()=>{setActiveDay(i);setNotifStatus("idle");}}
                      colorClass={dayColors[i%dayColors.length]}/>
                  ))}
                </div>
              </div>

              {/* Current Day */}
              {currentDay && (
                <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display font-bold text-gray-800 text-lg">{currentDay.dayName} ka Plan</h3>
                      <p className="text-xs text-green-600 mt-0.5">🎯 {currentDay.theme}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>setActiveDay(Math.max(0,activeDay-1))} disabled={activeDay===0} className="w-8 h-8 rounded-full bg-green-50 text-green-700 font-bold disabled:opacity-30 hover:bg-green-100 transition">‹</button>
                      <button onClick={()=>setActiveDay(Math.min((plan.days?.length||7)-1,activeDay+1))} disabled={activeDay===(plan.days?.length||7)-1} className="w-8 h-8 rounded-full bg-green-50 text-green-700 font-bold disabled:opacity-30 hover:bg-green-100 transition">›</button>
                    </div>
                  </div>
                  {mealOrder.map((key,i)=>{
                    const meal=currentDay.meals?.[key];
                    if(!meal)return null;
                    return <MealCard key={key} mealKey={key} meal={meal} index={i}/>;
                  })}
                </div>
              )}

              {/* Shopping List */}
              {plan.shoppingList?.length>0 && (
                <div className="bg-white rounded-3xl shadow-md border border-green-100 p-5">
                  <button onClick={()=>setShowShopping(!showShopping)} className="w-full flex items-center justify-between">
                    <h4 className="font-display font-bold text-gray-800 flex items-center gap-2">
                      <BagIcon/>Weekly Shopping List
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{plan.shoppingList.length} items</span>
                    </h4>
                    <span className={`text-gray-400 transition-transform ${showShopping?"rotate-180":""}`}>▾</span>
                  </button>
                  {showShopping && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {plan.shoppingList.map((item,i)=>(
                        <div key={i} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tips + Avoid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {plan.avoidList?.length>0 && (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-red-700 mb-3">🚫 Avoid These</h4>
                    <ul className="space-y-2">{plan.avoidList.map((item,i)=><li key={i} className="flex items-start gap-2 text-sm text-red-700"><span>✕</span>{item}</li>)}</ul>
                  </div>
                )}
                {plan.weeklyTips?.length>0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-amber-700 mb-3">💡 Weekly Tips</h4>
                    <ul className="space-y-2">{plan.weeklyTips.map((tip,i)=><li key={i} className="flex items-start gap-2 text-sm text-amber-800"><span>→</span>{tip}</li>)}</ul>
                  </div>
                )}
              </div>

              {/* Reset */}
              <div className="text-center space-y-3 pb-6">
                <button onClick={handleReset} className="bg-green-600 hover:bg-green-700 text-white font-display font-bold px-8 py-3 rounded-2xl transition shadow-md">← Generate New Plan</button>
                <p className="text-xs text-gray-400">Consult a certified nutritionist before major dietary changes.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
