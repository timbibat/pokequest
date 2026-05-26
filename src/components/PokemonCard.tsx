"use client";

import React from "react";
import { PokemonBrief } from "../types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonBrief;
  onClick: () => void;
  isInTeam: boolean;
  onToggleTeam: (e: React.MouseEvent) => void;
}

export default function PokemonCard({
  pokemon,
  onClick,
  isInTeam,
  onToggleTeam,
}: PokemonCardProps) {
  const primaryType = pokemon.types[0] || "normal";
  const glowClass = `glow-${primaryType}`;

  // Capitalize name helper
  const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

  // Format ID to 3 digits (e.g., 001)
  const formattedId = `#${String(pokemon.id).padStart(3, "0")}`;

  return (
    <div
      onClick={onClick}
      className={`glass-panel glass-panel-hover relative flex flex-col items-center justify-between p-5 rounded-2xl cursor-pointer border select-none transition-all duration-300 ${glowClass}`}
    >
      {/* Top action row */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/50">
          {formattedId}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleTeam(e);
          }}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 cursor-pointer ${
            isInTeam
              ? "bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30 hover:scale-110"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:scale-110"
          }`}
          title={isInTeam ? "Remove from Team" : "Add to Team"}
        >
          {isInTeam ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Image container with glow ring */}
      <div className="relative my-4 flex items-center justify-center group">
        <div className={`absolute w-24 h-24 rounded-full bg-${primaryType}/10 filter blur-xl group-hover:scale-125 transition-transform duration-300`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] transform transition-transform duration-300 group-hover:scale-110 animate-float"
          loading="lazy"
        />
      </div>

      {/* Info panel */}
      <div className="w-full text-center z-10 mt-2">
        <h3 className="text-lg font-bold text-slate-100 tracking-wide truncate">
          {capitalizedName}
        </h3>
        
        {/* Type badges */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md text-white bg-${type} shadow-sm border border-white/5`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
