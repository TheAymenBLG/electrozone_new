import React from "react";

interface BrandLogoProps {
  name: string;
  className?: string;
}

export default function BrandLogo({ name, className = "" }: BrandLogoProps) {
  const norm = name.toLowerCase().trim();

  // BOSCH
  if (norm.includes("bosch")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Bosch Armature Icon in Red */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 text-[#E20015] transition-transform group-hover/brand:scale-110"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="16" cy="16" r="12" />
          <path d="M16 4 v24" strokeWidth="1.5" />
          <path d="M8 16 h16" strokeWidth="1.5" />
          {/* Characteristic armature loops */}
          <path d="M11 11 Q16 16 21 11" strokeWidth="2" strokeLinecap="round" />
          <path d="M11 21 Q16 16 21 21" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-sans font-black tracking-wide text-lg text-cloud group-hover/brand:text-[#E20015] transition-colors font-extrabold uppercase">
          BOSCH
        </span>
      </div>
    );
  }

  // DE'LONGHI / DELONGHI
  if (norm.includes("delonghi")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* De'Longhi elegant crest/shield or script letter D */}
        <div className="w-7 h-7 rounded-lg bg-navy-tile border border-gold/40 flex items-center justify-center font-serif text-sm font-bold text-gold group-hover/brand:bg-gold group-hover/brand:text-navy transition-all duration-300">
          D
        </div>
        <span className="font-serif italic font-bold tracking-tight text-lg text-cloud group-hover/brand:text-gold transition-colors">
          De'Longhi
        </span>
      </div>
    );
  }

  // BEKO
  if (norm.includes("beko")) {
    return (
      <div className={`flex items-center gap-1.5 group/brand transition-all duration-300 ${className}`}>
        {/* Beko modern circle dot indicator */}
        <div className="w-2.5 h-2.5 rounded-full bg-[#0057B8] group-hover/brand:animate-ping absolute opacity-0 group-hover/brand:opacity-100" />
        <span className="font-sans font-extrabold tracking-tighter text-2xl lowercase text-cloud group-hover/brand:text-[#0057B8] transition-colors">
          beko
        </span>
      </div>
    );
  }

  // CONDOR
  if (norm.includes("condor")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Condor bird wing flying logo */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 text-[#00A3E0] transition-transform group-hover/brand:translate-y-[-2px]"
          fill="currentColor"
        >
          <path d="M2 12C2 12 7 7 14 8C19 8.7 22 13 22 13C22 13 17 11 13 12.5C8 14.4 6 18 6 18C6 18 4.5 15 2 12Z" />
          <path d="M7 9C9.5 7.5 13 7.8 15 9C12 9.5 9.5 11 8 13C8 11 7.5 9.8 7 9Z" className="opacity-80" />
        </svg>
        <span className="font-sans font-bold tracking-tight text-lg text-cloud group-hover/brand:text-[#00A3E0] transition-colors">
          Condor
        </span>
      </div>
    );
  }

  // GÉANT / GEANT
  if (norm.includes("géant") || norm.includes("geant")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Géant orbit satellite icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-gold transition-transform group-hover/brand:rotate-45"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" />
          <ellipse cx="12" cy="12" rx="10" ry="3" transform="rotate(-30 12 12)" />
        </svg>
        <span className="font-sans font-black italic tracking-tighter text-xl uppercase text-cloud group-hover/brand:text-gold transition-colors">
          GÉANT
        </span>
      </div>
    );
  }

  // IRIS
  if (norm.includes("iris")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Iris clean eye iris/shutter circle */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-[#1A569B] transition-all group-hover/brand:rotate-90 duration-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" />
        </svg>
        <span className="font-sans font-black tracking-widest text-lg uppercase text-cloud group-hover/brand:text-[#1A569B] transition-colors">
          IRIS
        </span>
      </div>
    );
  }

  // BISSELL
  if (norm.includes("bissell")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Bissell red/blue double triangle chevron */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-[#00529B]"
          fill="currentColor"
        >
          <path d="M12 2L4 14H9L12 9L15 14H20L12 2Z" />
          <path d="M12 11L7 19H17L12 11Z" className="text-red-500" />
        </svg>
        <span className="font-sans font-extrabold italic tracking-tight text-lg text-cloud group-hover/brand:text-[#00529B] transition-colors uppercase">
          Bissell
        </span>
      </div>
    );
  }

  // BOMANN
  if (norm.includes("bomann")) {
    return (
      <div className={`flex items-center gap-1.5 group/brand transition-all duration-300 ${className}`}>
        <span className="font-sans font-black tracking-normal text-xl text-cloud group-hover/brand:text-red-500 transition-colors uppercase">
          BOMANN
        </span>
        <div className="w-1.5 h-4 bg-red-500 rounded-sm" />
      </div>
    );
  }

  // CRISTOR
  if (norm.includes("cristor")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        {/* Cristor modern C circle arch */}
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6 text-[#E37222]"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          <path d="M18 6 A8 8 0 1 0 18 18" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
        <span className="font-sans font-extrabold tracking-tight text-lg text-cloud group-hover/brand:text-[#E37222] transition-colors uppercase">
          Cristor
        </span>
      </div>
    );
  }

  // MAXWELL
  if (norm.includes("maxwell")) {
    return (
      <div className={`flex items-center gap-2 group/brand transition-all duration-300 ${className}`}>
        <span className="font-sans font-light tracking-[0.25em] text-lg text-cloud group-hover/brand:text-gold transition-colors uppercase">
          MAXWELL
        </span>
      </div>
    );
  }

  // DIGITECH
  if (norm.includes("digitech")) {
    return (
      <div className={`flex items-center gap-1.5 group/brand transition-all duration-300 ${className}`}>
        <span className="font-mono font-bold tracking-tight text-lg text-cloud group-hover/brand:text-mint transition-colors">
          Digi<span className="text-gold">Tech</span>
        </span>
        <div className="w-2 h-2 rounded-full bg-mint group-hover/brand:bg-gold transition-all" />
      </div>
    );
  }

  // Fallback styling with nice layout
  return (
    <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-navy-tile border border-edge hover:border-gold transition-all duration-300 group/brand ${className}`}>
      <span className="font-sans font-bold tracking-wide text-sm text-cloud-muted group-hover/brand:text-gold transition-colors">
        {name}
      </span>
    </div>
  );
}
