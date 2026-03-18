"use client";

import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import {
  Sparkles,
  Play,
  ChevronLeft,
  Heart,
  Bookmark,
  Star,
  Lock,
} from "lucide-react";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer, PlayerProfile } from "@/app/lib/MultiplayerContext";
import { useEffect, useState } from "react";

// Helper to generate a unique but consistent theme for each book
const getBookTheme = (bookId: string) => {
  const themes = [
    {
      path: "text-amber-200",
      doneBg: "bg-amber-400",
      doneBorder: "border-amber-200",
      activeBorder: "border-amber-500",
      text: "text-amber-900",
    },
    {
      path: "text-emerald-200",
      doneBg: "bg-emerald-400",
      doneBorder: "border-emerald-200",
      activeBorder: "border-emerald-500",
      text: "text-emerald-900",
    },
    {
      path: "text-blue-200",
      doneBg: "bg-blue-400",
      doneBorder: "border-blue-200",
      activeBorder: "border-blue-500",
      text: "text-blue-900",
    },
    {
      path: "text-rose-200",
      doneBg: "bg-rose-400",
      doneBorder: "border-rose-200",
      activeBorder: "border-rose-500",
      text: "text-rose-900",
    },
    {
      path: "text-violet-200",
      doneBg: "bg-violet-400",
      doneBorder: "border-violet-200",
      activeBorder: "border-violet-500",
      text: "text-violet-900",
    },
  ];

  // Simple hash to consistently pick the same color for the same book
  const hash = bookId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
};

export default function BookPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = bibleBooks[bookId];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!book) notFound();

  const chapters = Object.entries(book.chapters);

  // Use the new multiplayer hook instead of the old progress hook
  const { currentUser, allPlayers, isLoaded } = useMultiplayer();
  const completedChapters = currentUser?.completedChapters || [];
  const theme = getBookTheme(bookId);

  const nextChapterId =
    chapters.find(
      ([id]) => !completedChapters.includes(`${bookId}-${id}`),
    )?.[0] || "1";

  const nextChapter = book.chapters[nextChapterId];
  const isChapterDone =
    isLoaded && completedChapters.includes(`${bookId}-${nextChapterId}`);

  // Gamified Map Configuration
  const MAP_WIDTH = 400;
  const NODE_SPACING = 140; // Vertical spacing between nodes

  // Calculate node coordinates on a winding path
  const nodePositions = chapters.map(([id, chapter], i) => {
    // Math.sin creates the winding snake-like curve.
    const x = 200 + Math.sin(i * 0.7) * 90;
    const y = i * NODE_SPACING + 80;
    return { id, chapter, x, y, i };
  });

  const containerHeight = chapters.length * NODE_SPACING + 160;

  // Generate smooth SVG curve connecting the nodes
  let pathD = "";
  if (nodePositions.length > 0) {
    pathD = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    for (let i = 1; i < nodePositions.length; i++) {
      const prev = nodePositions[i - 1];
      const curr = nodePositions[i];
      // Cubic bezier curve for smooth winding paths
      pathD += ` C ${prev.x} ${prev.y + 60}, ${curr.x} ${curr.y - 60}, ${curr.x} ${curr.y}`;
    }
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black font-serif text-stone-900 tracking-tight uppercase">
            {book.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Profile Link (Optional: Add a way for users to edit their avatar) */}
          <Link
            href="/favorites"
            className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-amber-100 hover:text-amber-600 transition-colors shadow-sm"
          >
            <Heart size={20} />
          </Link>
          <Link
            href="/spiritual-gems"
            className="p-2 bg-stone-100 rounded-full text-stone-600 hover:bg-amber-100 hover:text-amber-600 transition-colors shadow-sm"
          >
            <Bookmark size={20} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 mb-8">
        <div className="bg-stone-900 rounded-4xl p-8 text-white relative overflow-hidden min-h-[350px] flex flex-col justify-end shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

          {nextChapter?.visuals[0]?.imageSrc && (
            <div className="absolute inset-0 z-0">
              <Image
                src={nextChapter.visuals[0].imageSrc}
                alt="Background"
                fill
                className="object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20`}
            >
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isChapterDone ? "Review Chapter" : "Next Reading"}
              </span>
            </div>

            <h2 className="text-4xl font-serif font-bold mb-4">
              Chapter {nextChapter.chapter}
            </h2>

            <div className="flex flex-col gap-2 mb-8 max-w-md">
              {nextChapter?.visuals.map((visual, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div
                    className={`w-1 h-1 rounded-full ${theme.doneBg} mt-2 shrink-0`}
                  />
                  <p className="text-stone-300 text-sm leading-tight font-medium">
                    {visual.title}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href={`/book/${bookId}/${nextChapterId}`}
              className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs inline-flex items-center gap-2 hover:scale-105 transition-transform w-fit shadow-xl"
            >
              <Play size={14} fill="currentColor" />
              {isChapterDone ? "Continue Reading" : "Start Reading"}
            </Link>
          </div>
        </div>
      </section>

      {/* GAMIFIED MAP SECTION */}
      <section className="w-full overflow-hidden px-4">
        {/* Only fade in map nodes once client-side storage is loaded to avoid flashes */}
        <div
          className={`relative mx-auto w-full max-w-[400px] transition-opacity duration-500 ${mounted && isLoaded ? "opacity-100" : "opacity-0"}`}
          style={{ height: containerHeight }}
        >
          {/* SVG Dotted Path Background */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
            viewBox={`0 0 ${MAP_WIDTH} ${containerHeight}`}
            preserveAspectRatio="none"
          >
            <path
              d={pathD}
              fill="none"
              className={theme.path}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="0 22"
            />
          </svg>

          {/* Map Nodes */}
          {nodePositions.map((pos) => {
            const isDone = completedChapters.includes(`${bookId}-${pos.id}`);
            const isActive = !isDone && pos.id === nextChapterId;
            const thumbnail = pos.chapter.visuals[0]?.imageSrc;
            const isRightSide = pos.x > 200;

            // MULTIPLAYER LOGIC: Find other players currently on this exact chapter
            const playersOnThisNode = (allPlayers as PlayerProfile[]).filter(
              (player) => {
                if (player.id === currentUser?.id) return false; // Don't show current user in the tiny bubbles

                // Figure out this player's next chapter for this specific book
                const playerNextChapter =
                  chapters.find(
                    ([id]) =>
                      !player.completedChapters.includes(`${bookId}-${id}`),
                  )?.[0] || "1";

                return playerNextChapter === pos.id;
              },
            );

            return (
              <div
                key={pos.id}
                style={{ left: `${(pos.x / MAP_WIDTH) * 100}%`, top: pos.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
              >
                <Link
                  href={`/book/${bookId}/${pos.id}`}
                  className="relative group flex items-center justify-center"
                >
                  {/* The Node (Candy) */}
                  <div
                    className={`
                      w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 relative
                      ${
                        isActive
                          ? `bg-white border-4 ${theme.activeBorder} shadow-[0_0_30px_rgba(0,0,0,0.15)] scale-[1.3] z-20 animate-[bounce_2s_infinite]`
                          : isDone
                            ? `${theme.doneBg} border-4 ${theme.doneBorder} shadow-lg text-white scale-100 hover:scale-110 z-10`
                            : `bg-stone-100 border-4 border-stone-200 text-stone-300 scale-90 hover:scale-100 z-0 hover:border-stone-300`
                      }
                    `}
                  >
                    {isActive ? (
                      // SHOW THE AVATAR HERE INSTEAD OF THE PLAY ICON
                      <span className="text-3xl md:text-4xl drop-shadow-md pb-1">
                        {currentUser?.avatar || "👤"}
                      </span>
                    ) : isDone ? (
                      <Star className="fill-white text-white" size={20} />
                    ) : (
                      <Lock size={18} />
                    )}
                  </div>

                  {/* MULTIPLAYER AVATARS CLUSTER */}
                  {playersOnThisNode.length > 0 && (
                    <div className="absolute -top-3 -right-3 flex -space-x-2 z-30">
                      {playersOnThisNode.slice(0, 3).map((player) => (
                        <div
                          key={player.id}
                          className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center text-sm shadow-md"
                          title={player.name}
                        >
                          {player.avatar}
                        </div>
                      ))}
                      {playersOnThisNode.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 shadow-md">
                          +{playersOnThisNode.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Signpost (Thumbnail and Title) */}
                  <div
                    className={`
                      absolute top-1/2 -translate-y-1/2 flex items-center gap-3 w-max
                      ${isRightSide ? "right-full mr-3 flex-row-reverse" : "left-full ml-3"}
                      ${isActive ? "opacity-100" : "opacity-60 group-hover:opacity-100"} 
                      transition-all duration-300
                    `}
                  >
                    {thumbnail ? (
                      <div
                        className={`w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden relative shadow-md shrink-0 border-2 ${isActive ? theme.activeBorder : "border-white"}`}
                      >
                        <Image
                          src={thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-xl bg-stone-200 border-2 border-white flex items-center justify-center`}
                      >
                        <span className="font-serif text-stone-400 font-bold">
                          {pos.chapter.chapter}
                        </span>
                      </div>
                    )}

                    <div
                      className={`flex flex-col ${isRightSide ? "items-end" : "items-start"} drop-shadow-sm`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? theme.text : "text-stone-400"} mb-0.5`}
                      >
                        Chapter
                      </span>
                      <span
                        className={`text-xl font-black font-serif ${isActive ? "text-stone-900" : "text-stone-600"} leading-none`}
                      >
                        {pos.chapter.chapter}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
