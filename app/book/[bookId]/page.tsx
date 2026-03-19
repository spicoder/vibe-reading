"use client";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { bibleBooks } from "@/app/lib/data";
import { useMultiplayer, PlayerProfile } from "@/app/lib/MultiplayerContext";

// Import Refactored Components
import BookHeader from "./components/BookHeader";
import BookHero from "./components/BookHero";
import GamifiedMap from "./components/GamifiedMap";
import CommunityGemsModal from "./components/GemsModal";
import { getBookTheme } from "./theme";

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

  const nextChapterId =
    chapters.find(
      ([id]) => !completedChapters.includes(`${bookId}-${id}`),
    )?.[0] || "1";

  const nextChapter = book.chapters[nextChapterId];
  const isChapterDone =
    isLoaded && completedChapters.includes(`${bookId}-${nextChapterId}`);

  return (
    <main className="min-h-screen bg-[#FDFBF7] pb-24 font-sans">
      <BookHeader title={book.title} />

      <BookHero
        bookId={bookId}
        nextChapterId={nextChapterId}
        nextChapter={nextChapter}
        isChapterDone={isChapterDone}
        theme={theme}
      />

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
