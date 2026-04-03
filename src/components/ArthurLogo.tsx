"use client";

/**
 * ArthurLogo.tsx — Arthur Mission Control System Logo
 * Interlocking hexagon: Navy (#1B4F72) + Orange (#E67E22)
 * Represents the Round Table — interconnected decision system
 * Usage: <ArthurLogo size={24} />
 */
export default function ArthurLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Outer orange hexagon */}
      <path d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z" 
        fill="none" stroke="#E67E22" strokeWidth="8" strokeLinejoin="round" />
      {/* Inner navy hexagon — offset for interlocking */}
      <path d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z" 
        fill="none" stroke="#1B4F72" strokeWidth="8" strokeLinejoin="round" />
      {/* Interlocking segments */}
      <path d="M50 5 L90 27.5" stroke="#E67E22" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 15 L80 32.5" stroke="#1B4F72" strokeWidth="8" strokeLinecap="round" />
      <path d="M90 72.5 L50 95" stroke="#E67E22" strokeWidth="8" strokeLinecap="round" />
      <path d="M20 67.5 L50 85" stroke="#1B4F72" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}
