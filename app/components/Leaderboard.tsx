"use client";

import { useState } from "react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";
import { Trophy, X } from "lucide-react";

interface LeaderboardProps {
  allPlayers: PlayerProfile[];
  bookId: string;
  chapters: [string, any][];
}

export default function Leaderboard({
  allPlayers,
  bookId,
  chapters,
}: LeaderboardProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate progress and sort players
  const playersWithProgress = allPlayers
    .map((player) => {
      // Find how many chapters in this specific book the player has completed
      const completedCount = chapters.filter(([id]) =>
        player.completedChapters.includes(`${bookId}-${id}`),
      ).length;

      // Find their current/next active chapter
      const nextChapterId = chapters.find(
        ([id]) => !player.completedChapters.includes(`${bookId}-${id}`),
      )?.[0];

      return {
        ...player,
        completedCount,
        status:
          completedCount === chapters.length
            ? "Finished 🏆"
            : `Ch. ${nextChapterId || chapters[0][0]}`,
      };
    })
    .sort((a, b) => b.completedCount - a.completedCount);

  return (
    <>
      {/* Cute Floating Toggle Button (Visible only on mobile) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-4 top-24 z-40 bg-white/95 backdrop-blur-sm border-2 border-amber-200 px-4 py-2.5 rounded-2xl shadow-lg hover:scale-105 transition-all flex lg:hidden items-center gap-2 ${
          isOpen
            ? "opacity-0 pointer-events-none scale-90"
            : "opacity-100 scale-100"
        }`}
      >
        <Trophy className="text-amber-500 fill-amber-200" size={20} />
        <span className="text-sm font-bold text-amber-600">View Others</span>
      </button>

      {/* Leaderboard Panel */}
      <div
        className={`fixed right-4 top-24 lg:right-6 lg:top-28 w-60 bg-white/95 backdrop-blur-md border-[3px] border-amber-200 rounded-3xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col gap-3 transition-all duration-300 origin-top-right
        ${
          isOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none lg:scale-100 lg:opacity-100 lg:pointer-events-auto"
        }`}
      >
        {/* Cute Header with Mobile Close Button */}
        <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy
              className="text-amber-400 fill-amber-200 drop-shadow-sm"
              size={22}
            />
            <h3 className="font-serif font-black text-stone-700 tracking-wide text-lg">
              Adventurers
            </h3>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden bg-stone-100 hover:bg-stone-200 p-1.5 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Player List */}
        <div className="flex flex-col gap-2.5 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {playersWithProgress.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center gap-3 bg-stone-50/80 rounded-2xl p-2 border-2 border-transparent hover:border-amber-200 hover:bg-white hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden shadow-sm"
            >
              {/* Medals/Rank Lines for Top 3 */}
              {idx === 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400" />
              )}
              {idx === 1 && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-stone-300" />
              )}
              {idx === 2 && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-700/40" />
              )}

              <div className="text-2xl drop-shadow-md z-10 pl-2 group-hover:scale-110 transition-transform">
                {player.avatar}
              </div>

              <div className="flex flex-col flex-1 z-10 min-w-0">
                <span className="text-sm font-bold text-stone-800 truncate">
                  {player.name}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  {player.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
