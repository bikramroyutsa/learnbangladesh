"use client";

import React from "react";
import { Map, Trophy, Image as ImageIcon, Sparkles, RotateCcw } from "lucide-react";
import { ViewMode } from "@/types";

interface NavbarProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  revealedCount: number;
  totalCount: number;
  onResetRevealed: () => void;
  onOpenReference: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onModeChange,
  revealedCount,
  totalCount,
  onResetRevealed,
  onOpenReference
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <span className="text-xl">🇧🇩</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
                Learn Bangladesh
              </h1>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                64 Districts
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Interactive Map • Click any city to reveal its name
            </p>
          </div>
        </div>

        {/* Mode Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => onModeChange("explore")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                mode === "explore"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Map className="h-4 w-4" />
              <span>Explore Map</span>
            </button>
            <button
              onClick={() => onModeChange("quiz")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
                mode === "quiz"
                  ? "bg-white text-emerald-700 shadow-xs dark:bg-slate-700 dark:text-emerald-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Quiz Mode</span>
            </button>
          </div>

          {/* Revealed stats pill in explore mode */}
          {mode === "explore" && (
            <div className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                <strong className="text-slate-900 dark:text-white">{revealedCount}</strong> / {totalCount} Revealed
              </span>
              {revealedCount > 0 && (
                <button
                  onClick={onResetRevealed}
                  title="Reset revealed labels"
                  className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {/* Reference Image Button */}
          <button
            onClick={onOpenReference}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
            title="View original JPG reference map"
          >
            <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Reference Map</span>
          </button>
        </div>
      </div>
    </header>
  );
};

