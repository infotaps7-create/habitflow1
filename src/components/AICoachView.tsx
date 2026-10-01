import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Send,
  ArrowRight,
  CheckCircle2,
  Brain,
} from 'lucide-react';

export const AICoachView: React.FC = () => {
  const { coachMessages, sendCoachMessage, isCoachTyping } = useApp();
  const [inputQuery, setInputQuery] = useState('');

  const promptSuggestions = [
    'Why am I feeling unproductive this week?',
    'How can I boost my savings rate next month?',
    'Analyze my sleep vs screen-time pattern',
    'What is my single highest-leverage habit right now?',
  ];

  const handleSend = async (text: string) => {
    if (!text.trim() || isCoachTyping) return;
    setInputQuery('');
    await sendCoachMessage(text.trim());
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 lg:px-8 py-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Life Coach
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Grounded in your actual 4-week health, wealth, productivity, and lifestyle data.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 text-xs font-mono font-medium">
          <Brain className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gemini 3.8 Flash Context Engine</span>
        </div>
      </div>

      {/* Suggested Prompts Strip */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
          Frequent Behavioral Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isCoachTyping}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-500 text-xs text-slate-700 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-left shadow-2xs font-medium"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat History Container */}
      <div className="space-y-4 min-h-[380px] max-h-[560px] overflow-y-auto pr-1">
        {coachMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1 font-medium">
                <span>{isUser ? 'You' : 'HabitFlow Coach'}</span>
                <span>·</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-2xl max-w-2xl text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Main Message Text */}
                <div className="whitespace-pre-line text-[13px]">{msg.text}</div>

                {/* Trend Comparisons Grid */}
                {msg.trendComparisons && msg.trendComparisons.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-[11px]">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block font-sans">
                      4-Week Behavioral Shifts
                    </span>
                    {msg.trendComparisons.map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-slate-700">
                        <span>{t.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">{t.previous}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="text-amber-800 font-bold">{t.current}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actionable Steps Micro-Actions */}
                {msg.actionableSteps && msg.actionableSteps.length > 0 && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2">
                    <span className="text-emerald-900 text-[11px] font-bold font-mono uppercase tracking-wider block font-sans">
                      Recommended Micro-Actions for Tomorrow
                    </span>
                    <ul className="space-y-1.5">
                      {msg.actionableSteps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isCoachTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-2xl max-w-xs text-xs text-slate-500 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
            <span>Synthesizing multi-pillar metrics...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-2xl shadow-xs"
      >
        <input
          type="text"
          placeholder="Ask about productivity leaks, spending behavior, sleep recovery..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isCoachTyping}
          className="flex-1 px-3 py-2 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isCoachTyping}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
