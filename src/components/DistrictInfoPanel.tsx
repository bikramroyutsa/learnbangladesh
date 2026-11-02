"use client";

import React from "react";
import { Volume2, MapPin, Compass, Users, LandPlot, Sparkles, Shuffle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { DistrictData } from "@/types";
import { speakDistrictName } from "@/utils/audio";

interface DistrictInfoPanelProps {
  district: DistrictData | null;
  onClose: () => void;
  onSelectDistrict: (district: DistrictData) => void;
  allDistricts: DistrictData[];
}

export const DistrictInfoPanel: React.FC<DistrictInfoPanelProps> = ({
  district,
  onClose,
  onSelectDistrict,
  allDistricts
}) => {
  const handleRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * allDistricts.length);
    onSelectDistrict(allDistricts[randomIndex]);
  };

  const handleNextCity = () => {
    if (!district) {
      onSelectDistrict(allDistricts[0]);
      return;
    }
    const currentIndex = allDistricts.findIndex((d) => d.id === district.id);
    const nextIndex = (currentIndex + 1) % allDistricts.length;
    onSelectDistrict(allDistricts[nextIndex]);
  };

  const handlePrevCity = () => {
    if (!district) {
      onSelectDistrict(allDistricts[allDistricts.length - 1]);
      return;
    }
    const currentIndex = allDistricts.findIndex((d) => d.id === district.id);
    const prevIndex = (currentIndex - 1 + allDistricts.length) % allDistricts.length;
    onSelectDistrict(allDistricts[prevIndex]);
  };

  if (!district) {
    return (
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-full">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Compass className="h-6 w-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Explore Bangladesh
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any city/district on the map
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-200">
              👆 <strong>Tap or click any region on the map</strong> to reveal the city name right on the map. You can also view its division, landmarks, and facts.
            </p>
          </div>

          {/* Quick country statistics */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Districts (Zilas)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">64</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Divisions (Bibhag)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">8</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Area</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">147,570 km²</span>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Capital</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Dhaka (ঢাকা)</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRandomCity}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm"
          >
            <Shuffle className="h-4 w-4" />
            <span>Discover a Random City</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 h-full animate-in fade-in duration-200">
      <div className="space-y-4">
        {/* Header with Title and Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
              style={{ backgroundColor: district.color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {district.displayName}
                </h2>
                <button
                  onClick={() => speakDistrictName(district.displayName, district.bnName)}
                  title="Listen pronunciation"
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition-colors"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {district.bnName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Deselect city"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Division & Status Badge */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Compass className="h-3 w-3 text-slate-500" />
            {district.division} Division
          </span>
          {district.isCapital && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Sparkles className="h-3 w-3" />
              National Capital
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <MapPin className="h-3 w-3" />
            Shown on Map
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <LandPlot className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Area</span>
            </div>
            <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-white">
              {district.area}
            </span>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Users className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium">Population</span>
            </div>
            <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-white">
              {district.population}
            </span>
          </div>
        </div>

        {/* Famous For & Key Highlights */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1">
            Famous For & Highlights
          </span>
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {district.famousFor}
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={handlePrevCity}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          title="Previous District"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </button>

        <button
          onClick={handleRandomCity}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors"
          title="Pick random district"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Random</span>
        </button>

        <button
          onClick={handleNextCity}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
          title="Next District"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

