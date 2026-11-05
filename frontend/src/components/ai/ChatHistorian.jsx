import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, ExternalLink, ShieldCheck, User, Bot, AlertCircle } from 'lucide-react';
import { SpaceLegacyAPI } from '../../services/api';

export default function ChatHistorian({ equipmentId = 'all', equipmentName = 'this explorer' }) {
  const [level, setLevel] = useState('explorer');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Greetings explorer! I am the NASA AI Space Historian. Ask me anything about ${equipmentName}, why it was left behind, how its instruments worked, or its historical scientific discoveries!`,
      sources: [],
      grounded: false,
    },
  ]);

  const starterChips = [
    `Why was ${equipmentName} left behind?`,
    `What was its primary scientific instrument?`,
    `Could this equipment still function today?`,
    `How does the rocket equation affect this mission?`,
  ];

  const handleSend = async (qText = null) => {
    const textToSend = qText || question;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await SpaceLegacyAPI.askHistorian(equipmentId, textToSend, level);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer,
          sources: res.sources || [],
          grounded: res.grounded,
          level: res.level_applied,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I couldn't contact the mission control archives right now. Please try again shortly!",
          sources: [],
          grounded: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[560px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span>AI Space Historian</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-sans">
                NASA Mission Archives
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Powered by NASA Mission Documentation</p>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setLevel('kid')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              level === 'kid' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kid (Simple)
          </button>
          <button
            onClick={() => setLevel('explorer')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              level === 'explorer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Explorer (Standard)
          </button>
          <button
            onClick={() => setLevel('scientist')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              level === 'scientist' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Scientist (Technical)
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-600/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-line">{m.text}</p>

              {/* Citations Box */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Retrieved archive sources:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md text-[10px] text-cyan-400 border border-slate-800 hover:border-cyan-500/50 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{s.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-spin">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200" />
              <span className="text-[11px] text-slate-400 ml-1">Searching NASA archives...</span>
            </div>
          </div>
        )}
      </div>

      {/* Starter Prompts Chips */}
      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {starterChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-850 hover:bg-slate-800 border border-slate-750 text-[11px] text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Ask the AI Historian about ${equipmentName}...`}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={!question.trim() || loading}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
