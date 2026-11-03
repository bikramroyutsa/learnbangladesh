"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Search,
  Filter,
  Maximize2,
  Minimize2,
  Target
} from "lucide-react";
import { DistrictData, SeterraAttemptResult, Language } from "@/types";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, DIVISIONS, DivisionName } from "@/data/districtsData";
import { playRevealSound } from "@/utils/audio";
import { translations, toBanglaNumber, DIVISION_BN } from "@/utils/i18n";

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
  language: Language;
  // Seterra Quiz Mode props
  isQuizMode?: boolean;
  quizDivision?: DivisionName;
  quizResultsMap?: Map<string, SeterraAttemptResult>;
  flashingDistrictId?: string | null;
  onQuizDistrictClick?: (district: DistrictData) => void;
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
  onSelectDivision,
  language = "en",
  isQuizMode = false,
  quizDivision = "All",
  quizResultsMap = new Map(),
  flashingDistrictId = null,
  onQuizDistrictClick
}) => {
  const t = translations[language];

  // Zoom and Pan states
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictData | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; dist?: number }>({ x: 0, y: 0 });

  // Zoom handlers
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.35, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // Focus on current active division
  const handleFocusDivision = useCallback(() => {
    const activeDiv = isQuizMode ? quizDivision : selectedDivision;
    if (!activeDiv || activeDiv === "All") {
      setScale(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const divDistricts = districts.filter((d) => d.division === activeDiv);
    if (divDistricts.length === 0) return;

    const minX = Math.min(...divDistricts.map((d) => d.bbox[0]));
    const minY = Math.min(...divDistricts.map((d) => d.bbox[1]));
    const maxX = Math.max(...divDistricts.map((d) => d.bbox[2]));
    const maxY = Math.max(...divDistricts.map((d) => d.bbox[3]));

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = VIEWBOX_WIDTH / (width * 1.45);
    const scaleY = VIEWBOX_HEIGHT / (height * 1.45);
    const targetScale = Math.min(Math.max(Math.min(scaleX, scaleY), 1.25), 3.0);

    const dx = (500 - centerX) * 0.52 * targetScale;
    const dy = (715 - centerY) * 0.52 * targetScale;

    setScale(targetScale);
    setPan({ x: dx, y: dy });
  }, [districts, isQuizMode, quizDivision, selectedDivision]);

  // Auto-focus division when starting or changing quiz division
  React.useEffect(() => {
    if (isQuizMode && quizDivision) {
      if (quizDivision === "All") {
        setScale(1);
        setPan({ x: 0, y: 0 });
      } else {
        handleFocusDivision();
      }
    }
  }, [isQuizMode, quizDivision, handleFocusDivision]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
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

  // Touch handlers for mobile (Pan + Pinch Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX - pan.x,
        y: touch.clientY - pan.y
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = {
        x: pan.x,
        y: pan.y,
        dist: Math.hypot(dx, dy)
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && !touchStartRef.current.dist) {
      const touch = e.touches[0];
      setPan({
        x: touch.clientX - touchStartRef.current.x,
        y: touch.clientY - touchStartRef.current.y
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const factor = newDist / touchStartRef.current.dist;
      setScale((prev) => Math.min(Math.max(prev * (1 + (factor - 1) * 0.4), 0.75), 4));
      touchStartRef.current.dist = newDist;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = { x: 0, y: 0 };
  };

  // Handle clicking a district on the SVG map
  const handleDistrictClick = useCallback(
    (district: DistrictData, e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      if (isQuizMode && onQuizDistrictClick) {
        onQuizDistrictClick(district);
      } else {
        playRevealSound();
        onToggleRevealDistrict(district.id);
        onSelectDistrict(district);
      }
    },
    [isQuizMode, onQuizDistrictClick, onSelectDistrict, onToggleRevealDistrict]
  );

  // Filter districts based on search and division in explore mode
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

  // Determine District Fill Color
  const getDistrictFill = (district: DistrictData) => {
    if (flashingDistrictId === district.id) {
      return "#ef4444";
    }

    if (isQuizMode) {
      if (quizResultsMap.has(district.id)) {
        const res = quizResultsMap.get(district.id);
        if (res === 1) return "#ffffff";
        if (res === 2) return "#fef08a";
        if (res === 3) return "#fdba74";
        if (res === 0) return "#fca5a5";
      }

      // If quiz is scoped to a specific division
      if (quizDivision && quizDivision !== "All") {
        if (district.division === quizDivision) {
          return "#e2e8f0"; // Active practice territory
        }
        return "#94a3b8"; // Outside dimmed territory
      }

      return "#e2e8f0";
    }

    return district.color;
  };

  // Determine District Stroke
  const getDistrictStroke = (district: DistrictData, isSelected: boolean, isHovered: boolean) => {
    if (flashingDistrictId === district.id) {
      return "#991b1b";
    }

    if (isQuizMode) {
      if (quizResultsMap.has(district.id)) {
        const res = quizResultsMap.get(district.id);
        if (res === 1) return "#059669";
        if (res === 2) return "#ca8a04";
        if (res === 3) return "#ea580c";
        if (res === 0) return "#dc2626";
      }

      if (quizDivision && quizDivision !== "All") {
        if (district.division === quizDivision) {
          return isHovered ? "#047857" : "#059669";
        }
        return "#64748b";
      }

      return isHovered ? "#475569" : "#94a3b8";
    }

    return isSelected ? "#047857" : isHovered ? "#1e293b" : "#64748b";
  };

  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-all duration-200 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none p-2 sm:p-4" : ""
      }`}
    >
      {/* Map Header Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/70 p-2.5 sm:p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        {/* Search Bar (Only in Explore mode) */}
        {!isQuizMode ? (
          <div className="relative flex-1 min-w-[150px] sm:min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-8 sm:pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
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
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {t.seterraQuizBadge}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden xs:inline">
              {t.quizInstruction}
            </span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          {!isQuizMode && (
            <button
              onClick={allAreRevealed ? onHideAll : onRevealAll}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-3 py-1.5 text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                allAreRevealed
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
              title={allAreRevealed ? t.hideAllNames : t.showAllNames}
            >
              {allAreRevealed ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">{t.hideAllNames}</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  <span className="hidden sm:inline">{t.showAllNames}</span>
                </>
              )}
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <button
              onClick={handleZoomIn}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={t.zoomIn}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={t.zoomOut}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title={t.resetZoom}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Focus Division Button */}
          {((isQuizMode && quizDivision !== "All") || (!isQuizMode && selectedDivision !== "All")) && (
            <button
              onClick={handleFocusDivision}
              className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shadow-2xs"
              title={t.focusDivision}
            >
              <Target className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xs:inline">{t.focusDivision}</span>
            </button>
          )}

          {/* Fullscreen Expand Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
            title={isFullscreen ? t.minimize : t.maximize}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Division Filter Badges (Explore mode only) */}
      {!isQuizMode && (
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs scrollbar-none dark:border-slate-800/80 dark:bg-slate-900">
          <span className="flex items-center gap-1 font-semibold text-slate-400 dark:text-slate-500 pl-0.5 sm:pl-1 pr-1.5 sm:pr-2 shrink-0 text-[11px] sm:text-xs">
            <Filter className="h-3 w-3" />
            {t.division}:
          </span>
          {DIVISIONS.map((div) => {
            const isSelected = selectedDivision === div;
            const label = language === "bn" ? DIVISION_BN[div] || div : div;
            return (
              <button
                key={div}
                onClick={() => onSelectDivision(div)}
                className={`rounded-full px-2.5 py-1 font-medium transition-all shrink-0 cursor-pointer text-[11px] sm:text-xs ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Interactive Map Canvas - Mobile Responsive Height & Touch Gesture Support */}
      <div
        className={`relative flex-1 select-none overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center p-1 sm:p-2 transition-all ${
          isFullscreen
            ? "h-[calc(100vh-110px)]"
            : "h-[58vh] min-h-[460px] sm:min-h-[640px] md:min-h-[760px] lg:min-h-[880px] xl:min-h-[940px]"
        } ${isQuizMode ? "bg-slate-100/50 dark:bg-slate-950" : "bg-sky-50/20 dark:bg-slate-950/40"}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: "none" }}
      >
        {/* Subtle Watermark and Coordinates Compass */}
        <div className="absolute bottom-2 left-3 sm:bottom-3 sm:left-4 pointer-events-none text-[10px] sm:text-[11px] text-slate-400/80 dark:text-slate-600 flex flex-col gap-0.5">
          <span className="font-semibold tracking-wider uppercase">{t.republicBangladesh}</span>
          <span>{language === "bn" ? `${toBanglaNumber(64)} জেলা • ${toBanglaNumber(8)} বিভাগ` : t.subWatermark}</span>
        </div>

        {/* Hovered District Indicator in Explore Mode */}
        {!isQuizMode && hoveredDistrict && !revealedDistrictIds.has(hoveredDistrict.id) && (
          <div className="absolute top-2 right-3 sm:top-3 sm:right-4 pointer-events-none rounded-full bg-emerald-600 px-3 py-1 text-[11px] sm:text-xs font-semibold text-white shadow-md animate-in fade-in duration-150">
            {language === "bn"
              ? `${hoveredDistrict.bnName} (${hoveredDistrict.displayName})`
              : `${hoveredDistrict.displayName} (${hoveredDistrict.bnName})`}
          </div>
        )}

        {/* Active Quiz Division Indicator Badge */}
        {isQuizMode && quizDivision && quizDivision !== "All" && (
          <div className="absolute top-2 left-3 sm:top-3 sm:left-4 z-10 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-md dark:border-emerald-500/30 dark:bg-slate-900/90 animate-in fade-in duration-200">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t.practiceArea}
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {language === "bn" ? `${DIVISION_BN[quizDivision]} বিভাগ` : `${quizDivision} Division`}
              </span>
            </div>
            <button
              onClick={handleFocusDivision}
              className="ml-1.5 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
              title={t.focusDivision}
            >
              {t.focusDivision}
            </button>
          </div>
        )}

        {/* SVG Container */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full h-full max-h-[90vh] transition-transform duration-75 ease-out drop-shadow-lg"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center"
          }}
        >
          <defs>
            <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="8" stdDeviation="14" floodOpacity="0.16" floodColor="#0f172a" />
            </filter>
            <filter id="label-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.35" floodColor="#000000" />
            </filter>
            <filter id="division-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodOpacity="0.8" floodColor="#10b981" />
            </filter>
          </defs>

          {/* Glowing contour highlighting the active quiz division */}
          {isQuizMode && quizDivision && quizDivision !== "All" && (
            <g className="pointer-events-none" filter="url(#division-glow)">
              {districts
                .filter((d) => d.division === quizDivision)
                .map((d) => (
                  <path
                    key={`glow-${d.id}`}
                    d={d.path}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                ))}
            </g>
          )}

          {/* Districts Vector Paths */}
          <g filter="url(#map-shadow)">
            {districts.map((district) => {
              const isSelected = selectedDistrict?.id === district.id;
              const isHovered = hoveredDistrict?.id === district.id;
              const activeDiv = isQuizMode ? quizDivision : selectedDivision;
              const hasDivScope = activeDiv && activeDiv !== "All";
              const isInsideDivision = hasDivScope ? district.division === activeDiv : true;
              const isDimmed = hasDivScope && !isInsideDivision;

              const fillColor = getDistrictFill(district);
              const strokeColor = getDistrictStroke(district, isSelected, isHovered);

              const strokeWidth =
                flashingDistrictId === district.id
                  ? 4
                  : isSelected
                  ? 3.5
                  : isHovered
                  ? 2.5
                  : isQuizMode && quizResultsMap.has(district.id)
                  ? 2
                  : isQuizMode && hasDivScope && isInsideDivision
                  ? 2
                  : 1;

              return (
                <path
                  key={district.id}
                  d={district.path}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={isDimmed ? (isQuizMode ? 0.22 : 0.35) : 1}
                  className={`transition-all duration-150 ease-out ${
                    isQuizMode && isDimmed ? "pointer-events-none cursor-default" : "cursor-pointer"
                  }`}
                  style={{
                    filter:
                      flashingDistrictId === district.id
                        ? "brightness(1.2)"
                        : isSelected
                        ? "brightness(1.08)"
                        : isHovered
                        ? "brightness(1.05)"
                        : "none"
                  }}
                  onClick={(e) => handleDistrictClick(district, e)}
                  onMouseEnter={() => (!isDimmed ? setHoveredDistrict(district) : null)}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
              );
            })}
          </g>

          {/* City Labels Layer */}
          <g className="pointer-events-none">
            {districts.map((district) => {
              const showLabel = isQuizMode
                ? quizResultsMap.has(district.id)
                : revealedDistrictIds.has(district.id);

              if (!showLabel) return null;

              const isSelected = !isQuizMode && selectedDistrict?.id === district.id;
              const [cx, cy] = district.centroid;
              const isCapital = district.isCapital;

              const labelText =
                language === "bn" ? district.bnName : district.displayName.toUpperCase();

              let pillBg = "rgba(255, 255, 255, 0.92)";
              let pillBorder = "rgba(0, 0, 0, 0.18)";
              let textColor = isCapital ? "#1d4ed8" : "#0f172a";

              if (isQuizMode && quizResultsMap.has(district.id)) {
                const res = quizResultsMap.get(district.id);
                if (res === 1) {
                  pillBg = "#ffffff";
                  pillBorder = "#059669";
                  textColor = "#065f46";
                } else if (res === 2) {
                  pillBg = "#fef08a";
                  pillBorder = "#ca8a04";
                  textColor = "#854d0e";
                } else if (res === 3) {
                  pillBg = "#fed7aa";
                  pillBorder = "#ea580c";
                  textColor = "#9a3412";
                } else if (res === 0) {
                  pillBg = "#fecaca";
                  pillBorder = "#dc2626";
                  textColor = "#991b1b";
                }
              }

              const charMultiplier = language === "bn" ? 7 : 4.6;
              const boxWidth = labelText.length * (charMultiplier * 2) + 14;

              return (
                <g key={`label-${district.id}`} transform={`translate(${cx}, ${cy})`}>
                  {isSelected && (
                    <g className="animate-pulse">
                      <circle r="18" fill="#10b981" fillOpacity="0.25" />
                      <circle r="7" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />
                    </g>
                  )}

                  <g transform={`translate(0, ${isSelected ? -16 : 0})`}>
                    <rect
                      x={-(boxWidth / 2)}
                      y="-11"
                      width={boxWidth}
                      height="21"
                      rx="4"
                      fill={pillBg}
                      stroke={isSelected ? "#059669" : pillBorder}
                      strokeWidth={isSelected ? 1.5 : 0.8}
                    />

                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isCapital ? 14 : language === "bn" ? 12 : 11}
                      fontWeight={isCapital || isSelected ? "800" : "700"}
                      fill={textColor}
                      letterSpacing={language === "bn" ? "0.2px" : "0.4px"}
                      fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SolaimanLipi', 'Noto Sans Bengali', sans-serif"
                    >
                      {labelText}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Map Footer Stats / Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 border-t border-slate-100 bg-slate-50/50 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
        {isQuizMode ? (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-300">{t.legendTitle}</span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-white border border-emerald-600 inline-block" />
              {t.firstTry}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
              {t.secondTry}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400 border border-orange-600 inline-block" />
              {t.thirdTry}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 border border-rose-700 inline-block" />
              {t.missed}
            </span>
          </div>
        ) : (
          <div className="text-center sm:text-left">
            {t.showingDistricts
              .replace("{count}", language === "bn" ? toBanglaNumber(filteredDistricts.length) : String(filteredDistricts.length))
              .replace("{total}", language === "bn" ? toBanglaNumber(64) : "64")}
            {selectedDivision !== "All" &&
              ` ${t.inDivision.replace("{division}", language === "bn" ? DIVISION_BN[selectedDivision] || selectedDivision : selectedDivision)}`}
          </div>
        )}

        <div className="text-center sm:text-right">
          {isQuizMode ? (
            <span>
              {t.solvedCounter
                .replace("{count}", language === "bn" ? toBanglaNumber(quizResultsMap.size) : String(quizResultsMap.size))
                .replace("{total}", language === "bn" ? toBanglaNumber(districts.length) : String(districts.length))}
            </span>
          ) : (
            <span>
              {t.revealedOnMap
                .replace("{count}", language === "bn" ? toBanglaNumber(revealedDistrictIds.size) : String(revealedDistrictIds.size))
                .replace("{total}", language === "bn" ? toBanglaNumber(64) : "64")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
