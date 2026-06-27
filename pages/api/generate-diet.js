// pages/api/generate-diet.js — VegVita v3 (per-day calls, no rate limit issues)

async function generateOneDay(dayNum, dayName, theme, profile, ingredientSection) {
  const { age, gender, goal, weight, height, activityLevel, preferences } = profile;

  const prompt = `You are an expert Indian vegetarian nutritionist.
${ingredientSection}

Generate a single day meal plan for ${dayName} with theme "${theme}".
User: Age ${age}, Gender ${gender}, Goal ${goal}, Weight ${weight||"?"}kg, Height ${height||"?"}cm, Activity ${activityLevel||"moderate"}, Preferences: ${preferences||"none"}.

Respond ONLY with this exact JSON (no markdown, no extra text):
{"day":${dayNum},"dayName":"${dayName}","theme":"${theme}","meals":{"breakfast":{"time":"7:30 AM","title":"Title","items":[{"name":"Food","quantity":"1 bowl","calories":180,"benefit":"Benefit"}],"totalCalories":300,"prepTime":"15 mins","tip":"Tip"},"midMorningSnack":{"time":"10:30 AM","title":"Title","items":[{"name":"Food","quantity":"1 piece","calories":80,"benefit":"Benefit"}],"totalCalories":80,"prepTime":"2 mins","tip":"Tip"},"lunch":{"time":"1:00 PM","title":"Title","items":[{"name":"Food","quantity":"1 bowl","calories":250,"benefit":"Benefit"}],"totalCalories":500,"prepTime":"30 mins","tip":"Tip"},"eveningSnack":{"time":"4:30 PM","title":"Title","items":[{"name":"Food","quantity":"1 cup","calories":100,"benefit":"Benefit"}],"totalCalories":100,"prepTime":"5 mins","tip":"Tip"},"dinner":{"time":"7:30 PM","title":"Title","items":[{"name":"Food","quantity":"2 pieces","calories":200,"benefit":"Benefit"}],"totalCalories":450,"prepTime":"25 mins","tip":"Tip"}}}

Replace all Title/Food/Benefit/Tip placeholders with REAL Indian vegetarian food appropriate for the user profile and goal. Keep items array to max 3 items per meal. Output ONLY the JSON.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      temperature: 0.4,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// Small delay to avoid rate limits
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;

  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const ingredientSection = availableIngredients
    ? `IMPORTANT: Use ONLY these available ingredients: ${availableIngredients}. Be creative with combinations.`
    : `Use common Indian vegetarian ingredients. Make each day's meals completely different from other days.`;

  const profile = { age, gender, goal, weight, height, activityLevel, preferences };

  const weekPlan = [
    { day: 1, name: "Monday",    theme: "High Protein Start" },
    { day: 2, name: "Tuesday",   theme: "Energy & Fiber" },
    { day: 3, name: "Wednesday", theme: "Light & Digestive" },
    { day: 4, name: "Thursday",  theme: "Iron & Strength" },
    { day: 5, name: "Friday",    theme: "Antioxidant Rich" },
    { day: 6, name: "Saturday",  theme: "Indulgent Healthy" },
    { day: 7, name: "Sunday",    theme: "Rest & Recovery" },
  ];

  try {
    const days = [];

    for (const d of weekPlan) {
      const dayData = await generateOneDay(d.day, d.name, d.theme, profile, ingredientSection);
      days.push(dayData);
      if (d.day < 7) await sleep(500); // 500ms gap between calls
    }

    // Calculate calorie targets based on goal
    let dailyCalories = 2000;
    let protein = "80g", carbs = "250g", fats = "60g";
    if (goal.includes("Loss")) { dailyCalories = 1600; protein = "90g"; carbs = "180g"; fats = "50g"; }
    if (goal.includes("Gain") || goal.includes("Gym")) { dailyCalories = 2500; protein = "120g"; carbs = "300g"; fats = "70g"; }

    const plan = {
      summary: `Personalized 7-day vegetarian ${goal} plan for ${age}-year-old ${gender} — ${dailyCalories} kcal/day`,
      dailyCalories,
      macros: { protein, carbs, fats, fiber: "35g" },
      hydration: age < 12 ? "1.5 litres of water per day" : "2.5-3 litres of water per day",
      days,
      weeklyTips: [
        "Rotate your grains — try jowar, bajra, ragi for variety",
        "Soak legumes overnight to improve digestion and nutrition",
        "Include one raw salad with every lunch for live enzymes"
      ],
      avoidList: [
        "Maida (refined flour) and white sugar",
        "Packaged and ultra-processed snacks",
        "Deep-fried foods more than once a week"
      ],
      shoppingList: [
        "Dal (moong, masoor, chana)", "Paneer or tofu", "Seasonal vegetables",
        "Brown rice or millets", "Whole wheat atta", "Curd/yogurt",
        "Nuts and seeds", "Fresh fruits", "Besan (chickpea flour)"
      ]
    };

    return res.status(200).json({ success: true, plan });

  } catch (err) {
    console.error("Diet Agent Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
