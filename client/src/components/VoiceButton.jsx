import { useState, useRef } from 'react';
import { parseExpenseWithAI } from '../utils/aiService';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function VoiceButton({ onResult, expenses }) {
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!SpeechRecognition) {
      setStatus('error');
      return;
    }

    const recognition = new SpeechRecognition();

    // KEY CHANGE: try Tamil first, fall back to English
    // 'ta-IN' handles Tamil script
    // If user speaks Tanglish, we send it to AI regardless — AI handles both
    recognition.lang = 'ta-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatus('listening');
      setTranscript('');
    };

    recognition.onresult = async (event) => {
      const heard = event.results[0][0].transcript;
      setTranscript(heard);
      setStatus('processing');

      // Send to AI for intelligent parsing
      const parsed = await parseExpenseWithAI(heard, expenses);
      onResult(parsed);

      setTimeout(() => {
        setStatus('idle');
        setTranscript('');
      }, 2500);
    };

    recognition.onerror = () => {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    };

    recognition.onend = () => {
      if (status === 'listening') setStatus('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setStatus('idle');
  };

  const statusConfig = {
    idle: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      ),
      label: 'Speak in Tamil / Tanglish',
      className: 'bg-white border-2 border-indigo-200 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50',
    },
    listening: {
      icon: (
        <div className="flex items-end gap-0.5 h-5">
          {[40, 70, 55, 90, 60].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-red-500 rounded-full animate-bounce"
              style={{ height: `${h}%`, animationDelay: `${i * 75}ms` }}
            />
          ))}
        </div>
      ),
      label: 'Listening... tap to stop',
      className: 'bg-red-50 border-2 border-red-400 text-red-600',
    },
    processing: {
      icon: <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />,
      label: transcript ? `Heard: "${transcript}"` : 'AI is parsing...',
      className: 'bg-indigo-50 border-2 border-indigo-300 text-indigo-600',
    },
    error: {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
        </svg>
      ),
      label: SpeechRecognition ? 'Try again' : 'Use Chrome for voice input',
      className: 'bg-red-50 border-2 border-red-200 text-red-500',
    },
  };

  const current = statusConfig[status];

  return (
    <button
      onClick={status === 'listening' ? stopListening : startListening}
      disabled={status === 'processing'}
      className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm transition duration-200 ${current.className} disabled:opacity-60`}
    >
      {current.icon}
      <span className="truncate">{current.label}</span>
    </button>
  );
}

export default VoiceButton;