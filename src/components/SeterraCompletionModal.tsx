"use client";

import React from "react";
import { Clock, Target, RotateCcw } from "lucide-react";
import { QuizResults, Language } from "@/types";
import { translations, toBanglaNumber } from "@/utils/i18n";

interface SeterraCompletionModalProps {
  isOpen: boolean;
  results: QuizResults | null;
  onRestart: () => void;
  onClose: () => void;
  language: Language;
}

export const SeterraCompletionModal: React.FC<SeterraCompletionModalProps> = ({
  isOpen,
  results,
  onRestart,
  onClose,
  language = "en"
}) => {
  if (!isOpen || !results) return null;

  const t = translations[language];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return language === "bn" ? toBanglaNumber(timeStr) : timeStr;
  };

  const getGrade = (score: number) => {
    if (score >= 95) return { text: t.outstandingMaster, color: "text-amber-500", medal: "🥇" };
    if (score >= 85) return { text: t.greatJob, color: "text-emerald-500", medal: "🥈" };
    if (score >= 70) return { text: t.goodEffort, color: "text-sky-500", medal: "🥉" };
    return { text: t.keepPracticing, color: "text-slate-500", medal: "🎯" };
  };

  const grade = getGrade(results.scorePercent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        {/* Trophy & Medal */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-4xl shadow-lg shadow-amber-500/20 mb-3">
          {grade.medal}
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          {t.quizCompleted}
        </h2>
        <p className={`text-sm font-bold ${grade.color} mt-0.5`}>
          {grade.text}
        </p>

        {/* Big Score & Time Stats */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Target className="h-4 w-4 text-emerald-500" />
              <span>{t.finalScore}</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {language === "bn" ? `${toBanglaNumber(results.scorePercent)}%` : `${results.scorePercent}%`}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Clock className="h-4 w-4 text-sky-500" />
              <span>{t.totalTime}</span>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {formatTime(results.timeSeconds)}
            </div>
          </div>
        </div>

        {/* Seterra-style attempt breakdown */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/30 text-left space-y-2 mb-6">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            {t.attemptBreakdown}
          </span>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{t.firstTry}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {language === "bn" ? toBanglaNumber(results.firstTryCount) : results.firstTryCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{t.secondTry}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {language === "bn" ? toBanglaNumber(results.secondTryCount) : results.secondTryCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-orange-400 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{t.thirdTry}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {language === "bn" ? toBanglaNumber(results.thirdTryCount) : results.thirdTryCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{t.missed}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              {language === "bn" ? toBanglaNumber(results.missedCount) : results.missedCount}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.playAgain}</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t.reviewMap}
          </button>
        </div>
      </div>
    </div>
  );
};
