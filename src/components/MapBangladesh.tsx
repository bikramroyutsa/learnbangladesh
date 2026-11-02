"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  Filter
} from "lucide-react";
import { DistrictData } from "@/types";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, DIVISIONS, DivisionName } from "@/data/districtsData";
import { playRevealSound } from "@/utils/audio";

interface MapBangladeshProps {
  districts: DistrictData[];
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  revealedDistrictIds: Set<string>;
  onToggleRevealDistrict: (districtId: string) => void;
  onRevealAll: () => void;
  onHideAll: () => void;
  selectedDivision: DivisionName;
  onSelectDivision: (division: DivisionName) => void;
}

export const MapBangladesh: React.FC<MapBangladeshProps> = ({
  districts,
  selectedDistrict,
  onSelectDistrict,
  revealedDistrictIds,
  onToggleRevealDistrict,
  onRevealAll,
  onHideAll,
  selectedDivision,
  onSelectDivision
}) => {
  // Zoom and Pan states
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.3, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.3, 0.8));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary button
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle clicking a district on the SVG map
  const handleDistrictClick = useCallback(
    (district: DistrictData, e: React.MouseEvent) => {
      e.stopPropagation();
      playRevealSound();
      onToggleRevealDistrict(district.id);
      onSelectDistrict(district);
    },
    [onSelectDistrict, onToggleRevealDistrict]
  );

  // Filter districts based on search and division
  const filteredDistricts = districts.filter((d) => {
    const matchesDivision = selectedDivision === "All" || d.division === selectedDivision;
    const matchesSearch =
      searchQuery.trim() === "" ||
      d.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shapeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.bnName.includes(searchQuery.trim());
    return matchesDivision && matchesSearch;
  });

  const allAreRevealed = revealedDistrictIds.size === districts.length;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Map Header Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search district / জেলা..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls: Show/Hide All, Zoom */}
        <div className="flex items-center gap-2">
          {/* Toggle All Labels */}
          <button
            onClick={allAreRevealed ? onHideAll : onRevealAll}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs ${
              allAreRevealed
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
            title={allAreRevealed ? "Hide all city names" : "Show all 64 city names on the map"}
          >
            {allAreRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Hide All Names</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                <span>Show All Names</span>
              </>
            )}
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <button
              onClick={handleZoomIn}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              title="Reset Zoom & Pan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Division Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 text-xs scrollbar-none dark:border-slate-800/80 dark:bg-slate-900">
        <span className="flex items-center gap-1 font-semibold text-slate-400 dark:text-slate-500 pl-1 pr-2 shrink-0">
          <Filter className="h-3 w-3" />
          Division:
        </span>
        {DIVISIONS.map((div) => {
          const isSelected = selectedDivision === div;
          return (
            <button
              key={div}
              onClick={() => onSelectDivision(div)}
              className={`rounded-full px-2.5 py-1 font-medium transition-all shrink-0 ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {div}
            </button>
          );
        })}
      </div>

      {/* Interactive Map Canvas */}
      <div
        className="relative flex-1 min-h-[560px] sm:min-h-[680px] bg-sky-50/20 dark:bg-slate-950/40 select-none overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center p-2"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Subtle Watermark and Coordinates Compass */}
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-400/80 dark:text-slate-600 flex flex-col gap-0.5">
          <span className="font-semibold tracking-wider uppercase">People&apos;s Republic of Bangladesh</span>
          <span>64 Districts • 8 Divisions</span>
        </div>

        {/* Instructions pill overlay */}
        <div className="absolute top-3 left-4 pointer-events-none rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs px-3 py-1 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-2xs">
          💡 Click any city/district to show its name on map
        </div>

        {/* Hovered District Tooltip indicator */}
        {hoveredDistrict && !revealedDistrictIds.has(hoveredDistrict.id) && (
          <div className="absolute top-3 right-4 pointer-events-none rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md animate-in fade-in duration-150">
            Click to reveal: {hoveredDistrict.displayName} ({hoveredDistrict.bnName})
          </div>
        )}

        {/* SVG Container */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-full max-h-[82vh] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center"
          }}
        >
          {/* Defs for drop shadows and patterns */}
          <defs>
            <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodOpacity="0.12" floodColor="#0f172a" />
            </filter>
            <filter id="label-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.35" floodColor="#000000" />
            </filter>
            <filter id="active-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodOpacity="0.6" floodColor="#059669" />
            </filter>
          </defs>

          {/* Districts Layer */}
          <g filter="url(#map-shadow)">
            {districts.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const isHovered = hoveredDistrict?.id === district.id;
              const isDimmed =
                selectedDivision !== "All" && district.division !== selectedDivision;
              const isRevealed = revealedDistrictIds.has(district.id);

              return (
                <path
                  key={district.id}
                  d={district.path}
                  fill={district.color}
                  stroke={isSelected ? "#047857" : isHovered ? "#334155" : "#64748b"}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2 : 1}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.35 : 1}
                  className="cursor-pointer transition-all duration-150 ease-out"
                  style={{
                    filter: isSelected ? "brightness(1.08)" : isHovered ? "brightness(1.04)" : "none"
                  }}
                  onClick={(e) => handleDistrictClick(district, e)}
                  onMouseEnter={() => setHoveredDistrict(district)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
              );
            })}
          </g>

          {/* Revealed City Names Layer */}
          <g className="pointer-events-none">
            {districts.map((district) => {
              const isRevealed = revealedDistrictIds.has(district.id);
              if (!isRevealed) return null;

              const isSelected = selectedDistrict?.id === district.id;
              const [cx, cy] = district.centroid;
              const isCapital = district.isCapital;

              return (
                <g key={`label-${district.id}`} transform={`translate(${cx}, ${cy})`}>
                  {/* Pin marker for active/selected district */}
                  {isSelected && (
                    <g className="animate-pulse">
                      <circle r="18" fill="#10b981" fillOpacity="0.25" />
                      <circle r="7" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />
                    </g>
                  )}

                  {/* Clean city label mimicking the JPG reference map */}
                  <g transform={`translate(0, ${isSelected ? -16 : 0})`}>
                    {/* Background white pill for crisp contrast */}
                    <rect
                      x={-(district.displayName.length * 4.6 + 6)}
                      y="-11"
                      width={district.displayName.length * 9.2 + 12}
                      height="20"
                      rx="4"
                      fill="rgba(255, 255, 255, 0.88)"
                      stroke={isSelected ? "#059669" : "rgba(0, 0, 0, 0.15)"}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                    />

                    {/* City Name Text */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isCapital ? 14 : 11}
                      fontWeight={isCapital || isSelected ? "800" : "700"}
                      fill={isCapital ? "#1d4ed8" : isSelected ? "#065f46" : "#0f172a"}
                      letterSpacing="0.4px"
                      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    >
                      {district.displayName.toUpperCase()}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Map Footer Stats / Search Feedback */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
        <div>
          Showing <strong>{filteredDistricts.length}</strong> of 64 districts
          {selectedDivision !== "All" && ` in ${selectedDivision} Division`}
        </div>
        <div>
          Revealed on map: <strong>{revealedDistrictIds.size} / 64</strong>
        </div>
      </div>
    </div>
  );
};

