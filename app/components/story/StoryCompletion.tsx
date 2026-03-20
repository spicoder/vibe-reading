import { useEffect, useState } from "react";
import { useMultiplayer } from "@/app/lib/MultiplayerContext";
import FlyingStars from "./completion/FlyingStars";
import CompletionStars from "./completion/CompletionStars";
import CompletionMessage from "./completion/CompletionMessage";
import CompletionNav from "./completion/CompletionNav";

interface StoryCompletionProps {
  isStoryComplete: boolean;
  showGrid: boolean;
  currentChapter: number;
  bookId: string;
  bookTitle: string;
  nextChapterId?: string | null;
}

export function StoryCompletion({
  isStoryComplete,
  showGrid,
  currentChapter,
  bookId,
  bookTitle,
  nextChapterId,
}: StoryCompletionProps) {
  const { currentUser, awardChapterStars } = useMultiplayer();
  const [showFlyingStars, setShowFlyingStars] = useState(false);

  // Calculate stars based on engagement
  const favPrefix = `chapter-${currentChapter}-`;
  const hasFavorites =
    currentUser?.favorites?.some((id: string) => id.startsWith(favPrefix)) ||
    false;

  const gemPrefix = `${bookTitle} ${currentChapter}:`;
  const hasGems =
    Object.keys(currentUser?.gems || {}).some((key: string) =>
      key.startsWith(gemPrefix),
    ) || false;

  // Updated star calculation to match map logic (3 stars for gems, 2 for favs)
  let starsEarned = 1;
  if (hasGems) {
    starsEarned = 3;
  } else if (hasFavorites) {
    starsEarned = 2;
  }

  // Auto-award stars when the story completes
  useEffect(() => {
    if (isStoryComplete && !showGrid && currentUser) {
      const uniqueChapterId = `${bookId}-${currentChapter}`;

      // Check if they haven't been rewarded yet
      const rewarded = currentUser.rewardedChapters || [];
      if (!rewarded.includes(uniqueChapterId)) {
        setShowFlyingStars(true); // Trigger the CSS animation

        // Wait 1 second (while stars are flying) before updating the database/wallet balance
        const timer = setTimeout(() => {
          awardChapterStars(uniqueChapterId, starsEarned);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [
    isStoryComplete,
    showGrid,
    currentUser?.id,
    bookId,
    currentChapter,
    starsEarned,
    awardChapterStars,
  ]);

  if (!isStoryComplete || showGrid) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-2xl z-50 animate-in fade-in duration-500">
      {/* 1. Render the flying stars based on how many they earned */}
      {showFlyingStars && <FlyingStars count={starsEarned} />}

      <div className="text-center p-8">
        <h2 className="text-4xl font-serif font-bold mb-8">
          {!nextChapterId ? "Book Complete! 🏆" : "Chapter Complete! 🎉"}
        </h2>

        {/* 2. Extracted Star Rating Display */}
        <CompletionStars starsEarned={starsEarned} />

        {/* 3. Extracted Dynamic Praise Message */}
        <div className="mb-10 max-w-sm mx-auto h-16 flex items-center justify-center">
          <CompletionMessage
            starsEarned={starsEarned}
            nextChapterId={nextChapterId}
          />
        </div>

        {/* 4. Extracted Navigation Buttons */}
        <CompletionNav
          bookId={bookId}
          currentChapter={currentChapter}
          nextChapterId={nextChapterId}
        />
      </div>
    </div>
  );
}
