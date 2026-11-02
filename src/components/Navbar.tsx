"use client";

import React from "react";
import { Map, Trophy, Image as ImageIcon, Sparkles, RotateCcw, Sun, Moon } from "lucide-react";
import { ViewMode, Language } from "@/types";
import { translations, toBanglaNumber } from "@/utils/i18n";

interface NavbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  revealedCount: number;
  totalCount: number;
  onResetRevealed: () => void;
  onOpenReference: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  revealedCount,
  totalCount,
  onResetRevealed,
  onOpenReference,
  language,
  onLanguageChange,
  theme,
  onToggleTheme
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs transition-colors">
      <div className="mx-auto flex max-w-[1580px] items-center justify-between px-2.5 py-2 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20 text-base sm:text-xl shrink-0">
            🇧🇩
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl truncate max-w-[120px] xs:max-w-none">
                {t.title}
              </h1>
              <span className="hidden sm:inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {language === "bn" ? `${toBanglaNumber(64)}টি জেলা` : "64 Districts"}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switcher, Language Toggle, Theme Toggle & Actions */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
            title={theme === "dark" ? t.switchToLight : t.switchToDark}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-700 animate-in spin-in-90 duration-300" />
            )}
          </button>

          {/* Language Switcher Button */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-2xs shrink-0">
            <button
              onClick={() => onLanguageChange("en")}
              className={`rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("bn")}
              className={`rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                language === "bn"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              বাং
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 sm:p-1 dark:bg-slate-800 shrink-0">
            <button
              onClick={() => onModeChange("explore")}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                mode === "explore"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>{t.exploreMode}</span>
            </button>
            <button
              onClick={() => onModeChange("quiz")}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-md px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                mode === "quiz"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
              <span className="font-semibold">{t.quizMode}</span>
            </button>
          </div>

          {/* Reference Image Button */}
          <button
            onClick={onOpenReference}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs cursor-pointer shrink-0"
            title="View original JPG reference map"
          >
            <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">{t.referenceMap}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
