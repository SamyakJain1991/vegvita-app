// VegVita v8 — OpenRouter (free, high limits) + Gemini fallback

async function callOpenRouter(prompt) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://vegvita-app.vercel.app",
      "X-Title": "VegVita Diet Agent"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      max_tokens: 8000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "OpenRouter error"); }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 8000 }
      })
    }
  );
  if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "Gemini error"); }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function parseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No valid JSON found");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && !goal.includes("Diabetes") && !goal.includes("Heart");

  const ingredientNote = availableIngredients
    ? `Use ONLY these available ingredients: ${availableIngredients}.`
    : `Use common Indian vegetarian ingredients. Each day must have different meals.`;

  const prompt = `Expert Indian vegetarian nutritionist. ${ingredientNote}
User: Age ${age}, Gender ${gender}, Goal: ${goal}, Weight: ${weight||"?"}kg, Height: ${height||"?"}cm, Activity: ${activityLevel||"moderate"}, Preferences: ${preferences||"none"}.

Output ONLY a JSON object for a 7-day vegetarian meal plan. No markdown, no explanation, start directly with {

Use this exact structure and fill all 7 days with real Indian food:
{"days":[{"day":1,"dayName":"Monday","theme":"High Protein","meals":{"breakfast":{"time":"7:30 AM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":180,"benefit":"BENEFIT","nutrition":{"protein":"8g","carbs":"22g","fat":"4g","fiber":"3g"}}],"totalCalories":300,"totalNutrition":{"protein":"15g","carbs":"40g","fat":"8g","fiber":"5g"},"prepTime":"15 mins","tip":"TIP"},"midMorningSnack":{"time":"10:30 AM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":80,"benefit":"BENEFIT","nutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"}}],"totalCalories":80,"totalNutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"},"prepTime":"2 mins","tip":"TIP"},"lunch":{"time":"1:00 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":250,"benefit":"BENEFIT","nutrition":{"protein":"12g","carbs":"35g","fat":"6g","fiber":"4g"}}],"totalCalories":500,"totalNutrition":{"protein":"25g","carbs":"65g","fat":"12g","fiber":"8g"},"prepTime":"30 mins","tip":"TIP"},"eveningSnack":{"time":"4:30 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":100,"benefit":"BENEFIT","nutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"}}],"totalCalories":100,"totalNutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"},"prepTime":"5 mins","tip":"TIP"},"dinner":{"time":"7:30 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":200,"benefit":"BENEFIT","nutrition":{"protein":"10g","carbs":"28g","fat":"5g","fiber":"3g"}}],"totalCalories":450,"totalNutrition":{"protein":"20g","carbs":"55g","fat":"10g","fiber":"6g"},"prepTime":"25 mins","tip":"TIP"}},"workout":${needsWorkout ? `{"duration":"40 mins","type":"TYPE","warmup":{"duration":"5 mins","exercises":["Ex1","Ex2"]},"mainWorkout":[{"name":"EX","sets":3,"reps":"12","rest":"60 sec","tip":"TIP"},{"name":"EX","sets":3,"reps":"12","rest":"60 sec","tip":"TIP"},{"name":"EX","sets":3,"reps":"12","rest":"60 sec","tip":"TIP"}],"cooldown":{"duration":"5 mins","exercises":["Ex1","Ex2"]},"caloriesBurned":280,"intensity":"Moderate","bestTime":"6-8 AM"}` : "null"}}]}

Fill ALL 7 days (Monday-Sunday) with different real Indian vegetarian food each day. Goal is "${goal}" so adjust calories and workout accordingly. Output ONLY the complete JSON.`;

  try {
    let raw = "";

    // Try Gemini first (primary), fallback to OpenRouter
    try {
      raw = await callGemini(prompt);
    } catch (err1) {
      console.log("Gemini failed, trying OpenRouter:", err1.message);
      try {
        raw = await callOpenRouter(prompt);
      } catch (err2) {
        throw new Error(`Gemini: ${err1.message} | OpenRouter: ${err2.message}`);
      }
    }

    const parsed = parseJSON(raw);
    if (!parsed.days?.length) throw new Error("No meal plan generated");

    let dailyCalories=2000, protein="80g", carbs="250g", fats="60g";
    if (goal.includes("Loss"))  { dailyCalories=1600; protein="90g"; carbs="180g"; fats="50g"; }
    if (goal.includes("Gain")||goal.includes("Gym")) { dailyCalories=2500; protein="120g"; carbs="300g"; fats="70g"; }

    return res.status(200).json({
      success: true,
      plan: {
        summary: `Personalized 7-day vegetarian ${goal} plan for ${age}yr ${gender} — ${dailyCalories} kcal/day`,
        dailyCalories,
        macros: { protein, carbs, fats, fiber: "35g" },
        hydration: parseInt(age) < 12 ? "1.5 litres/day" : "2.5-3 litres/day",
        days: parsed.days,
        weeklyTips: [
          "Rotate grains — jowar, bajra, ragi for variety",
          "Soak legumes overnight for better digestion",
          "One raw salad with every lunch for enzymes"
        ],
        avoidList: ["Maida and white sugar", "Packaged ultra-processed snacks", "Deep-fried foods daily"],
        shoppingList: ["Dal (moong, masoor, chana)", "Paneer / tofu", "Seasonal vegetables", "Brown rice / millets", "Whole wheat atta", "Curd", "Nuts and seeds", "Fresh fruits", "Besan"]
      }
    });
  } catch (err) {
    console.error("Final error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
