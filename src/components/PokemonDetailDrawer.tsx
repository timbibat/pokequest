"use client";

import React, { useState, useEffect, useRef } from "react";
import { PokemonDetails, PokemonSpecies } from "../types/pokemon";

interface PokemonDetailDrawerProps {
  pokemonId: number | null;
  onClose: () => void;
}

export default function PokemonDetailDrawer({
  pokemonId,
  onClose,
}: PokemonDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "abilities" | "moves">("stats");
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch detailed data when pokemonId changes
  useEffect(() => {
    if (!pokemonId) {
      setDetails(null);
      setSpecies(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Fetch base details and species descriptions in parallel
        const [detailsRes, speciesRes] = await Promise.all([
          fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`),
          fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`),
        ]);

        if (!detailsRes.ok) throw new Error("Failed to fetch pokemon details");
        
        const detailsData = await detailsRes.json();
        setDetails(detailsData);

        if (speciesRes.ok) {
          const speciesData = await speciesRes.json();
          setSpecies(speciesData);
        } else {
          setSpecies(null);
        }
      } catch (err) {
        console.error("Error fetching pokemon details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    setActiveTab("stats");
  }, [pokemonId]);

  // Handle play pokemon cry
  const playCry = () => {
    const cryUrl = details?.cries?.latest || details?.cries?.legacy;
    if (!cryUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsPlayingCry(true);
    const audio = new Audio(cryUrl);
    audio.volume = 0.4; // Soften volume slightly
    audioRef.current = audio;
    
    audio.play().catch((err) => {
      console.error("Audio playback blocked or failed:", err);
      setIsPlayingCry(false);
    });

    audio.onended = () => {
      setIsPlayingCry(false);
    };
  };

  if (!pokemonId) return null;

  const primaryType = details?.types[0]?.type.name || "normal";
  const glowClass = `glow-${primaryType}`;
  const textClass = `text-${primaryType}`;
  const bgClass = `bg-${primaryType}`;

  // Capitalize helper
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // Format ID
  const formattedId = `#${String(pokemonId).padStart(3, "0")}`;

  // Process flavor text
  const getFlavorText = () => {
    if (!species) return "No description available for this Pokémon.";
    const englishEntry = species.flavor_text_entries.find(
      (entry) => entry.language.name === "en"
    );
    if (!englishEntry) return "No description available for this Pokémon.";
    
    // Clean up weird characters PokeAPI sometimes has in text
    return englishEntry.flavor_text.replace(/[\u0000-\u001f]/g, " ").replace(/\f/g, " ");
  };

  // Convert Decimeters to Meters & Feet
  const getHeight = () => {
    if (!details) return "";
    const meters = details.height * 0.1;
    const totalInches = meters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${meters.toFixed(1)}m (${feet}'${inches}")`;
  };

  // Convert Hectograms to Kg & Lbs
  const getWeight = () => {
    if (!details) return "";
    const kg = details.weight * 0.1;
    const lbs = kg * 2.20462;
    return `${kg.toFixed(1)}kg (${lbs.toFixed(1)} lbs)`;
  };

  // Get stat base totals
  const getStatTotal = () => {
    if (!details) return 0;
    return details.stats.reduce((total, s) => total + s.base_stat, 0);
  };

  // Stat styling colors mapping
  const getStatBarColor = (statName: string) => {
    switch (statName) {
      case "hp":
        return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
      case "attack":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
      case "defense":
        return "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]";
      case "special-attack":
        return "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]";
      case "special-defense":
        return "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]";
      case "speed":
        return "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]";
      default:
        return "bg-slate-500";
    }
  };

  const getStatShortName = (name: string) => {
    switch (name) {
      case "hp": return "HP";
      case "attack": return "ATK";
      case "defense": return "DEF";
      case "special-attack": return "S.ATK";
      case "special-defense": return "S.DEF";
      case "speed": return "SPD";
      default: return name.toUpperCase();
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[460px] z-50 glass-panel shadow-2xl flex flex-col border-l border-white/10 text-slate-200 transition-all duration-300 overflow-hidden ${
          loading ? "glow-normal" : glowClass
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/60">
              {formattedId}
            </span>
            {details && (
              <h2 className="text-2xl font-bold tracking-wide text-slate-100">
                {capitalize(details.name)}
              </h2>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/50 cursor-pointer transition-all duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin shadow-lg" />
            <p className="text-slate-400 font-mono tracking-wider text-sm animate-pulse">
              Hydrating Pokédex Entries...
            </p>
          </div>
        ) : details ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Visual Header Deck */}
            <div className="relative rounded-2xl p-6 overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/5 flex items-center justify-between">
              {/* Type backdrop circular glow */}
              <div
                className={`absolute w-36 h-36 rounded-full -left-8 -top-8 filter blur-3xl opacity-20 bg-gradient-to-r from-${primaryType} to-slate-900`}
              />
              
              {/* Image with type specific animated backglow */}
              <div className="relative w-36 h-36 flex items-center justify-center bg-slate-800/30 rounded-full border border-white/5 p-2 shadow-inner">
                <div
                  className={`absolute inset-0.5 rounded-full filter blur-md opacity-25 ${bgClass}`}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={details.sprites.other["official-artwork"].front_default}
                  alt={details.name}
                  className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_8px_6px_rgba(0,0,0,0.6)] animate-float"
                />
              </div>

              {/* Quick Details Deck */}
              <div className="flex-1 pl-6 flex flex-col justify-center space-y-3 relative z-10">
                {/* Type badges */}
                <div className="flex flex-wrap gap-1.5">
                  {details.types.map((t) => (
                    <span
                      key={t.type.name}
                      className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md text-white bg-${t.type.name} shadow-sm border border-white/5`}
                    >
                      {t.type.name}
                    </span>
                  ))}
                </div>

                {/* Sound player for Pokémon cries */}
                {(details.cries?.latest || details.cries?.legacy) && (
                  <button
                    onClick={playCry}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs cursor-pointer transition-all duration-200 ${
                      isPlayingCry
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${isPlayingCry ? "animate-bounce" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                    <span>{isPlayingCry ? "Crying..." : "Play Cry"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-slate-950/40 rounded-xl p-4 border border-white/5">
              <p className="text-sm leading-relaxed text-slate-300 italic tracking-wide font-medium">
                "{getFlavorText()}"
              </p>
            </div>

            {/* Physical metrics layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-xl p-3.5 border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Height
                </span>
                <span className="text-sm font-semibold text-slate-100 mt-1">
                  {getHeight()}
                </span>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3.5 border border-white/5 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Weight
                </span>
                <span className="text-sm font-semibold text-slate-100 mt-1">
                  {getWeight()}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 bg-slate-950/20 p-1 rounded-xl">
              {(["stats", "abilities", "moves"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? `${bgClass} text-white shadow-md font-extrabold`
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="min-h-[220px]">
              {/* STATS TAB */}
              {activeTab === "stats" && (
                <div className="space-y-4">
                  {details.stats.map((s) => {
                    const pct = Math.min((s.base_stat / 255) * 100, 100);
                    return (
                      <div key={s.stat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400 tracking-wide">
                            {getStatShortName(s.stat.name)}
                          </span>
                          <span className="text-slate-100 tracking-wider">
                            {s.base_stat} <span className="text-[10px] text-slate-500 font-normal">/ 255</span>
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full transition-all duration-1000 ${getStatBarColor(
                              s.stat.name
                            )}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {/* Total Stat Box */}
                  <div className="flex items-center justify-between p-3.5 bg-slate-950/50 rounded-xl border border-white/5 mt-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Total Base Rating
                    </span>
                    <span className={`text-lg font-black font-mono ${textClass}`}>
                      {getStatTotal()}
                    </span>
                  </div>
                </div>
              )}

              {/* ABILITIES TAB */}
              {activeTab === "abilities" && (
                <div className="space-y-3">
                  {details.abilities.map((a) => (
                    <div
                      key={a.ability.name}
                      className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex items-center justify-between hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm font-bold text-slate-100">
                          {capitalize(a.ability.name.replace("-", " "))}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Slot #{a.slot}
                        </span>
                      </div>
                      {a.is_hidden && (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-rose-400 bg-rose-500/10 border border-rose-500/20 shadow-sm animate-pulse-slow">
                          Hidden
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* MOVES TAB */}
              {activeTab === "moves" && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2">
                    Level Up Moves Grid
                  </p>
                  <div className="max-h-[250px] overflow-y-auto grid grid-cols-2 gap-2 pr-1">
                    {details.moves
                      .filter((m) =>
                        m.version_group_details.some(
                          (d) => d.move_learn_method.name === "level-up"
                        )
                      )
                      .map((m) => {
                        const levelDetail = m.version_group_details.find(
                          (d) => d.move_learn_method.name === "level-up"
                        );
                        const lvl = levelDetail ? levelDetail.level_learned_at : 0;
                        return (
                          <div
                            key={m.move.name}
                            className="bg-slate-900/40 rounded-lg p-2.5 border border-white/5 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors"
                          >
                            <span className="font-semibold text-slate-300 truncate pr-2">
                              {capitalize(m.move.name.replace("-", " "))}
                            </span>
                            <span className="text-[10px] font-bold font-mono bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/50 text-slate-400">
                              Lvl {lvl}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-slate-400">
            Error loading Pokédex file.
          </div>
        )}
      </div>
    </>
  );
}
