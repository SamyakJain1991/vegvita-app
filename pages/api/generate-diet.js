// pages/api/generate-diet.js — VegVita v4 (nutrition details + workout plan)

async function generateOneDay(dayNum, dayName, theme, profile, ingredientSection) {
  const { age, gender, goal, weight, height, activityLevel, preferences } = profile;
  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && (goal.includes("Loss") || goal.includes("Gain") || goal.includes("Gym") || goal.includes("Health"));

  const prompt = `You are an expert Indian vegetarian nutritionist and certified fitness trainer.
${ingredientSection}

Generate a meal + workout plan for ${dayName} (theme: "${theme}").
User: Age ${age}, Gender ${gender}, Goal: ${goal}, Weight: ${weight||"?"}kg, Height: ${height||"?"}cm, Activity: ${activityLevel||"moderate"}, Preferences: ${preferences||"none"}.

Respond ONLY with this exact JSON (no markdown, no extra text, no explanation):
{
  "day": ${dayNum},
  "dayName": "${dayName}",
  "theme": "${theme}",
  "meals": {
    "breakfast": {
      "time": "7:30 AM",
      "title": "Meal Title",
      "items": [
        {
          "name": "Food Name",
          "quantity": "1 bowl",
          "calories": 180,
          "benefit": "Short benefit under 8 words",
          "nutrition": { "protein": "8g", "carbs": "22g", "fat": "4g", "fiber": "3g" }
        }
      ],
      "totalCalories": 300,
      "totalNutrition": { "protein": "15g", "carbs": "40g", "fat": "8g", "fiber": "5g" },
      "prepTime": "15 mins",
      "tip": "Short tip under 12 words"
    },
    "midMorningSnack": {
      "time": "10:30 AM",
      "title": "Snack Title",
      "items": [{ "name": "Food", "quantity": "1 piece", "calories": 80, "benefit": "Benefit", "nutrition": { "protein": "3g", "carbs": "15g", "fat": "2g", "fiber": "2g" } }],
      "totalCalories": 80,
      "totalNutrition": { "protein": "3g", "carbs": "15g", "fat": "2g", "fiber": "2g" },
      "prepTime": "2 mins",
      "tip": "Short tip"
    },
    "lunch": {
      "time": "1:00 PM",
      "title": "Lunch Title",
      "items": [{ "name": "Food", "quantity": "1 bowl", "calories": 250, "benefit": "Benefit", "nutrition": { "protein": "12g", "carbs": "35g", "fat": "6g", "fiber": "4g" } }],
      "totalCalories": 500,
      "totalNutrition": { "protein": "25g", "carbs": "65g", "fat": "12g", "fiber": "8g" },
      "prepTime": "30 mins",
      "tip": "Short tip"
    },
    "eveningSnack": {
      "time": "4:30 PM",
      "title": "Snack Title",
      "items": [{ "name": "Food", "quantity": "1 cup", "calories": 100, "benefit": "Benefit", "nutrition": { "protein": "5g", "carbs": "12g", "fat": "3g", "fiber": "1g" } }],
      "totalCalories": 100,
      "totalNutrition": { "protein": "5g", "carbs": "12g", "fat": "3g", "fiber": "1g" },
      "prepTime": "5 mins",
      "tip": "Short tip"
    },
    "dinner": {
      "time": "7:30 PM",
      "title": "Dinner Title",
      "items": [{ "name": "Food", "quantity": "2 roti", "calories": 200, "benefit": "Benefit", "nutrition": { "protein": "10g", "carbs": "28g", "fat": "5g", "fiber": "3g" } }],
      "totalCalories": 450,
      "totalNutrition": { "protein": "20g", "carbs": "55g", "fat": "10g", "fiber": "6g" },
      "prepTime": "25 mins",
      "tip": "Short tip"
    }
  },
  "workout": ${needsWorkout ? `{
    "duration": "45 mins",
    "type": "Strength + Cardio",
    "warmup": { "duration": "5 mins", "exercises": ["Jumping jacks 30 sec", "Arm circles 30 sec", "Leg swings 30 sec"] },
    "mainWorkout": [
      { "name": "Exercise Name", "sets": 3, "reps": "12-15", "rest": "60 sec", "tip": "Form tip under 8 words" }
    ],
    "cooldown": { "duration": "5 mins", "exercises": ["Child pose 1 min", "Hamstring stretch 1 min"] },
    "caloriesBurned": 300,
    "intensity": "Moderate",
    "bestTime": "Morning 6-8 AM"
  }` : "null"}
}

Rules:
- Max 3 items per meal
- Nutrition values must be ACCURATE for the actual food item
- ${needsWorkout ? `Workout must match goal "${goal}": Weight Loss = more cardio, Gym/Muscle = strength training, Weight Gain = heavy compound lifts` : "workout should be null for kids"}
- All meals must be 100% vegetarian Indian food
- Keep benefit and tip SHORT
Output ONLY the JSON.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const ingredientSection = availableIngredients
    ? `IMPORTANT: Use ONLY these available ingredients: ${availableIngredients}. Be creative with combinations.`
    : `Use common Indian vegetarian ingredients. Make each day completely different.`;

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
      const dayData = await generateOneDay(d.day, d.name, d.theme, profile, ingredientSection);
      days.push(dayData);
      if (d.day < 7) await sleep(500);
    }

    let dailyCalories = 2000;
    let protein = "80g", carbs = "250g", fats = "60g";
    if (goal.includes("Loss"))  { dailyCalories = 1600; protein = "90g";  carbs = "180g"; fats = "50g"; }
    if (goal.includes("Gain") || goal.includes("Gym")) { dailyCalories = 2500; protein = "120g"; carbs = "300g"; fats = "70g"; }

    return res.status(200).json({
      success: true,
      plan: {
        summary: `Personalized 7-day vegetarian ${goal} plan for ${age}-year-old ${gender} — ${dailyCalories} kcal/day`,
        dailyCalories,
        macros: { protein, carbs, fats, fiber: "35g" },
        hydration: parseInt(age) < 12 ? "1.5 litres per day" : "2.5-3 litres per day",
        hasWorkout: !goal.includes("Health") && parseInt(age) >= 13,
        days,
        weeklyTips: [
          "Rotate grains — try jowar, bajra, ragi for variety",
          "Soak legumes overnight to improve digestion",
          "Include one raw salad with every lunch for enzymes"
        ],
        avoidList: [
          "Maida and white sugar",
          "Packaged ultra-processed snacks",
          "Deep-fried foods more than once a week"
        ],
        shoppingList: [
          "Dal (moong, masoor, chana)", "Paneer or tofu", "Seasonal vegetables",
          "Brown rice or millets", "Whole wheat atta", "Curd/yogurt",
          "Nuts and seeds", "Fresh fruits", "Besan"
        ]
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
