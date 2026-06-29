const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ── Helper: build expense summary text for context ─────────────────────────
const buildExpenseContext = (expenses = []) => {
  if (!expenses.length) return 'No expenses recorded yet.';

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const breakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => `  • ${cat}: ₹${amt}`)
    .join('\n');

  const recent = expenses.slice(0, 15).map(e =>
    `  • ${e.category} — ₹${e.amount}${e.description ? ` (${e.description})` : ''} on ${new Date(e.date).toLocaleDateString('en-IN')}`
  ).join('\n');

  return `Total spent: ₹${total}
Category breakdown:
${breakdown}
Recent expenses:
${recent}`;
};

// ── CHAT — answer questions about expenses ─────────────────────────────────
const chat = async (req, res) => {
  try {
    const { message, expenses, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const expenseContext = buildExpenseContext(expenses);

    // FIX: Structure the system instruction as an object containing a parts array
    const systemInstruction = {
      parts: [{ 
        text: `You are a helpful personal expense tracking assistant for an Indian user. 
You help users understand their spending habits and give practical, specific money-saving advice.
Always use Indian Rupee (₹) for amounts.
Keep responses concise — 2 to 4 sentences unless a detailed breakdown is asked for.
Be friendly and encouraging. If the user writes in Tamil or Tanglish, respond in simple English.` 
      }]
    };

    // Build the conversation turns for Gemini's format
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chatSession = model.startChat({
      systemInstruction, // Fixed system instruction object passed here
      history: geminiHistory,
    });

    // The current message includes the expense context
    const fullMessage = `My current expense data:
${expenseContext}

User question: ${message}`;

    const result = await chatSession.sendMessage(fullMessage);
    const reply = result.response.text();

    res.status(200).json({ reply });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'AI service error. Please try again.' });
  }
};

// ── PARSE VOICE — extract expense fields from Tamil/Tanglish/English text ──
const parseVoice = async (req, res) => {
  try {
    const { transcript, recentExpenses = [] } = req.body;

    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }

    const recentContext = recentExpenses.slice(0, 5)
      .map(e => `${e.category}: ₹${e.amount}`)
      .join(', ');

    const prompt = `Extract expense details from this text. The user may be speaking Tamil, Tanglish (Tamil in English letters), English, or a mix.

Text: "${transcript}"
Recent expenses for context: ${recentContext || 'none'}

Rules:
- amount: extract the numeric rupee amount (number only, no ₹ symbol)
- category: must be exactly one of: food, travel, shopping, bills, entertainment, other
- description: a short English description of what was bought (2-4 words max)

Common Tamil/Tanglish patterns:
- "paal" or "பால்" = milk = food
- "saapadu" or "சாப்பாடு" = food
- "bus" or "auto" or "ola" = travel  
- "light bill" or "current" or "மின்சாரம்" = bills
- Numbers: "nooru"=100, "aayiram"=1000, "irubadu"=20, "aimbadu"=50

Examples:
- "inniku 2 paal vaangunean 60 aachu" → bought 2 milk today for 60
- "நூறு ரூபாய் சாப்பாடு" → 100 rupees food
- "auto 45 rupees" → 45 travel auto
- "500 rent paid" → 500 bills rent

Respond ONLY with raw JSON, no markdown, no explanation:
{"amount": <number or null>, "category": "<category or null>", "description": "<short description or null>"}`;

    // Optimization: Tell the model to explicitly return JSON schema
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
    
    const text = result.response.text().trim();

    // Strip any accidental markdown code fences just in case
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json({
      amount: parsed.amount || null,
      category: parsed.category || 'other',
      description: parsed.description || '',
      transcript,
    });

  } catch (error) {
    console.error('Voice parse error:', error);
    // Graceful fallback — don't crash, return what we can
    res.status(200).json({
      amount: null,
      category: 'other',
      description: req.body.transcript || '',
      transcript: req.body.transcript || '',
    });
  }
};

module.exports = { chat, parseVoice };