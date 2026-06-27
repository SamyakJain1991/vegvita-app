// VegVita v5 — gemini-flash free tier (no rate limit issues)

async function generateOneDay(dayNum, dayName, theme, profile, ingredientSection) {
  const { age, gender, goal, weight, height, activityLevel, preferences } = profile;
  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && !goal.includes("Diabetes") && !goal.includes("Heart");

  const prompt = `You are an expert Indian vegetarian nutritionist and fitness trainer.
${ingredientSection}

Generate a ONE DAY meal + workout plan for ${dayName} (theme: "${theme}").
User: Age ${age}, Gender ${gender}, Goal: ${goal}, Weight: ${weight||"?"}kg, Height: ${height||"?"}cm, Activity: ${activityLevel||"moderate"}, Preferences: ${preferences||"none"}.

CRITICAL: Output ONLY raw JSON. Zero markdown. Zero explanation. Start directly with {

{"day":${dayNum},"dayName":"${dayName}","theme":"${theme}","meals":{"breakfast":{"time":"7:30 AM","title":"REAL_TITLE","items":[{"name":"REAL_FOOD","quantity":"1 bowl","calories":180,"benefit":"short benefit","nutrition":{"protein":"8g","carbs":"22g","fat":"4g","fiber":"3g"}}],"totalCalories":300,"totalNutrition":{"protein":"15g","carbs":"40g","fat":"8g","fiber":"5g"},"prepTime":"15 mins","tip":"short tip"},"midMorningSnack":{"time":"10:30 AM","title":"REAL_TITLE","items":[{"name":"REAL_FOOD","quantity":"1 piece","calories":80,"benefit":"benefit","nutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"}}],"totalCalories":80,"totalNutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"},"prepTime":"2 mins","tip":"tip"},"lunch":{"time":"1:00 PM","title":"REAL_TITLE","items":[{"name":"REAL_FOOD","quantity":"1 bowl","calories":250,"benefit":"benefit","nutrition":{"protein":"12g","carbs":"35g","fat":"6g","fiber":"4g"}}],"totalCalories":500,"totalNutrition":{"protein":"25g","carbs":"65g","fat":"12g","fiber":"8g"},"prepTime":"30 mins","tip":"tip"},"eveningSnack":{"time":"4:30 PM","title":"REAL_TITLE","items":[{"name":"REAL_FOOD","quantity":"1 cup","calories":100,"benefit":"benefit","nutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"}}],"totalCalories":100,"totalNutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"},"prepTime":"5 mins","tip":"tip"},"dinner":{"time":"7:30 PM","title":"REAL_TITLE","items":[{"name":"REAL_FOOD","quantity":"2 roti","calories":200,"benefit":"benefit","nutrition":{"protein":"10g","carbs":"28g","fat":"5g","fiber":"3g"}}],"totalCalories":450,"totalNutrition":{"protein":"20g","carbs":"55g","fat":"10g","fiber":"6g"},"prepTime":"25 mins","tip":"tip"}},"workout":${needsWorkout ? `{"duration":"40 mins","type":"WORKOUT_TYPE","warmup":{"duration":"5 mins","exercises":["Jumping jacks 30 sec","Arm circles","Leg swings"]},"mainWorkout":[{"name":"EXERCISE","sets":3,"reps":"12","rest":"60 sec","tip":"form tip"}],"cooldown":{"duration":"5 mins","exercises":["Child pose 1 min","Hamstring stretch"]},"caloriesBurned":280,"intensity":"Moderate","bestTime":"Morning 6-8 AM"}` : "null"}}

Replace ALL CAPS placeholders with real Indian vegetarian food and appropriate exercises for goal "${goal}". Max 3 items per meal. Output ONLY the JSON starting with {`;

  // Use gemini via openai-compatible endpoint on groq — actually use mixtral which has higher limits
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "API error");
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON response");
  return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1));
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const ingredientSection = availableIngredients
    ? `Use ONLY these ingredients: ${availableIngredients}. Be creative.`
    : `Use common Indian vegetarian ingredients. Each day must have completely different meals.`;

  const profile = { age, gender, goal, weight, height, activityLevel, preferences };
  const weekPlan = [
    { day:1, name:"Monday",    theme:"High Protein Start" },
    { day:2, name:"Tuesday",   theme:"Energy & Fiber" },
    { day:3, name:"Wednesday", theme:"Light & Digestive" },
    { day:4, name:"Thursday",  theme:"Iron & Strength" },
    { day:5, name:"Friday",    theme:"Antioxidant Rich" },
    { day:6, name:"Saturday",  theme:"Indulgent Healthy" },
    { day:7, name:"Sunday",    theme:"Rest & Recovery" },
  ];

  try {
    const days = [];
    for (const d of weekPlan) {
      let dayData = null;
      let attempts = 0;
      while (!dayData && attempts < 3) {
        try {
          dayData = await generateOneDay(d.day, d.name, d.theme, profile, ingredientSection);
        } catch (e) {
          attempts++;
          if (attempts < 3) await sleep(3000); // retry after 3 sec
          else throw e;
        }
      }
      days.push(dayData);
      if (d.day < 7) await sleep(2000); // 2 sec between days — safe for mixtral
    }

    let dailyCalories = 2000, protein = "80g", carbs = "250g", fats = "60g";
    if (goal.includes("Loss"))  { dailyCalories=1600; protein="90g";  carbs="180g"; fats="50g"; }
    if (goal.includes("Gain") || goal.includes("Gym")) { dailyCalories=2500; protein="120g"; carbs="300g"; fats="70g"; }

    return res.status(200).json({
      success: true,
      plan: {
        summary: `Personalized 7-day vegetarian ${goal} plan for ${age}yr ${gender} — ${dailyCalories} kcal/day`,
        dailyCalories, macros: { protein, carbs, fats, fiber:"35g" },
        hydration: parseInt(age)<12 ? "1.5 litres/day" : "2.5-3 litres/day",
        days,
        weeklyTips: ["Rotate grains — jowar, bajra, ragi for variety","Soak legumes overnight for better digestion","One raw salad with every lunch for enzymes"],
        avoidList: ["Maida and white sugar","Packaged ultra-processed snacks","Deep-fried foods daily"],
        shoppingList: ["Dal (moong, masoor, chana)","Paneer / tofu","Seasonal vegetables","Brown rice / millets","Whole wheat atta","Curd","Nuts and seeds","Fresh fruits","Besan"]
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
