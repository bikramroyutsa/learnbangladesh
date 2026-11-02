"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { MapBangladesh } from "@/components/MapBangladesh";
import { DistrictInfoPanel } from "@/components/DistrictInfoPanel";
import { QuizView } from "@/components/QuizView";
import { ReferenceModal } from "@/components/ReferenceModal";
import { DISTRICTS_DATA, DivisionName } from "@/data/districtsData";
import { DistrictData, ViewMode } from "@/types";

export default function Home() {
  const [districts] = useState<DistrictData[]>(DISTRICTS_DATA);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [revealedDistrictIds, setRevealedDistrictIds] = useState<Set<string>>(() => {
    // By default, reveal Dhaka so users immediately see how the label looks on the map
    return new Set<string>(["dhaka"]);
  });
  const [selectedDivision, setSelectedDivision] = useState<DivisionName>("All");
  const [mode, setMode] = useState<ViewMode>("explore");
  const [isReferenceOpen, setIsReferenceOpen] = useState<boolean>(false);
  const [lastClickedDistrict, setLastClickedDistrict] = useState<DistrictData | null>(null);

  // Toggle reveal for a district
  const handleToggleReveal = (districtId: string) => {
    setRevealedDistrictIds((prev) => {
      const next = new Set(prev);
      if (next.has(districtId)) {
        // If already selected, clicking it again toggles or keeps it
        next.add(districtId);
      } else {
        next.add(districtId);
      }
      return next;
    });
  };

  const handleSelectDistrict = (district: DistrictData) => {
    setSelectedDistrict(district);
    setLastClickedDistrict(district);
    setRevealedDistrictIds((prev) => new Set(prev).add(district.id));
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        mode={mode}
        onModeChange={setMode}
        revealedCount={revealedDistrictIds.size}
        totalCount={districts.length}
        onResetRevealed={handleResetRevealed}
        onOpenReference={() => setIsReferenceOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Map View */}
          <div className="lg:col-span-8 xl:col-span-8 flex flex-col">
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
            />
          </div>

          {/* Side Panel: Info or Quiz */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col lg:sticky lg:top-20">
            {mode === "explore" ? (
              <DistrictInfoPanel
                district={selectedDistrict}
                onClose={() => setSelectedDistrict(null)}
                onSelectDistrict={handleSelectDistrict}
                allDistricts={districts}
              />
            ) : (
              <QuizView
                districts={districts}
                onDistrictGuess={handleSelectDistrict}
                lastClickedDistrict={lastClickedDistrict}
              />
            )}
          </div>
        </div>

        {/* Quick Directory Grid of All 64 Districts */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                All 64 Districts Directory (৬৪টি জেলা)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any district to locate and reveal it instantly on the map
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {districts.filter((d) => selectedDivision === "All" || d.division === selectedDivision).length} districts shown
            </div>
          </div>

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
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
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
                        <span className="truncate">{d.displayName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {d.bnName}
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
        </section>
      </main>

      {/* Reference Image Modal */}
      <ReferenceModal
        isOpen={isReferenceOpen}
        onClose={() => setIsReferenceOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Learn Bangladesh • Interactive district map inspired by <code>bdmapdistricts.jpg</code>
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => setIsReferenceOpen(true)}
              className="text-emerald-600 hover:underline dark:text-emerald-400"
            >
              View Reference JPG
            </button>
            <button
              onClick={handleRevealAll}
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-300"
            >
              Show All 64 Districts
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
