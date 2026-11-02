"use client";

import React from "react";
import { Clock, Target, RotateCcw, Flag, Layers } from "lucide-react";
import { DistrictData, Language } from "@/types";
import { DivisionName, DIVISIONS } from "@/data/districtsData";
import { translations, toBanglaNumber, DIVISION_BN } from "@/utils/i18n";

interface SeterraQuizHeaderProps {
  targetDistrict: DistrictData | null;
  scorePercent: number;
  completedCount: number;
  totalQuestions: number;
  currentAttempts: number;
  elapsedSeconds: number;
  wrongGuessInfo: { clickedName: string; targetName: string; clickedBn?: string; targetBn?: string } | null;
  quizDivision: DivisionName;
  onSelectQuizDivision: (div: DivisionName) => void;
  onRestart: () => void;
  onGiveUpCurrent: () => void;
  language: Language;
}

export const SeterraQuizHeader: React.FC<SeterraQuizHeaderProps> = ({
  targetDistrict,
  scorePercent,
  completedCount,
  totalQuestions,
  currentAttempts,
  elapsedSeconds,
  wrongGuessInfo,
  quizDivision,
  onSelectQuizDivision,
  onRestart,
  onGiveUpCurrent,
  language = "en"
}) => {
  const t = translations[language];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return language === "bn" ? toBanglaNumber(timeStr) : timeStr;
  };

  const progressPercent = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden mb-3 sm:mb-4">
      {/* Top Toolbar - Mobile-friendly flex wrap */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3 sm:px-4 py-2 sm:py-2.5 dark:border-slate-800 dark:bg-slate-950/40 text-xs">
        {/* Scope Selector & Quick Actions row on mobile */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] sm:text-xs shrink-0">
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">{t.quizScope}</span>
            </span>
            <select
              value={quizDivision}
              onChange={(e) => onSelectQuizDivision(e.target.value as DivisionName)}
              className="w-full sm:w-auto rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] sm:text-xs font-semibold text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer truncate"
            >
              <option value="All">{t.allBangladeshScope}</option>
              {DIVISIONS.filter((d) => d !== "All").map((div) => (
                <option key={div} value={div}>
                  {language === "bn" ? `${DIVISION_BN[div]} বিভাগ` : `${div} Division`}
                </option>
              ))}
            </select>
          </div>

          {/* Actions (Restart & Give Up) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onRestart}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-colors"
              title={t.restart}
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden xs:inline">{t.restart}</span>
            </button>
            <button
              onClick={onGiveUpCurrent}
              className="flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 cursor-pointer shadow-2xs transition-colors"
              title={t.giveUp}
            >
              <Flag className="h-3 w-3" />
              <span className="hidden xs:inline">{t.giveUp}</span>
            </button>
          </div>
        </div>

        {/* Live Score, Time, Progress Stats chips */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 font-bold pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800">
          {/* Score */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t.score}</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {language === "bn" ? `${toBanglaNumber(scorePercent)}%` : `${scorePercent}%`}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs">
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t.time}</span>
            <span className="font-black text-slate-800 dark:text-slate-100 font-mono">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{t.progress}</span>
            <span className="text-slate-800 dark:text-slate-100">
              {language === "bn" ? toBanglaNumber(completedCount) : completedCount} /{" "}
              {language === "bn" ? toBanglaNumber(totalQuestions) : totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Seterra Prompt Banner */}
      <div className="p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {targetDistrict ? (
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-center sm:text-left">
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.clickOn}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {language === "bn" ? targetDistrict.bnName : targetDistrict.displayName}
              </span>
              <span className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                ({language === "bn" ? targetDistrict.displayName : targetDistrict.bnName})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {t.quizCompleted}
          </div>
        )}

        {/* Seterra Attempt Dots Indicator */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 sm:px-3.5 sm:py-2 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.attempt}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border transition-all ${
                currentAttempts === 0
                  ? "bg-emerald-500 border-emerald-600 ring-2 ring-emerald-500/30 scale-110"
                  : "bg-emerald-200 border-emerald-300 dark:bg-emerald-950"
              }`}
              title={t.firstTry}
            />
            <span
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border transition-all ${
                currentAttempts === 1
                  ? "bg-yellow-400 border-yellow-500 ring-2 ring-yellow-400/30 scale-110"
                  : currentAttempts > 1
                  ? "bg-yellow-200 border-yellow-300 dark:bg-yellow-950"
                  : "bg-slate-200 border-slate-300 dark:bg-slate-700"
              }`}
              title={t.secondTry}
            />
            <span
              className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border transition-all ${
                currentAttempts === 2
                  ? "bg-orange-400 border-orange-500 ring-2 ring-orange-400/30 scale-110"
                  : currentAttempts > 2
                  ? "bg-orange-200 border-orange-300 dark:bg-orange-950"
                  : "bg-slate-200 border-slate-300 dark:bg-slate-700"
              }`}
              title={t.thirdTry}
            />
          </div>
        </div>
      </div>

      {/* Seterra Wrong Click Feedback Toast */}
      {wrongGuessInfo && (
        <div className="bg-rose-500 px-3 py-1.5 sm:py-2 text-center text-[11px] sm:text-xs font-bold text-white shadow-inner animate-in fade-in slide-in-from-top-1 duration-150">
          {t.thatsClicked
            .replace("{clicked}", language === "bn" ? wrongGuessInfo.clickedBn || wrongGuessInfo.clickedName : wrongGuessInfo.clickedName)
            .replace("{target}", language === "bn" ? wrongGuessInfo.targetBn || wrongGuessInfo.targetName : wrongGuessInfo.targetName)}
        </div>
      )}
    </div>
  );
};
