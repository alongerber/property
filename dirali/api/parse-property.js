export const config = {
  runtime: 'edge',
};

const SYSTEM_PROMPT = `אתה מנתח מודעות נדל"ן בעברית. המשתמש ידביק טקסט גולמי של מודעת דירה (מ-Yad2, פייסבוק, או מקור אחר) ותפקידך לחלץ ממנו מידע מובנה.

החזר אך ורק אובייקט JSON תקני (ללא markdown, ללא הסברים, ללא backticks) עם השדות הבאים:

{
  "name": "כינוי קצר לנכס, לדוגמה: דירת גן ברחוב הזית 5",
  "street": "כתובת הרחוב ומספר",
  "city": "שם העיר",
  "rooms": 4.5,
  "sqm_built": 120,
  "sqm_garden": 40,
  "floor": "קרקע" או "3/8",
  "parking_spots": 1,
  "has_storage": true,
  "has_elevator": true,
  "has_mamad": true,
  "has_accessible": false,
  "price": 1750000,
  "condition": "משופצת קומפלט / חדשה מקבלן / דורשת שיפוץ / וכו׳",
  "entry_date": "תאריך כניסה כפי שמופיע במודעה, או מחרוזת ריקה",
  "broker_name": "שם המתווך אם מופיע, אחרת מחרוזת ריקה",
  "broker_phone": "טלפון המתווך אם מופיע, אחרת מחרוזת ריקה",
  "features": ["מעלית", "ממ״ד", "מחסן", "מרפסת שמש"],
  "highlights": ["נקודות חיוביות בולטות כמו: שקט, נוף פתוח, קרוב לתחבורה"],
  "risks": ["דגלים אדומים או חששות כמו: קומה גבוהה ללא מעלית, ליד כביש ראשי, חריגת בנייה"],
  "renovation_estimate": 0,
  "notes": "מידע נוסף שלא נכנס לשדות אחרים"
}

כללים חשובים:
- rooms: מספר חדרים כולל חצאי חדרים (3.5, 4, 4.5 וכו׳)
- sqm_built: שטח בנוי במ"ר. אם לא מצוין, נסה להסיק מהטקסט
- sqm_garden: שטח גינה במ"ר. אם אין גינה, החזר 0
- floor: קומה כפי שמופיעה. "קרקע" לקומת קרקע, "3/8" לקומה 3 מתוך 8
- parking_spots: מספר חניות. אם לא מצוין, החזר 0
- has_storage, has_elevator, has_mamad, has_accessible: בוליאני true/false
- price: מחיר ב-ILS כמספר שלם ללא פסיקים. אם מצוין "1,750,000" החזר 1750000
- renovation_estimate: הערכת עלות שיפוץ ב-ILS. אם הדירה משופצת או חדשה, החזר 0. אם דורשת שיפוץ, העריך בהתאם לגודל ומצב
- features: מערך של תכונות שמופיעות במודעה
- highlights: מערך של יתרונות בולטים - הסק מהטקסט נקודות חיוביות
- risks: מערך של סיכונים או חששות - הסק מהטקסט דגלים אדומים
- notes: כל מידע חשוב שלא נכנס לשדות האחרים

אם שדה לא מופיע בטקסט ואי אפשר להסיק אותו, השתמש בערך ברירת מחדל סביר (0 למספרים, מחרוזת ריקה לטקסט, false לבוליאנים, מערך ריק למערכים).

החזר רק JSON תקני. שום דבר אחר.`;

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'text field is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `נתח את מודעת הנדל"ן הבאה וחלץ ממנה את כל המידע המובנה:\n\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${errorBody}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Parse the JSON from Claude's response, handling possible markdown wrapping
    let property;
    try {
      // Try direct parse first
      property = JSON.parse(rawText);
    } catch {
      // If that fails, try to extract JSON from markdown code block
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        property = JSON.parse(jsonMatch[1].trim());
      } else {
        // Try to find JSON object in text
        const braceMatch = rawText.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          property = JSON.parse(braceMatch[0]);
        } else {
          throw new Error('Could not parse AI response as JSON');
        }
      }
    }

    return new Response(JSON.stringify({ property }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
