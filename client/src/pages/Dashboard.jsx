import { useState, useEffect } from 'react';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import ChatPanel from '../components/ChatPanel';

const CATEGORIES = ['all', 'food', 'travel', 'shopping', 'bills', 'entertainment', 'other'];

const CATEGORY_CONFIG = {
  food:          { emoji: '🍽️', color: 'text-orange-500', bar: 'bg-orange-400' },
  travel:        { emoji: '🚌', color: 'text-blue-500',   bar: 'bg-blue-400' },
  shopping:      { emoji: '🛍️', color: 'text-purple-500', bar: 'bg-purple-400' },
  bills:         { emoji: '💡', color: 'text-red-500',    bar: 'bg-red-400' },
  entertainment: { emoji: '🎬', color: 'text-pink-500',   bar: 'bg-pink-400' },
  other:         { emoji: '📦', color: 'text-slate-500',  bar: 'bg-slate-400' },
};

function Dashboard({ onLogout }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data.expenses);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  const handleExpenseAdded = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleExpenseDeleted = (id) => {
    setExpenses(prev => prev.filter(exp => exp._id !== id));
  };

  const filteredExpenses = filter === 'all'
    ? expenses
    : expenses.filter(exp => exp.category === filter);

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const breakdown = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <span className="font-bold text-slate-800">Expense Tracker</span>
          </div>
          <div className="flex items-center gap-2">
            {/* AI chat button — mobile only, desktop panel is always visible */}
            <button
              onClick={() => setChatOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100 hover:bg-indigo-100 transition"
            >
              <span>✦</span>
              <span>Ask AI</span>
            </button>
            <button
              onClick={onLogout}
              className="text-sm text-slate-500 hover:text-red-500 px-3 py-1.5 hover:bg-red-50 rounded-lg transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content: two columns on desktop ──────────────────── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex gap-6">

        {/* ── LEFT COLUMN (or full width on mobile) ─────────────── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">

          {/* Total hero card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-indigo-200 text-white">
            <p className="text-indigo-200 text-sm font-medium mb-1">Total Spent</p>
            <p className="text-4xl font-bold tracking-tight">
              ₹{total.toLocaleString('en-IN')}
            </p>
            <p className="text-indigo-300 text-xs mt-2">
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} recorded
            </p>
          </div>

          {/* Category breakdown */}
          {Object.keys(breakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Breakdown
              </h3>
              <div className="flex flex-col gap-3">
                {Object.entries(breakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amt]) => {
                    const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                    const pct = total > 0 ? (amt / total) * 100 : 0;
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{config.emoji}</span>
                            <span className="text-sm font-medium text-slate-700 capitalize">{cat}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{pct.toFixed(0)}%</span>
                            <span className={`text-sm font-semibold ${config.color}`}>
                              ₹{amt.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`${config.bar} h-1.5 rounded-full transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Add expense form (includes voice button) */}
          <ExpenseForm
            onExpenseAdded={handleExpenseAdded}
            expenses={expenses}
          />

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition capitalize
                  ${filter === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List header */}
          <div className="flex items-center justify-between -mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filter === 'all' ? 'All Expenses' : `${filter} expenses`}
            </h3>
            {filter !== 'all' && (
              <span className="text-sm font-semibold text-indigo-600">
                ₹{filteredExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Expense list */}
          <ExpenseList
            expenses={filteredExpenses}
            onExpenseDeleted={handleExpenseDeleted}
          />
        </div>

        {/* ── RIGHT COLUMN — AI chat, desktop only ──────────────── */}
        <div className="hidden lg:flex flex-col w-80 xl:w-96 flex-shrink-0">
          {/* Sticky so it stays in view while the left side scrolls */}
          <div className="sticky top-24 h-[calc(100vh-7rem)] flex flex-col">
            <ChatPanel
              expenses={expenses}
              isOpen={true}
              onClose={() => {}}
            />
          </div>
        </div>

      </div>

      {/* ── Mobile chat panel (bottom sheet) ──────────────────────── */}
      <ChatPanel
        expenses={expenses}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

    </div>
  );
}

export default Dashboard;