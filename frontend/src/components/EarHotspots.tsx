import React, { useState } from 'react';
import { Volume2, Shield } from 'lucide-react';

interface EarHotspotsProps {
  earSelection: string;
  setEarSelection: (sel: string) => void;
  selectedHotspots: string[];
  setSelectedHotspots: React.Dispatch<React.SetStateAction<string[]>>;
}

const HOTSPOT_DETAILS: Record<string, { label: string; desc: string }> = {
  eardrum: { label: "Tympanic Membrane (Eardrum)", desc: "Internal deep ringing, often linked to middle-ear pressure or mechanical fatigue." },
  canal: { label: "External Auditory Canal", desc: "Perceived ringing within the canal, common in noise exposure or wax accumulation." },
  helix: { label: "Helix / Outer Rim", desc: "Peripheral high frequency buzzing, often reported in somatic tinnitus." },
  lobe: { label: "Lobule (Earlobe)", desc: "Lower peripheral buzz, sometimes influenced by neck or jaw posture (somatic)." },
  mastoid: { label: "Mastoid Area (Behind Ear)", desc: "Deep bone conduction hum, common in vascular or tensor tympani contractions." }
};

export const EarHotspots: React.FC<EarHotspotsProps> = ({
  earSelection,
  setEarSelection,
  selectedHotspots,
  setSelectedHotspots
}) => {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  const toggleHotspot = (id: string) => {
    if (selectedHotspots.includes(id)) {
      setSelectedHotspots(selectedHotspots.filter(h => h !== id));
    } else {
      setSelectedHotspots([...selectedHotspots, id]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="bg-white/80 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-md shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Step 1: Auditory Location mapping</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Specify which ears are affected, and click on the interactive regions of the ear model to map where you perceive the sound spikes.
        </p>

        {/* Ear Selector Buttons */}
        <div className="flex gap-3 mb-6">
          {['left', 'right', 'both'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEarSelection(type)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold capitalize border transition-all ${
                earSelection === type
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {type} Ear
            </button>
          ))}
        </div>

        {/* Contextual Hotspot Box */}
        <div className="min-h-[140px] bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          {activeHover || (selectedHotspots.length > 0 ? selectedHotspots[selectedHotspots.length - 1] : null) ? (
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 mb-2">
                <Volume2 className="w-3.5 h-3.5" />
                {HOTSPOT_DETAILS[activeHover || selectedHotspots[selectedHotspots.length - 1]]?.label}
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {HOTSPOT_DETAILS[activeHover || selectedHotspots[selectedHotspots.length - 1]]?.desc}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-4 text-center">
              <Shield className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Hover or click hotspots on the ear model to see anatomical details.
              </p>
            </div>
          )}
        </div>

        {/* Selected List */}
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedHotspots.map(h => (
            <span
              key={h}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50"
            >
              {HOTSPOT_DETAILS[h]?.label.split(' (')[0]}
              <button
                type="button"
                onClick={() => toggleHotspot(h)}
                className="hover:text-emerald-900 font-bold ml-1 text-sm focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SVG Interactive Ear Display */}
      <div className="flex justify-center items-center p-6 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 300 400"
          className="w-full max-w-[280px] h-auto drop-shadow-xl select-none"
        >
          {/* Background Ear Outline */}
          <path
            d="M 120,40 C 60,30 20,90 40,160 C 50,200 80,220 90,260 C 100,300 110,360 180,360 C 230,360 250,300 240,250 C 230,200 250,150 240,100 C 230,50 180,50 120,40 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-300 dark:text-slate-700"
          />
          {/* Inner details of ear */}
          <path
            d="M 110,70 C 80,60 70,110 80,150 C 90,190 120,210 130,250"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-300 dark:text-slate-750"
          />
          <path
            d="M 150,110 C 120,100 120,160 130,190"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-300 dark:text-slate-750"
          />

          {/* Hotspot 1: Helix (Outer Rim) */}
          <circle
            cx="140"
            cy="52"
            r="16"
            onMouseEnter={() => setActiveHover("helix")}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => toggleHotspot("helix")}
            className={`cursor-pointer transition-all duration-300 stroke-2 ${
              selectedHotspots.includes("helix")
                ? "fill-indigo-500/40 stroke-indigo-600 r-[18px]"
                : "fill-slate-400/10 stroke-slate-400 hover:fill-indigo-500/25 hover:stroke-indigo-400"
            }`}
          />
          <text x="140" y="56" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">H</text>

          {/* Hotspot 2: Canal (Entrance) */}
          <circle
            cx="110"
            cy="165"
            r="18"
            onMouseEnter={() => setActiveHover("canal")}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => toggleHotspot("canal")}
            className={`cursor-pointer transition-all duration-300 stroke-2 ${
              selectedHotspots.includes("canal")
                ? "fill-indigo-500/40 stroke-indigo-600 r-[20px]"
                : "fill-slate-400/10 stroke-slate-400 hover:fill-indigo-500/25 hover:stroke-indigo-400"
            }`}
          />
          <text x="110" y="169" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">C</text>

          {/* Hotspot 3: Eardrum (Deep Center) */}
          <circle
            cx="155"
            cy="175"
            r="15"
            onMouseEnter={() => setActiveHover("eardrum")}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => toggleHotspot("eardrum")}
            className={`cursor-pointer transition-all duration-300 stroke-2 ${
              selectedHotspots.includes("eardrum")
                ? "fill-indigo-500/40 stroke-indigo-600 r-[17px]"
                : "fill-slate-400/10 stroke-slate-400 hover:fill-indigo-500/25 hover:stroke-indigo-400"
            }`}
          />
          <text x="155" y="179" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">D</text>

          {/* Hotspot 4: Lobe */}
          <circle
            cx="170"
            cy="330"
            r="20"
            onMouseEnter={() => setActiveHover("lobe")}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => toggleHotspot("lobe")}
            className={`cursor-pointer transition-all duration-300 stroke-2 ${
              selectedHotspots.includes("lobe")
                ? "fill-indigo-500/40 stroke-indigo-600 r-[22px]"
                : "fill-slate-400/10 stroke-slate-400 hover:fill-indigo-500/25 hover:stroke-indigo-400"
            }`}
          />
          <text x="170" y="334" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">L</text>

          {/* Hotspot 5: Mastoid (Rear Bone) */}
          <circle
            cx="220"
            cy="210"
            r="18"
            onMouseEnter={() => setActiveHover("mastoid")}
            onMouseLeave={() => setActiveHover(null)}
            onClick={() => toggleHotspot("mastoid")}
            className={`cursor-pointer transition-all duration-300 stroke-2 ${
              selectedHotspots.includes("mastoid")
                ? "fill-indigo-500/40 stroke-indigo-600 r-[20px]"
                : "fill-slate-400/10 stroke-slate-400 hover:fill-indigo-500/25 hover:stroke-indigo-400"
            }`}
          />
          <text x="220" y="214" textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none">M</text>
        </svg>
      </div>
    </div>
  );
};
