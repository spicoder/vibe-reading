"use client";

import {
  notFound,
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer, PlayerProfile } from "@/app/lib/MultiplayerContext";

// Import Refactored Components
import BookHeader from "./components/BookHeader";
import BookHero from "./components/BookHero";
import GamifiedMap from "./components/GamifiedMap";
import CommunityGemsModal from "./components/GemsModal";
import { getBookTheme } from "./theme";
import BottomNav from "@/app/components/BottomNav";
import Leaderboard from "@/app/components/Leaderboard";
import { div } from "framer-motion/client";

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

function BookPageContent() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = bibleBooks[bookId];

  // 1. Hook into URL parameters for animation triggers
  const searchParams = useSearchParams();
  const router = useRouter();
  const animateTo = searchParams.get("animateTo");
  const animateFrom = searchParams.get("animateFrom");

  const [mounted, setMounted] = useState(false);
  const [viewingGems, setViewingGems] = useState<{
    chapter: string;
    gems: { player: PlayerProfile; ref: string; content: string }[];
  } | null>(null);

  // 2. State for the Start Reading Modal
  const [startModalChapter, setStartModalChapter] = useState<string | null>(
    null,
  );

  useEffect(() => setMounted(true), []);

  // 3. Trigger Modal After Map Animation (2200ms delay)
  useEffect(() => {
    if (animateTo && animateTo !== "treasure") {
      const timer = setTimeout(() => {
        setStartModalChapter(animateTo);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [animateTo]);

  if (!book) notFound();

  const chapters = Object.entries(book.chapters);
  const { currentUser, allPlayers, isLoaded } = useMultiplayer();
  const completedChapters = currentUser?.completedChapters || [];
  const theme = getBookTheme(bookId);
  const bgColor = getBookBgColor(bookId);

  const isBookCompleted =
    isLoaded &&
    chapters.length > 0 &&
    chapters.every(([id]) => completedChapters.includes(`${bookId}-${id}`));

  const nextChapterId =
    chapters.find(
      ([id]) => !completedChapters.includes(`${bookId}-${id}`),
    )?.[0] || chapters[0][0];

  const nextChapter = book.chapters[nextChapterId];
  const isChapterDone =
    isLoaded && completedChapters.includes(`${bookId}-${nextChapterId}`);

  return (
    <main className={`min-h-screen ${bgColor} pb-40 font-sans relative`}>
      <BookHeader title={book.title} />

      {isLoaded && (
        <div className="absolute top-6 right-6 z-50">
          <Leaderboard
            allPlayers={allPlayers as PlayerProfile[]}
            bookId={bookId}
            chapters={chapters}
          />
        </div>
      )}

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
          // 4. Pass the animation props to GamifiedMap
          animateTo={animateTo}
          animateFrom={animateFrom}
          isBookCompleted={isBookCompleted}
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
            isBookCompleted={isBookCompleted}
          />
        </div>

        {/* Bottom Navigation Bar */}
        <BottomNav bookId={bookId} />
      </div>

      {viewingGems && (
        <CommunityGemsModal
          bookTitle={book.title}
          viewingGems={viewingGems}
          onClose={() => setViewingGems(null)}
        />
      )}

      {/* 5. Start Reading Modal */}
      {startModalChapter && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm px-4 transition-opacity">
          <div className="bg-white text-black p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📖
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2 text-stone-900">
              Chapter {startModalChapter} Unlocked!
            </h3>
            <p className="text-stone-500 mb-8 leading-relaxed">
              Your journey continues. Are you ready to dive into the next
              chapter?
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/book/${bookId}/${startModalChapter}`}
                className="bg-amber-500 text-black px-6 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/30"
              >
                Start Reading
              </Link>
              <button
                onClick={() => {
                  setStartModalChapter(null);
                  // Clean up the URL so it doesn't trigger again on refresh
                  router.replace(`/book/${bookId}`);
                }}
                className="text-stone-400 font-bold uppercase text-xs tracking-widest py-3 hover:text-stone-600 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// 6. Wrap in Suspense to safely use searchParams
export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <BookPageContent />
    </Suspense>
  );
}
