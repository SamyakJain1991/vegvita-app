# 🥗 VegVita — Healthy Veg Diet AI Agent

A **free-tier**, AI-powered vegetarian diet planner for everyone aged 1–70.  
Built with **Next.js + Tailwind CSS + Groq API (LLaMA 3.3 70B)**, deployed on **Vercel**.

---

## ✅ Tech Stack (100% Free)

| Layer       | Technology                          | Free Tier         |
|-------------|-------------------------------------|-------------------|
| Frontend    | Next.js 14 + Tailwind CSS           | ✅ Vercel Free     |
| AI Backend  | Groq API — LLaMA 3.3 70B Versatile  | ✅ Groq Free Tier  |
| Hosting     | Vercel                              | ✅ Free            |
| Database    | Supabase (optional, for v2)         | ✅ Free Tier       |

---

## 🚀 Local Setup (5 Minutes)

### Step 1: Clone / Create Project
```bash
npx create-next-app@latest vegvita --no-typescript --no-eslint --no-src-dir --no-app
cd vegvita
```

### Step 2: Copy All Files
Replace the contents of your project with the files provided:
- `pages/index.js` → Main UI
- `pages/api/generate-diet.js` → AI Agent API Route
- `pages/_app.js` → App wrapper
- `styles/globals.css` → Global styles
- `tailwind.config.js`, `postcss.config.js` → Tailwind setup

### Step 3: Install Dependencies
```bash
npm install
npm install -D tailwindcss postcss autoprefixer
```

### Step 4: Get Groq API Key (Free)
1. Go to https://console.groq.com
2. Sign up → Create API Key → Copy it

### Step 5: Set Environment Variable
```bash
cp .env.local.template .env.local
# Edit .env.local and paste your Groq key
```

### Step 6: Run Locally
```bash
npm run dev
# Open: http://localhost:3000
```

---

## ☁️ Deploy to Vercel (Free)

### Option A: Vercel CLI
```bash
npm i -g vercel
vercel
# Follow prompts → it auto-detects Next.js
```

### Option B: GitHub + Vercel Dashboard
1. Push your code to a GitHub repo
2. Go to https://vercel.com → New Project → Import repo
3. Add Environment Variable: `GROQ_API_KEY` = your key
4. Click Deploy → Done! 🎉

---

## 🧠 How the AI Agent Works

```
User Input (Age, Gender, Goal, Weight, Height)
         ↓
pages/api/generate-diet.js
         ↓
Strict System Prompt → Groq API (LLaMA 3.3 70B)
         ↓
Structured JSON Response:
{
  summary, dailyCalories, macros, hydration,
  meals: { breakfast, midMorningSnack, lunch, eveningSnack, dinner },
  weeklyTips, avoidList
}
         ↓
Beautiful Timeline UI on Frontend
```

---

## 🎯 Features

- ✅ 5-meal timeline (Breakfast → Snack → Lunch → Snack → Dinner)
- ✅ Dynamic calorie & macro targets per user profile
- ✅ Personalized for children, adults, seniors
- ✅ Goal-based: Weight Loss / Gain / Gym / Diabetes / Heart Health
- ✅ Allergy & preference support
- ✅ Expandable meal cards with food items, benefits, calories
- ✅ Weekly tips + avoid list
- ✅ Mobile-first, accessible design (high contrast, large touch targets)
- ✅ Zero external UI library dependencies

---

## 🔮 V2 Ideas (with Supabase)

- Save plan history per user (Supabase Auth + DB)
- Weekly plan generation (7-day rotation)
- Shopping list generator
- WhatsApp reminder integration
- BMI + TDEE calculator

---

## 📄 License
MIT — Free to use, modify, and deploy.
