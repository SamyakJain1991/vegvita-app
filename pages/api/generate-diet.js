// VegVita — Groq primary, smart retry with backoff

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No valid JSON found");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGroq(prompt, model = "llama-3.1-8b-instant") {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      max_tokens: 6000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!response.ok) {
    const e = await response.json();
    throw new Error(e.error?.message || "Groq error");
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, and goal are required." });

  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && !goal.includes("Diabetes") && !goal.includes("Heart");

  const ingredientNote = availableIngredients
    ? `Use ONLY these ingredients: ${availableIngredients}.`
    : `Use common Indian vegetarian ingredients. Each day different meals.`;

  // Split into 2 calls: Days 1-4 and Days 5-7 to stay within token limits
  const makePrompt = (days) => `Indian vegetarian nutritionist. ${ingredientNote}
User: Age ${age}, Gender ${gender}, Goal: ${goal}, Weight: ${weight||"?"}kg, Height: ${height||"?"}cm, Activity: ${activityLevel||"moderate"}, Preferences: ${preferences||"none"}.

Output ONLY JSON starting with {. No markdown. Generate meal plan for these days: ${days.map(d => d.name).join(", ")}.

{"days":[{"day":1,"dayName":"Monday","theme":"High Protein","meals":{"breakfast":{"time":"7:30 AM","title":"T","items":[{"name":"F","quantity":"Q","calories":180,"benefit":"B","nutrition":{"protein":"8g","carbs":"22g","fat":"4g","fiber":"3g"}}],"totalCalories":300,"totalNutrition":{"protein":"15g","carbs":"40g","fat":"8g","fiber":"5g"},"prepTime":"15 mins","tip":"T"},"midMorningSnack":{"time":"10:30 AM","title":"T","items":[{"name":"F","quantity":"Q","calories":80,"benefit":"B","nutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"}}],"totalCalories":80,"totalNutrition":{"protein":"3g","carbs":"15g","fat":"2g","fiber":"2g"},"prepTime":"2 mins","tip":"T"},"lunch":{"time":"1:00 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":250,"benefit":"B","nutrition":{"protein":"12g","carbs":"35g","fat":"6g","fiber":"4g"}}],"totalCalories":500,"totalNutrition":{"protein":"25g","carbs":"65g","fat":"12g","fiber":"8g"},"prepTime":"30 mins","tip":"T"},"eveningSnack":{"time":"4:30 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":100,"benefit":"B","nutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"}}],"totalCalories":100,"totalNutrition":{"protein":"5g","carbs":"12g","fat":"3g","fiber":"1g"},"prepTime":"5 mins","tip":"T"},"dinner":{"time":"7:30 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":200,"benefit":"B","nutrition":{"protein":"10g","carbs":"28g","fat":"5g","fiber":"3g"}}],"totalCalories":450,"totalNutrition":{"protein":"20g","carbs":"55g","fat":"10g","fiber":"6g"},"prepTime":"25 mins","tip":"T"}},"workout":${needsWorkout ? `{"duration":"40 mins","type":"T","warmup":{"duration":"5 mins","exercises":["Ex1","Ex2"]},"mainWorkout":[{"name":"Ex","sets":3,"reps":"12","rest":"60 sec","tip":"T"},{"name":"Ex","sets":3,"reps":"12","rest":"60 sec","tip":"T"},{"name":"Ex","sets":3,"reps":"12","rest":"60 sec","tip":"T"}],"cooldown":{"duration":"5 mins","exercises":["Ex1","Ex2"]},"caloriesBurned":280,"intensity":"Moderate","bestTime":"6-8 AM"}` : "null"}}]}

Fill ONLY for days: ${days.map(d => `day ${d.day} ${d.name} theme "${d.theme}"`).join(", ")}. Use real Indian vegetarian food. Goal: ${goal}. Output only JSON.`;

  const week1 = [
    { day:1, name:"Monday",    theme:"High Protein" },
    { day:2, name:"Tuesday",   theme:"Energy & Fiber" },
    { day:3, name:"Wednesday", theme:"Light & Digestive" },
    { day:4, name:"Thursday",  theme:"Iron & Strength" },
  ];
  const week2 = [
    { day:5, name:"Friday",   theme:"Antioxidant Rich" },
    { day:6, name:"Saturday", theme:"Indulgent Healthy" },
    { day:7, name:"Sunday",   theme:"Rest & Recovery" },
  ];

  try {
    let raw1 = "", raw2 = "";

    // Call 1: Days 1-4
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        raw1 = await callGroq(makePrompt(week1));
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        await sleep(3000);
      }
    }

    // Wait between calls
    await sleep(4000);

    // Call 2: Days 5-7
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        raw2 = await callGroq(makePrompt(week2));
        break;
      } catch (e) {
        if (attempt === 2) throw e;
        await sleep(3000);
      }
    }

    const parsed1 = parseJSON(raw1);
    const parsed2 = parseJSON(raw2);
    const days = [...(parsed1.days || []), ...(parsed2.days || [])];

    if (!days.length) throw new Error("No days generated");

    let dailyCalories=2000, protein="80g", carbs="250g", fats="60g";
    if (goal.includes("Loss"))  { dailyCalories=1600; protein="90g"; carbs="180g"; fats="50g"; }
    if (goal.includes("Gain")||goal.includes("Gym")) { dailyCalories=2500; protein="120g"; carbs="300g"; fats="70g"; }

    return res.status(200).json({
      success: true,
      plan: {
        summary: `Personalized 7-day vegetarian ${goal} plan for ${age}yr ${gender} — ${dailyCalories} kcal/day`,
        dailyCalories,
        macros: { protein, carbs, fats, fiber:"35g" },
        hydration: parseInt(age)<12 ? "1.5 litres/day" : "2.5-3 litres/day",
        days,
        weeklyTips: [
          "Rotate grains — jowar, bajra, ragi for variety",
          "Soak legumes overnight for better digestion",
          "One raw salad with every lunch for enzymes"
        ],
        avoidList: ["Maida and white sugar","Packaged ultra-processed snacks","Deep-fried foods daily"],
        shoppingList: ["Dal (moong, masoor, chana)","Paneer / tofu","Seasonal vegetables","Brown rice / millets","Whole wheat atta","Curd","Nuts and seeds","Fresh fruits","Besan"]
      }
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
