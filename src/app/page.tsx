"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MapBangladesh } from "@/components/MapBangladesh";
import { DistrictInfoPanel } from "@/components/DistrictInfoPanel";
import { SeterraQuizHeader } from "@/components/SeterraQuizHeader";
import { SeterraCompletionModal } from "@/components/SeterraCompletionModal";
import { ReferenceModal } from "@/components/ReferenceModal";
import { DISTRICTS_DATA, DivisionName } from "@/data/districtsData";
import { DistrictData, ViewMode, SeterraAttemptResult, QuizResults, Language } from "@/types";
import { playSuccessSound, playErrorSound, playRevealSound, speakDistrictName } from "@/utils/audio";
import { translations, toBanglaNumber, DIVISION_BN } from "@/utils/i18n";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<Language>("bn");
  const [districts] = useState<DistrictData[]>(DISTRICTS_DATA);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [revealedDistrictIds, setRevealedDistrictIds] = useState<Set<string>>(() => {
    // By default in Explore mode, reveal Dhaka
    return new Set<string>(["dhaka"]);
  });
  const [selectedDivision, setSelectedDivision] = useState<DivisionName>("All");
  const [mode, setMode] = useState<ViewMode>("explore");
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState<boolean>(false);

  // Seterra Quiz Mode States
  const [quizDivision, setQuizDivision] = useState<DivisionName>("All");
  const [quizQueue, setQuizQueue] = useState<DistrictData[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [currentAttempts, setCurrentAttempts] = useState<number>(0);
  const [quizResultsMap, setQuizResultsMap] = useState<Map<string, SeterraAttemptResult>>(new Map());
  const [quizElapsedSeconds, setQuizElapsedSeconds] = useState<number>(0);
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);
  const [wrongGuessInfo, setWrongGuessInfo] = useState<{
    clickedName: string;
    targetName: string;
    clickedBn?: string;
    targetBn?: string;
  } | null>(null);
  const [flashingDistrictId, setFlashingDistrictId] = useState<string | null>(null);
  const [quizCompletedResults, setQuizCompletedResults] = useState<QuizResults | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState<boolean>(false);
  const [autoVoice, setAutoVoice] = useState<boolean>(true);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);

  const t = translations[language];

  // Theme initialization and listener
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Helper to shuffle districts
  const shuffleDistricts = (items: DistrictData[]) => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Start or restart Seterra Quiz
  const startQuiz = (division: DivisionName = quizDivision) => {
    const pool = districts.filter((d) => division === "All" || d.division === division);
    const shuffled = shuffleDistricts(pool);
    setQuizQueue(shuffled);
    setCurrentQuizIndex(0);
    setCurrentAttempts(0);
    setQuizResultsMap(new Map());
    setQuizElapsedSeconds(0);
    setQuizTimerActive(true);
    setWrongGuessInfo(null);
    setFlashingDistrictId(null);
    setQuizCompletedResults(null);
    setIsCompletionModalOpen(false);
  };

  // Switch to quiz mode starts quiz automatically
  useEffect(() => {
    if (mode === "quiz") {
      startQuiz(quizDivision);
    }
  }, [mode]);

  // Stopwatch Timer effect for Seterra quiz
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mode === "quiz" && quizTimerActive && currentQuizIndex < quizQueue.length) {
      interval = setInterval(() => {
        setQuizElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, quizTimerActive, currentQuizIndex, quizQueue.length]);

  // Seterra Score Calculation
  const calculateScorePercent = () => {
    if (quizResultsMap.size === 0) return 100;
    let earned = 0;
    quizResultsMap.forEach((result) => {
      if (result === 1) earned += 3;
      else if (result === 2) earned += 2;
      else if (result === 3) earned += 1;
    });
    const maxPossible = quizResultsMap.size * 3;
    return Math.round((earned / maxPossible) * 100);
  };

  // Seterra Quiz District Click Handler
  const handleQuizDistrictClick = (clicked: DistrictData) => {
    if (currentQuizIndex >= quizQueue.length) return;
    const target = quizQueue[currentQuizIndex];

    // If quiz is scoped to a specific division, ignore clicks on districts outside that division
    if (quizDivision !== "All" && clicked.division !== quizDivision) {
      return;
    }

    // If already solved, ignore
    if (quizResultsMap.has(clicked.id)) {
      return;
    }

    if (clicked.id === target.id) {
      // Correct guess!
      playSuccessSound();
      const attemptResult: SeterraAttemptResult =
        currentAttempts === 0 ? 1 : currentAttempts === 1 ? 2 : 3;

      const nextResultsMap = new Map(quizResultsMap);
      nextResultsMap.set(target.id, attemptResult);
      setQuizResultsMap(nextResultsMap);
      setWrongGuessInfo(null);

      // Check if finished
      if (currentQuizIndex + 1 >= quizQueue.length) {
        setQuizTimerActive(false);
        try {
          confetti({
            particleCount: 130,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch {}

        let firstCount = 0, secondCount = 0, thirdCount = 0, missedCount = 0;
        let earned = 0;
        nextResultsMap.forEach((res) => {
          if (res === 1) { firstCount++; earned += 3; }
          else if (res === 2) { secondCount++; earned += 2; }
          else if (res === 3) { thirdCount++; earned += 1; }
          else if (res === 0) { missedCount++; }
        });
        const finalScore = Math.round((earned / (quizQueue.length * 3)) * 100);

        setQuizCompletedResults({
          scorePercent: finalScore,
          timeSeconds: quizElapsedSeconds,
          firstTryCount: firstCount,
          secondTryCount: secondCount,
          thirdTryCount: thirdCount,
          missedCount: missedCount,
          totalQuestions: quizQueue.length
        });
        setIsCompletionModalOpen(true);
      } else {
        setCurrentQuizIndex((prev) => prev + 1);
        setCurrentAttempts(0);
      }
    } else {
      // Wrong guess!
      playErrorSound();
      // Flash clicked district in red
      setFlashingDistrictId(clicked.id);
      setTimeout(() => setFlashingDistrictId(null), 600);

      setWrongGuessInfo({
        clickedName: clicked.displayName,
        targetName: target.displayName,
        clickedBn: clicked.bnName,
        targetBn: target.bnName
      });

      const nextAttempts = currentAttempts + 1;
      if (nextAttempts >= 3) {
        // 3 misses: Seterra reveals the target district in red
        setFlashingDistrictId(target.id);
        const nextResultsMap = new Map(quizResultsMap);
        nextResultsMap.set(target.id, 0); // 0 = missed
        setQuizResultsMap(nextResultsMap);

        setTimeout(() => {
          setFlashingDistrictId(null);
          setWrongGuessInfo(null);
          if (currentQuizIndex + 1 >= quizQueue.length) {
            setQuizTimerActive(false);
            let firstCount = 0, secondCount = 0, thirdCount = 0, missedCount = 0;
            let earned = 0;
            nextResultsMap.forEach((res) => {
              if (res === 1) { firstCount++; earned += 3; }
              else if (res === 2) { secondCount++; earned += 2; }
              else if (res === 3) { thirdCount++; earned += 1; }
              else if (res === 0) { missedCount++; }
            });
            const finalScore = Math.round((earned / (quizQueue.length * 3)) * 100);
            setQuizCompletedResults({
              scorePercent: finalScore,
              timeSeconds: quizElapsedSeconds,
              firstTryCount: firstCount,
              secondTryCount: secondCount,
              thirdTryCount: thirdCount,
              missedCount: missedCount,
              totalQuestions: quizQueue.length
            });
            setIsCompletionModalOpen(true);
          } else {
            setCurrentQuizIndex((prev) => prev + 1);
            setCurrentAttempts(0);
          }
        }, 1200);
      } else {
        setCurrentAttempts(nextAttempts);
      }
    }
  };

  // Give Up on current question
  const handleGiveUpCurrent = () => {
    if (currentQuizIndex >= quizQueue.length) return;
    const target = quizQueue[currentQuizIndex];
    setFlashingDistrictId(target.id);
    const nextResultsMap = new Map(quizResultsMap);
    nextResultsMap.set(target.id, 0);
    setQuizResultsMap(nextResultsMap);

    setTimeout(() => {
      setFlashingDistrictId(null);
      setWrongGuessInfo(null);
      if (currentQuizIndex + 1 >= quizQueue.length) {
        setQuizTimerActive(false);
        let firstCount = 0, secondCount = 0, thirdCount = 0, missedCount = 0;
        let earned = 0;
        nextResultsMap.forEach((res) => {
          if (res === 1) { firstCount++; earned += 3; }
          else if (res === 2) { secondCount++; earned += 2; }
          else if (res === 3) { thirdCount++; earned += 1; }
          else if (res === 0) { missedCount++; }
        });
        const finalScore = Math.round((earned / (quizQueue.length * 3)) * 100);
        setQuizCompletedResults({
          scorePercent: finalScore,
          timeSeconds: quizElapsedSeconds,
          firstTryCount: firstCount,
          secondTryCount: secondCount,
          thirdTryCount: thirdCount,
          missedCount: missedCount,
          totalQuestions: quizQueue.length
        });
        setIsCompletionModalOpen(true);
      } else {
        setCurrentQuizIndex((prev) => prev + 1);
        setCurrentAttempts(0);
      }
    }, 1000);
  };

  // Explore Mode Handlers
  const handleToggleReveal = (districtId: string) => {
    setRevealedDistrictIds((prev) => {
      const next = new Set(prev);
      if (next.has(districtId)) {
        next.add(districtId);
      } else {
        next.add(districtId);
      }
      return next;
    });
  };

  const handleSelectDistrict = (district: DistrictData) => {
    setSelectedDistrict(district);
    setRevealedDistrictIds((prev) => new Set(prev).add(district.id));
    if (typeof window !== "undefined" && window.innerWidth < 1024 && infoPanelRef.current) {
      setTimeout(() => {
        infoPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleRevealAll = () => {
    setRevealedDistrictIds(new Set(districts.map((d) => d.id)));
  };

  const handleHideAll = () => {
    setRevealedDistrictIds(new Set());
    setSelectedDistrict(null);
  };

  const handleResetRevealed = () => {
    setRevealedDistrictIds(new Set());
    setSelectedDistrict(null);
  };

  const currentTargetDistrict =
    mode === "quiz" && currentQuizIndex < quizQueue.length ? quizQueue[currentQuizIndex] : null;

  // Automatically pronounce city name in voice when target changes in Quiz mode
  useEffect(() => {
    if (mode === "quiz" && autoVoice && currentTargetDistrict) {
      speakDistrictName(currentTargetDistrict.id, currentTargetDistrict.bnName, language);
    }
  }, [mode, currentTargetDistrict?.id, autoVoice, language]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation with Language Switcher & Theme Switcher */}
      <Navbar
        mode={mode}
        onModeChange={(newMode) => {
          setMode(newMode);
          if (newMode === "quiz") {
            startQuiz(quizDivision);
          }
        }}
        revealedCount={revealedDistrictIds.size}
        totalCount={districts.length}
        onResetRevealed={handleResetRevealed}
        onOpenReference={() => setIsReferenceOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Expansive Container */}
      <main className="flex-1 max-w-[1580px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        {/* Seterra Quiz Header */}
        {mode === "quiz" && (
          <SeterraQuizHeader
            targetDistrict={currentTargetDistrict}
            scorePercent={calculateScorePercent()}
            completedCount={quizResultsMap.size}
            totalQuestions={quizQueue.length}
            currentAttempts={currentAttempts}
            elapsedSeconds={quizElapsedSeconds}
            wrongGuessInfo={wrongGuessInfo}
            quizDivision={quizDivision}
            onSelectQuizDivision={(div) => {
              setQuizDivision(div);
              startQuiz(div);
            }}
            onRestart={() => startQuiz(quizDivision)}
            onGiveUpCurrent={handleGiveUpCurrent}
            language={language}
            autoVoice={autoVoice}
            onToggleAutoVoice={() => setAutoVoice(!autoVoice)}
          />
        )}

        {/* Map and Side Panel Layout */}
        <div className={`grid grid-cols-1 ${mode === "quiz" ? "grid-cols-1" : "lg:grid-cols-12"} gap-5 items-start`}>
          {/* Main Big Map View */}
          <div className={`${mode === "quiz" ? "col-span-1" : "lg:col-span-8 xl:col-span-9"} flex flex-col`}>
            <MapBangladesh
              districts={districts}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              revealedDistrictIds={revealedDistrictIds}
              onToggleRevealDistrict={handleToggleReveal}
              onRevealAll={handleRevealAll}
              onHideAll={handleHideAll}
              selectedDivision={selectedDivision}
              onSelectDivision={setSelectedDivision}
              language={language}
              // Seterra Quiz Mode props
              isQuizMode={mode === "quiz"}
              quizDivision={quizDivision}
              quizResultsMap={quizResultsMap}
              flashingDistrictId={flashingDistrictId}
              onQuizDistrictClick={handleQuizDistrictClick}
            />
          </div>

          {/* Side Info Panel (Active in Explore Mode) */}
          {mode === "explore" && (
            <div ref={infoPanelRef} className="lg:col-span-4 xl:col-span-3 flex flex-col lg:sticky lg:top-20">
              <DistrictInfoPanel
                district={selectedDistrict}
                onClose={() => setSelectedDistrict(null)}
                onSelectDistrict={handleSelectDistrict}
                allDistricts={districts}
                language={language}
              />
            </div>
          )}
        </div>

        {/* 64 Districts Dropdown Section */}
        <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
              className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer w-full sm:w-auto"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {t.allDistrictsDirectory}
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] sm:text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {language === "bn"
                    ? toBanglaNumber(districts.filter((d) => selectedDivision === "All" || d.division === selectedDivision).length)
                    : districts.filter((d) => selectedDivision === "All" || d.division === selectedDivision).length}
                </span>
                {isDistrictDropdownOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-auto sm:ml-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors ml-auto sm:ml-0" />
                )}
              </div>
            </button>

            {/* Quick District Select Dropdown Menu & Expand Toggle */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="district-select-dropdown" className="sr-only">
                {t.selectDistrictDropdown}
              </label>
              <select
                id="district-select-dropdown"
                value={selectedDistrict?.id || ""}
                onChange={(e) => {
                  const found = districts.find((d) => d.id === e.target.value);
                  if (found) handleSelectDistrict(found);
                }}
                className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="">{t.selectDistrictDropdown}</option>
                {districts.map((d) => {
                  const divLabel = language === "bn" ? DIVISION_BN[d.division] || d.division : d.division;
                  return (
                    <option key={d.id} value={d.id}>
                      {language === "bn" ? `${d.bnName} (${d.displayName}) • ${divLabel}` : `${d.displayName} (${d.bnName}) • ${divLabel}`}
                    </option>
                  );
                })}
              </select>

              <button
                onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                <span>{isDistrictDropdownOpen ? t.hideGrid : t.showGrid}</span>
                {isDistrictDropdownOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Dropdown Content Grid */}
          {isDistrictDropdownOpen && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {districts
                  .filter((d) => selectedDivision === "All" || d.division === selectedDivision)
                  .map((d) => {
                    const isRevealed = revealedDistrictIds.has(d.id);
                    const isSelected = selectedDistrict?.id === d.id;

                    return (
                      <button
                        key={d.id}
                        onClick={() => handleSelectDistrict(d)}
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/60 dark:text-white font-semibold ring-2 ring-emerald-500/20"
                            : isRevealed
                            ? "border-slate-200 bg-slate-50/70 text-slate-900 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 hover:border-emerald-400"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800/60 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="truncate">
                              {language === "bn" ? d.bnName : d.displayName}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {language === "bn" ? d.displayName : d.bnName}
                          </div>
                        </div>
                        {isRevealed && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0 ml-1">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Reference Image Modal */}
      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* Seterra Completion Scorecard Modal */}
      <SeterraCompletionModal
        isOpen={isCompletionModalOpen}
        results={quizCompletedResults}
        onRestart={() => startQuiz(quizDivision)}
        onClose={() => setIsCompletionModalOpen(false)}
        language={language}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-[1580px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t.footerText}</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsReferenceOpen(true)}
              className="text-emerald-600 hover:underline dark:text-emerald-400 cursor-pointer"
            >
              {t.referenceMap}
            </button>
            <button
              onClick={handleRevealAll}
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300 cursor-pointer"
            >
              {t.showAll64}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
