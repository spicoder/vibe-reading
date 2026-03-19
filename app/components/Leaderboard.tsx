"use client";

import { useState } from "react";
import { PlayerProfile } from "@/app/lib/MultiplayerContext";
import { Trophy } from "lucide-react";

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
      {/* Leaderboard Panel */}
      <div
        className={`fixed right-4 top-24 lg:right-6 lg:top-28 w-44 bg-white/95 backdrop-blur-md border-[3px] border-amber-200 rounded-3xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-50 flex flex-col gap-3 transition-all duration-300 origin-top-right`}
      >
        {/* Cute Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-100 pb-2">
          <div className="flex items-center gap-2">
            <Trophy
              className="text-amber-400 fill-amber-200 drop-shadow-sm"
              size={18}
            />
            <h3 className="font-serif font-black text-stone-700 text-sm">
              Readers
            </h3>
          </div>
        </div>

        {/* Player List - Fixed height to show exactly ~3 items and scroll the rest */}
        <div className="flex flex-col gap-2 max-h-[165px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-amber-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {playersWithProgress.map((player, idx) => (
            <div
              key={player.id}
              className="flex items-center gap-2.5 bg-stone-50/80 rounded-2xl p-2 border-2 border-transparent hover:border-amber-200 hover:bg-white transition-all duration-300 relative group overflow-hidden shadow-sm shrink-0"
            >
              {/* Medals/Rank Lines for Top 3 */}
              {idx === 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
              )}
              {idx === 1 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-stone-300" />
              )}
              {idx === 2 && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-700/40" />
              )}

              <div className="text-xl drop-shadow-md z-10 group-hover:scale-110 transition-transform pl-1">
                {player.avatar}
              </div>

              <div className="flex flex-col flex-1 z-10 min-w-0">
                <span className="text-[11px] font-bold text-stone-800 truncate">
                  {player.name}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
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
