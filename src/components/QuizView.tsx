"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, HelpCircle, CheckCircle2, XCircle, RotateCcw, Flame } from "lucide-react";
import { DistrictData } from "@/types";
import { playSuccessSound, playErrorSound } from "@/utils/audio";

interface QuizViewProps {
  districts: DistrictData[];
  onDistrictGuess: (district: DistrictData) => void;
  lastClickedDistrict: DistrictData | null;
}

export const QuizView: React.FC<QuizViewProps> = ({
  districts,
  lastClickedDistrict
}) => {
  const [currentTarget, setCurrentTarget] = useState<DistrictData | null>(null);
  const [score, setScore] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong" | null;
    message: string;
  }>({ type: null, message: "" });
  const [showHint, setShowHint] = useState<boolean>(false);
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(new Set());

  // Pick a new random target district
  const pickNewTarget = () => {
    const remaining = districts.filter((d) => !completedTargets.has(d.id));
    if (remaining.length === 0) {
      setCurrentTarget(null);
      return;
    }
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentTarget(random);
    setFeedback({ type: null, message: "" });
    setShowHint(false);
  };

  // Initialize first target
  useEffect(() => {
    if (!currentTarget && districts.length > 0) {
      const initial = districts[Math.floor(Math.random() * districts.length)];
      setCurrentTarget(initial);
    }
  }, [districts, currentTarget]);

  // Check last clicked district against current target
  useEffect(() => {
    if (!lastClickedDistrict || !currentTarget) return;

    if (lastClickedDistrict.id === currentTarget.id) {
      // Correct!
      playSuccessSound();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }

      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      setQuestionsAnswered((prev) => prev + 1);

      setCompletedTargets((prev) => new Set(prev).add(currentTarget.id));
      setFeedback({
        type: "correct",
        message: `Spot on! That is indeed ${currentTarget.displayName} (${currentTarget.bnName})!`
      });

      // Advance after a brief delay
      const timer = setTimeout(() => {
        pickNewTarget();
      }, 1400);
      return () => clearTimeout(timer);
    } else {
      // Wrong
      playErrorSound();
      setStreak(0);
      setQuestionsAnswered((prev) => prev + 1);
      setFeedback({
        type: "wrong",
        message: `Oops! That was ${lastClickedDistrict.displayName}. Try locating ${currentTarget.displayName}!`
      });
    }
  }, [lastClickedDistrict]);

  const handleRestart = () => {
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setCompletedTargets(new Set());
    pickNewTarget();
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-full justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Map Quiz Challenge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test your geography knowledge of Bangladesh
              </p>
            </div>
          </div>
          <button
            onClick={handleRestart}
            title="Reset Quiz"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Score & Streak Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Score</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {score} / {questionsAnswered}
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <Flame className="h-3 w-3 text-amber-500" />
              Streak
            </span>
            <span className="text-base font-bold text-amber-600 dark:text-amber-400">
              {streak} 🔥
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Best</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {bestStreak}
            </span>
          </div>
        </div>

        {/* Current Prompt Card */}
        {currentTarget ? (
          <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-5 text-center dark:border-emerald-600/30 dark:bg-emerald-950/20">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block mb-1">
              Find & Click On The Map:
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white my-1">
              {currentTarget.displayName}
            </div>
            <div className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
              {currentTarget.bnName}
            </div>

            {/* Hint toggler */}
            <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-900/50">
              {showHint ? (
                <div className="text-xs text-slate-700 dark:text-slate-300 font-medium animate-in fade-in">
                  💡 Hint: Located in <strong>{currentTarget.division} Division</strong>
                </div>
              ) : (
                <button
                  onClick={() => setShowHint(true)}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 transition-colors"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Need a hint?</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40">
            <Trophy className="mx-auto h-10 w-10 text-amber-500 mb-2" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Outstanding Job!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              You found all districts! Your final score is {score}/{questionsAnswered}.
            </p>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback.type && (
          <div
            className={`flex items-start gap-2.5 rounded-xl p-3 text-xs font-medium animate-in slide-in-from-top-2 duration-150 ${
              feedback.type === "correct"
                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200"
            }`}
          >
            {feedback.type === "correct" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            )}
            <div>{feedback.message}</div>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={pickNewTarget}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <span>Skip / Next District</span>
        </button>
      </div>
    </div>
  );
};

