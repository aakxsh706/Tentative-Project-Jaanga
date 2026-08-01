import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Stethoscope, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  HeartHandshake, 
  HeartPulse 
} from 'lucide-react';
import { 
  QUICK_PROMPTS, 
  EMPATHETIC_RESPONSES, 
  matchUserQuery,
  DOCTOR_DISCLAIMER
} from '../data/tinnitusKnowledgeBase';

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  showDoctorNotice?: boolean;
  type?: 'TRIGGER_ASSESSMENT' | 'RED_FLAG_WARNING' | 'KNOWLEDGE_ANSWER' | 'GENERAL_GUIDANCE';
}

export const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'bot',
      text: EMPATHETIC_RESPONSES.greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showDoctorNotice: true
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleOpenAssessment = () => {
    navigate('/assessment');
  };

  const handleOpenSoundMasker = () => {
    navigate('/therapy');
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate thoughtful, empathetic AI response delay
    setTimeout(() => {
      const matchResult = matchUserQuery(query);

      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: matchResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showDoctorNotice: true,
        type: matchResult.type
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: EMPATHETIC_RESPONSES.greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showDoctorNotice: true
      }
    ]);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto font-sans flex flex-col h-[calc(100vh-80px)]">
      {/* Chat Header */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-t-2xl border-t border-x border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <span className="w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full absolute bottom-0 right-0"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Aura</h3>
              <span className="text-[10px] bg-teal-150 text-teal-800 dark:bg-teal-950 dark:text-teal-400 font-medium px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-900/50">
                Tinnitus Guidance AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <HeartHandshake className="w-3 h-3 text-teal-600" /> Always here to support & listen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold py-1 px-3 bg-indigo-50 text-indigo-755 dark:bg-indigo-950 dark:text-indigo-400 rounded-full hidden sm:flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5" /> Direct Mode
          </span>
          <button
            onClick={clearChat}
            title="Reset Conversation"
            className="p-2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-205 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-805 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 bg-rose-50 border-x border-rose-100 text-rose-805 dark:bg-rose-955/15 dark:border-rose-905/30 dark:text-rose-300 text-[11px] flex items-start gap-2.5 flex-shrink-0 leading-normal">
        <AlertTriangle className="w-4.5 h-4.5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Clinician Advisory:</strong> {DOCTOR_DISCLAIMER.short}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-100 dark:border-slate-805 p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 max-w-[85%] ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
              msg.sender === 'user'
                ? 'bg-slate-700 text-white'
                : 'bg-teal-600 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
              msg.sender === 'user'
                ? 'bg-teal-600 text-white rounded-tr-none'
                : msg.type === 'RED_FLAG_WARNING'
                ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-100 rounded-tl-none'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-850 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Special Action Buttons inside Bot Message */}
              {msg.sender === 'bot' && msg.type === 'TRIGGER_ASSESSMENT' && (
                <div className="pt-2">
                  <button
                    onClick={handleOpenAssessment}
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-755 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> Launch AI Tinnitus Assessment Now
                  </button>
                </div>
              )}

              {/* Doctor Consultation Prompts on Bot messages */}
              {msg.sender === 'bot' && msg.showDoctorNotice && (
                <div className="pt-2 border-t border-slate-205/60 dark:border-slate-805/60 text-[11px] text-teal-800 dark:text-teal-400 flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1 font-medium">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-655" />
                    ENT review recommended.
                  </span>
                  <button
                    onClick={handleOpenAssessment}
                    className="underline text-teal-700 dark:text-teal-400 font-semibold hover:text-teal-900"
                  >
                    Assess Symptoms
                  </button>
                </div>
              )}

              <div className={`text-[10px] text-right ${msg.sender === 'user' ? 'text-teal-100' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200/60 dark:border-slate-850 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Pills */}
      <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border-x border-b border-slate-100 dark:border-slate-850 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (prompt.action === 'start_assessment') {
                handleOpenAssessment();
              } else {
                handleSend(prompt.text);
              }
            }}
            className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:border-teal-500 dark:hover:border-teal-500 hover:text-teal-600 transition shadow-2xs cursor-pointer"
          >
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-b-2xl bg-white dark:bg-slate-900 flex-shrink-0 mt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aura anything about tinnitus symptoms, causes, treatments, sound therapy..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs sm:text-sm text-slate-850 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl disabled:opacity-30 transition shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AIChat;
