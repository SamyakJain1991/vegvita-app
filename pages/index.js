// pages/index.js — VegVita v4 (nutrition details + workout plan + PWA)
import { useState, useEffect } from "react";
import Head from "next/head";

// ── Icons ──────────────────────────────────────────────────────────────────
const LeafIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2C19 4 19 8 17 8z"/></svg>);
const ClockIcon = () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
const FireIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2c0 0-5 4.5-5 9a5 5 0 0 0 10 0c0-4.5-5-9-5-9zm0 14a3 3 0 0 1-3-3c0-2 2-4.5 3-6 1 1.5 3 4 3 6a3 3 0 0 1-3 3z"/></svg>);
const ChefIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.5 3A3.5 3.5 0 0 0 15.14 6H8.86A3.5 3.5 0 1 0 5.5 10c.17 0 .33-.01.5-.03V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9.03c.17.02.33.03.5.03A3.5 3.5 0 0 0 18.5 3z"/></svg>);
const SparkIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>);
const DropIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6 10 6 13 6 14a6 6 0 0 0 12 0c0-1 0-4-6-12z"/></svg>);
const BagIcon   = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zm-9-1a2 2 0 0 1 4 0v1h-4V6z"/></svg>);
const BellIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>);
const PhoneIcon = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-5 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4H7V4h10v13z"/></svg>);
const DumbIcon  = () => (<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/></svg>);

// ── Constants ──────────────────────────────────────────────────────────────
const mealMeta = {
  breakfast:       { emoji:"🌅", color:"from-amber-50 to-orange-50",  border:"border-amber-300",  dot:"bg-amber-400",   badge:"bg-amber-100 text-amber-800",   notif:"🌅 Breakfast in 15 mins!" },
  midMorningSnack: { emoji:"🍎", color:"from-green-50 to-emerald-50", border:"border-emerald-300",dot:"bg-emerald-400", badge:"bg-emerald-100 text-emerald-800",notif:"🍎 Morning Snack in 15 mins!" },
  lunch:           { emoji:"☀️", color:"from-sky-50 to-blue-50",      border:"border-sky-300",    dot:"bg-sky-400",     badge:"bg-sky-100 text-sky-800",        notif:"☀️ Lunch in 15 mins!" },
  eveningSnack:    { emoji:"🌿", color:"from-violet-50 to-purple-50", border:"border-violet-300", dot:"bg-violet-400",  badge:"bg-violet-100 text-violet-800",  notif:"🌿 Evening Snack in 15 mins!" },
  dinner:          { emoji:"🌙", color:"from-indigo-50 to-slate-50",  border:"border-indigo-300", dot:"bg-indigo-500",  badge:"bg-indigo-100 text-indigo-900",  notif:"🌙 Dinner in 15 mins!" },
};
const mealOrder   = ["breakfast","midMorningSnack","lunch","eveningSnack","dinner"];
const dayColors   = ["bg-green-600","bg-emerald-600","bg-teal-600","bg-cyan-600","bg-sky-600","bg-blue-600","bg-violet-600"];
const intensityColor = { Low:"bg-green-100 text-green-700", Moderate:"bg-yellow-100 text-yellow-700", High:"bg-orange-100 text-orange-700", "Very High":"bg-red-100 text-red-700" };

// ── Helpers ────────────────────────────────────────────────────────────────
function getReminderTime(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period==="PM" && h!==12) h+=12;
  if (period==="AM" && h===12) h=0;
  const d = new Date(); d.setHours(h,m,0,0);
  return new Date(d.getTime()-15*60*1000);
}

// ── Nutrition Bar ──────────────────────────────────────────────────────────
function NutriBadge({ label, value, color }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${color} text-xs font-semibold`}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}

// ── Meal Card ──────────────────────────────────────────────────────────────
function MealCard({ mealKey, meal, index }) {
  const [open, setOpen] = useState(index===0);
  const [showNutrition, setShowNutrition] = useState(false);
  const meta = mealMeta[mealKey] || mealMeta.lunch;
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full ${meta.dot} flex items-center justify-center text-white text-base shadow-md z-10 flex-shrink-0`}>{meta.emoji}</div>
        {index<mealOrder.length-1 && <div className="w-0.5 bg-gradient-to-b from-green-300 to-green-100 flex-1 mt-1 min-h-[28px]"/>}
      </div>
      <div className={`flex-1 mb-4 rounded-2xl border ${meta.border} bg-gradient-to-br ${meta.color} shadow-sm overflow-hidden`}>
        {/* Header */}
        <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-gray-800 text-sm">{meal.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${meta.badge}`}>{meal.totalCalories} kcal</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-1"><ClockIcon/>{meal.time}</span>
              <span className="flex items-center gap-1"><ChefIcon/>{meal.prepTime}</span>
            </div>
          </div>
          <span className={`text-gray-400 transition-transform ${open?"rotate-180":""}`}>▾</span>
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-2">
            {/* Meal total nutrition */}
            {meal.totalNutrition && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <NutriBadge label="P:" value={meal.totalNutrition.protein} color="bg-blue-100 text-blue-700"/>
                <NutriBadge label="C:" value={meal.totalNutrition.carbs}   color="bg-yellow-100 text-yellow-700"/>
                <NutriBadge label="F:" value={meal.totalNutrition.fat}     color="bg-orange-100 text-orange-700"/>
                <NutriBadge label="Fi:" value={meal.totalNutrition.fiber}  color="bg-green-100 text-green-700"/>
              </div>
            )}

            {/* Food items */}
            {meal.items?.map((item,i)=>(
              <div key={i} className="bg-white/70 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.quantity}</span>
                    </div>
                    <p className="text-xs text-green-700 mt-0.5">{item.benefit}</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-bold flex-shrink-0">
                    <FireIcon/>{item.calories}
                  </div>
                </div>
                {/* Per-item nutrition */}
                {item.nutrition && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">P {item.nutrition.protein}</span>
                    <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-md">C {item.nutrition.carbs}</span>
                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md">F {item.nutrition.fat}</span>
                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-md">Fi {item.nutrition.fiber}</span>
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5">
              <span className="text-green-600 flex-shrink-0">💡</span>
              <p className="text-xs text-gray-600 italic">{meal.tip}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Workout Card ───────────────────────────────────────────────────────────
function WorkoutCard({ workout }) {
  const [open, setOpen] = useState(true);
  if (!workout) return null;
  return (
    <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-3xl shadow-xl overflow-hidden text-white">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center"><DumbIcon/></div>
          <div>
            <h3 className="font-display font-bold text-lg">Aaj ka Workout 💪</h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-300">{workout.type}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-300">{workout.duration}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${intensityColor[workout.intensity]||"bg-gray-700 text-gray-300"}`}>{workout.intensity}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-orange-400 font-bold">{workout.caloriesBurned}</div>
            <div className="text-xs text-gray-400">kcal burn</div>
          </div>
          <span className={`text-gray-400 transition-transform ${open?"rotate-180":""}`}>▾</span>
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4">
          {/* Best time */}
          <div className="flex items-center gap-2 bg-orange-500/20 rounded-xl px-4 py-2.5">
            <span>⏰</span>
            <span className="text-sm font-medium text-orange-300">Best time: {workout.bestTime}</span>
          </div>

          {/* Warmup */}
          {workout.warmup && (
            <div className="bg-white/5 rounded-2xl p-4">
              <h4 className="font-semibold text-green-400 mb-2 text-sm">🔥 Warmup — {workout.warmup.duration}</h4>
              <div className="flex flex-wrap gap-2">
                {workout.warmup.exercises?.map((ex,i)=>(
                  <span key={i} className="text-xs bg-green-900/40 text-green-300 px-3 py-1 rounded-full">{ex}</span>
                ))}
              </div>
            </div>
          )}

          {/* Main Workout */}
          <div className="space-y-2">
            <h4 className="font-semibold text-orange-400 text-sm">💥 Main Workout</h4>
            {workout.mainWorkout?.map((ex,i)=>(
              <div key={i} className="bg-white/5 rounded-xl p-3 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-semibold text-white text-sm">{ex.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-300">{ex.sets} sets × {ex.reps}</span>
                      <span className="text-xs text-gray-400">Rest: {ex.rest}</span>
                    </div>
                  </div>
                  {ex.tip && <p className="text-xs text-gray-400 mt-1 italic">💡 {ex.tip}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Cooldown */}
          {workout.cooldown && (
            <div className="bg-white/5 rounded-2xl p-4">
              <h4 className="font-semibold text-blue-400 mb-2 text-sm">🧘 Cooldown — {workout.cooldown.duration}</h4>
              <div className="flex flex-wrap gap-2">
                {workout.cooldown.exercises?.map((ex,i)=>(
                  <span key={i} className="text-xs bg-blue-900/40 text-blue-300 px-3 py-1 rounded-full">{ex}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Day Selector Button ────────────────────────────────────────────────────
function DayCard({ dayData, isActive, onClick, colorClass }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-2.5 rounded-2xl font-bold text-sm transition-all ${isActive?`${colorClass} text-white shadow-md scale-105`:"bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}>
      <div>{dayData.dayName?.slice(0,3)}</div>
      <div className="text-xs font-normal mt-0.5 opacity-80">{dayData.theme?.split(" ").slice(0,2).join(" ")}</div>
    </button>
  );
}

// ── Form Helpers ───────────────────────────────────────────────────────────
const inputCls  = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition placeholder-gray-400";
const selectCls = inputCls;
const Field = ({label,children}) => (<div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-700">{label}</label>{children}</div>);

// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [form, setForm]               = useState({age:"",gender:"",goal:"",weight:"",height:"",activityLevel:"moderate",preferences:"",availableIngredients:""});
  const [showIngredients, setShowIng] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [plan, setPlan]               = useState(null);
  const [error, setError]             = useState("");
  const [activeDay, setActiveDay]     = useState(0);
  const [showShopping, setShowShop]   = useState(false);
  const [activeTab, setActiveTab]     = useState("diet"); // "diet" | "workout"
  const [notifStatus, setNotif]       = useState("idle");
  const [swReady, setSwReady]         = useState(false);
  const [installPrompt, setInstall]   = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  const update = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").then(()=>setSwReady(true)).catch(()=>{});
    }
    window.addEventListener("beforeinstallprompt",(e)=>{e.preventDefault();setInstall(e);setShowInstall(true);});
  },[]);

  const handleInstall = async () => {
    if(!installPrompt) return;
    installPrompt.prompt();
    const {outcome} = await installPrompt.userChoice;
    if(outcome==="accepted") setShowInstall(false);
  };

  const scheduleNotifs = async (meals) => {
    if(!("Notification" in window)){alert("Browser notifications support nahi karta.");return;}
    const perm = await Notification.requestPermission();
    if(perm!=="granted"){setNotif("denied");return;}
    setNotif("granted");
    const now = new Date();
    const scheduled = [];
    mealOrder.forEach(key=>{
      const meal = meals?.[key];
      if(!meal?.time) return;
      const rt = getReminderTime(meal.time);
      const delay = rt.getTime()-now.getTime();
      if(delay>0) scheduled.push({title:mealMeta[key]?.notif||"VegVita",body:`${meal.title} — ${meal.totalCalories} kcal taiyaar karein! 🥗`,delay,tag:key});
    });
    if(scheduled.length===0){alert("Aaj ke baaki meals ke liye koi reminder nahi bacha!");return;}
    if(swReady && navigator.serviceWorker.controller){
      navigator.serviceWorker.controller.postMessage({type:"SCHEDULE_NOTIFICATIONS",meals:scheduled});
    } else {
      scheduled.forEach(({title,body,delay})=>setTimeout(()=>new Notification(title,{body,icon:"/icon-192.png"}),delay));
    }
    setNotif("scheduled");
    alert(`✅ ${scheduled.length} reminders set! Har meal se 15 min pehle notification aayegi.`);
  };

  const handleGenerate = async () => {
    if(!form.age||!form.gender||!form.goal){setError("Age, Gender aur Goal zaroori hain.");return;}
    setError("");setLoading(true);setPlan(null);setActiveDay(0);setNotif("idle");setActiveTab("diet");
    try {
      const res = await fetch("/api/generate-diet",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data = await res.json();
      if(data.success&&data.plan) setPlan(data.plan);
      else setError(data.error||"Kuch gadbad hui. Dobara try karo.");
    } catch { setError("Network error. Connection check karo."); }
    finally { setLoading(false); }
  };

  const handleReset = () => {setPlan(null);setError("");setActiveDay(0);setNotif("idle");setActiveTab("diet");setForm({age:"",gender:"",goal:"",weight:"",height:"",activityLevel:"moderate",preferences:"",availableIngredients:""});};

  const currentDay = plan?.days?.[activeDay];

  return (
    <>
      <Head>
        <title>VegVita — 7-Day Diet + Workout AI</title>
        <meta name="description" content="AI-powered 7-day vegetarian diet + workout planner"/>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500&display=swap" rel="stylesheet"/>
      </Head>
      <style jsx global>{`
        body{font-family:'Inter',sans-serif;background:#F0FFF4;}
        .font-display{font-family:'Plus Jakarta Sans',sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse-leaf{0%,100%{transform:scale(1) rotate(-5deg);}50%{transform:scale(1.15) rotate(5deg);}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        .animate-fade-up{animation:fadeUp 0.4s ease forwards;}
        .animate-leaf{animation:pulse-leaf 1.5s ease-in-out infinite;}
        .shimmer{background:linear-gradient(90deg,#e8f5e9 25%,#c8e6c9 50%,#e8f5e9 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
        .day-scroll::-webkit-scrollbar{height:4px;}
        .day-scroll::-webkit-scrollbar-thumb{background:#6ee7b7;border-radius:2px;}
      `}</style>

      <main className="min-h-screen bg-gradient-to-br from-[#F0FFF4] via-[#FAFFF6] to-[#EEF9F4]">

        {/* PWA Install Banner */}
        {showInstall && (
          <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PhoneIcon/>
              <div>
                <p className="font-bold text-sm">Phone pe Install karo!</p>
                <p className="text-xs text-green-200">Background reminders + Offline access</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleInstall} className="bg-white text-green-700 font-bold text-xs px-3 py-1.5 rounded-lg">Install</button>
              <button onClick={()=>setShowInstall(false)} className="text-green-200 text-lg leading-none">✕</button>
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
                <p className="text-xs text-green-600">Diet + Workout + Reminders</p>
              </div>
            </div>
            {plan && <button onClick={handleReset} className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-semibold border border-green-200">← New Plan</button>}
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {/* Hero */}
          {!plan && !loading && (
            <div className="text-center space-y-2 pt-2 animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full">
                <SparkIcon/> Diet + Workout + Nutrition + Reminders
              </div>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight mt-3">
                Complete<br/><span className="text-green-600">7-Day Veg Plan</span>
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">Diet + Workout + Nutrition breakdown — ek jagah sab kuch!</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-10 text-center animate-fade-up">
              <div className="text-5xl mb-4 animate-leaf inline-block">🥗</div>
              <h3 className="font-display font-bold text-gray-800 text-xl mb-1">Plan Ban Raha Hai...</h3>
              <p className="text-gray-500 text-sm mb-6">Diet + Workout + Nutrition — sab ek saath</p>
              <div className="space-y-2 max-w-xs mx-auto">
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d,i)=>(
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20 text-right">{d}</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="shimmer h-full rounded-full w-full"/>
                    </div>
                    <span className="text-xs">⏳</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-6">~20-25 seconds — please wait!</p>
            </div>
          )}

          {/* Form */}
          {!plan && !loading && (
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 space-y-5 animate-fade-up">
              <h3 className="font-display font-bold text-gray-800 text-lg">Apna Profile Daalo</h3>
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
                    <option value="Weight Loss">⬇️ Weight Loss</option>
                    <option value="Weight Gain">⬆️ Weight Gain</option>
                    <option value="Gym / Muscle Building">💪 Gym / Muscle</option>
                    <option value="Maintain Health">✅ Maintain Health</option>
                    <option value="Manage Diabetes">🩺 Manage Diabetes</option>
                    <option value="Heart Health">❤️ Heart Health</option>
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
                <button onClick={()=>setShowIng(!showIngredients)} className="w-full flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧺</span>
                    <div>
                      <p className="font-semibold text-green-800 text-sm">Budget-Friendly Mode (Optional)</p>
                      <p className="text-xs text-green-600">Ghar mein jo hai usi se plan banwao!</p>
                    </div>
                  </div>
                  <span className={`text-green-600 font-bold text-lg transition-transform duration-200 ${showIngredients?"rotate-45":""}`}>+</span>
                </button>
                {showIngredients && (
                  <div className="mt-3">
                    <textarea rows={3} placeholder="e.g. chawal, dal, aloo, tamatar, roti, doodh, dahi, besan, poha, banana..." className="w-full px-4 py-3 rounded-xl border border-green-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder-gray-400 resize-none" value={form.availableIngredients} onChange={e=>update("availableIngredients",e.target.value)}/>
                    <p className="text-xs text-green-600 mt-1">⚡ Sirf inhi ingredients se plan banega!</p>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

              <button onClick={handleGenerate} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-display font-bold rounded-2xl text-base transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2">
                <SparkIcon/>Generate Diet + Workout Plan
              </button>
              <p className="text-center text-xs text-gray-400">100% Veg • Groq LLaMA • Free Forever</p>
            </div>
          )}

          {/* ── RESULTS ────────────────────────────────────────────────── */}
          {plan && !loading && (
            <div className="space-y-5 animate-fade-up">

              {/* Summary Banner */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-4xl">🥗</div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl">7-Day Plan Ready!</h3>
                    <p className="text-green-100 text-sm mt-1">{plan.summary}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[{l:"Calories/day",v:`${plan.dailyCalories} kcal`},{l:"Protein",v:plan.macros?.protein},{l:"Carbs",v:plan.macros?.carbs},{l:"Fats",v:plan.macros?.fats}].map((m,i)=>(
                    <div key={i} className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
                      <div className="font-bold">{m.v}</div>
                      <div className="text-xs text-green-100">{m.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 bg-white/10 rounded-xl px-4 py-2.5">
                  <DropIcon/><span className="text-sm">{plan.hydration}</span>
                </div>
              </div>

              {/* Notification Banner */}
              <div className={`rounded-2xl p-4 border ${notifStatus==="scheduled"?"bg-green-50 border-green-200":"bg-amber-50 border-amber-200"}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notifStatus==="scheduled"?"bg-green-500":"bg-amber-400"} text-white`}><BellIcon/></div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{notifStatus==="scheduled"?"✅ Reminders Set!":"🔔 Meal Reminders"}</p>
                      <p className="text-xs text-gray-600">{notifStatus==="scheduled"?"Har meal se 15 min pehle notification aayegi":notifStatus==="denied"?"Permission deny — browser settings se enable karo":"Har meal se 15 min pehle reminder set karo"}</p>
                    </div>
                  </div>
                  {notifStatus!=="scheduled" && (
                    <button onClick={()=>scheduleNotifs(currentDay?.meals)} className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-4 py-2 rounded-xl transition flex items-center gap-2 flex-shrink-0">
                      <BellIcon/>Enable
                    </button>
                  )}
                </div>
              </div>

              {/* Day Selector */}
              <div className="bg-white rounded-3xl shadow-md border border-green-100 p-5">
                <h3 className="font-display font-bold text-gray-800 mb-3">📅 Week at a Glance</h3>
                <div className="flex gap-2 overflow-x-auto pb-1 day-scroll">
                  {plan.days?.map((day,i)=>(
                    <DayCard key={i} dayData={day} isActive={activeDay===i}
                      onClick={()=>{setActiveDay(i);setNotif("idle");setActiveTab("diet");}}
                      colorClass={dayColors[i%dayColors.length]}/>
                  ))}
                </div>
              </div>

              {/* Diet / Workout Tab */}
              {currentDay && (
                <div className="bg-white rounded-3xl shadow-md border border-green-100 overflow-hidden">
                  {/* Tab header */}
                  <div className="flex border-b border-gray-100">
                    <button onClick={()=>setActiveTab("diet")}
                      className={`flex-1 py-3.5 font-display font-bold text-sm transition ${activeTab==="diet"?"bg-green-600 text-white":"text-gray-500 hover:bg-gray-50"}`}>
                      🥗 Diet Plan
                    </button>
                    {currentDay.workout && (
                      <button onClick={()=>setActiveTab("workout")}
                        className={`flex-1 py-3.5 font-display font-bold text-sm transition ${activeTab==="workout"?"bg-gray-900 text-white":"text-gray-500 hover:bg-gray-50"}`}>
                        💪 Workout Plan
                      </button>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Day title */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-display font-bold text-gray-800 text-lg">{currentDay.dayName} ka Plan</h3>
                        <p className="text-xs text-green-600">🎯 {currentDay.theme}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>setActiveDay(Math.max(0,activeDay-1))} disabled={activeDay===0} className="w-8 h-8 rounded-full bg-green-50 text-green-700 font-bold disabled:opacity-30 hover:bg-green-100">‹</button>
                        <button onClick={()=>setActiveDay(Math.min((plan.days?.length||7)-1,activeDay+1))} disabled={activeDay===(plan.days?.length||7)-1} className="w-8 h-8 rounded-full bg-green-50 text-green-700 font-bold disabled:opacity-30 hover:bg-green-100">›</button>
                      </div>
                    </div>

                    {/* Diet Tab */}
                    {activeTab==="diet" && mealOrder.map((key,i)=>{
                      const meal = currentDay.meals?.[key];
                      if(!meal) return null;
                      return <MealCard key={key} mealKey={key} meal={meal} index={i}/>;
                    })}

                    {/* Workout Tab */}
                    {activeTab==="workout" && currentDay.workout && (
                      <WorkoutCard workout={currentDay.workout}/>
                    )}
                  </div>
                </div>
              )}

              {/* Shopping List */}
              {plan.shoppingList?.length>0 && (
                <div className="bg-white rounded-3xl shadow-md border border-green-100 p-5">
                  <button onClick={()=>setShowShop(!showShopping)} className="w-full flex items-center justify-between">
                    <h4 className="font-display font-bold text-gray-800 flex items-center gap-2">
                      <BagIcon/>Weekly Shopping List
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{plan.shoppingList.length} items</span>
                    </h4>
                    <span className={`text-gray-400 transition-transform ${showShopping?"rotate-180":""}`}>▾</span>
                  </button>
                  {showShopping && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {plan.shoppingList.map((item,i)=>(
                        <div key={i} className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2">
                          <span className="text-green-500 text-sm">✓</span>
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
                    <ul className="space-y-2">{plan.avoidList.map((x,i)=><li key={i} className="flex gap-2 text-sm text-red-700"><span>✕</span>{x}</li>)}</ul>
                  </div>
                )}
                {plan.weeklyTips?.length>0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                    <h4 className="font-display font-bold text-amber-700 mb-3">💡 Weekly Tips</h4>
                    <ul className="space-y-2">{plan.weeklyTips.map((x,i)=><li key={i} className="flex gap-2 text-sm text-amber-800"><span>→</span>{x}</li>)}</ul>
                  </div>
                )}
              </div>

              <div className="text-center pb-6">
                <button onClick={handleReset} className="bg-green-600 hover:bg-green-700 text-white font-display font-bold px-8 py-3 rounded-2xl shadow-md transition">← Generate New Plan</button>
                <p className="text-xs text-gray-400 mt-3">Certified nutritionist se consult karein major changes se pehle.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
