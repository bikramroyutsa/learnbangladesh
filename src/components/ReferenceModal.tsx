"use client";

import React from "react";
import { X, ExternalLink, Info } from "lucide-react";

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Reference Map: bdmapdistricts.jpg
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                The original 64 districts map supplied with color-coded regions and district names
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/bdmapdistricts.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>Full resolution</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content with Image */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
          <div className="relative max-h-[68vh] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bdmapdistricts.jpg"
              alt="Bangladesh Districts Reference Map"
              className="max-h-[66vh] w-auto object-contain mx-auto"
            />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            Our interactive vector map reproduces the district boundaries, color tones, and city names from this map.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-5 py-3 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-900/60">
          <button
            onClick={onClose}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            Back to Interactive Map
          </button>
        </div>
      </div>
    </div>
  );
};

