"use client";

import React, { useState, useEffect } from "react";
import { PokemonBrief } from "../types/pokemon";

interface TeamBuilderProps {
  team: PokemonBrief[];
  onRemove: (id: number) => void;
  onClear: () => void;
  onSelectPokemon: (id: number) => void;
}

interface TeamStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export default function TeamBuilder({
  team,
  onRemove,
  onClear,
  onSelectPokemon,
}: TeamBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  });

  // Fetch detailed stats for the team to calculate synergies
  useEffect(() => {
    if (team.length === 0) {
      setTeamStats({ hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 });
      return;
    }

    const fetchTeamStats = async () => {
      try {
        const promises = team.map((p) =>
          fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`).then((r) => r.json())
        );
        const results = await Promise.all(promises);

        const sums = results.reduce(
          (acc, res) => {
            res.stats.forEach((s: { base_stat: number; stat: { name: string } }) => {
              if (s.stat.name === "hp") acc.hp += s.base_stat;
              else if (s.stat.name === "attack") acc.attack += s.base_stat;
              else if (s.stat.name === "defense") acc.defense += s.base_stat;
              else if (s.stat.name === "special-attack") acc.spAttack += s.base_stat;
              else if (s.stat.name === "special-defense") acc.spDefense += s.base_stat;
              else if (s.stat.name === "speed") acc.speed += s.base_stat;
            });
            return acc;
          },
          { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }
        );

        // Compute averages
        const count = team.length;
        setTeamStats({
          hp: Math.round(sums.hp / count),
          attack: Math.round(sums.attack / count),
          defense: Math.round(sums.defense / count),
          spAttack: Math.round(sums.spAttack / count),
          spDefense: Math.round(sums.spDefense / count),
          speed: Math.round(sums.speed / count),
        });
      } catch (err) {
        console.error("Error computing team synergy statistics:", err);
      }
    };

    fetchTeamStats();
  }, [team]);

  // Calculate chemistry / synergy feedback
  const getSynergyRating = () => {
    if (team.length === 0) return { rating: "Empty", desc: "Add Pokémon to start planning your battle party!" };
    if (team.length < 3) return { rating: "Building", desc: "Add more Pokémon to unlock detailed synergy analyses." };

    // Count unique types
    const allTypes = team.flatMap((p) => p.types);
    const uniqueTypes = new Set(allTypes);
    const diversityRatio = uniqueTypes.size / team.length;

    // Check specific synergistic cores
    const hasFire = allTypes.includes("fire");
    const hasWater = allTypes.includes("water");
    const hasGrass = allTypes.includes("grass");
    const hasElectric = allTypes.includes("electric");

    let coreBonus = "";
    if (hasFire && hasWater && hasGrass) {
      coreBonus = " Elemental Fire-Water-Grass core active!";
    } else if (hasFire && hasWater) {
      coreBonus = " Steam (Fire + Water) synergy active.";
    } else if (hasWater && hasElectric) {
      coreBonus = " Volt-Soak (Water + Electric) synergy active.";
    }

    if (diversityRatio >= 0.8) {
      return {
        rating: "Elite Diversity",
        desc: `Excellent type spread (${uniqueTypes.size} unique types). Good defensive coverage.${coreBonus}`,
      };
    } else if (diversityRatio >= 0.5) {
      return {
        rating: "Balanced Core",
        desc: `Solid type distribution. Ready for standard match strategies.${coreBonus}`,
      };
    } else {
      return {
        rating: "Monotype Bias",
        desc: "High vulnerability due to type clustering. Consider swapping a member to improve coverage.",
      };
    }
  };

  const getChemistryColor = (rating: string) => {
    switch (rating) {
      case "Elite Diversity": return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      case "Balanced Core": return "text-teal-400 border-teal-500/30 bg-teal-500/10";
      case "Monotype Bias": return "text-amber-400 border-amber-500/30 bg-amber-500/10";
      case "Building": return "text-slate-400 border-slate-700/50 bg-slate-800/40";
      default: return "text-slate-500 border-slate-800 bg-slate-950/20";
    }
  };

  const synergy = getSynergyRating();
  const chemColorClass = getChemistryColor(synergy.rating);
  const totalPower = Object.values(teamStats).reduce((a, b) => a + b, 0);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-30 transition-transform duration-300 ${
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-52px)]"
      }`}
    >
      {/* Floating Toggle Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="mx-3 sm:mx-auto max-w-5xl glass-panel px-4 sm:px-6 py-3.5 rounded-t-2xl border-t border-x border-white/10 flex items-center justify-between gap-3 cursor-pointer shadow-[0_-8px_30px_rgba(0,0,0,0.4)] select-none hover:bg-slate-900/60 transition-colors"
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-3.5">
          <div className="relative flex shrink-0 items-center justify-center">
            {team.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white animate-pulse">
                {team.length}
              </span>
            )}
            <span className="text-lg">🛡️</span>
          </div>
          <span className="truncate text-sm font-bold text-slate-100 tracking-wide">
            My Battle Team <span className="text-slate-400 font-medium">({team.length}/6)</span>
          </span>
          {team.length > 0 && (
            <div className={`hidden md:flex items-center gap-2 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${chemColorClass}`}>
              {synergy.rating}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {team.length > 0 && !isOpen && (
            <div className="hidden sm:flex items-center gap-3.5 text-xs text-slate-300 font-mono">
              <span>Avg Rating: <strong className="text-emerald-400">{totalPower}</strong></span>
            </div>
          )}
          <span className="text-slate-400 transition-transform duration-300">
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
            )}
          </span>
        </div>
      </div>

      {/* Main Stats Panel Deck */}
      <div className="max-h-[calc(100dvh-52px)] overflow-y-auto bg-slate-950/95 backdrop-blur-xl border-t border-white/10 p-3 sm:p-5 lg:p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] custom-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 pb-[env(safe-area-inset-bottom)]">
          
          {/* Grid Slots (6 slots) */}
          <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
            {Array.from({ length: 6 }).map((_, index) => {
              const member = team[index];
              return member ? (
                <div
                  key={member.id}
                  onClick={() => onSelectPokemon(member.id)}
                  className={`glass-panel border-white/15 relative flex min-h-[96px] sm:min-h-[110px] flex-col items-center justify-center gap-1.5 sm:gap-2 p-2.5 sm:p-3.5 rounded-xl transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 hover:bg-slate-900/50 cursor-pointer glow-${member.types[0]}`}
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(member.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-slate-900/90 text-rose-400 hover:text-rose-200 border border-white/10 shadow-md cursor-pointer hover:bg-rose-500/20 transition-all duration-150 z-10"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Artwork image - scaled up and centered */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform duration-200"
                  />

                  {/* Info card */}
                  <div className="text-center w-full">
                    <span className="block text-[11px] font-bold text-slate-100 truncate capitalize">
                      {member.name}
                    </span>
                    <span className="block truncate text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {member.types.join(" · ")}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={index}
                  className="border border-dashed border-slate-700/60 bg-slate-900/20 rounded-xl flex min-h-[96px] sm:min-h-[110px] flex-col items-center justify-center p-2.5 sm:p-3.5"
                >
                  {/* Glowing Pokéball silhouette */}
                  <div className="w-8 h-8 opacity-20 border-2 border-slate-600 rounded-full relative flex items-center justify-center">
                    <div className="absolute w-full h-[2px] bg-slate-600 top-1/2 -translate-y-1/2" />
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-600 bg-slate-900 relative z-10" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-600 mt-2 font-bold tracking-wider">
                    EMPTY SLOT
                  </span>
                </div>
              );
            })}
          </div>

          {/* Analysis Dashboard (Right side) */}
          <div className="bg-slate-900/50 rounded-xl p-3 sm:p-4 border border-white/5 flex flex-col justify-between space-y-4">
            
            {/* Stat meters */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Party Average Stats
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Total: {totalPower}
                </span>
              </div>
              
              {/* Stats progress bars */}
              {(["hp", "attack", "defense", "speed"] as const).map((key) => {
                const val =
                  key === "hp"
                    ? teamStats.hp
                    : key === "attack"
                    ? teamStats.attack
                    : key === "defense"
                    ? teamStats.defense
                    : teamStats.speed;
                const pct = Math.min((val / 200) * 100, 100);
                return (
                  <div key={key} className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">{key}</span>
                      <span className="text-slate-200">{val}</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Synergy analysis text & clear buttons */}
            <div className="space-y-3">
              <div className={`p-2.5 rounded-lg border ${chemColorClass}`}>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Synergy: {synergy.rating}
                </span>
                <span className="block text-[9px] text-slate-300 leading-snug mt-1.5 font-medium">
                  {synergy.desc}
                </span>
              </div>

              {team.length > 0 && (
                <button
                  onClick={onClear}
                  className="w-full py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-200 text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-all"
                >
                  Disband Party
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
