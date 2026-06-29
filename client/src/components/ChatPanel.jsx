import { useState, useRef, useEffect } from 'react';
import { askExpenseAI } from '../utils/aiService';

const SUGGESTIONS = [
  'How much did I spend this month?',
  'What is my biggest expense category?',
  'How can I reduce my spending?',
  'Show me a summary of my expenses',
];

function ChatPanel({ expenses, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I can answer questions about your expenses. Try asking "How much did I spend on food?" or "How can I save money?"`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
  const question = text || input.trim();
  if (!question || loading) return;

  setInput('');
  setLoading(true);

  const userMessage = { role: 'user', content: question };
  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);

  // Build history for the API — everything except the initial greeting
  // and the message we just added (that gets sent as the current message)
  const history = updatedMessages
    .slice(1, -1)  // skip greeting at index 0, skip the message we just added
    .map(m => ({ role: m.role, content: m.content }));

  const reply = await askExpenseAI(question, expenses, history);

  setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
  setLoading(false);
};

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel — slides up on mobile, always visible on desktop */}
      <div
        className={`
          flex flex-col bg-white border-l border-slate-100
          fixed bottom-0 left-0 right-0 z-30 rounded-t-2xl shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:static lg:rounded-none lg:shadow-none lg:translate-y-0 lg:z-auto
          ${isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}
        style={{ height: 'calc(100vh - 80px)', maxHeight: '600px' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">✦</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">AI Assistant</p>
              <p className="text-xs text-slate-400">Ask about your expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips — only shown when there's just the greeting */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 flex flex-col gap-2 flex-shrink-0">
            <p className="text-xs text-slate-400 font-medium">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hover:bg-indigo-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your expenses..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default ChatPanel;