"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Map, Heart, Bookmark } from "lucide-react";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer, PlayerProfile } from "@/app/lib/MultiplayerContext";

// Import Refactored Components
import BookHeader from "./components/BookHeader";
import BookHero from "./components/BookHero";
import GamifiedMap from "./components/GamifiedMap";
import CommunityGemsModal from "./components/GemsModal";
import { getBookTheme } from "./theme";

// Helper to generate a consistent random background color per book
const getBookBgColor = (bookId: string) => {
  const colors = [
    "bg-rose-50",
    "bg-blue-50",
    "bg-emerald-50",
    "bg-amber-50",
    "bg-purple-50",
    "bg-teal-50",
  ];
  let hash = 0;
  for (let i = 0; i < bookId.length; i++) {
    hash = bookId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function BookPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = bibleBooks[bookId];

  const [mounted, setMounted] = useState(false);
  const [viewingGems, setViewingGems] = useState<{
    chapter: string;
    gems: { player: PlayerProfile; ref: string; content: string }[];
  } | null>(null);

  useEffect(() => setMounted(true), []);

  if (!book) notFound();

  const chapters = Object.entries(book.chapters);
  const { currentUser, allPlayers, isLoaded } = useMultiplayer();
  const completedChapters = currentUser?.completedChapters || [];
  const theme = getBookTheme(bookId);
  const bgColor = getBookBgColor(bookId);

  const nextChapterId =
    chapters.find(
      ([id]) => !completedChapters.includes(`${bookId}-${id}`),
    )?.[0] || "1";

  const nextChapter = book.chapters[nextChapterId];
  const isChapterDone =
    isLoaded && completedChapters.includes(`${bookId}-${nextChapterId}`);

  return (
    <main className={`min-h-screen ${bgColor} pb-40 font-sans relative`}>
      <BookHeader title={book.title} />

      {/* Main Map Area */}
      <div className="pt-1">
        <GamifiedMap
          book={book}
          bookId={bookId}
          chapters={chapters}
          completedChapters={completedChapters}
          nextChapterId={nextChapterId}
          theme={theme}
          currentUser={currentUser}
          allPlayers={allPlayers as PlayerProfile[]}
          isLoaded={isLoaded}
          mounted={mounted}
          onViewGems={setViewingGems}
        />
      </div>

      {/* Fixed Bottom UI (Hero + Nav Bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center">
        {/* Concise Hero Banner */}
        <div className="w-full max-w-md px-4 pb-4 pointer-events-auto">
          <BookHero
            bookId={bookId}
            nextChapterId={nextChapterId}
            nextChapter={nextChapter}
            isChapterDone={isChapterDone}
            theme={theme}
          />
        </div>

        {/* Bottom Navigation Bar */}
        <div className="bg-white border-t border-stone-200 px-8 py-3 w-full max-w-md flex justify-between items-center pointer-events-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
          <Link
            href={`/book/${bookId}`}
            className="flex flex-col items-center text-amber-500 hover:scale-105 transition-transform"
          >
            <Map size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              Map
            </span>
          </Link>
          <Link
            href="/favorites"
            className="flex flex-col items-center text-stone-400 hover:text-rose-400 hover:scale-105 transition-all"
          >
            <Heart size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              Favorites
            </span>
          </Link>
          <Link
            href="/spiritual-gems"
            className="flex flex-col items-center text-stone-400 hover:text-amber-500 hover:scale-105 transition-all"
          >
            <Bookmark size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-bold mt-1 tracking-wide">
              Gems
            </span>
          </Link>
        </div>
      </div>

      {viewingGems && (
        <CommunityGemsModal
          bookTitle={book.title}
          viewingGems={viewingGems}
          onClose={() => setViewingGems(null)}
        />
      )}
    </main>
  );
}
