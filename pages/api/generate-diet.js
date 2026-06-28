// VegVita Final — 3 Groq calls (3+2+2 days), small prompts, always within 6000 TPM

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 4000,
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

function buildPrompt(days, profile, ingredientNote, needsWorkout) {
  const { age, gender, goal, weight, height, activityLevel, preferences } = profile;
  const dayList = days.map(d => `day${d.day}=${d.name}(${d.theme})`).join(",");

  return `Veg Indian nutritionist. ${ingredientNote} User:${age}yr ${gender}, Goal:${goal}, ${weight||"?"}kg, ${height||"?"}cm, ${activityLevel||"moderate"}, ${preferences||"none"}.
Output ONLY JSON. No markdown. Days: ${dayList}.
Template(fill ALL days with real Indian food, different each day):
{"days":[{"day":1,"dayName":"Monday","theme":"T","meals":{"breakfast":{"time":"7:30 AM","title":"T","items":[{"name":"F","quantity":"Q","calories":150,"benefit":"B","nutrition":{"protein":"8g","carbs":"20g","fat":"3g","fiber":"2g"}}],"totalCalories":280,"totalNutrition":{"protein":"12g","carbs":"35g","fat":"6g","fiber":"4g"},"prepTime":"15m","tip":"T"},"midMorningSnack":{"time":"10:30 AM","title":"T","items":[{"name":"F","quantity":"Q","calories":80,"benefit":"B","nutrition":{"protein":"3g","carbs":"12g","fat":"2g","fiber":"1g"}}],"totalCalories":80,"totalNutrition":{"protein":"3g","carbs":"12g","fat":"2g","fiber":"1g"},"prepTime":"2m","tip":"T"},"lunch":{"time":"1:00 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":200,"benefit":"B","nutrition":{"protein":"10g","carbs":"30g","fat":"5g","fiber":"3g"}}],"totalCalories":450,"totalNutrition":{"protein":"20g","carbs":"55g","fat":"10g","fiber":"6g"},"prepTime":"30m","tip":"T"},"eveningSnack":{"time":"4:30 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":90,"benefit":"B","nutrition":{"protein":"4g","carbs":"10g","fat":"2g","fiber":"1g"}}],"totalCalories":90,"totalNutrition":{"protein":"4g","carbs":"10g","fat":"2g","fiber":"1g"},"prepTime":"5m","tip":"T"},"dinner":{"time":"7:30 PM","title":"T","items":[{"name":"F","quantity":"Q","calories":180,"benefit":"B","nutrition":{"protein":"9g","carbs":"25g","fat":"4g","fiber":"3g"}}],"totalCalories":400,"totalNutrition":{"protein":"18g","carbs":"48g","fat":"8g","fiber":"5g"},"prepTime":"25m","tip":"T"}},"workout":${needsWorkout ? `{"duration":"40m","type":"T","warmup":{"duration":"5m","exercises":["Ex1","Ex2"]},"mainWorkout":[{"name":"Ex","sets":3,"reps":"12","rest":"60s","tip":"T"},{"name":"Ex","sets":3,"reps":"12","rest":"60s","tip":"T"}],"cooldown":{"duration":"5m","exercises":["Ex1","Ex2"]},"caloriesBurned":250,"intensity":"Moderate","bestTime":"6-8AM"}` : "null"}}]}
Fill for goal "${goal}". Output only JSON.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, goal required." });

  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && !goal.includes("Diabetes") && !goal.includes("Heart");
  const ingredientNote = availableIngredients ? `Use ONLY: ${availableIngredients}.` : `Use common Indian veg ingredients, different each day.`;
  const profile = { age, gender, goal, weight, height, activityLevel, preferences };

  // 3 small batches — each well under 6000 TPM
  const batches = [
    [{ day:1,name:"Monday",theme:"High Protein" }, { day:2,name:"Tuesday",theme:"Energy Boost" }, { day:3,name:"Wednesday",theme:"Light Digestive" }],
    [{ day:4,name:"Thursday",theme:"Iron Strength" }, { day:5,name:"Friday",theme:"Antioxidant" }],
    [{ day:6,name:"Saturday",theme:"Indulgent Healthy" }, { day:7,name:"Sunday",theme:"Rest Recovery" }],
  ];

  try {
    const allDays = [];

    for (let i = 0; i < batches.length; i++) {
      const prompt = buildPrompt(batches[i], profile, ingredientNote, needsWorkout);
      let raw = "";
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          raw = await callGroq(prompt);
          break;
        } catch (e) {
          if (attempt === 2) throw e;
          await sleep(4000);
        }
      }
      const parsed = parseJSON(raw);
      allDays.push(...(parsed.days || []));
      if (i < batches.length - 1) await sleep(3000); // 3 sec gap between batches
    }

    if (!allDays.length) throw new Error("No days generated");

    let dailyCalories=2000, protein="80g", carbs="250g", fats="60g";
    if (goal.includes("Loss"))  { dailyCalories=1600; protein="90g"; carbs="180g"; fats="50g"; }
    if (goal.includes("Gain")||goal.includes("Gym")) { dailyCalories=2500; protein="120g"; carbs="300g"; fats="70g"; }

    return res.status(200).json({
      success: true,
      plan: {
        summary: `7-day vegetarian ${goal} plan for ${age}yr ${gender} — ${dailyCalories} kcal/day`,
        dailyCalories,
        macros: { protein, carbs, fats, fiber:"35g" },
        hydration: parseInt(age)<12 ? "1.5 litres/day" : "2.5-3 litres/day",
        days: allDays,
        weeklyTips: ["Rotate grains — jowar, bajra, ragi","Soak legumes overnight","Raw salad with every lunch"],
        avoidList: ["Maida and white sugar","Packaged snacks","Daily deep-fried food"],
        shoppingList: ["Dal","Paneer/tofu","Seasonal vegetables","Brown rice/millets","Whole wheat atta","Curd","Nuts","Fruits","Besan"]
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
