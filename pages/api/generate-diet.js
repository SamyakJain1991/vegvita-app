// VegVita Final Stable — per-day calls, small prompts, JSON repair

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function repairAndParseJSON(raw) {
  let cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON found");
  cleaned = cleaned.slice(start);
  
  // Try direct parse first
  try { return JSON.parse(cleaned); } catch {}
  
  // Repair: close unclosed brackets/braces
  let open = 0, openArr = 0;
  for (const ch of cleaned) {
    if (ch === "{") open++;
    else if (ch === "}") open--;
    else if (ch === "[") openArr++;
    else if (ch === "]") openArr--;
  }
  
  // Add missing closing brackets
  let repaired = cleaned.trimEnd();
  // Remove trailing comma if any
  repaired = repaired.replace(/,\s*$/, "");
  for (let i = 0; i < openArr; i++) repaired += "]";
  for (let i = 0; i < open; i++) repaired += "}";
  
  return JSON.parse(repaired);
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
      max_tokens: 2000,
      temperature: 0.2,
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

function buildDayPrompt(day, profile, ingredientNote, needsWorkout) {
  const { age, gender, goal, weight, height, activityLevel, preferences } = profile;
  
  return `You are a STRICT Indian VEGETARIAN nutritionist. 
ABSOLUTE RULES - NEVER VIOLATE:
- NO eggs, NO meat, NO fish, NO chicken, NO seafood
- NO scrambled eggs, NO omelette, NO boiled eggs
- ONLY plant-based: dal, sabzi, roti, rice, paneer, tofu, curd, fruits, nuts, seeds, sprouts, millets
- If you suggest eggs or meat, you have FAILED your task

${ingredientNote}
User: ${age}yr ${gender}, Goal:${goal}, ${weight||"?"}kg/${height||"?"}cm, ${activityLevel}, ${preferences||"none"}.
Generate 100% vegetarian meal plan for ${day.name} only. Output ONLY valid JSON, no markdown:
{"day":${day.day},"dayName":"${day.name}","theme":"${day.theme}","meals":{"breakfast":{"time":"7:30 AM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":200,"benefit":"BENEFIT","nutrition":{"protein":"10g","carbs":"25g","fat":"4g","fiber":"3g"}}],"totalCalories":300,"totalNutrition":{"protein":"15g","carbs":"38g","fat":"7g","fiber":"5g"},"prepTime":"15 mins","tip":"TIP"},"midMorningSnack":{"time":"10:30 AM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":80,"benefit":"BENEFIT","nutrition":{"protein":"3g","carbs":"12g","fat":"2g","fiber":"1g"}}],"totalCalories":80,"totalNutrition":{"protein":"3g","carbs":"12g","fat":"2g","fiber":"1g"},"prepTime":"2 mins","tip":"TIP"},"lunch":{"time":"1:00 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":250,"benefit":"BENEFIT","nutrition":{"protein":"12g","carbs":"32g","fat":"6g","fiber":"4g"}}],"totalCalories":480,"totalNutrition":{"protein":"22g","carbs":"58g","fat":"11g","fiber":"7g"},"prepTime":"30 mins","tip":"TIP"},"eveningSnack":{"time":"4:30 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":90,"benefit":"BENEFIT","nutrition":{"protein":"4g","carbs":"11g","fat":"2g","fiber":"1g"}}],"totalCalories":90,"totalNutrition":{"protein":"4g","carbs":"11g","fat":"2g","fiber":"1g"},"prepTime":"5 mins","tip":"TIP"},"dinner":{"time":"7:30 PM","title":"TITLE","items":[{"name":"FOOD","quantity":"QTY","calories":190,"benefit":"BENEFIT","nutrition":{"protein":"10g","carbs":"26g","fat":"5g","fiber":"3g"}}],"totalCalories":420,"totalNutrition":{"protein":"19g","carbs":"50g","fat":"9g","fiber":"6g"},"prepTime":"25 mins","tip":"TIP"}},"workout":${needsWorkout ? `{"duration":"40 mins","type":"WORKOUT_TYPE","warmup":{"duration":"5 mins","exercises":["Jumping jacks","Arm circles"]},"mainWorkout":[{"name":"EXERCISE1","sets":3,"reps":"12","rest":"60 sec","tip":"TIP"},{"name":"EXERCISE2","sets":3,"reps":"12","rest":"60 sec","tip":"TIP"}],"cooldown":{"duration":"5 mins","exercises":["Child pose","Hamstring stretch"]},"caloriesBurned":250,"intensity":"Moderate","bestTime":"6-8 AM"}` : "null"}}
Replace TITLE/FOOD/QTY/BENEFIT/TIP/WORKOUT_TYPE/EXERCISE with real Indian vegetarian content matching goal "${goal}". Output only the JSON object.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { age, gender, goal, weight, height, activityLevel, preferences, availableIngredients } = req.body;
  if (!age || !gender || !goal) return res.status(400).json({ error: "Age, gender, goal required." });

  const isKid = parseInt(age) < 13;
  const needsWorkout = !isKid && !goal.includes("Diabetes") && !goal.includes("Heart");
  const ingredientNote = availableIngredients
    ? `Use ONLY these ingredients: ${availableIngredients}.`
    : `Use common Indian veg ingredients. Make this day unique.`;
  const profile = { age, gender, goal, weight, height, activityLevel, preferences };

  const weekDays = [
    { day:1, name:"Monday",    theme:"High Protein" },
    { day:2, name:"Tuesday",   theme:"Energy Boost" },
    { day:3, name:"Wednesday", theme:"Light Digestive" },
    { day:4, name:"Thursday",  theme:"Iron Strength" },
    { day:5, name:"Friday",    theme:"Antioxidant" },
    { day:6, name:"Saturday",  theme:"Indulgent Healthy" },
    { day:7, name:"Sunday",    theme:"Rest Recovery" },
  ];

  try {
    const allDays = [];

    for (const day of weekDays) {
      let dayData = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const prompt = buildDayPrompt(day, profile, ingredientNote, needsWorkout);
          const raw = await callGroq(prompt);
          dayData = repairAndParseJSON(raw);
          // Ensure day number is correct
          dayData.day = day.day;
          dayData.dayName = day.name;
          break;
        } catch (e) {
          if (attempt === 2) {
            // Use fallback minimal day instead of failing
            dayData = {
              day: day.day,
              dayName: day.name,
              theme: day.theme,
              meals: {
                breakfast: { time:"7:30 AM", title:"Dal Chilla", items:[{name:"Moong Dal Chilla",quantity:"2 pieces",calories:200,benefit:"High protein",nutrition:{protein:"12g",carbs:"24g",fat:"4g",fiber:"3g"}}], totalCalories:280, totalNutrition:{protein:"14g",carbs:"30g",fat:"5g",fiber:"4g"}, prepTime:"15 mins", tip:"Eat fresh" },
                midMorningSnack: { time:"10:30 AM", title:"Fruit & Nuts", items:[{name:"Banana + Almonds",quantity:"1+10",calories:180,benefit:"Energy boost",nutrition:{protein:"5g",carbs:"28g",fat:"8g",fiber:"3g"}}], totalCalories:180, totalNutrition:{protein:"5g",carbs:"28g",fat:"8g",fiber:"3g"}, prepTime:"2 mins", tip:"Stay hydrated" },
                lunch: { time:"1:00 PM", title:"Dal Rice Sabzi", items:[{name:"Brown Rice + Dal + Sabzi",quantity:"1 plate",calories:450,benefit:"Complete meal",nutrition:{protein:"18g",carbs:"65g",fat:"8g",fiber:"7g"}}], totalCalories:480, totalNutrition:{protein:"20g",carbs:"68g",fat:"9g",fiber:"8g"}, prepTime:"30 mins", tip:"Chew slowly" },
                eveningSnack: { time:"4:30 PM", title:"Makhana", items:[{name:"Roasted Makhana",quantity:"1 cup",calories:110,benefit:"Low calorie snack",nutrition:{protein:"4g",carbs:"20g",fat:"1g",fiber:"2g"}}], totalCalories:110, totalNutrition:{protein:"4g",carbs:"20g",fat:"1g",fiber:"2g"}, prepTime:"5 mins", tip:"Avoid fried snacks" },
                dinner: { time:"7:30 PM", title:"Roti Sabzi", items:[{name:"Whole Wheat Roti + Paneer Sabzi",quantity:"2+1 bowl",calories:380,benefit:"Protein rich dinner",nutrition:{protein:"18g",carbs:"42g",fat:"12g",fiber:"5g"}}], totalCalories:420, totalNutrition:{protein:"20g",carbs:"46g",fat:"13g",fiber:"6g"}, prepTime:"25 mins", tip:"Eat 2hrs before sleep" }
              },
              workout: needsWorkout ? { duration:"40 mins", type:"Full Body", warmup:{duration:"5 mins",exercises:["Jumping jacks","Arm circles"]}, mainWorkout:[{name:"Push-ups",sets:3,reps:"12",rest:"60 sec",tip:"Keep back straight"},{name:"Squats",sets:3,reps:"15",rest:"60 sec",tip:"Knees over toes"}], cooldown:{duration:"5 mins",exercises:["Child pose","Hamstring stretch"]}, caloriesBurned:250, intensity:"Moderate", bestTime:"6-8 AM" } : null
            };
          } else {
            await sleep(2000);
          }
        }
      }
      
      allDays.push(dayData);
      // Gap between days to avoid rate limit
      if (day.day < 7) await sleep(1500);
    }

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
        weeklyTips: [
          "Rotate grains — jowar, bajra, ragi for variety",
          "Soak legumes overnight for better digestion",
          "One raw salad with every lunch for enzymes"
        ],
        avoidList: ["Maida and white sugar","Packaged ultra-processed snacks","Deep-fried foods daily"],
        shoppingList: ["Dal (moong/masoor/chana)","Paneer/tofu","Seasonal vegetables","Brown rice/millets","Whole wheat atta","Curd","Nuts and seeds","Fresh fruits","Besan"]
      }
    });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
