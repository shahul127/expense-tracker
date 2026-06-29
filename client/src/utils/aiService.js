import api from '../api/axios';

// ── Parse voice transcript via backend ────────────────────────────────────
export async function parseExpenseWithAI(transcript, expenses = []) {
  try {
    const res = await api.post('/ai/parse-voice', {
      transcript,
      recentExpenses: expenses.slice(0, 5),
    });
    return res.data;
  } catch (err) {
    console.error('Voice parse error:', err);
    // Fallback so the form doesn't break
    return {
      amount: null,
      category: 'other',
      description: transcript,
      transcript,
    };
  }
}

// ── Ask a question about expenses via backend ─────────────────────────────
export async function askExpenseAI(message, expenses = [], history = []) {
  try {
    const res = await api.post('/ai/chat', {
      message,
      expenses,
      history,
    });
    return res.data.reply;
  } catch (err) {
    console.error('Chat error:', err);
    return 'Something went wrong. Please try again.';
  }
}