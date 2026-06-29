import api from '../api/axios';

const CATEGORY_CONFIG = {
  food:          { emoji: '🍽️', bg: 'bg-orange-100', text: 'text-orange-600' },
  travel:        { emoji: '🚌', bg: 'bg-blue-100',   text: 'text-blue-600' },
  shopping:      { emoji: '🛍️', bg: 'bg-purple-100', text: 'text-purple-600' },
  bills:         { emoji: '💡', bg: 'bg-red-100',    text: 'text-red-600' },
  entertainment: { emoji: '🎬', bg: 'bg-pink-100',   text: 'text-pink-600' },
  other:         { emoji: '📦', bg: 'bg-slate-100',  text: 'text-slate-600' },
};

function ExpenseList({ expenses, onExpenseDeleted }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      onExpenseDeleted(id);
    } catch {
      alert('Failed to delete. Try again.');
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-5xl mb-4">🧾</div>
        <p className="text-slate-500 font-medium">No expenses yet</p>
        <p className="text-slate-400 text-sm mt-1">Add your first expense above</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {expenses.map((expense) => {
        const config = CATEGORY_CONFIG[expense.category] || CATEGORY_CONFIG.other;

        return (
          <div
            key={expense._id}
            className="bg-white rounded-2xl border border-slate-100 px-4 py-3.5 flex items-center gap-3 shadow-sm hover:shadow-md transition"
          >
            {/* Category icon */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
              <span className="text-lg">{config.emoji}</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-medium text-sm truncate">
                {expense.description || expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {new Date(expense.date).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>

            {/* Amount + delete */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-slate-800 font-bold text-base">
                ₹{expense.amount.toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => handleDelete(expense._id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ExpenseList;