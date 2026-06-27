// VegVita v7 — Single API call for full 7-day plan (no rate limit issues)

async function callGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 8000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "Groq error"); }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

  // ONE single prompt for all 7 days — avoids per-minute rate limits completely
  const prompt = `You are an expert Indian vegetarian nutritionist and fitness trainer.
${ingredientNote}
User: Age ${age}, Gender ${gender}, Goal: ${goal}, Weight: ${weight||"?"}kg, Height: ${height||"?"}cm, Activity: ${activityLevel||"moderate"}, Preferences/Allergies: ${preferences||"none"}.

Generate a complete 7-day vegetarian meal plan. Output ONLY a JSON object. No markdown, no explanation.

Rules:
- Each day MUST have completely different meals
- Max 2 food items per meal to keep response short
- All food must be 100% vegetarian Indian food
- Nutrition values must be accurate
- ${needsWorkout ? `Include workout for each day matching goal: "${goal}" (Weight Loss=cardio, Gym=strength, Gain=heavy compound)` : "Set workout to null for all days"}
- Keep all text fields SHORT (under 8 words)

Required JSON structure:
{
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "theme": "High Protein Start",
      "meals": {
        "breakfast": {
          "time": "7:30 AM",
          "title": "meal title",
          "items": [
            {"name": "food name", "quantity": "1 bowl", "calories": 180, "benefit": "short benefit", "nutrition": {"protein": "8g", "carbs": "22g", "fat": "4g", "fiber": "3g"}}
          ],
          "totalCalories": 300,
          "totalNutrition": {"protein": "15g", "carbs": "40g", "fat": "8g", "fiber": "5g"},
          "prepTime": "15 mins",
          "tip": "short tip"
        },
        "midMorningSnack": {"time": "10:30 AM", "title": "title", "items": [{"name": "food", "quantity": "1 piece", "calories": 80, "benefit": "benefit", "nutrition": {"protein": "3g", "carbs": "15g", "fat": "2g", "fiber": "2g"}}], "totalCalories": 80, "totalNutrition": {"protein": "3g", "carbs": "15g", "fat": "2g", "fiber": "2g"}, "prepTime": "2 mins", "tip": "tip"},
        "lunch": {"time": "1:00 PM", "title": "title", "items": [{"name": "food", "quantity": "1 bowl", "calories": 250, "benefit": "benefit", "nutrition": {"protein": "12g", "carbs": "35g", "fat": "6g", "fiber": "4g"}}], "totalCalories": 500, "totalNutrition": {"protein": "25g", "carbs": "65g", "fat": "12g", "fiber": "8g"}, "prepTime": "30 mins", "tip": "tip"},
        "eveningSnack": {"time": "4:30 PM", "title": "title", "items": [{"name": "food", "quantity": "1 cup", "calories": 100, "benefit": "benefit", "nutrition": {"protein": "5g", "carbs": "12g", "fat": "3g", "fiber": "1g"}}], "totalCalories": 100, "totalNutrition": {"protein": "5g", "carbs": "12g", "fat": "3g", "fiber": "1g"}, "prepTime": "5 mins", "tip": "tip"},
        "dinner": {"time": "7:30 PM", "title": "title", "items": [{"name": "food", "quantity": "2 roti", "calories": 200, "benefit": "benefit", "nutrition": {"protein": "10g", "carbs": "28g", "fat": "5g", "fiber": "3g"}}], "totalCalories": 450, "totalNutrition": {"protein": "20g", "carbs": "55g", "fat": "10g", "fiber": "6g"}, "prepTime": "25 mins", "tip": "tip"}
      },
      "workout": ${needsWorkout ? `{
        "duration": "40 mins",
        "type": "workout type",
        "warmup": {"duration": "5 mins", "exercises": ["Jumping jacks 30 sec", "Arm circles"]},
        "mainWorkout": [
          {"name": "exercise name", "sets": 3, "reps": "12-15", "rest": "60 sec", "tip": "form tip"}
        ],
        "cooldown": {"duration": "5 mins", "exercises": ["Child pose 1 min", "Hamstring stretch"]},
        "caloriesBurned": 280,
        "intensity": "Moderate",
        "bestTime": "Morning 6-8 AM"
      }` : "null"}
    }
  ]
}

Generate all 7 days (Monday to Sunday) with real Indian food. Output ONLY the JSON.`;

  try {
    let raw = "";

    // Try Groq first, fallback to Gemini
    try {
      raw = await callGroq(prompt);
    } catch (groqErr) {
      console.log("Groq failed, trying Gemini:", groqErr.message);
      try {
        raw = await callGemini(prompt);
      } catch (geminiErr) {
        throw new Error(`Both APIs failed. Groq: ${groqErr.message} | Gemini: ${geminiErr.message}`);
      }
    }

    const parsed = parseJSON(raw);
    const days = parsed.days;
    if (!days || days.length === 0) throw new Error("No days in response");

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
        days,
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
