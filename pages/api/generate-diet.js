// pages/api/generate-diet.js — VegVita v2 (7-day + ingredients)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;

  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const ingredientSection = availableIngredients
    ? `The user has LIMITED ingredients/budget. Build the ENTIRE plan using ONLY these available items (be creative with combinations): ${availableIngredients}. Do NOT suggest any ingredient not in this list.`
    : `Use a variety of common Indian vegetarian ingredients. Rotate ingredients across days so no meal repeats.`;

  const systemPrompt = `You are an expert certified Indian nutritionist specializing in vegetarian diets for all ages (1–70 years).
You ONLY recommend 100% vegetarian food — no meat, no fish, no eggs.

${ingredientSection}

STRICT OUTPUT RULES:
- Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanation.
- Generate a FULL 7-DAY meal plan. Each day must have DIFFERENT meals — no repetition across days.
- Follow this EXACT structure:

{
  "summary": "Personalized one-line summary",
  "dailyCalories": 1800,
  "macros": { "protein": "75g", "carbs": "220g", "fats": "55g", "fiber": "30g" },
  "hydration": "2.5 litres of water per day",
  "days": [
    {
      "day": 1,
      "dayName": "Monday",
      "theme": "High Protein Start",
      "meals": {
        "breakfast": {
          "time": "7:30 AM",
          "title": "Meal title",
          "items": [
            { "name": "Food item", "quantity": "1 bowl", "calories": 180, "benefit": "Short benefit" }
          ],
          "totalCalories": 280,
          "prepTime": "15 mins",
          "tip": "One practical tip"
        },
        "midMorningSnack": {
          "time": "10:30 AM",
          "title": "Snack title",
          "items": [{ "name": "Item", "quantity": "1 piece", "calories": 80, "benefit": "Benefit" }],
          "totalCalories": 80,
          "prepTime": "2 mins",
          "tip": "Tip"
        },
        "lunch": {
          "time": "1:00 PM",
          "title": "Lunch title",
          "items": [{ "name": "Item", "quantity": "1 bowl", "calories": 200, "benefit": "Benefit" }],
          "totalCalories": 480,
          "prepTime": "30 mins",
          "tip": "Tip"
        },
        "eveningSnack": {
          "time": "4:30 PM",
          "title": "Snack title",
          "items": [{ "name": "Item", "quantity": "1 cup", "calories": 100, "benefit": "Benefit" }],
          "totalCalories": 100,
          "prepTime": "5 mins",
          "tip": "Tip"
        },
        "dinner": {
          "time": "7:30 PM",
          "title": "Dinner title",
          "items": [{ "name": "Item", "quantity": "2 roti", "calories": 180, "benefit": "Benefit" }],
          "totalCalories": 420,
          "prepTime": "25 mins",
          "tip": "Tip"
        }
      }
    }
  ],
  "weeklyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "avoidList": ["Item 1", "Item 2", "Item 3"],
  "shoppingList": ["ingredient 1", "ingredient 2", "ingredient 3"]
}

Generate ALL 7 days (Monday to Sunday) with completely different meals each day.

Key rules:
- Children (1–12): smaller portions, mild food, more dairy/fruit
- Teenagers (13–18): higher calories, iron for girls
- Adults (19–40): balanced macros, goal-oriented
- Middle-aged (41–60): high fiber, heart-healthy
- Seniors (60+): soft foods, high calcium, low sodium
- Weight Loss: 300–500 kcal deficit, high fiber
- Weight Gain: 300–500 kcal surplus, calorie-dense healthy foods
- Gym: high protein 1.6–2g/kg body weight

User profile:
- Age: ${age}, Gender: ${gender}, Goal: ${goal}
- Weight: ${weight || "not provided"} kg, Height: ${height || "not provided"} cm
- Activity: ${activityLevel || "moderate"}
- Allergies/Preferences: ${preferences || "none"}

Output ONLY the JSON. Nothing else.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 6000,
        temperature: 0.5,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate 7-day vegetarian diet plan for: Age ${age}, Gender ${gender}, Goal: ${goal}${availableIngredients ? `, using ONLY these ingredients: ${availableIngredients}` : ""}.` }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Groq API error");
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { return res.status(200).json({ error: "parse_failed", raw: cleaned }); }

    return res.status(200).json({ success: true, plan: parsed });
  } catch (err) {
    console.error("Diet Agent Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
