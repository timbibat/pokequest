"use client";

import React, { useState, useEffect } from "react";
import { PokemonBrief } from "../types/pokemon";
import PokemonCard from "../components/PokemonCard";
import PokemonDetailDrawer from "../components/PokemonDetailDrawer";
import TeamBuilder from "../components/TeamBuilder";

// List of all 18 Pokémon types for the filter toolbar
const POKEMON_TYPES = [
  "normal", "fire", "water", "electric", "grass", "ice",
  "fighting", "poison", "ground", "flying", "psychic", "bug",
  "rock", "ghost", "dragon", "dark", "steel", "fairy"
];

export default function Home() {
  const [pokemonList, setPokemonList] = useState<PokemonBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-asc");
  const [team, setTeam] = useState<PokemonBrief[]>([]);
  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, sortBy]);

  // Trigger brief alert notifications
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Hydrate Pokemon team from localStorage on mount
  useEffect(() => {
    const savedTeam = localStorage.getItem("pokequest-team");
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam));
      } catch (err) {
        console.error("Failed to parse saved battle party:", err);
      }
    }
  }, []);

  // Sync team to localStorage
  const updateTeam = (newTeam: PokemonBrief[]) => {
    setTeam(newTeam);
    localStorage.setItem("pokequest-team", JSON.stringify(newTeam));
  };

  // Fetch G1 151 Pokémon
  useEffect(() => {
    const fetchG1 = async () => {
      setLoading(true);
      try {
        // Fetch index of first 151
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        if (!res.ok) throw new Error("Failed to index generation 1");
        const indexData = await res.json();

        // Fetch details for all 151 in parallel
        const detailPromises = indexData.results.map(async (p: { url: string }) => {
          const detailRes = await fetch(p.url);
          if (!detailRes.ok) return null;
          const data = await detailRes.json();
          return {
            id: data.id,
            name: data.name,
            image: data.sprites.other["official-artwork"].front_default || data.sprites.front_default,
            types: data.types.map((t: { type: { name: string } }) => t.type.name),
          } as PokemonBrief;
        });

        const details = await Promise.all(detailPromises);
        const validDetails = details.filter((item): item is PokemonBrief => item !== null);
        
        setPokemonList(validDetails);
      } catch (err) {
        console.error("Error loading Pokédex index:", err);
        showNotification("Failed to fetch Pokémon list. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchG1();
  }, []);

  // Handle adding/removing to battle party
  const handleToggleTeam = (pokemon: PokemonBrief) => {
    const isInTeam = team.some((t) => t.id === pokemon.id);
    if (isInTeam) {
      updateTeam(team.filter((t) => t.id !== pokemon.id));
      showNotification(`${pokemon.name.toUpperCase()} disbanded from party.`);
    } else {
      if (team.length >= 6) {
        showNotification("Your Battle Team is full (max 6 Pokémon)!");
        return;
      }
      updateTeam([...team, pokemon]);
      showNotification(`${pokemon.name.toUpperCase()} joined your battle party!`);
    }
  };

  const handleRemoveTeamMember = (id: number) => {
    const pokemon = team.find((t) => t.id === id);
    if (pokemon) {
      updateTeam(team.filter((t) => t.id !== id));
      showNotification(`${pokemon.name.toUpperCase()} disbanded from party.`);
    }
  };

  const handleClearTeam = () => {
    updateTeam([]);
    showNotification("Battle party completely disbanded.");
  };

  // Filter and Sort calculation
  const getProcessedList = () => {
    let list = [...pokemonList];

    // Search filter
    if (search.trim() !== "") {
      const query = search.toLowerCase().trim();
      list = list.filter(
        (p) => p.name.includes(query) || String(p.id) === query
      );
    }

    // Type filter
    if (selectedType) {
      list = list.filter((p) => p.types.includes(selectedType));
    }

    // Sorting options
    list.sort((a, b) => {
      if (sortBy === "id-asc") return a.id - b.id;
      if (sortBy === "id-desc") return b.id - a.id;
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

    return list;
  };

  const processedList = getProcessedList();

  const totalPages = Math.ceil(processedList.length / ITEMS_PER_PAGE);
  const paginatedList = processedList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-400">
      {/* Visual background lights */}
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full filter blur-[150px] pointer-events-none" />
      <div className="fixed -top-[10%] -right-[10%] w-[45%] h-[45%] bg-blue-500/10 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Main layout wrapper */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 relative z-10">
        
        {/* Sleek dashboard header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="text-center md:text-left flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-md select-none">
              POKÉQUEST EXPLORER
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Next-Gen Pokedex & Party Synergy Deck
            </p>
          </div>

          {/* Quick battle party indicators for header */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-900/60 border border-white/5 px-4 py-2.5 rounded-full flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${team.length > 0 ? "bg-emerald-500 animate-ping" : "bg-slate-700"}`} />
              Party Slots: <strong className="text-slate-200">{team.length}/6</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Filters Deck (Search, select, sort) */}
        <section className="glass-panel p-5 rounded-2xl flex flex-col gap-5 border border-white/10">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Live search input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Pokemon name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 text-sm font-semibold border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/80 focus:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Type selector toggle dropdown */}
            <div className="relative">
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 text-sm font-semibold border border-white/10 text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/80 focus:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all"
              >
                <option value="">All Types (Filter)</option>
                {POKEMON_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort options selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 text-sm font-semibold border border-white/10 text-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-emerald-500/80 focus:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all"
              >
                <option value="id-asc">Sort: ID (Low to High)</option>
                <option value="id-desc">Sort: ID (High to Low)</option>
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

          </div>

          {/* Quick type pills clickable list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-white/5 pt-3.5 scrollbar-thin">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 whitespace-nowrap mr-2 select-none">
              Type Pills:
            </span>
            <button
              onClick={() => setSelectedType(null)}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer transition-all border ${
                selectedType === null
                  ? "bg-white text-slate-950 border-white shadow-md"
                  : "bg-slate-900/60 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              All
            </button>
            {POKEMON_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type === selectedType ? null : type)}
                className={`text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full cursor-pointer transition-all border ${
                  selectedType === type
                    ? `bg-${type} text-white border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)]`
                    : `bg-slate-900/60 text-slate-400 border-white/5 hover:text-white hover:bg-${type}/30`
                }`}
              >
                {type}
              </button>
            ))}
          </div>

        </section>

        {/* Dynamic Grid Results */}
        <section className="flex-1">
          {loading ? (
            /* Loading skeletal shimmers */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-24">
              {Array.from({ length: 15 }).map((_, index) => (
                <div
                  key={index}
                  className="glass-panel relative flex flex-col justify-between p-5 rounded-2xl border border-white/5 h-[240px] animate-pulse overflow-hidden"
                >
                  <div className="flex justify-between items-center w-full z-10">
                    <div className="w-12 h-5 bg-slate-800/80 rounded-full" />
                    <div className="w-8 h-8 bg-slate-800/80 rounded-full" />
                  </div>
                  <div className="my-4 flex items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full bg-slate-800/50" />
                  </div>
                  <div className="w-full flex flex-col items-center gap-2 mt-2">
                    <div className="w-3/4 h-5 bg-slate-800/80 rounded-md" />
                    <div className="flex gap-1.5 mt-1.5 w-1/2">
                      <div className="h-4 bg-slate-800/80 rounded-md flex-1" />
                      <div className="h-4 bg-slate-800/80 rounded-md flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : processedList.length > 0 ? (
            /* Renders actual matching profiles with pagination */
            <div className="flex flex-col gap-8 mb-28">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {paginatedList.map((pokemon) => (
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    onClick={() => setSelectedPokemonId(pokemon.id)}
                    isInTeam={team.some((t) => t.id === pokemon.id)}
                    onToggleTeam={() => handleToggleTeam(pokemon)}
                  />
                ))}
              </div>

              {/* Premium Pagination Toolbar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-4 bg-slate-900/40 p-3 rounded-2xl border border-white/5 max-w-md mx-auto w-full shadow-inner">
                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/50 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all"
                  >
                    Prev
                  </button>

                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-500">
                      Page
                    </span>
                    <span className="text-xs font-black text-slate-200 bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                      {currentPage} <span className="text-[10px] text-slate-500 font-normal">/ {totalPages}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/50 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed hover:bg-slate-700 hover:text-white transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Empty Search States */
            <div className="glass-panel py-20 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-8 mb-24">
              <span className="text-4xl mb-4">🔍</span>
              <h3 className="text-xl font-bold text-slate-200">No Pokémon Found</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                No Generation 1 Pokémon matches "{search}" {selectedType && `under type ${selectedType}`}. Try a different query!
              </p>
            </div>
          )}
        </section>

      </div>

      {/* Floating sliding pokemon details drawer overlay */}
      <PokemonDetailDrawer
        pokemonId={selectedPokemonId}
        onClose={() => setSelectedPokemonId(null)}
      />

      {/* Persistent sliding bottom Team Builder panel */}
      <TeamBuilder
        team={team}
        onRemove={handleRemoveTeamMember}
        onClear={handleClearTeam}
        onSelectPokemon={(id) => setSelectedPokemonId(id)}
      />

      {/* High-fidelity custom bottom-left Toast notification messages */}
      {notification && (
        <div className="fixed bottom-20 left-6 z-50 glass-panel border-emerald-500/20 bg-slate-950/95 text-slate-100 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3.5 border animate-pulse-slow">
          <span className="flex h-2.5 w-2.5 items-center justify-center">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider">
            {notification}
          </span>
        </div>
      )}
    </div>
  );
}
