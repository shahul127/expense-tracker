import { useState } from 'react';
import api from '../api/axios';
import VoiceButton from './VoiceButton';

const CATEGORIES = [
  { value: 'food',          label: '🍽️ Food' },
  { value: 'travel',        label: '🚌 Travel' },
  { value: 'shopping',      label: '🛍️ Shopping' },
  { value: 'bills',         label: '💡 Bills' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'other',         label: '📦 Other' },
];

function ExpenseForm({ onExpenseAdded ,expenses=[] }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceUsed, setVoiceUsed] = useState(false); // track if voice filled the form

  // Called by VoiceButton when speech is parsed
  const handleVoiceResult = (parsed) => {
    // Only fill in what was understood — don't overwrite if nothing was detected
    if (parsed.amount) {
      setAmount(String(parsed.amount));
    }
    if (parsed.category) {
      setCategory(parsed.category);
    }
    if (parsed.description) {
      setDescription(parsed.description);
    }
    setVoiceUsed(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/expenses', {
        amount: Number(amount),
        category,
        description,
        source: voiceUsed ? 'voice' : 'manual', // tag where this came from
      });
      setAmount('');
      setDescription('');
      setCategory('food');
      setVoiceUsed(false);
      onExpenseAdded(res.data.expense);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-base font-semibold text-slate-800 mb-4">Add Expense</h3>

      {/* Voice input button */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          Voice Input <span className="text-slate-400 font-normal">(Tamil)</span>
        </label>
     <VoiceButton onResult={handleVoiceResult} expenses={expenses} />
        <p className="text-xs text-slate-400 mt-1.5">
          Try saying: "நூறு ரூபாய் சாப்பாடு" (100 rupees food)
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-400 font-medium">or type manually</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* Amount */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">Amount</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 text-lg font-semibold placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Category grid */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition
                ${category === cat.value
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-600 mb-1.5">
          Note <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this for?"
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
      </div>

      {/* Voice used badge */}
      {voiceUsed && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl">
          <span className="text-green-500 text-sm">🎙️</span>
          <p className="text-green-700 text-sm font-medium">Form filled from voice</p>
          <button
            onClick={() => setVoiceUsed(false)}
            className="ml-auto text-green-400 hover:text-green-600 text-xs"
          >
            dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding...
          </>
        ) : '+ Add Expense'}
      </button>
    </div>
  );
}

export default ExpenseForm;