import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Sparkles, AlertTriangle, ShieldAlert, HeartPulse, User, Bot, HelpCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export const AIChat: React.FC = () => {
  const { api } = useAuth();
  
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hello! I am TinniCare AI, your assistant for tinnitus education and management. You can ask me about sound therapy, stress reduction techniques, sleep hygiene, or how Tinnitus Retraining Therapy works."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setLoading(true);
    setError(null);
    const userMsg = textToSend;
    setMessage('');

    // Optimistically update history with user message
    setHistory(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const response = await api.post('/api/ai/chat', {
        message: userMsg,
        history: history.map(h => ({ role: h.role, content: h.content }))
      });
      
      setHistory(response.data.history);
    } catch (err: any) {
      setError("Failed to reach AI counselor. Please check backend connection.");
      // Rollback user message from history on error for clarity
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "What triggers tinnitus?",
    "How does sound masking work?",
    "Explain TRT therapy",
    "How can I sleep better with ringing?"
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans flex flex-col h-[calc(100vh-80px)]">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-indigo-50 text-indigo-655 rounded-xl dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-md font-bold text-slate-800 dark:text-slate-150">AI Coping Coach</h1>
            <p className="text-[10px] text-slate-400">Educational advice & relaxation counseling</p>
          </div>
        </div>
        <span className="text-[10px] font-bold py-1 px-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 rounded-full flex items-center gap-1">
          <HeartPulse className="w-3.5 h-3.5" /> HIPAA Compliant Mode
        </span>
      </div>

      {/* Emergency Distress Notice */}
      <div className="p-3 bg-amber-500/10 border border-amber-550/20 text-amber-805 dark:text-amber-300 text-xs rounded-xl flex items-start gap-2.5 mb-4 flex-shrink-0 leading-normal">
        <AlertTriangle className="w-4.5 h-4.5 text-amber-550 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Safety Warning:</strong> If you are experiencing severe emotional distress, sudden profound hearing loss, or extreme vertigo, please seek immediate professional care or dial <strong>988</strong> to connect with the suicide & crisis lifeline.
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-805 rounded-2xl p-6 overflow-y-auto mb-4 space-y-4 shadow-inner">
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950' 
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-none'
                : 'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 border border-slate-150/40 dark:border-slate-850 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-755 dark:bg-emerald-950 flex items-center justify-center font-bold text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-150/40 dark:border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1.5 py-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex gap-2 items-center dark:bg-rose-955/20 dark:border-rose-900/50 dark:text-rose-455 max-w-sm mx-auto">
            <ShieldAlert className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips */}
      {history.length < 3 && !loading && (
        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0 items-center justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
          </span>
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => handleSend(sug)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-655 text-[11px] font-semibold rounded-lg dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(message);
        }}
        className="flex gap-2.5 items-center bg-white dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-150/80 dark:border-slate-850 shadow-sm flex-shrink-0"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about sound masking or therapy exercises..."
          className="flex-1 bg-transparent border-none text-xs px-3 focus:outline-none placeholder-slate-400"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <div className="text-[9px] text-slate-400 text-center mt-2 flex-shrink-0">
        AI responses are for educational reference and should not replace an audiologist clinical plan.
      </div>
    </div>
  );
};
