import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  User,
  Bot,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { SpaceLegacyAPI } from '../../services/api';

const createWelcomeMessage = (equipmentName) => ({
  role: 'assistant',
  text: `Greetings, explorer! I am the NASA AI Space Historian. Ask me about ${equipmentName}, its mission, its instruments, or the evidence preserved in the archive.`,
  sources: [],
  grounded: false,
});

export default function ChatHistorian({
  equipmentId = 'all',
  equipmentName = 'this explorer',
}) {
  const [level, setLevel] = useState('explorer');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([createWelcomeMessage(equipmentName)]);
  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);

  // A conversation belongs to one exhibit. Never carry an answer into another exhibit.
  useEffect(() => {
    requestIdRef.current += 1;
    setMessages([createWelcomeMessage(equipmentName)]);
    setQuestion('');
    setLoading(false);
    setLevel('explorer');

    return () => {
      requestIdRef.current += 1;
    };
  }, [equipmentId, equipmentName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  const starterChips = [
    `Why was ${equipmentName} left behind?`,
    'What scientific instruments did it carry?',
    'What does the archive say about its final status?',
  ];

  const handleSend = async (suggestedQuestion = null) => {
    const textToSend = (suggestedQuestion ?? question).trim();
    if (textToSend.length < 3 || loading) return;

    const requestId = ++requestIdRef.current;
    setMessages((previous) => [...previous, { role: 'user', text: textToSend }]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await SpaceLegacyAPI.askHistorian(equipmentId, textToSend, level);
      if (requestId !== requestIdRef.current) return;

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: response?.answer || 'The archive returned an empty response. Please try a more specific question.',
          sources: Array.isArray(response?.sources) ? response.sources : [],
          grounded: response?.grounded === true,
          level: response?.level_applied || level,
        },
      ]);
    } catch {
      if (requestId !== requestIdRef.current) return;
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          text: 'I could not reach the mission archive. Check your connection and try again.',
          sources: [],
          grounded: false,
        },
      ]);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const resetConversation = () => {
    requestIdRef.current += 1;
    setMessages([createWelcomeMessage(equipmentName)]);
    setQuestion('');
    setLoading(false);
  };

  const levels = [
    { id: 'kid', label: 'Kid', detail: 'Simple' },
    { id: 'explorer', label: 'Explorer', detail: 'Standard' },
    { id: 'scientist', label: 'Scientist', detail: 'Technical' },
  ];

  return (
    <section
      aria-label="AI Space Historian"
      className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-[560px] min-h-[420px] overflow-hidden shadow-2xl"
    >
      <header className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-white flex flex-wrap items-center gap-2">
              <span>AI Space Historian</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-sans">
                Archive-grounded
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Answers are checked against retrieved mission records</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs"
            role="group"
            aria-label="Explanation level"
          >
            {levels.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevel(item.id)}
                aria-pressed={level === item.id}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                  level === item.id
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{item.label}</span>
                <span className="hidden sm:inline"> ({item.detail})</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={resetConversation}
            disabled={messages.length <= 1 && !question && !loading}
            aria-label="Start a new conversation"
            title="New conversation"
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        className="flex-1 p-4 overflow-y-auto space-y-4"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex gap-3 text-xs leading-relaxed ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400 mt-1">
                <Bot className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            )}

            <div
              className={`max-w-[88%] min-w-0 rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-600/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="whitespace-pre-line break-words">{message.text}</p>

              {message.role === 'assistant' && message.grounded && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Evidence check passed</span>
                </div>
              )}

              {message.role === 'assistant' && !message.grounded && message.sources?.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Source excerpt — generated explanation not verified</span>
                </div>
              )}

              {message.sources?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                    <span>Mission archive sources</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {message.sources.map((source, sourceIndex) => (
                      <a
                        key={source.url || sourceIndex}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-2 text-[10px] text-cyan-300 hover:text-cyan-200 underline-offset-2 hover:underline break-words"
                      >
                        <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" aria-hidden="true" />
                        <span>{source.title || 'Open source'}{source.year ? ` · ${source.year}` : ''}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 mt-1">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-slate-400" role="status">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            </div>
            <div className="bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:240ms]" />
              <span className="text-[11px] text-slate-400 ml-1">Searching the mission archive…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/60">
        <p className="text-[10px] text-slate-500 mb-2">Try asking</p>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {starterChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSend(chip)}
              disabled={loading}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <label htmlFor="space-historian-question" className="sr-only">
          Ask the AI Space Historian
        </label>
        <input
          id="space-historian-question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={`Ask about ${equipmentName}…`}
          maxLength={500}
          autoComplete="off"
          className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
        />
        <button
          type="submit"
          disabled={question.trim().length < 3 || loading}
          aria-label="Send question"
          className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-colors shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
