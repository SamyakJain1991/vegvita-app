// pages/api/generate-diet.js
// Healthy Veg Diet AI Agent — Groq API (Free Tier)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { age, gender, goal, weight, height, activityLevel, preferences } = req.body;

  if (!age || !gender || !goal) {
    return res.status(400).json({ error: "Age, gender, and goal are required." });
  }

  const systemPrompt = `You are an expert certified nutritionist and dietitian specializing in vegetarian diets for all age groups (1–70 years). 
You ONLY recommend 100% vegetarian food — no meat, no fish, no eggs.
Your task is to generate a personalized daily meal plan.

STRICT OUTPUT RULES:
- Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanation text.
- The JSON must exactly follow this structure:

{
  "summary": "One sentence personalized summary for this user",
  "dailyCalories": 1800,
  "macros": {
    "protein": "75g",
    "carbs": "220g",
    "fats": "55g",
    "fiber": "30g"
  },
  "hydration": "2.5 litres of water per day",
  "meals": {
    "breakfast": {
      "time": "7:30 AM",
      "title": "Power Breakfast",
      "items": [
        { "name": "Moong Dal Chilla", "quantity": "2 pieces", "calories": 180, "benefit": "High protein, easy to digest" },
        { "name": "Low-fat Curd", "quantity": "1 bowl (150g)", "calories": 80, "benefit": "Probiotics for gut health" },
        { "name": "Green Chutney", "quantity": "2 tbsp", "calories": 20, "benefit": "Antioxidants and iron" }
      ],
      "totalCalories": 280,
      "prepTime": "15 mins",
      "tip": "Eat within 1 hour of waking up to kickstart metabolism."
    },
    "midMorningSnack": {
      "time": "10:30 AM",
      "title": "Energy Booster",
      "items": [
        { "name": "Seasonal Fruit", "quantity": "1 medium", "calories": 70, "benefit": "Natural sugars and vitamins" },
        { "name": "Handful of Nuts", "quantity": "20g", "calories": 120, "benefit": "Healthy fats and satiety" }
      ],
      "totalCalories": 190,
      "prepTime": "2 mins",
      "tip": "Opt for locally available seasonal fruits."
    },
    "lunch": {
      "time": "1:00 PM",
      "title": "Balanced Midday Meal",
      "items": [
        { "name": "Brown Rice", "quantity": "1 cup cooked", "calories": 215, "benefit": "Complex carbs for sustained energy" },
        { "name": "Dal Tadka", "quantity": "1 bowl", "calories": 130, "benefit": "Plant-based protein powerhouse" },
        { "name": "Sabzi (Seasonal Veg)", "quantity": "1 bowl", "calories": 100, "benefit": "Micronutrients and fiber" },
        { "name": "Salad with Lemon", "quantity": "1 plate", "calories": 40, "benefit": "Enzymes and hydration" }
      ],
      "totalCalories": 485,
      "prepTime": "30 mins",
      "tip": "Sit down and eat mindfully — chew each bite 20 times."
    },
    "eveningSnack": {
      "time": "4:30 PM",
      "title": "Pre-Workout Snack",
      "items": [
        { "name": "Roasted Makhana", "quantity": "1 cup (30g)", "calories": 110, "benefit": "Low-calorie, high magnesium" },
        { "name": "Green Tea", "quantity": "1 cup", "calories": 5, "benefit": "Antioxidants and calm energy" }
      ],
      "totalCalories": 115,
      "prepTime": "5 mins",
      "tip": "Avoid heavy snacks 2 hours before dinner."
    },
    "dinner": {
      "time": "7:30 PM",
      "title": "Light Recovery Dinner",
      "items": [
        { "name": "Roti (Whole Wheat)", "quantity": "2 medium", "calories": 180, "benefit": "Fiber and B vitamins" },
        { "name": "Paneer Bhurji / Tofu Stir-fry", "quantity": "150g", "calories": 200, "benefit": "Protein for overnight muscle repair" },
        { "name": "Bottle Gourd Sabzi", "quantity": "1 bowl", "calories": 60, "benefit": "High water content, easy digestion" }
      ],
      "totalCalories": 440,
      "prepTime": "25 mins",
      "tip": "Eat dinner at least 2 hours before bedtime for better digestion."
    }
  },
  "weeklyTips": [
    "Rotate your grains — try millets like jowar, bajra, and ragi for variety.",
    "Include one raw meal per day for live enzymes.",
    "Soak legumes overnight to improve digestibility and nutrient absorption."
  ],
  "avoidList": [
    "Refined sugar and maida (white flour)",
    "Packaged and ultra-processed snacks",
    "Deep-fried foods more than once a week"
  ]
}

Customize all timings, quantities, calorie targets, and food items strictly based on:
- Age: ${age} years
- Gender: ${gender}
- Goal: ${goal}
- Weight: ${weight || "not provided"} kg
- Height: ${height || "not provided"} cm
- Activity Level: ${activityLevel || "moderate"}
- Dietary preferences / allergies: ${preferences || "none"}

Key adjustments to apply:
- Children (1–12): smaller portions, more dairy and fruit, avoid spicy food
- Teenagers (13–18): higher calories, more protein, iron for girls
- Adults (19–40): balanced macros, goal-oriented
- Middle-aged (41–60): lower refined carbs, more fiber, heart-healthy fats
- Seniors (60+): softer foods, high calcium, lower sodium, easily digestible
- Weight Loss: 300–500 calorie deficit, high fiber, high protein
- Weight Gain: 300–500 calorie surplus, frequent meals, healthy calorie-dense foods
- Gym/Muscle Building: high protein (1.6–2g per kg body weight), pre/post workout meals

Output ONLY the JSON. Nothing else.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Generate a personalized vegetarian diet plan for: Age ${age}, Gender ${gender}, Goal: ${goal}. ${preferences ? `Special notes: ${preferences}` : ""}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Groq API error");
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || "";

    // Safely parse JSON — strip any accidental markdown fences
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // If parsing fails, return the raw text with an error flag
      return res.status(200).json({ error: "parse_failed", raw: cleaned });
    }

    return res.status(200).json({ success: true, plan: parsed });
  } catch (err) {
    console.error("Diet Agent Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
