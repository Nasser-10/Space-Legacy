import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, X, Sparkles, Volume2 } from 'lucide-react';
import { SpaceLegacyAPI } from '../../services/api';
import { SoundSystem } from '../../utils/soundEffects';

export default function QuizModal({ equipmentId, equipmentName, isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && equipmentId) {
      loadQuiz();
    }
  }, [isOpen, equipmentId]);

  const loadQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setResults(null);
    try {
      const qz = await SpaceLegacyAPI.getQuiz(equipmentId);
      setQuestions(qz);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, optionKey) => {
    if (submitted) return;
    SoundSystem.playClick();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) return;
    try {
      const res = await SpaceLegacyAPI.submitQuiz(equipmentId, answers);
      setResults(res);
      setSubmitted(true);
      SoundSystem.playSuccess();
    } catch (err) {
      console.error('Quiz submission error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] glass-panel bg-slate-900/95 border border-slate-700/80 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Award className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">
                Mission Mastery Quiz: {equipmentName}
              </h3>
              <p className="text-xs text-slate-400">Test your planetary science knowledge & earn badges</p>
            </div>
          </div>
          <button
            onClick={() => {
              SoundSystem.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Sparkles className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
              Loading mission quiz questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No quiz questions available for this mission.
            </div>
          ) : (
            <>
              {/* Results Banner when Submitted */}
              {submitted && results && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/90 via-indigo-950/90 to-purple-950/90 border border-cyan-500/60 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 shadow-xl">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      MISSION EVALUATION COMPLETE
                    </span>
                    <h4 className="font-display font-black text-2xl text-white">
                      Score: {results.score} / {results.total_questions} ({results.percentage}%)
                    </h4>
                    <p className="text-xs text-slate-200">
                      Digital Badge Awarded: <strong className="text-amber-300 font-display">{results.badge}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      SoundSystem.playClick();
                      loadQuiz();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-all shadow-md hover:scale-105"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const feedbackItem = results?.feedback?.find((f) => f.question_id === q.question_id);
                  const selectedOption = answers[q.question_id];

                  return (
                    <div
                      key={q.question_id}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3 shadow-md"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-850 border border-slate-700 text-[11px] font-bold text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-medium text-slate-200 leading-snug">
                          {q.question_text}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        {Object.entries(q.options).map(([optKey, optText]) => {
                          const isSelected = selectedOption === optKey;
                          let optionStyle =
                            'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                          if (submitted && feedbackItem) {
                            if (feedbackItem.correct_option === optKey) {
                              optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/10';
                            } else if (isSelected && !feedbackItem.is_correct) {
                              optionStyle = 'bg-rose-950/70 border-rose-500 text-rose-200 shadow-md shadow-rose-500/10';
                            }
                          } else if (isSelected) {
                            optionStyle = 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/15';
                          }

                          return (
                            <button
                              key={optKey}
                              disabled={submitted}
                              onClick={() => handleSelect(q.question_id, optKey)}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${optionStyle}`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="uppercase font-mono font-bold text-[11px] text-cyan-400/80">
                                  {optKey})
                                </span>
                                <span>{optText}</span>
                              </div>

                              {submitted && feedbackItem && (
                                <div>
                                  {feedbackItem.correct_option === optKey && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  )}
                                  {isSelected && !feedbackItem.is_correct && (
                                    <XCircle className="w-4 h-4 text-rose-400" />
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Feedback */}
                      {submitted && feedbackItem && (
                        <div className="mt-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed animate-in fade-in">
                          <strong className="text-cyan-400 font-mono">Scientific Rationale: </strong>
                          {feedbackItem.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {Object.keys(answers).length} of {questions.length} answered
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                SoundSystem.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Close
            </button>
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== questions.length}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 disabled:opacity-40 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Submit Answers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
